import { setHeadlessWhen, setCommonPlugins } from "@codeceptjs/configure"
import os from "os"

// Run headless in CI, headed locally
setHeadlessWhen(process.env.CI)

// Enable common plugins
setCommonPlugins()

const BASE_URL = process.env.APP_URL || "http://localhost:5173"

export const config: CodeceptJS.MainConfig = {
  tests: "./tests/**/*.test.ts",
  output: "./output",
  bootstrap: async () => {
    const { bootstrap } = await import("./bootstrap")
    bootstrap()
  },
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
      links: {
        issue: {
          urlTemplate: "https://github.com/APSAS-Testing-Course-UTH/apsas-test/issues/%s",
        },
        tms: {
          urlTemplate: "https://github.com/APSAS-Testing-Course-UTH/apsas-test/issues?q=%s",
        },
      },
      environmentInfo: {
        os_platform: os.platform(),
        os_release: os.release(),
        os_version: os.version(),
        node_version: process.version,
      },
    },
  },
  name: "apsas-e2e",
}
