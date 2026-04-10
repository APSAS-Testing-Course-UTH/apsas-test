# E2E Testing Agent Guide

This directory contains the APSAS end-to-end test project built with CodeceptJS + Playwright.
E2E must run with the real backend stack (no MSW mock-only flow).

## Scope

- Work only inside the `e2e/` directory for E2E changes.
- Prefer minimal, focused test updates.
- Do not modify backend services for E2E-only requests.

## Prerequisites

- Node.js 18+.
- Docker + Docker Compose available locally.

## Common Commands

Run from the `e2e/` directory:

```bash
npm install
npx codeceptjs check
npm test
npm run test:ci
npm run test:parallel
npm run stack:up
npm run stack:down
npm run test:real
```

## Allure Reporting

```bash
npm run test:allure
npm run allure:open
```

- Raw results are written to `allure-results/`.
- Generated HTML report is written to `allure-report/`.

## Runtime Stack for Real E2E

- Use `docker-compose.e2e.yaml` to run:
  - backend infrastructure and backend services
  - piston API
  - frontend configured with `VITE_ENABLE_MSW=false`
- Default frontend URL for tests is `http://localhost:5173`.
- API gateway is exposed on `http://localhost:8080`.

## Test Authoring Rules

- Keep selectors stable and user-facing (labels/text) before CSS selectors.
- Prefer short smoke scenarios that validate critical flows.
- Reuse shared steps in `steps_file.js` when behavior repeats.
- Keep tests deterministic (avoid random waits; prefer explicit checks).

## Validation Before Completion

- Run `npx codeceptjs check` after config changes.
- If tests were changed, run at least the impacted scenarios.
- For CI/integration validation, run `npm run test:ci` to exercise the real stack.
- Ensure generated artifacts are not committed (`output/`, `allure-results/`, `allure-report/`).
