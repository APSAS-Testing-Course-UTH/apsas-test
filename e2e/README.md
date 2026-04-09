# APSAS E2E Tests

End-to-end tests for APSAS using [CodeceptJS](https://codecept.io/) + [Playwright](https://playwright.dev/).

## Prerequisites

- Node.js 18+
- The frontend dev server (auto-started when running `npm run test:ci`)

## Setup

```bash
cd e2e
npm install
```

## Running Tests

### Spin up frontend automatically and run tests (CI / local integration)

```bash
npm run test:ci
```

This uses `start-server-and-test` to:
1. Start the Vite dev server on `http://localhost:5173`
2. Wait until the server is ready
3. Run the full CodeceptJS suite
4. Shut down the server when tests finish

### Run tests against an already-running frontend

```bash
# Start the frontend first (in a separate terminal):
cd ../frontend && npm run dev

# Then run e2e tests:
cd e2e && npm test
```

### Run tests against a custom URL

```bash
APP_URL=http://localhost:4173 npm test
```

### Run with parallel workers

```bash
npm run test:parallel
```

## Project Structure

```
e2e/
├── tests/             # Test files (*.test.js)
│   ├── login.test.js
│   └── register.test.js
├── steps_file.js      # Custom step definitions (shared helpers)
├── codecept.conf.js   # CodeceptJS configuration
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

## Mock Accounts (MSW)

The frontend uses MSW for API mocking in development. Available test accounts:

| Role       | Email                    | Password        |
|------------|--------------------------|-----------------|
| Student    | student@apsas.edu.vn     | Student@123     |
| Instructor | instructor@apsas.edu.vn  | Instructor@123  |
| Provider   | provider@apsas.edu.vn    | Provider@123    |
| Admin      | admin@apsas.edu.vn       | Admin@123       |

## CI Integration

Set the `CI` environment variable to run tests in headless mode (GitHub Actions sets this automatically):

```bash
CI=true npm test
```
