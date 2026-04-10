# AGENTS.md

## Project Overview

This folder contains APSAS end-to-end tests using:

- CodeceptJS test runner
- Playwright browser automation
- Allure reporting via `allure-codeceptjs`

E2E is expected to run against the real stack (gateway + backend services + piston + frontend), not a mock-only flow.

## Scope and Boundaries

- Make E2E changes inside `e2e/` only unless a request explicitly requires cross-project edits.
- Keep scenarios focused on observable behavior.
- Prefer minimal, targeted changes over broad refactors.

## Setup Commands

Run all commands from `e2e/`.

Preferred setup:

```bash
bun install
bun run setup:playwright
```

## Development Workflow

Fast local checks:

```bash
npx codeceptjs check
bun run test
bun run test:parallel
```

Single-command with real stack:

```bash
bun run test:e2e
```

Run against already-running app:

```bash
APP_URL=http://localhost:5173 bun run test:real
```

Full real-stack workflow:

```bash
bun run stack:up
bun run test:real
bun run stack:down
```

Single-command CI-style workflow:

```bash
bun run test:ci
```

## Testing Instructions

### Test Locations and Naming

- Test files: `tests/**/*.test.js`
- Shared helper steps: `steps_file.js`
- Main config: `codecept.conf.js`

### Runtime Expectations

- Default base URL is `http://localhost:5173`.
- Override URL with `APP_URL`.
- Headless mode is controlled by `CI`.

### E2E Stack Composition

`docker-compose.e2e.yaml` starts:

- backend infrastructure (PostgreSQL, RabbitMQ, Redis)
- APSAS backend services and API gateway
- Piston API
- frontend with `VITE_ENABLE_MSW=false`

## CodeceptJS + Allure Authoring Guidelines

Use these conventions when writing or updating `tests/*.test.js`.

### Scenario Design Rules

- One business behavior per `Scenario`.
- Prefer user-facing selectors (label, visible text, role) before CSS fallbacks.
- Avoid fixed sleeps; wait on meaningful UI states.
- Reuse shared actions in `steps_file.js` for repeated flows.
- Keep data deterministic and independent between scenarios.

### Required Allure Metadata for Scenarios

Apply backend-style reporting discipline to e2e scenarios so triage is consistent.
Each scenario should set:

- `allure.epic(...)`
- `allure.feature(...)`
- `allure.story(...)`
- `allure.severity("critical" | "normal" | "minor")`
- `allure.owner(...)`
- `allure.tag("e2e")`
- `allure.tag("smoke")` or `allure.tag("regression")`

Recommended pattern:

```js
const { allure } = require("allure-codeceptjs");

Feature("Authentication");

Scenario("student logs in with valid credentials", async ({ I }) => {
  allure.epic("Learning Platform Access");
  allure.feature("Authentication");
  allure.story("Student Login");
  allure.severity("critical");
  allure.owner("qa-e2e");
  allure.tag("e2e");
  allure.tag("smoke");

  I.amOnPage("/login");
  I.fillField("Email", "student@apsas.edu.vn");
  I.fillField("Mật khẩu", "Student@123");
  I.click("Đăng nhập");
  I.waitForNavigation();
  I.dontSeeInCurrentUrl("/login");
});
```

## Allure Report Commands

Generate and open report:

```bash
bun run test:allure
bun run allure:open
```

Serve directly from raw results:

```bash
bun run allure:serve
```

Artifacts:

- Raw results: `allure-results/`
- Generated HTML report: `allure-report/`
- Codecept output/screenshots: `output/`

## Code Style Guidelines

- Follow existing JavaScript style used in nearby test files.
- Use clear, behavior-oriented scenario names.
- Keep helper methods in `steps_file.js` semantic and reusable.
- Do not reformat unrelated files.

## Security and Data Handling

- Do not commit real credentials, secrets, or tokens.
- Use seeded/test accounts and environment variables only.
- Never attach sensitive values in Allure artifacts.

## Build and Execution Notes

- `test:e2e` performs stack-up, real test run, and stack-down through npm lifecycle hooks.
- `postinstall` and `setup:playwright` ensure browser binary/dependencies are installed.
- API gateway is reachable at `http://localhost:8080` during real-stack runs.

## Pull Request Checklist

Before opening or updating a PR with E2E changes:

```bash
npx codeceptjs check
bun run test
```

For integration confidence:

```bash
bun run test:ci
```

Do not commit generated artifacts:

- `output/`
- `allure-results/`
- `allure-report/`

## Troubleshooting

- Missing browser/system deps: run `bun run setup:playwright`.
- Stack startup issues: verify Docker daemon and retry `bun run stack:up`.
- Frontend unreachable: confirm `http://localhost:5173` is ready before running tests.
- Config updates: run `npx codeceptjs check` after editing `codecept.conf.js`.
