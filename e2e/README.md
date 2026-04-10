# APSAS E2E Tests

End-to-end tests for APSAS using [CodeceptJS](https://codecept.io/) + [Playwright](https://playwright.dev/).

> E2E uses the real backend stack (not MSW mock mode).

## Prerequisites

- Node.js 18+
- Docker + Docker Compose

## Setup

```bash
cd e2e
npm install
```

## Running Tests

### Run full E2E stack (backend + piston + frontend) and execute tests

```bash
npm run test:ci
```

This uses Docker Compose (`docker-compose.e2e.yaml`) to:
1. Start backend infrastructure + backend services + piston API
2. Start frontend with `VITE_ENABLE_MSW=false`
3. Wait for services to become healthy
4. Run CodeceptJS against `http://localhost:5173`
5. Tear down the stack after tests finish

### Manage stack manually

```bash
npm run stack:up
npm run test:real
npm run stack:down
```

### Run with parallel workers

```bash
npm run test:parallel
```

## Allure Report

Generate and view Allure reports from CodeceptJS results:

```bash
# Run tests and generate report
npm run test:allure

# Open generated report
npm run allure:open
```

You can also serve directly from raw results:

```bash
npm run allure:serve
```

## Project Structure

```
e2e/
├── tests/             # Test files (*.test.js)
│   ├── login.test.js
│   └── register.test.js
├── steps_file.js      # Custom step definitions (shared helpers)
├── codecept.conf.js   # CodeceptJS configuration
├── docker-compose.e2e.yaml # Full E2E runtime stack
├── allure-results/    # Raw Allure results (git-ignored)
├── allure-report/     # Generated Allure report (git-ignored)
├── output/            # Screenshots, test artifacts (git-ignored)
└── package.json
```

## Writing Tests

Tests follow the [BDD-style Gherkin syntax](https://codecept.io/basics/#writing-tests):

```js
Feature("My Feature")

Scenario("does something", ({ I }) => {
  I.amOnPage("/some-path")
  I.see("Expected text")
  I.fillField("Label", "value")
  I.click("Button text")
})
```

See [CodeceptJS Playwright helper docs](https://codecept.io/helpers/Playwright/) for all available actions.

## Test Accounts

Use accounts available in your backend seed data/environment.
Current smoke tests expect the default seeded student account:

| Role    | Email                | Password    |
|---------|----------------------|-------------|
| Student | student@apsas.edu.vn | Student@123 |

## CI Integration

Set the `CI` environment variable to run tests in headless mode (GitHub Actions sets this automatically):

```bash
CI=true npm test
```
