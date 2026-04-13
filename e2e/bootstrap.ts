import path from "path";
import { promises as fs } from "fs";
import { event, recorder, container } from "codeceptjs";
import allure, { ContentType } from "allure-js-commons";

function sanitizeFileName(input: string): string {
  return String(input)
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}

export function bootstrap(): void {
  event.dispatcher.on(event.test.finished, (test: CodeceptJS.Test) => {
    if (test.state !== "failed") {
      return;
    }

    recorder.add("capture screenshot for failed test", async () => {
      const playwright = container.helpers("Playwright") as any;

      if (!playwright || typeof playwright.saveScreenshot !== "function") {
        return;
      }

      const status = test.state || "finished";
      const baseName = sanitizeFileName(
        `${test.title || "scenario"}_${status}_${Date.now()}`,
      );
      const screenshotFileName = `${baseName}.png`;
      const outputDir = path.resolve(__dirname, "output");
      const screenshotPath = path.join(outputDir, screenshotFileName);

      try {
        await playwright.saveScreenshot(screenshotFileName, true);
        await fs.access(screenshotPath);
        await allure.attachmentPath(`Screenshot (${status})`, screenshotPath, {
          contentType: ContentType.PNG,
          fileExtension: "png",
        });
      } catch {
        // Ignore attachment errors to avoid hiding test result.
      }
    });
  });
}
