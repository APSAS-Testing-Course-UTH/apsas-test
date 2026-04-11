import { setHeadlessWhen, setCommonPlugins } from "@codeceptjs/configure";

// Run headless in CI, headed locally
setHeadlessWhen(process.env.CI);

// Enable common plugins
setCommonPlugins();

const BASE_URL = process.env.APP_URL || "http://localhost:5173";

export const config: CodeceptJS.MainConfig = {
  tests: "./tests/**/*.test.ts",
  output: "./output",
  require: ["ts-node/register/transpile-only"],
  helpers: {
    Playwright: {
      url: BASE_URL,
      show: !process.env.CI,
      browser: "chromium",
      waitForNavigation: "domcontentloaded",
      waitForTimeout: 10000,
    },
  },
  include: {
    I: "./steps_file.ts",
  },
  plugins: {
    pauseOnFail: {},
    retryFailedStep: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
    },
    allure: {
      enabled: true,
      require: "allure-codeceptjs",
      outputDir: "allure-results",
    },
  },
  name: "apsas-e2e",
};
