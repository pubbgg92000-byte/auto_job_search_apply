# CoSTAR ATS Intelligence Prototype

This workspace contains a browser-local Phase 2 prototype for the CoSTAR PRD:
ATS intelligence, resume upload/parsing, semantic job matching, evidence-based
rewrites, and resume version tracking.

## Run

Open `index.html` in a browser. No server is required.

## What is implemented

- Drag-and-drop resume upload for TXT, PDF, and DOCX.
- Browser-side parsing and normalization.
- Section, skill, contact, and evidence chunk extraction.
- ATS scoring across formatting, readability, keyword alignment, and measurable impact.
- Job-description semantic matching with exact, transferable, and missing keyword groups.
- Evidence-backed rewrite diffs that map each optimized line to a source chunk.
- Local version history in `localStorage`.
- Career Ops command-center view for local job preparation, workflow retries,
  recruiter/ATS readiness, and explicit human approval checkpoints.
- JSON export for parsed metadata, analysis, match data, and rewrites.

## Notes

PDF and DOCX extraction use browser libraries from public CDNs in this static
prototype. A production Next.js implementation should move parsing behind
server routes with `pdf-parse`, `mammoth`, OCR fallback, parser logs, and file
persistence. The UI and data contracts here are shaped so those services can
replace the in-browser pipeline later.

The Career Ops page adapts the root project's pipeline, batch, tracker, and
apply-mode ideas into sample browser state. It does not read tracker files,
run real workflow queues, invoke MCP modules, or submit applications.

## Phase 2 backend targets

- `resume_chunks`
- `ats_analysis`
- `resume_evidence_links`
- `parsing_logs`

## Phase 2 API targets

- `POST /api/resume/upload`
- `POST /api/resume/parse`
- `POST /api/resume/analyze`
- `POST /api/resume/tailor`
- `GET /api/resume/export`
- `POST /api/ats/score`
- `POST /api/ats/keywords`
- `GET /api/ats/report`
