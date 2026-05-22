# CoSTAR Phase 2 README

## Status

Phase 2 has been added as a browser-local ATS Intelligence prototype inside:

`phase2-ats-prototype/`

The original Career Ops project has also been restored into the repository root
at:

`/Users/arvind/auto_job_search_apply`

The Phase 2 prototype is currently static HTML/CSS/JavaScript so it can run
immediately without a Next.js backend, database migration, or cloud services.

## Live URL

When the local server is running from the project root:

```bash
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/phase2-ats-prototype/
```

## What Was Built In Phase 2

### 1. Resume Upload Interface

Built a drag-and-drop resume upload screen that supports:

- TXT upload
- PDF upload
- DOCX upload
- manual file picker
- drag-over state
- parsing progress indicator
- parsed text preview panel

Files are processed locally in the browser.

### 2. Resume Parsing

Built a browser-side parsing pipeline that extracts:

- candidate name
- email
- phone-like contact text
- summary/profile
- skills
- work experience
- projects
- education
- certifications

The parser normalizes resume text and separates content into resume sections.

### 3. Resume Evidence Chunks

Built an evidence chunk system that converts parsed resume sections into
structured chunks.

Each chunk includes:

- chunk id
- chunk type
- source content
- detected keywords
- bullet/source metadata

These chunks are used by the rewrite engine so generated improvements can be
traced back to original resume evidence.

### 4. ATS Intelligence Dashboard

Built an ATS dashboard with score cards for:

- ATS score
- recruiter readability
- keyword alignment
- evidence safety

The dashboard also shows:

- ATS issues
- missing sections
- weak impact signals
- missing measurable achievements
- keyword heatmap
- job-specific coverage tags

### 5. Semantic Job Matching

Built a job-description matching screen where a user can paste a target role.

The match engine identifies:

- exact keyword matches
- transferable skill matches
- missing keyword gaps
- overall role fit score

This is currently local keyword and relationship scoring. It is designed to be
replaced later by embeddings and vector search.

### 6. Evidence-Based Resume Rewrite Diff

Built a side-by-side resume diff screen showing:

- original bullet
- optimized bullet
- ATS improvement reason
- source chunk id
- source evidence text

The rewrite logic avoids unsupported claims by generating improvements only from
detected source chunks.

### 7. Resume Version Tracking

Built local version history using `localStorage`.

Saved version metadata includes:

- resume name
- source file name
- created timestamp
- ATS score
- detected skills
- chunk count
- analysis output
- rewrite output

### 8. JSON Export

Built an export flow that downloads:

- parsed resume metadata
- ATS analysis
- semantic match results
- evidence rewrite diffs
- export timestamp

The exported file is named:

`costar-resume-intelligence.json`

### 9. MCP Workflow Representation

Added a visible MCP workflow layer in the UI for:

- Filesystem MCP
- Vector DB MCP
- AI Gateway MCP
- Playwright MCP

In this static prototype these are represented as workflow contracts, not live
MCP calls. The UI and data structure are ready to connect to real MCP-backed
services later.

### 10. Career Ops Command Center

Added a Career Ops view that brings Career-Ops operating concepts into the
browser prototype:

- local application pipeline rows with fit, ATS readiness, recruiter
  confidence, stage, and next action
- batch/workflow operations with a retry simulation
- discovery, ATS, rewrite, recruiter, and supervisor agent activity cards
- approval checkpoints that pause prepared application assets before any
  manual candidate action
- live readiness signals from the existing ATS analysis and semantic match
  state when a resume has been loaded

This command center uses sample local prototype data. It does not yet wire
Career-Ops tracker files, reports, MCP modules, browser form workflows, queues,
or persistent workflow state.

## Files Added For Phase 2

```text
phase2-ats-prototype/index.html
phase2-ats-prototype/README.md
PHASE_2_README.md
```

## Existing Project Restored

The Career Ops project code was merged into:

`/Users/arvind/auto_job_search_apply`

Restored project areas include:

- `README.md`
- `docs/`
- `modes/`
- `.claude/`
- `.opencode/`
- `templates/`
- `examples/`
- `fonts/`
- `batch/`
- `dashboard/`
- pipeline scripts such as `doctor.mjs`, `generate-pdf.mjs`,
  `verify-pipeline.mjs`, and `normalize-statuses.mjs`

## Installed/Verified

Installed npm dependencies:

```bash
npm install
```

Installed Playwright Chromium:

```bash
npx playwright install chromium
```

Ran doctor check:

```bash
npm run doctor
```

Passing:

- Node.js version
- npm dependencies
- Playwright Chromium
- fonts directory
- data directory
- output directory
- reports directory

Still requiring user setup:

- `cv.md`
- `config/profile.yml`
- `portals.yml`

These were not auto-created because they require your personal resume, profile,
and target company details.

## Current Limitations

This Phase 2 version is a prototype, not the final production backend.

Current limitations:

- no Prisma schema migration yet
- no SQLite persistence yet
- no real vector database yet
- no live Ollama/OpenRouter/AI provider calls yet
- no real MCP server calls yet
- no OCR fallback yet
- PDF/DOCX parsing depends on browser CDN libraries
- semantic scoring is keyword/relationship based, not embeddings based
- Career Ops workflows and approvals are browser-local simulations

## Planned Production Integration

The next production step is to move the prototype logic into the real app stack:

- Next.js App Router UI
- TypeScript components
- API routes
- Prisma + SQLite tables
- local file persistence
- Ollama/free AI provider routing
- MCP workflow adapters
- vector search for resume/job chunks

### Target Database Tables

```text
resume_chunks
ats_analysis
resume_evidence_links
parsing_logs
```

### Target API Endpoints

```text
POST /api/resume/upload
POST /api/resume/parse
POST /api/resume/analyze
POST /api/resume/tailor
GET  /api/resume/export
POST /api/ats/score
POST /api/ats/keywords
GET  /api/ats/report
```

## Phase 2 Product Summary

Phase 2 turns the project from a simple career automation helper into an ATS
intelligence system with:

- local resume upload
- structured resume understanding
- ATS scoring
- semantic job matching
- evidence-backed rewriting
- recruiter readability checks
- version history
- exportable intelligence metadata

The most important design rule implemented is:

Generated resume improvements must trace back to original resume evidence.
