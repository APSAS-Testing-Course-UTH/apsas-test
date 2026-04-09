# E2E Testing Agent Guide

This directory contains the APSAS end-to-end test project built with CodeceptJS + Playwright.

## Scope

- Work only inside the `e2e/` directory for E2E changes.
- Prefer minimal, focused test updates.
- Do not modify backend services for E2E-only requests.

## Prerequisites

- Node.js 18+.
- Frontend app available at `http://localhost:5173`.
- Frontend dev server command is `bun run dev` (from `frontend/`).

## Common Commands

Run from the `e2e/` directory:

```bash
npm install
npx codeceptjs check
npm test
npm run test:ci
npm run test:parallel
```

## Allure Reporting

```bash
npm run test:allure
npm run allure:open
```

- Raw results are written to `allure-results/`.
- Generated HTML report is written to `allure-report/`.

## Test Authoring Rules

- Keep selectors stable and user-facing (labels/text) before CSS selectors.
- Prefer short smoke scenarios that validate critical flows.
- Reuse shared steps in `steps_file.js` when behavior repeats.
- Keep tests deterministic (avoid random waits; prefer explicit checks).

## Validation Before Completion

- Run `npx codeceptjs check` after config changes.
- If tests were changed, run at least the impacted scenarios.
- Ensure generated artifacts are not committed (`output/`, `allure-results/`, `allure-report/`).
