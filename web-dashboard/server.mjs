#!/usr/bin/env node

import { createServer } from 'node:http';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');
const publicDir = join(currentDir, 'public');
const host = process.env.CAREER_OPS_DASHBOARD_HOST || '127.0.0.1';
const port = Number(process.env.CAREER_OPS_DASHBOARD_PORT || 4317);

const statuses = [
  'Evaluated',
  'Applied',
  'Responded',
  'Interview',
  'Offer',
  'Rejected',
  'Discarded',
  'SKIP',
];

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function appFile(...parts) {
  return join(projectRoot, ...parts);
}

function trackerPath() {
  return existsSync(appFile('data', 'applications.md'))
    ? appFile('data', 'applications.md')
    : appFile('applications.md');
}

function pipelinePath() {
  return appFile('data', 'pipeline.md');
}

function sendJson(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function sendText(response, status, payload, type = 'text/plain; charset=utf-8') {
  response.writeHead(status, { 'Content-Type': type });
  response.end(payload);
}

function cleanCell(value = '') {
  return value.replace(/\*\*/g, '').trim();
}

function normalizeStatus(raw = '') {
  const status = cleanCell(raw)
    .replace(/\s+\d{4}-\d{2}-\d{2}.*$/, '')
    .toLowerCase();
  if (status.includes('interview') || status.includes('entrevista')) return 'interview';
  if (status === 'offer' || status.includes('oferta')) return 'offer';
  if (status.includes('responded') || status.includes('respondido')) return 'responded';
  if (status.includes('applied') || status.includes('aplicado') || ['sent', 'enviada', 'aplicada'].includes(status)) return 'applied';
  if (status.includes('rejected') || status.includes('rechazad')) return 'rejected';
  if (status.includes('discard') || status.includes('descart') || status.includes('cancel') || status.startsWith('dup')) return 'discarded';
  if (status.includes('no aplicar') || status.includes('no_aplicar') || status === 'skip' || status === 'monitor' || status.includes('geo blocker')) return 'skip';
  if (status.includes('evaluat') || status.includes('evaluada') || ['hold', 'condicional', 'evaluar', 'verificar'].includes(status)) return 'evaluated';
  return status || 'unknown';
}

function parseScore(scoreRaw = '') {
  const match = cleanCell(scoreRaw).match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function parseReportLink(markdown = '') {
  const match = markdown.match(/\[(\d+)\]\(([^)]+)\)/);
  return match ? { reportNumber: match[1], reportPath: match[2] } : {};
}

function parseTracker() {
  const filePath = trackerPath();
  if (!existsSync(filePath)) return [];
  return readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|') && !line.includes('|---') && !line.includes('| # '))
    .map((line) => {
      const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
      if (cells.length < 8 || Number.isNaN(Number.parseInt(cells[0], 10))) return null;
      const link = parseReportLink(cells[7]);
      return {
        number: Number.parseInt(cells[0], 10),
        date: cleanCell(cells[1]),
        company: cleanCell(cells[2]),
        role: cleanCell(cells[3]),
        score: parseScore(cells[4]),
        scoreRaw: cleanCell(cells[4]),
        status: cleanCell(cells[5]),
        statusKey: normalizeStatus(cells[5]),
        hasPdf: cells[6].includes('✅'),
        pdf: cells[6].trim(),
        notes: cleanCell(cells[8] || ''),
        ...link,
      };
    })
    .filter(Boolean)
    .map((application) => ({ ...application, ...readReportSummary(application.reportPath) }));
}

function readReportSummary(reportPath) {
  const fullPath = reportAbsolutePath(reportPath);
  if (!fullPath || !existsSync(fullPath)) return {};
  const text = readFileSync(fullPath, 'utf8');
  const field = (patterns) => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return cleanCell(match[1]).replace(/\|$/, '').trim();
    }
    return '';
  };
  return {
    archetype: field([/\*\*Arquetipo(?:\s+detectado)?\*\*\s*\|\s*(.+)/i, /\*\*Arquetipo:\*\*\s*(.+)/i]),
    tldr: field([/\*\*TL;DR\*\*\s*\|\s*(.+)/i, /\*\*TL;DR:\*\*\s*(.+)/i]).slice(0, 180),
    remote: field([/\*\*Remote\*\*\s*\|\s*(.+)/i]),
    compensation: field([/\*\*Comp\*\*\s*\|\s*(.+)/i]),
    jobUrl: field([/^\*\*URL:\*\*\s*(https?:\/\/\S+)/im]),
  };
}

function reportAbsolutePath(reportPath = '') {
  if (!reportPath || reportPath.includes('\0')) return null;
  const absolute = resolve(projectRoot, normalize(reportPath));
  const reportsDir = resolve(appFile('reports'));
  if (absolute !== reportsDir && !absolute.startsWith(`${reportsDir}${sep}`)) return null;
  return absolute;
}

function computeMetrics(applications) {
  const byStatus = Object.fromEntries(statuses.map((status) => [normalizeStatus(status), 0]));
  let scoreTotal = 0;
  let scored = 0;
  let withPdf = 0;
  let topScore = 0;
  for (const application of applications) {
    byStatus[application.statusKey] = (byStatus[application.statusKey] || 0) + 1;
    if (application.score > 0) {
      scoreTotal += application.score;
      scored += 1;
      topScore = Math.max(topScore, application.score);
    }
    if (application.hasPdf) withPdf += 1;
  }
  return {
    total: applications.length,
    actionable: applications.filter((app) => !['skip', 'rejected', 'discarded'].includes(app.statusKey)).length,
    withPdf,
    topScore,
    averageScore: scored ? Number((scoreTotal / scored).toFixed(2)) : 0,
    byStatus,
  };
}

function parsePipeline() {
  const filePath = pipelinePath();
  if (!existsSync(filePath)) return { pending: [], processed: [] };
  const groups = { pending: [], processed: [] };
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    const item = trimmed.match(/^- \[([ x!])\]\s*(.+)$/i);
    if (!item) continue;
    const parts = item[2].split('|').map((part) => part.trim());
    const record = {
      marker: item[1],
      url: parts[0],
      company: parts[1] || '',
      role: parts[2] || '',
      detail: parts.slice(3).join(' | '),
    };
    if (item[1].toLowerCase() === 'x') groups.processed.push(record);
    else groups.pending.push(record);
  }
  return groups;
}

function parseBatchState() {
  const filePath = appFile('batch', 'batch-state.tsv');
  if (!existsSync(filePath)) return [];
  return readFileSync(filePath, 'utf8')
    .split('\n')
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const [id, url, status, startedAt, completedAt, reportNumber, score, error, retries] = line.split('\t');
      return { id, url, status, startedAt, completedAt, reportNumber, score, error, retries };
    });
}

function setupState() {
  const required = [
    { key: 'cv', label: 'CV source', path: 'cv.md', required: true },
    { key: 'profile', label: 'Candidate profile', path: 'config/profile.yml', required: true },
    { key: 'portals', label: 'Portal config', path: 'portals.yml', required: true },
    { key: 'profileMode', label: 'Profile mode', path: 'modes/_profile.md', required: true },
    { key: 'tracker', label: 'Application tracker', path: existsSync(trackerPath()) ? trackerPath().replace(`${projectRoot}${sep}`, '') : 'data/applications.md', required: true },
    { key: 'proof', label: 'Proof-point digest', path: 'article-digest.md', required: false },
  ];
  return required.map((item) => ({
    ...item,
    ready: existsSync(appFile(item.path)),
  }));
}

function dashboardPayload() {
  const applications = parseTracker().sort((a, b) => b.score - a.score || b.number - a.number);
  const pipeline = parsePipeline();
  const batch = parseBatchState();
  const reports = applications.filter((app) => app.reportPath);
  return {
    generatedAt: new Date().toISOString(),
    projectRoot,
    statuses,
    setup: setupState(),
    metrics: computeMetrics(applications),
    applications,
    pipeline,
    batch: {
      items: batch.slice(-12).reverse(),
      failed: batch.filter((item) => item.status === 'failed').length,
      running: batch.filter((item) => item.status === 'running').length,
      completed: batch.filter((item) => item.status === 'completed').length,
    },
    reports: reports.slice(0, 20),
  };
}

function updateTrackerStatus(number, status) {
  if (!statuses.includes(status)) throw new Error('Status must be canonical.');
  const filePath = trackerPath();
  if (!existsSync(filePath)) throw new Error('Tracker file is missing.');
  let found = false;
  const next = readFileSync(filePath, 'utf8').split('\n').map((line) => {
    if (!line.trim().startsWith('|')) return line;
    const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
    if (Number.parseInt(cells[0], 10) !== Number(number) || cells.length < 8) return line;
    cells[5] = status;
    found = true;
    return `| ${cells.join(' | ')} |`;
  });
  if (!found) throw new Error(`Application #${number} was not found.`);
  writeFileSync(filePath, next.join('\n'));
}

function ensurePipelineFile() {
  const filePath = pipelinePath();
  if (existsSync(filePath)) return filePath;
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, '## Pendientes\n\n## Procesadas\n');
  return filePath;
}

function appendPipelineItem({ url = '', company = '', role = '' }) {
  const cleanUrl = url.trim();
  if (!/^(https?:\/\/|local:)/i.test(cleanUrl)) throw new Error('Use an http(s) job URL or a local: JD path.');
  const filePath = ensurePipelineFile();
  const line = `- [ ] ${[cleanUrl, company.trim(), role.trim()].filter(Boolean).join(' | ')}`;
  const current = readFileSync(filePath, 'utf8');
  if (current.includes(cleanUrl)) throw new Error('That URL is already in the pipeline inbox.');
  const heading = '## Pendientes';
  const index = current.indexOf(heading);
  if (index < 0) {
    writeFileSync(filePath, `${heading}\n${line}\n\n${current}`);
    return;
  }
  const insertion = index + heading.length;
  writeFileSync(filePath, `${current.slice(0, insertion)}\n${line}${current.slice(insertion)}`);
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function serveStatic(pathname, response) {
  const route = pathname === '/' ? '/index.html' : pathname;
  const absolute = resolve(publicDir, `.${route}`);
  if (!absolute.startsWith(publicDir) || !existsSync(absolute) || statSync(absolute).isDirectory()) {
    sendText(response, 404, 'Not found');
    return;
  }
  sendText(response, 200, readFileSync(absolute), contentTypes[extname(absolute)] || 'application/octet-stream');
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);
    if (url.pathname === '/api/dashboard' && request.method === 'GET') {
      sendJson(response, 200, dashboardPayload());
      return;
    }
    if (url.pathname === '/api/report' && request.method === 'GET') {
      const absolute = reportAbsolutePath(url.searchParams.get('path') || '');
      if (!absolute || !existsSync(absolute)) {
        sendJson(response, 404, { error: 'Report not found.' });
        return;
      }
      sendJson(response, 200, { path: absolute.replace(`${projectRoot}${sep}`, ''), markdown: readFileSync(absolute, 'utf8') });
      return;
    }
    const statusMatch = url.pathname.match(/^\/api\/applications\/(\d+)\/status$/);
    if (statusMatch && request.method === 'PATCH') {
      const body = await readBody(request);
      updateTrackerStatus(statusMatch[1], body.status);
      sendJson(response, 200, { ok: true, payload: dashboardPayload() });
      return;
    }
    if (url.pathname === '/api/pipeline' && request.method === 'POST') {
      appendPipelineItem(await readBody(request));
      sendJson(response, 201, { ok: true, payload: dashboardPayload() });
      return;
    }
    if (url.pathname.startsWith('/api/')) {
      sendJson(response, 404, { error: 'API route not found.' });
      return;
    }
    serveStatic(url.pathname, response);
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
});

server.listen(port, host, () => {
  console.log(`Career-Ops web dashboard running at http://${host}:${port}`);
});
