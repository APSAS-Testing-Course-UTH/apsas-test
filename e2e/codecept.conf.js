const { setHeadlessWhen, setCommonPlugins } = require("@codeceptjs/configure")

// Run headless in CI, headed locally
setHeadlessWhen(process.env.CI)

// Enable common plugins
setCommonPlugins()

const BASE_URL = process.env.APP_URL || "http://localhost:5173"

/** @type {CodeceptJS.MainConfig} */
exports.config = {
  tests: "./tests/**/*.test.js",
  output: "./output",
  helpers: {
    Playwright: {
      url: BASE_URL,
      show: !process.env.CI,
      browser: "chromium",
      waitForNavigation: "networkidle",
      waitForTimeout: 10000,
    },
  },
  include: {
    I: "./steps_file.js",
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
}
