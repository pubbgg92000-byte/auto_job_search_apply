#!/usr/bin/env node

/**
 * Live ATS scanner for configured Career-Ops companies.
 *
 * Pulls current public postings from Greenhouse, Ashby, and Lever APIs, then
 * adds matching, unseen jobs to the existing Career-Ops pipeline inbox.
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const defaultConfigPath = join(projectRoot, 'portals.yml');
const pipelinePath = join(projectRoot, 'data/pipeline.md');
const historyPath = join(projectRoot, 'data/scan-history.tsv');
const applicationsPath = join(projectRoot, 'data/applications.md');
const historyHeader = 'url\tfirst_seen\tportal\ttitle\tcompany\tstatus\n';

function help() {
  console.log(`Usage: npm run scan -- [options]

Options:
  --config <path>     Use a portals YAML file other than ./portals.yml
  --company <name>    Scan only companies whose names include this text
  --limit <count>     Scan only the first N supported companies
  --dry-run           Print results without changing pipeline/history files
  --json              Print the scan summary as JSON
  --help              Show this help

This live scanner supports tracked companies on Greenhouse, Ashby, and Lever.
Use the agent scan mode for broad WebSearch discovery and custom career pages.`);
}

function parseArgs(argv) {
  const options = {
    configPath: defaultConfigPath,
    company: '',
    dryRun: false,
    json: false,
    limit: Infinity,
  };

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--help') {
      help();
      process.exit(0);
    }
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--config') options.configPath = resolve(projectRoot, argv[++index] || '');
    else if (arg === '--company') options.company = (argv[++index] || '').toLowerCase();
    else if (arg === '--limit') options.limit = Number.parseInt(argv[++index], 10);
    else throw new Error(`Unknown option: ${arg}`);
  }

  if (!options.configPath || options.configPath === projectRoot) {
    throw new Error('--config requires a path.');
  }
  if (!Number.isFinite(options.limit) || options.limit < 1) {
    options.limit = Infinity;
  }
  return options;
}

async function readText(filePath) {
  if (!existsSync(filePath)) return '';
  return readFile(filePath, 'utf8');
}

function cleanField(value = '') {
  return String(value).replace(/[\t\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalized(value = '') {
  return cleanField(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function normalizedUrl(value = '') {
  try {
    const url = new URL(value);
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return cleanField(value);
  }
}

function containsTerm(text, rawTerm) {
  const term = String(rawTerm).trim();
  if (!term) return false;
  if (!/^[a-z0-9 ]+$/i.test(term)) {
    return text.toLowerCase().includes(term.toLowerCase());
  }
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
}

function titleMatches(title, titleFilter = {}) {
  const positives = titleFilter.positive || [];
  const negatives = titleFilter.negative || [];
  const positiveMatch = positives.length === 0 || positives.some((term) => containsTerm(title, term));
  const negativeMatch = negatives.some((term) => containsTerm(title, term));
  return positiveMatch && !negativeMatch;
}

function localDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getApplicationsKeys(markdown) {
  const keys = new Set();
  for (const line of markdown.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
    if (cells.length < 4 || Number.isNaN(Number.parseInt(cells[0], 10))) continue;
    keys.add(`${normalized(cells[2])}::${normalized(cells[3])}`);
  }
  return keys;
}

function getPipelineUrls(markdown) {
  return new Set((markdown.match(/https?:\/\/[^\s|)]+/g) || []).map(normalizedUrl));
}

function getHistoryUrls(tsv) {
  return new Set(
    tsv.split('\n')
      .slice(1)
      .map((line) => line.split('\t')[0])
      .filter(Boolean)
      .map(normalizedUrl),
  );
}

function resolveSource(company) {
  if (company.api?.includes('boards-api.greenhouse.io')) {
    return { kind: 'greenhouse-api', url: company.api };
  }

  if (!company.careers_url) return null;
  const url = new URL(company.careers_url);
  const slug = url.pathname.split('/').filter(Boolean)[0];
  if (!slug) return null;

  if (url.hostname === 'job-boards.greenhouse.io' || url.hostname === 'job-boards.eu.greenhouse.io' || url.hostname === 'boards.greenhouse.io') {
    return { kind: 'greenhouse-api', url: `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs` };
  }
  if (url.hostname === 'jobs.ashbyhq.com') {
    return { kind: 'ashby-api', url: `https://api.ashbyhq.com/posting-api/job-board/${slug}` };
  }
  if (url.hostname === 'jobs.lever.co' || url.hostname === 'jobs.eu.lever.co') {
    const apiHost = url.hostname === 'jobs.eu.lever.co' ? 'api.eu.lever.co' : 'api.lever.co';
    return { kind: 'lever-api', url: `https://${apiHost}/v0/postings/${slug}?mode=json` };
  }
  return null;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

function jobsFromPayload(company, source, payload) {
  if (source.kind === 'greenhouse-api') {
    return (payload.jobs || []).map((job) => ({
      company: company.name,
      title: job.title,
      url: job.absolute_url,
      location: job.location?.name || '',
      portal: source.kind,
    }));
  }
  if (source.kind === 'ashby-api') {
    return (payload.jobs || [])
      .filter((job) => job.isListed !== false)
      .map((job) => ({
        company: company.name,
        title: job.title,
        url: job.jobUrl,
        location: job.location || job.workplaceType || '',
        portal: source.kind,
      }));
  }
  if (source.kind === 'lever-api') {
    return (Array.isArray(payload) ? payload : []).map((job) => ({
      company: company.name,
      title: job.text,
      url: job.hostedUrl,
      location: job.categories?.location || '',
      portal: source.kind,
    }));
  }
  return [];
}

function withPipelineRows(markdown, rows) {
  const lines = rows.map((job) => `- [ ] ${job.url} | ${cleanField(job.company)} | ${cleanField(job.title)}`).join('\n');
  if (!markdown.trim()) {
    return `# Pipeline Inbox

## Pendientes
${lines}

## Procesadas
`;
  }
  if (/^## Pendientes\s*$/m.test(markdown)) {
    return markdown.replace(/^## Pendientes\s*$/m, (heading) => `${heading}\n${lines}`);
  }
  return `${markdown.trimEnd()}\n\n## Pendientes\n${lines}\n\n## Procesadas\n`;
}

function historyLine(job, status, date) {
  return [
    normalizedUrl(job.url),
    date,
    job.portal,
    cleanField(job.title),
    cleanField(job.company),
    status,
  ].join('\t');
}

async function writeOutputs({ pipeline, history, added, historyRows }) {
  await mkdir(dirname(pipelinePath), { recursive: true });
  if (added.length > 0) {
    await writeFile(pipelinePath, withPipelineRows(pipeline, added), 'utf8');
  }
  const baseHistory = history.trim() ? history.trimEnd() : historyHeader.trimEnd();
  if (historyRows.length > 0 || !history.trim()) {
    await writeFile(historyPath, `${baseHistory}\n${historyRows.join('\n')}${historyRows.length ? '\n' : ''}`, 'utf8');
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const configText = await readText(options.configPath);
  if (!configText) {
    throw new Error(`Portal config not found: ${options.configPath}\nCreate portals.yml from templates/portals.example.yml before scanning.`);
  }

  const config = parseYaml(configText);
  const pipeline = await readText(pipelinePath);
  const history = await readText(historyPath);
  const applications = await readText(applicationsPath);
  const pipelineUrls = getPipelineUrls(pipeline);
  const historyUrls = getHistoryUrls(history);
  const applicationKeys = getApplicationsKeys(applications);
  const enabledCompanies = (config.tracked_companies || [])
    .filter((company) => company.enabled !== false)
    .filter((company) => !options.company || company.name?.toLowerCase().includes(options.company));

  const sourceCompanies = enabledCompanies
    .map((company) => ({ company, source: resolveSource(company) }))
    .filter(({ source }) => source)
    .slice(0, options.limit);

  const result = {
    date: localDate(),
    config: options.configPath,
    companiesConfigured: enabledCompanies.length,
    companiesSupported: sourceCompanies.length,
    companiesSkipped: enabledCompanies.length - sourceCompanies.length,
    jobsFound: 0,
    titleSkipped: 0,
    duplicateSkipped: 0,
    added: [],
    errors: [],
    dryRun: options.dryRun,
  };
  const queuedUrls = new Set([...pipelineUrls, ...historyUrls]);
  const queuedKeys = new Set(applicationKeys);
  const historyRows = [];

  for (const { company, source } of sourceCompanies) {
    let jobs = [];
    try {
      jobs = jobsFromPayload(company, source, await fetchJson(source.url))
        .filter((job) => job.title && job.url);
    } catch (error) {
      result.errors.push({ company: company.name, source: source.kind, message: error.message });
      continue;
    }

    result.jobsFound += jobs.length;
    for (const job of jobs) {
      const urlKey = normalizedUrl(job.url);
      const applicationKey = `${normalized(job.company)}::${normalized(job.title)}`;
      if (!titleMatches(job.title, config.title_filter)) {
        result.titleSkipped++;
        historyRows.push(historyLine(job, 'skipped_title', result.date));
        continue;
      }
      if (queuedUrls.has(urlKey) || queuedKeys.has(applicationKey)) {
        result.duplicateSkipped++;
        historyRows.push(historyLine(job, 'skipped_dup', result.date));
        continue;
      }
      queuedUrls.add(urlKey);
      queuedKeys.add(applicationKey);
      result.added.push(job);
      historyRows.push(historyLine(job, 'added', result.date));
    }
  }

  if (!options.dryRun) {
    await writeOutputs({ pipeline, history, added: result.added, historyRows });
  }

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`Live portal scan - ${result.date}${options.dryRun ? ' (dry run)' : ''}`);
  console.log(`Supported companies scanned: ${result.companiesSupported}/${result.companiesConfigured}`);
  console.log(`Live postings found: ${result.jobsFound}`);
  console.log(`Title-filtered: ${result.titleSkipped}`);
  console.log(`Duplicates skipped: ${result.duplicateSkipped}`);
  console.log(`Added to data/pipeline.md: ${result.added.length}`);
  for (const job of result.added.slice(0, 20)) {
    console.log(`  + ${job.company} | ${job.title} | ${job.portal}`);
  }
  if (result.added.length > 20) console.log(`  ... ${result.added.length - 20} more`);
  if (result.companiesSkipped > 0) {
    console.log(`Custom/WebSearch-only companies skipped: ${result.companiesSkipped}`);
  }
  for (const error of result.errors) {
    console.log(`  ! ${error.company} (${error.source}): ${error.message}`);
  }
}

main().catch((error) => {
  console.error(`Live scan failed: ${error.message}`);
  process.exitCode = 1;
});
