const state = {
  data: null,
  view: 'resume-flow',
  search: '',
  status: 'all',
  reportPath: '',
  flow: {
    slide: 0,
    draftBuilt: false,
    resumeFile: '',
    jobs: [],
  },
};

const titles = {
  command: 'Dashboard',
  'resume-flow': 'Career Flow',
  pipeline: 'Applications',
  reports: 'Reports',
  setup: 'Settings',
};

const elements = {
  metrics: document.querySelector('#metrics'),
  priorityApps: document.querySelector('#priority-apps'),
  setupPeek: document.querySelector('#setup-peek'),
  setupFull: document.querySelector('#setup-full'),
  pendingPeek: document.querySelector('#pending-peek'),
  workflowPending: document.querySelector('#workflow-pending'),
  pendingList: document.querySelector('#pending-list'),
  processedList: document.querySelector('#processed-list'),
  batch: document.querySelector('#batch'),
  applicationTable: document.querySelector('#application-table'),
  reportList: document.querySelector('#report-list'),
  reportTitle: document.querySelector('#report-title'),
  reportContent: document.querySelector('#report-content'),
  statusFilter: document.querySelector('#status-filter'),
  search: document.querySelector('#search'),
  toast: document.querySelector('#toast'),
  track: document.querySelector('#career-track'),
  flowBack: document.querySelector('#career-back'),
  flowNext: document.querySelector('#career-next'),
  flowGate: document.querySelector('#career-gate'),
  resumeFile: document.querySelector('#resume-file'),
  resumeFileNote: document.querySelector('#resume-file-note'),
  resumePrefill: document.querySelector('#resume-prefill'),
  resumeText: document.querySelector('#resume-text'),
  targetRoles: document.querySelector('#target-roles'),
  jdContext: document.querySelector('#jd-context'),
  locationPreferences: document.querySelector('#location-preferences'),
  workPreferences: document.querySelector('#work-preferences'),
  atsScoreboard: document.querySelector('#ats-scoreboard'),
  improvementPlan: document.querySelector('#improvement-plan'),
  aiChangeApproval: document.querySelector('#ai-change-approval'),
  buildResumeDraft: document.querySelector('#build-resume-draft'),
  draftStatus: document.querySelector('#draft-status'),
  finalResume: document.querySelector('#final-resume'),
  finalScoreboard: document.querySelector('#final-scoreboard'),
  downloadResume: document.querySelector('#download-resume'),
  guidedJobList: document.querySelector('#guided-job-list'),
  queueApproval: document.querySelector('#queue-approval'),
  queueApprovedJobs: document.querySelector('#queue-approved-jobs'),
  followupMetrics: document.querySelector('#followup-metrics'),
  followupList: document.querySelector('#followup-list'),
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Request failed.');
  return payload;
}

async function load() {
  state.data = await api('/api/dashboard');
  render();
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[char]);
}

function tag(label, tone = 'info') {
  return `<span class="tag ${tone}">${escapeHtml(label)}</span>`;
}

function statusTone(status = '') {
  if (['offer', 'interview', 'responded'].includes(status)) return 'good';
  if (['rejected', 'discarded', 'skip', 'failed'].includes(status)) return 'bad';
  if (['applied', 'running'].includes(status)) return 'info';
  return 'warn';
}

function render() {
  if (!state.data) return;
  renderMetrics();
  renderSetup(elements.setupPeek, true);
  renderSetup(elements.setupFull, false);
  renderApplications();
  renderPriorityApps();
  renderPipeline();
  renderBatch();
  renderReports();
  fillStatusFilter();
  renderCareerFlow();
}

function renderMetrics() {
  const metrics = state.data.metrics;
  const setupReady = state.data.setup.filter((item) => item.required && item.ready).length;
  const requiredCount = state.data.setup.filter((item) => item.required).length;
  elements.metrics.innerHTML = [
    ['Tracked roles', metrics.total, `${metrics.actionable} active decisions`],
    ['Average score', metrics.averageScore || '--', `Top score ${metrics.topScore || '--'}`],
    ['Tailored PDFs', metrics.withPdf, 'Generated PDF artifacts'],
    ['Setup ready', `${setupReady}/${requiredCount}`, 'Live workflow files'],
  ].map(([label, value, note]) => `
    <article class="metric">
      <span>${escapeHtml(label)}</span>
      <b>${escapeHtml(value)}</b>
      <small>${escapeHtml(note)}</small>
    </article>
  `).join('');
}

function renderSetup(target, compact) {
  if (!target) return;
  const rows = compact ? state.data.setup.filter((item) => item.required) : state.data.setup;
  target.innerHTML = rows.map((item) => `
    <div class="check">
      <div>
        <b>${escapeHtml(item.label)}</b>
        <code>${escapeHtml(item.path)}</code>
      </div>
      ${tag(item.ready ? 'Ready' : item.required ? 'Missing' : 'Optional', item.ready ? 'good' : item.required ? 'bad' : 'warn')}
    </div>
  `).join('');
}

function flowStorage() {
  return {
    resumeText: elements.resumeText.value,
    targetRoles: elements.targetRoles.value,
    jdContext: elements.jdContext.value,
    locationPreferences: elements.locationPreferences.value,
    workPreferences: elements.workPreferences.value,
    finalResume: elements.finalResume.value,
    jobs: state.flow.jobs,
    resumeFile: state.flow.resumeFile,
    draftBuilt: state.flow.draftBuilt,
  };
}

function saveFlow() {
  localStorage.setItem('career-ops-guided-flow', JSON.stringify(flowStorage()));
}

function restoreFlow() {
  try {
    const stored = JSON.parse(localStorage.getItem('career-ops-guided-flow') || '{}');
    elements.resumeText.value = stored.resumeText || '';
    elements.targetRoles.value = stored.targetRoles || '';
    elements.jdContext.value = stored.jdContext || '';
    elements.locationPreferences.value = stored.locationPreferences || '';
    elements.workPreferences.value = stored.workPreferences || '';
    elements.finalResume.value = stored.finalResume || '';
    state.flow.jobs = Array.isArray(stored.jobs) ? stored.jobs : [];
    state.flow.resumeFile = stored.resumeFile || '';
    state.flow.draftBuilt = Boolean(stored.draftBuilt && elements.finalResume.value);
    if (state.flow.resumeFile) elements.resumeFileNote.textContent = `${state.flow.resumeFile} is attached to this local draft.`;
  } catch {
    localStorage.removeItem('career-ops-guided-flow');
  }
}

function words(value = '') {
  const common = new Set(['about', 'after', 'also', 'and', 'are', 'for', 'from', 'have', 'into', 'job', 'role', 'that', 'the', 'this', 'with', 'work', 'your']);
  return [...new Set(value.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) || [])]
    .filter((word) => !common.has(word))
    .slice(0, 30);
}

function normalizeResumeText(text = '') {
  return String(text)
    .replace(/\r/g, '')
    .replace(/[•●▪]/g, '-')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function readResumeFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  if (extension === 'txt' || extension === 'md') return file.text();
  if (extension === 'pdf') return readPdf(file);
  if (extension === 'docx') return readDocx(file);
  throw new Error('Use a TXT, Markdown, PDF, or DOCX resume.');
}

async function readPdf(file) {
  if (!window.pdfjsLib) throw new Error('PDF parser is unavailable.');
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(' '));
  }
  return pages.join('\n\n');
}

async function readDocx(file) {
  if (!window.mammoth) throw new Error('DOCX parser is unavailable.');
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

function resumeLines(text) {
  return normalizeResumeText(text).split('\n').map((line) => line.trim()).filter(Boolean);
}

function cleanHint(value = '') {
  return value
    .replace(/\*\*/g, '')
    .replace(/^[-*#\s]+/, '')
    .replace(/^\*\*(?:headline|title|location|target roles?|preferred roles?|job descriptions?|preferences?|work preferences?)\*\*:?\s*/i, '')
    .replace(/^(headline|title|location|target roles?|preferred roles?|job descriptions?|preferences?|work preferences?)\s*:?\s*/i, '')
    .trim();
}

function resumeSection(text, names) {
  const namePattern = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const section = normalizeResumeText(text).match(new RegExp(`(?:^|\\n)#{0,3}\\s*(?:${namePattern})\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n#{1,3}\\s|$)`, 'i'));
  return section?.[1]?.trim() || '';
}

function roleHints(text) {
  const hints = [];
  const lines = resumeLines(text);
  const headline = lines.find((line) => /headline\s*:|developer|engineer|designer|manager|architect|analyst/i.test(line) && !/@/.test(line));
  const toward = normalizeResumeText(text).match(/toward\s+(.+?\sroles?)[.\n]/i)?.[1];
  const targetSection = resumeSection(text, ['target roles', 'preferred roles', 'role targets']);
  for (const source of [targetSection, toward, headline]) {
    if (!source) continue;
    cleanHint(source)
      .split(/\s*(?:\||,|\band\b)\s*/i)
      .map(cleanHint)
      .filter((hint) => /(developer|engineer|builder|manager|architect|analyst|generalist|designer)/i.test(hint))
      .slice(0, 4)
      .forEach((hint) => hints.push(hint.replace(/\s+roles?$/i, '')));
  }
  return [...new Set(hints)].slice(0, 4).join('\n');
}

function locationHint(text) {
  const lines = resumeLines(text);
  const explicit = lines.find((line) => /^(?:\*\*)?location(?:\*\*)?\s*:/i.test(line));
  if (explicit) return cleanHint(explicit);
  const headerLocation = lines.slice(0, 8).find((line) => /\b(remote|india|hyderabad|bengaluru|bangalore|delhi|mumbai|pune|chennai|kolkata|united states|usa|europe|uk)\b/i.test(line) && !/@/.test(line));
  return headerLocation ? cleanHint(headerLocation) : '';
}

function preferenceHint(text) {
  const explicit = resumeSection(text, ['preferences', 'work preferences', 'availability']);
  if (explicit) return cleanHint(explicit.split('\n').slice(0, 3).join('; '));
  const lines = resumeLines(text);
  const signals = lines
    .filter((line) => /\b(remote|hybrid|onsite|on-site|relocat|visa|sponsor|timezone|salary)\b/i.test(line) || /^(work\s+)?availability\s*:/i.test(line))
    .filter((line) => !/location/i.test(line))
    .slice(0, 3)
    .map(cleanHint);
  return signals.join('; ');
}

function jobContextHint(text) {
  const explicit = resumeSection(text, ['job description', 'target job', 'target job description', 'desired role']);
  if (explicit) return cleanHint(explicit.split('\n').slice(0, 8).join('\n'));
  const target = resumeSection(text, ['professional summary', 'summary']);
  const skills = resumeSection(text, ['technical skills', 'skills']);
  if (!target && !skills) return '';
  return [
    target ? `Resume summary: ${cleanHint(target.split('\n').slice(0, 3).join(' '))}` : '',
    skills ? `Resume skills: ${cleanHint(skills.split('\n').slice(0, 6).join(' '))}` : '',
  ].filter(Boolean).join('\n');
}

function setEmptyField(field, value, label, filled) {
  if (!value || field.value.trim()) return;
  field.value = value;
  filled.push(label);
}

function prefillFromResume(text) {
  const filled = [];
  setEmptyField(elements.targetRoles, roleHints(text), 'target roles', filled);
  setEmptyField(elements.locationPreferences, locationHint(text), 'locations', filled);
  setEmptyField(elements.workPreferences, preferenceHint(text), 'preferences', filled);
  setEmptyField(elements.jdContext, jobContextHint(text), 'job context', filled);
  elements.resumePrefill.textContent = filled.length
    ? `Filled from resume evidence: ${filled.join(', ')}. Review these fields before continuing.`
    : 'Resume text loaded. No role, job-context, location, or preference fields were filled because those signals were not explicit.';
  return filled;
}

function scoreResume(text = '') {
  const resume = text.trim();
  const roleTerms = words(`${elements.targetRoles.value}\n${elements.jdContext.value}`);
  const matchedTerms = roleTerms.filter((term) => resume.toLowerCase().includes(term.toLowerCase()));
  const sectionChecks = [
    /summary|profile|objective/i,
    /experience|employment|work history/i,
    /skills|tooling|technologies/i,
    /education|degree|certification/i,
    /project|portfolio|achievement/i,
  ].filter((pattern) => pattern.test(resume)).length;
  const structure = Math.min(100, sectionChecks * 18 + (resume.length > 1200 ? 10 : 0));
  const keywords = roleTerms.length ? Math.round((matchedTerms.length / roleTerms.length) * 100) : 55;
  const clarity = Math.min(100, 35 + (resume.split('\n').filter((line) => line.trim().startsWith('-')).length * 8) + (resume.length > 700 ? 20 : 0));
  const evidence = Math.min(100, 30 + ((resume.match(/\d+%|\d+\+|\$\d+|\b\d{2,}\b/g) || []).length * 10) + (/github|portfolio|case study|project/i.test(resume) ? 15 : 0));
  return {
    structure,
    keywords,
    clarity,
    evidence,
    overall: Math.round((structure + keywords + clarity + evidence) / 4),
    roleTerms,
    matchedTerms,
  };
}

function scoreTile(label, value, note) {
  const tone = value >= 80 ? 'good' : value >= 55 ? 'warn' : 'bad';
  return `<article class="score-tile ${tone}"><span>${escapeHtml(label)}</span><b>${value}</b><small>${escapeHtml(note)}</small></article>`;
}

function renderScoreboard(target, score, compact = false) {
  target.innerHTML = [
    scoreTile('ATS score', score.overall, 'Balanced scan'),
    scoreTile('Structure', score.structure, 'Resume sections'),
    scoreTile('Keywords', score.keywords, `${score.matchedTerms.length}/${score.roleTerms.length || 0} terms`),
    scoreTile('Evidence', score.evidence, 'Metrics and proof'),
    ...(compact ? [] : [scoreTile('Clarity', score.clarity, 'Readable bullets')]),
  ].join('');
}

function improvementRows(score) {
  const items = [];
  if (score.structure < 80) items.push(['Resume sections', 'Add summary, skills, experience, education, and projects where supported.']);
  if (score.keywords < 80) items.push(['Target alignment', `Review role terms such as ${score.roleTerms.slice(0, 6).join(', ') || 'role keywords'}.`]);
  if (score.evidence < 75) items.push(['Proof points', 'Keep measurable outcomes and project evidence close to the relevant bullets.']);
  if (score.clarity < 75) items.push(['ATS clarity', 'Prefer concise bullet lines and plain headings over dense paragraphs.']);
  if (!items.length) items.push(['Strong baseline', 'The draft already carries the main ATS signals. Review truth and tone before download.']);
  return items;
}

function renderCareerFlow() {
  if (!elements.track) return;
  const resumeText = elements.finalResume.value || elements.resumeText.value;
  const score = scoreResume(resumeText);
  renderScoreboard(elements.atsScoreboard, score);
  renderScoreboard(elements.finalScoreboard, score, true);
  elements.improvementPlan.innerHTML = improvementRows(score).map(([label, detail]) => `
    <div class="check"><div><b>${escapeHtml(label)}</b><p>${escapeHtml(detail)}</p></div>${tag('Review', 'info')}</div>
  `).join('');
  renderGuidedJobs();
  renderFollowup();
  setSlide(state.flow.slide);
}

function intakeReady() {
  const resumeReady = Boolean(elements.resumeText.value.trim() || state.flow.resumeFile);
  return resumeReady
    && elements.targetRoles.value.trim()
    && elements.jdContext.value.trim()
    && elements.locationPreferences.value.trim()
    && elements.workPreferences.value.trim();
}

function currentGate() {
  if (state.flow.slide === 0) {
    return [Boolean(intakeReady()), 'Complete the resume, roles, job context, locations, and preferences.'];
  }
  if (state.flow.slide === 1) {
    return [state.flow.draftBuilt, 'Approve assisted changes and build the editable resume draft.'];
  }
  if (state.flow.slide === 2) {
    return [elements.finalResume.value.trim().length > 120, 'Keep an editable resume draft before job queueing.'];
  }
  if (state.flow.slide === 3) {
    const queued = state.flow.jobs.some((job) => job.queued);
    return [queued || state.data.pipeline.pending.length > 0, 'Add and approve at least one job for the Career Ops pipeline.'];
  }
  return [false, 'Refresh the tracker after each daily review.'];
}

function setSlide(index) {
  state.flow.slide = Math.max(0, Math.min(4, index));
  elements.track.style.transform = `translateX(-${state.flow.slide * 20}%)`;
  document.querySelectorAll('.deck-dot').forEach((dot) => dot.classList.toggle('active', Number(dot.dataset.slideJump) === state.flow.slide));
  elements.flowBack.disabled = state.flow.slide === 0;
  elements.flowNext.textContent = state.flow.slide === 4 ? 'Done' : 'Next';
  const [ready, message] = currentGate();
  elements.flowNext.disabled = state.flow.slide === 4 || !ready;
  elements.flowGate.textContent = ready ? 'Ready for the next slide.' : message;
  saveFlow();
}

function moveSlide(index) {
  setSlide(index);
  document.querySelector('.flow-deck').scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function createResumeDraft() {
  if (!elements.aiChangeApproval.checked) {
    toast('Approve the AI change gate first.');
    return;
  }
  const source = elements.resumeText.value.trim();
  const keywords = words(`${elements.targetRoles.value}\n${elements.jdContext.value}`).slice(0, 12);
  const summary = `## Targeted Summary\nFocused on ${elements.targetRoles.value.trim().split('\n').slice(0, 2).join(' and ')} roles for ${elements.locationPreferences.value.trim()}.`;
  const alignment = `## Target Keywords\n${keywords.map((keyword) => `- ${keyword}`).join('\n')}`;
  const truth = '## Review Note\nConfirm every metric and claim against the original resume before application.';
  elements.finalResume.value = source
    ? `${source}\n\n${summary}\n\n${alignment}\n\n${truth}`
    : `# Resume Draft\n\n${summary}\n\n${alignment}\n\n## Source\nResume file selected: ${state.flow.resumeFile}\n\n${truth}`;
  state.flow.draftBuilt = true;
  elements.draftStatus.textContent = 'Editable draft built. Review the final resume slide before download.';
  renderCareerFlow();
  toast('Improved resume draft built.');
}

function renderGuidedJobs() {
  elements.guidedJobList.innerHTML = state.flow.jobs.length ? state.flow.jobs.map((job, index) => `
    <article class="list-row">
      <div class="tagline">${tag(job.queued ? 'Queued' : 'Draft', job.queued ? 'good' : 'warn')}${job.company ? tag(job.company, 'info') : ''}</div>
      <h4>${escapeHtml(job.role)}</h4>
      <div class="url">${escapeHtml(job.url)}</div>
      ${job.description ? `<p>${escapeHtml(job.description)}</p>` : ''}
      ${job.queued ? '' : `<button class="button remove-job" type="button" data-remove-job="${index}">Remove</button>`}
    </article>
  `).join('') : empty('Add job roles with URLs to build the approved queue.');
}

function renderFollowup() {
  if (!state.data) return;
  const metrics = state.data.metrics;
  const applied = metrics.byStatus.applied || 0;
  const responded = (metrics.byStatus.responded || 0) + (metrics.byStatus.interview || 0) + (metrics.byStatus.offer || 0);
  const rejected = (metrics.byStatus.rejected || 0) + (metrics.byStatus.discarded || 0) + (metrics.byStatus.skip || 0);
  elements.followupMetrics.innerHTML = [
    scoreTile('Queued', state.data.pipeline.pending.length, 'Inbox jobs'),
    scoreTile('Evaluated', metrics.byStatus.evaluated || 0, 'Reports ready'),
    scoreTile('Applied', applied, 'Sent roles'),
    scoreTile('Progress', responded, 'Replies or interviews'),
    scoreTile('Closed', rejected, 'Rejected or skipped'),
  ].join('');
  elements.followupList.innerHTML = [
    ['Pending URLs', `${state.data.pipeline.pending.length} jobs need evaluation and tailoring.`],
    ['Applied roles', `${applied} roles need daily reply checks and follow-ups.`],
    ['Human approval', 'Open the live application assistant only when you are ready to review and submit.'],
  ].map(([label, detail]) => `<div class="check"><div><b>${escapeHtml(label)}</b><p>${escapeHtml(detail)}</p></div>${tag('Daily', 'info')}</div>`).join('');
}

function renderPriorityApps() {
  const apps = state.data.applications
    .filter((app) => !['skip', 'discarded', 'rejected'].includes(app.statusKey))
    .slice(0, 5);
  elements.priorityApps.innerHTML = apps.length ? apps.map((app) => `
    <article class="app-card">
      <div>
        <div class="tagline">
          ${tag(app.status, statusTone(app.statusKey))}
          ${app.hasPdf ? tag('PDF ready', 'good') : tag('PDF pending', 'warn')}
        </div>
        <h4>${escapeHtml(app.company)} - ${escapeHtml(app.role)}</h4>
        <p>${escapeHtml(app.tldr || app.notes || 'Tracker entry ready for a report summary.')}</p>
      </div>
      <div class="score"><b>${app.score || '--'}</b><span>/ 5 fit</span></div>
    </article>
  `).join('') : empty('No tracker entries yet. Evaluate a live role and it will appear here.');
}

function filteredApplications() {
  const query = state.search.toLowerCase();
  return state.data.applications.filter((app) => {
    const statusMatches = state.status === 'all' || app.statusKey === state.status;
    const textMatches = !query || `${app.company} ${app.role} ${app.notes}`.toLowerCase().includes(query);
    return statusMatches && textMatches;
  });
}

function renderApplications() {
  const apps = filteredApplications();
  elements.applicationTable.innerHTML = apps.length ? apps.map((app) => `
    <tr>
      <td>${app.number}</td>
      <td>
        <strong>${escapeHtml(app.company)}</strong>
        ${escapeHtml(app.role)}
        ${app.jobUrl ? `<div class="url">${escapeHtml(app.jobUrl)}</div>` : ''}
      </td>
      <td><strong>${app.score || '--'}</strong>${escapeHtml(app.scoreRaw || 'N/A')}</td>
      <td>
        <select data-status-number="${app.number}">
          ${state.data.statuses.map((status) => `<option ${status === app.status ? 'selected' : ''}>${escapeHtml(status)}</option>`).join('')}
        </select>
      </td>
      <td>
        <div class="signals">
          ${app.archetype ? `<span>${escapeHtml(app.archetype)}</span>` : ''}
          ${app.remote ? `<span>Remote: ${escapeHtml(app.remote)}</span>` : ''}
          ${app.compensation ? `<span>Comp: ${escapeHtml(app.compensation)}</span>` : ''}
          ${!app.archetype && !app.remote && !app.compensation ? '<span>Report summary pending</span>' : ''}
        </div>
      </td>
      <td>
        <div class="row-actions">
          ${app.reportPath ? `<button class="button" data-report="${escapeHtml(app.reportPath)}">Report</button>` : ''}
          ${app.jobUrl ? `<a class="button" href="${escapeHtml(app.jobUrl)}" target="_blank" rel="noreferrer">Job</a>` : ''}
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="6">${empty('No applications match this filter.')}</td></tr>`;
}

function renderPipeline() {
  const pending = state.data.pipeline.pending;
  const processed = state.data.pipeline.processed;
  elements.pendingPeek.innerHTML = renderPipelineRows(pending.slice(0, 4), 'The URL inbox is empty.');
  elements.workflowPending.innerHTML = renderPipelineRows(pending.slice(0, 5), 'No pending URLs yet. Add a selected job here.');
  elements.pendingList.innerHTML = renderPipelineRows(pending, 'No pending URLs in `data/pipeline.md`.');
  elements.processedList.innerHTML = renderPipelineRows(processed.slice(0, 12), 'No processed URL rows yet.');
}

function renderPipelineRows(rows, emptyText) {
  return rows.length ? rows.map((row) => `
    <article class="list-row">
      <div class="tagline">
        ${tag(row.marker === '!' ? 'Needs attention' : row.marker.toLowerCase() === 'x' ? 'Processed' : 'Pending', row.marker === '!' ? 'bad' : row.marker.toLowerCase() === 'x' ? 'good' : 'warn')}
        ${row.company ? tag(row.company, 'info') : ''}
      </div>
      <h4>${escapeHtml(row.role || row.company || 'Imported job URL')}</h4>
      <div class="url">${escapeHtml(row.url)}</div>
      ${row.detail ? `<p>${escapeHtml(row.detail)}</p>` : ''}
    </article>
  `).join('') : empty(emptyText);
}

function renderBatch() {
  const batch = state.data.batch;
  const header = `
    <div class="tagline">
      ${tag(`${batch.completed} completed`, 'good')}
      ${tag(`${batch.running} running`, 'info')}
      ${tag(`${batch.failed} failed`, batch.failed ? 'bad' : 'warn')}
    </div>
  `;
  const rows = batch.items.map((item) => `
    <article class="list-row">
      <div class="tagline">${tag(item.status || 'unknown', statusTone(item.status))}${item.reportNumber && item.reportNumber !== '-' ? tag(`#${item.reportNumber}`, 'info') : ''}</div>
      <h4>Batch ${escapeHtml(item.id || '?')}</h4>
      <div class="url">${escapeHtml(item.url || 'No URL')}</div>
      <p>${escapeHtml(item.error && item.error !== '-' ? item.error : `Retries: ${item.retries || 0}`)}</p>
    </article>
  `).join('');
  elements.batch.innerHTML = `${header}${rows || empty('No batch state yet. Run the existing batch pipeline to populate this feed.')}`;
}

function renderReports() {
  const reports = state.data.reports;
  elements.reportList.innerHTML = reports.length ? reports.map((report) => `
    <button class="report-button ${report.reportPath === state.reportPath ? 'active' : ''}" data-report="${escapeHtml(report.reportPath)}">
      <b>#${escapeHtml(report.reportNumber || report.number)} ${escapeHtml(report.company)}</b>
      <span>${escapeHtml(report.role)}</span>
    </button>
  `).join('') : empty('Reports linked from the tracker will appear here.');
}

function fillStatusFilter() {
  if (elements.statusFilter.options.length > 1) return;
  const keys = [...new Set(state.data.applications.map((app) => app.statusKey))].sort();
  elements.statusFilter.insertAdjacentHTML('beforeend', keys.map((key) => `<option value="${escapeHtml(key)}">${escapeHtml(key)}</option>`).join(''));
}

function empty(text) {
  return `<div class="empty">${escapeHtml(text)}</div>`;
}

async function openReport(path) {
  const report = await api(`/api/report?path=${encodeURIComponent(path)}`);
  state.reportPath = path;
  elements.reportTitle.textContent = report.path;
  elements.reportContent.textContent = report.markdown;
  setView('reports');
  renderReports();
}

function setView(view) {
  state.view = view;
  document.querySelectorAll('.view').forEach((item) => item.classList.toggle('active', item.id === view));
  document.querySelectorAll('.nav').forEach((item) => item.classList.toggle('active', item.dataset.view === view));
  document.querySelector('#view-title').textContent = titles[view];
}

function toast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('active');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => elements.toast.classList.remove('active'), 2800);
}

document.querySelectorAll('.nav').forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));
document.querySelectorAll('[data-go-view]').forEach((button) => button.addEventListener('click', () => setView(button.dataset.goView)));
document.querySelector('#refresh').addEventListener('click', async () => {
  await load();
  toast('Local Career-Ops data refreshed.');
});
elements.search.addEventListener('input', (event) => {
  state.search = event.target.value;
  renderApplications();
});
elements.statusFilter.addEventListener('change', (event) => {
  state.status = event.target.value;
  renderApplications();
});
document.body.addEventListener('click', (event) => {
  const path = event.target.closest('[data-report]')?.dataset.report;
  if (path) openReport(path).catch((error) => toast(error.message));
});
elements.applicationTable.addEventListener('change', async (event) => {
  const select = event.target.closest('[data-status-number]');
  if (!select) return;
  try {
    const result = await api(`/api/applications/${select.dataset.statusNumber}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: select.value }),
    });
    state.data = result.payload;
    render();
    toast(`Tracker status updated to ${select.value}.`);
  } catch (error) {
    toast(error.message);
    await load();
  }
});
async function submitInbox(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget).entries());
  try {
    const result = await api('/api/pipeline', { method: 'POST', body: JSON.stringify(values) });
    state.data = result.payload;
    render();
    event.currentTarget.reset();
    toast('Job URL added to the pipeline inbox.');
  } catch (error) {
    toast(error.message);
  }
}

document.querySelector('#inbox-form').addEventListener('submit', submitInbox);
elements.flowBack.addEventListener('click', () => moveSlide(state.flow.slide - 1));
elements.flowNext.addEventListener('click', () => moveSlide(state.flow.slide + 1));
document.querySelectorAll('[data-slide-jump]').forEach((button) => button.addEventListener('click', () => {
  if (Number(button.dataset.slideJump) <= state.flow.slide) moveSlide(Number(button.dataset.slideJump));
}));
[elements.resumeText, elements.targetRoles, elements.jdContext, elements.locationPreferences, elements.workPreferences, elements.finalResume].forEach((field) => {
  field.addEventListener('input', () => {
    if (field === elements.resumeText) state.flow.draftBuilt = false;
    renderCareerFlow();
  });
});
elements.resumeFile.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  state.flow.resumeFile = file.name;
  elements.resumeFileNote.textContent = `Parsing ${file.name}...`;
  try {
    const text = normalizeResumeText(await readResumeFile(file));
    elements.resumeText.value = text;
    const filled = prefillFromResume(text);
    elements.resumeFileNote.textContent = `${file.name} parsed${filled.length ? ' and intake fields were filled where resume evidence was found' : ''}.`;
  } catch (error) {
    elements.resumeFileNote.textContent = error.message;
    toast(error.message);
  }
  state.flow.draftBuilt = false;
  renderCareerFlow();
});
elements.buildResumeDraft.addEventListener('click', createResumeDraft);
elements.aiChangeApproval.addEventListener('change', () => {
  elements.draftStatus.textContent = elements.aiChangeApproval.checked
    ? 'Assisted changes approved for the local editable draft.'
    : 'Approve the change gate before moving forward.';
});
elements.downloadResume.addEventListener('click', () => {
  const text = elements.finalResume.value.trim();
  if (!text) {
    toast('Build or edit a resume draft first.');
    return;
  }
  const blob = new Blob([`${text}\n`], { type: 'text/markdown;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'career-ops-tailored-resume.md';
  link.click();
  URL.revokeObjectURL(link.href);
  toast('Resume download started.');
});
document.querySelector('#guided-job-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget).entries());
  state.flow.jobs.unshift({
    company: values.company.trim(),
    role: values.role.trim(),
    url: values.url.trim(),
    description: values.description.trim(),
    queued: false,
  });
  event.currentTarget.reset();
  renderCareerFlow();
});
elements.guidedJobList.addEventListener('click', (event) => {
  const remove = event.target.closest('[data-remove-job]');
  if (!remove) return;
  state.flow.jobs.splice(Number(remove.dataset.removeJob), 1);
  renderCareerFlow();
});
elements.queueApprovedJobs.addEventListener('click', async () => {
  if (!elements.queueApproval.checked) {
    toast('Approve adding the job links before queueing them.');
    return;
  }
  const pending = state.flow.jobs.filter((job) => !job.queued);
  if (!pending.length) {
    toast('Add a new job role first.');
    return;
  }
  let queued = 0;
  for (const job of pending) {
    try {
      const result = await api('/api/pipeline', {
        method: 'POST',
        body: JSON.stringify({ url: job.url, company: job.company, role: job.role }),
      });
      state.data = result.payload;
      job.queued = true;
      queued++;
    } catch (error) {
      toast(`${job.company || job.role}: ${error.message}`);
    }
  }
  elements.queueApproval.checked = false;
  render();
  if (queued) toast(`${queued} approved job link${queued === 1 ? '' : 's'} queued.`);
});

restoreFlow();
setView(state.view);
load().catch((error) => toast(error.message));
