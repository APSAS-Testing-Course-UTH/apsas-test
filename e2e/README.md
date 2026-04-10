# APSAS E2E Tests

End-to-end tests for APSAS using [CodeceptJS](https://codecept.io/) + [Playwright](https://playwright.dev/).

> E2E uses the real backend stack (not MSW mock mode). Smoke/mock-only test scenarios are removed.

## Prerequisites

- Node.js 18+
- Docker + Docker Compose

## Setup

```bash
cd e2e
bun install
```

## Running Tests

### Run full E2E stack (backend + piston + frontend) and execute tests

```bash
bun run test:e2e
```

This uses Docker Compose (`docker-compose.e2e.yaml`) to:

1. Start backend infrastructure + backend services + piston API
2. Start frontend with `VITE_ENABLE_MSW=false`
3. Wait for services to become healthy
4. Run CodeceptJS against `http://localhost:5173`
5. Tear down the stack after tests finish

### Manage stack manually

```bash
bun run stack:up
bun run test:real
bun run stack:down
```

### Run with parallel workers

```bash
bun run test:parallel
```

## Allure Report

Generate and view Allure reports from CodeceptJS results:

```bash
# Run tests and generate report
bun run test:allure

# Open generated report
bun run allure:open
```

You can also serve directly from raw results:

```bash
bun run allure:serve
```

## Project Structure

```
e2e/
├── tests/             # Test files (*.test.ts)
│   └── login.test.ts
├── steps_file.ts      # Custom step definitions (shared helpers)
├── codecept.conf.js   # CodeceptJS configuration
├── docker-compose.e2e.yaml # Full E2E runtime stack
├── tsconfig.json      # TypeScript configuration
├── allure-results/    # Raw Allure results (git-ignored)
├── allure-report/     # Generated Allure report (git-ignored)
├── output/            # Screenshots, test artifacts (git-ignored)
└── package.json
```

## Writing Tests

Tests follow the [BDD-style Gherkin syntax](https://codecept.io/basics/#writing-tests):

```ts
Feature("My Feature");

Scenario("does something", ({ I }) => {
  I.amOnPage("/some-path");
  I.see("Expected text");
  I.fillField("Label", "value");
  I.click("Button text");
});
```

See [CodeceptJS Playwright helper docs](https://codecept.io/helpers/Playwright/) for all available actions.

## Test Accounts

Use accounts available in your backend seed data/environment.
The current automated regression login scenario uses:

| Email                 | Password    |
| --------------------- | ----------- |
| student@apsas.edu.vn  | Student@123 |

## CI Integration

Set the `CI` environment variable to run tests in headless mode (GitHub Actions sets this automatically):

```bash
CI=true bun test
```
