const { chromium } = require("playwright")
const { execSync } = require("node:child_process")
const path = require("node:path")

function run(command) {
  execSync(command, { stdio: "inherit" })
}

function hasMissingSharedLibraries(executablePath) {
  if (process.platform !== "linux") {
    return false
  }

  try {
    const output = execSync(`ldd "${executablePath}"`, { encoding: "utf8" })
    return output.includes("not found")
  } catch {
    // If ldd fails for any reason, attempt dependency installation as a safe fallback.
    return true
  }
}

function setupPlaywright() {
  const playwrightBin = path.join(__dirname, "..", "node_modules", ".bin", "playwright")

  // Always ensure the browser binary is present.
  run(`"${playwrightBin}" install chromium`)

  // On Linux/WSL, ensure required shared libraries exist.
  if (process.platform === "linux") {
    const browserPath = chromium.executablePath()
    if (hasMissingSharedLibraries(browserPath)) {
      console.log("Detected missing Playwright system dependencies. Installing Linux browser deps...")
      run(`"${playwrightBin}" install-deps chromium`)
    }
  }
}

setupPlaywright()
