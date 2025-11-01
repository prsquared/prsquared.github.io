# CHRL-KE Practice Exam

A static, client-side HTML/JavaScript application delivering a 250-question CHRL Knowledge Exam (practice) across 13 paginated pages. Each page contains at most 20 questions (final page has 10) with per-page scoring and persistent answer storage using `localStorage`.

## Contents
- `index.html` – Launcher UI (tabs, page navigation iframe, aggregate progress indicator)
- `index.js` – Navigation logic (exam/page switching, iframe source updates, progress aggregation)
- `Exam1/` – Folder containing `exam-page1.html` … `exam-page13.html`
- `Exam2/` – (skeleton) placeholder pages `exam-page1.html` … `exam-page13.html` ready for question authoring

## Features
- 250 globally numbered questions (q1–q250) across domains (Strategy, Professional Practice, Organizational Effectiveness, Workforce Planning & Talent Management, Labour & Employee Relations, Total Rewards, Learning & Development, Health, Wellness & Safe Workplace, HR Metrics & Financial Management, Enabling/Integration).
- Each page self-contained: markup, inline CSS, answer key, evaluation script, and rationale metadata (in HTML comments).
- Per-page scoring: user sees score X / page total + unanswered list.
- Persistence: Answers stored per page via key pattern `CHRL_EXAM{examNumber}_PAGE{pageNumber}_ANSWERS`.
- Aggregate Progress: Launcher shows overall answered count and percentage (0–250) derived from stored page answers.
- Full Exam Submission: Launcher button computes total score across all 250 questions, lists unanswered IDs, and records timestamp.
- Clear All: Launcher button removes every per-page answer key and the stored global result for a fresh attempt and broadcasts a `postMessage` event (`CHRL_GLOBAL_CLEARED`) so the currently loaded page instantly resets its UI without manual refresh.
- Scenario MCQs, standard MCQs, and limited short-answer text items (case-insensitive evaluation) in designated pages.
- No build step, no external dependencies (pure vanilla JS + HTML + inline CSS).

## Running
Simply open `index.html` in a modern browser (Chrome, Edge, Firefox). The launcher loads page 1 in an iframe. Use:
- Exam tabs (if more exams added) to switch exam context.
- Page buttons or Previous/Next to navigate.
- Each page's own navigation links for direct browsing outside iframe if desired.

## Answer Persistence & Scoring
- Selecting or typing an answer auto-saves to `localStorage` immediately (`change` event).
- Clicking Submit on a page evaluates all questions on that page only and applies `correct` / `incorrect` CSS classes to fieldsets.
- Clearing answers via the page Clear button removes that page's storage entry and styling.
- Aggregate progress updates when switching pages or when other tabs modify stored answers (via `storage` event listener).
- Full exam submission normalizes short-answer responses (trim + lowercase) before comparison against consolidated key.

## Storage Keys
Pattern: `CHRL_EXAM1_PAGE{N}_ANSWERS` for Exam 1 pages. Do NOT modify existing keys if preserving user progress. When adding Exam 2, use `CHRL_EXAM2_PAGE{N}_ANSWERS` and update `NUMBER_OF_EXAMS` and page files accordingly.
Global full-exam result key: `CHRL_EXAM{exam}_GLOBAL_RESULT` storing `{ exam, score, total, percent, unanswered:[], timestamp }`.
Global clear broadcast (not persisted): parent iframe sends `window.postMessage({ type: 'CHRL_GLOBAL_CLEARED', exam, timestamp })` to the active page so it can run its local clear routine.

## Adding a New Exam or Pages
1. Duplicate an existing page file as a template (`exam-pageX.html`).
2. Update title, header, navigation links (prev/next), question range, STORAGE_KEY, and answerKey object.
3. Maintain global question ID continuity per exam (questions are 1–250 within each exam; do not mix IDs across exams in the launcher global key unless intentionally aggregating).
4. If adding a new exam folder (e.g., `Exam3/`), create all page files first, then bump `NUMBER_OF_EXAMS` in `index.js`.
5. Keep per-page maximum: 20 questions (except final page if fewer remain).
6. For skeleton exams (like current `Exam2/`) authoring involves populating fieldsets, metadata comments, and extending the optional global consolidated key if you intend cross-exam full submission scoring in future.

## Short-Answer Items
- Implemented by using text inputs/IDs with answer normalization (`trim().toLowerCase()`).
- Present on select pages (e.g., page 5 and page 13). Expand by replicating existing pattern (check answerKey for those IDs).

## Accessibility & Semantics
- Each question in a `fieldset` with `legend` supporting screen readers.
- Labels wrap radio inputs for improved clickable area.
- ARIA label added on short-answer inputs for clarity.
- Consider future enhancement: add `aria-live` region for score updates.

## Styling Conventions
- Reuse class names: `correct`, `incorrect`, `actions`, `page-hint`.
- Consistent neutral backgrounds; green/red feedback highlight using existing CSS classes.

## Aggregate Progress Logic
- In `index.js`, counts keys for current exam across all pages, summing answered item counts.
- Total = 250 (pages 1–12 × 20 + page 13 × 10).
- Updates on page/exam changes and window `storage` events.

## Rationale & Metadata
- For each question, rationale + domain/competency/source stored in HTML comments directly below the legend for exam-author traceability without exposing to learners.

## Clearing All Progress
Use the launcher "Clear All Answers" button to remove all page answer keys and the global result key, resetting progress and total score display.

Manual console alternative:
```js
Object.keys(localStorage).forEach(k => { if (k.startsWith('CHRL_EXAM1_PAGE') || k === 'CHRL_EXAM1_GLOBAL_RESULT') localStorage.removeItem(k); });
```

## Contributing
- Preserve existing key patterns and CSS class names.
- Add new logic cautiously: ensure initialization loads saved answers before attaching listeners.
- Keep questions Canadian context and domain alignment.

## Potential Enhancements
- Domain-level progress breakdown.
- Export answers to JSON or CSV.
- Add overall score compilation after all pages submitted.
- Mobile responsive refinement for navigation bar wrapping.

## License / Usage
Internal educational practice resource. Avoid distributing proprietary source references publicly; maintain citation comments internally.

---
Questions or updates: Extend pages or add features following conventions above.
