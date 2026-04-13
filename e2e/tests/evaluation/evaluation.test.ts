import * as allure from "allure-js-commons";
import path from "path";
import type { Page, Response } from "playwright";

const APP_URL = process.env.APP_URL || "http://localhost:5173";
const HELLO_WORLD_ASSIGNMENT_ID = "550e8400-e29b-41d4-a716-446655440001";
const PASSED_SUBMISSION_ID = "80000000-0000-0000-0000-000000000002";
const FAILED_SUBMISSION_ID = "80000000-0000-0000-0000-000000000005";

async function waitForTextWithReload(
  I: CodeceptJS.I,
  text: string,
  timeoutSeconds: number,
  stepSeconds = 15,
): Promise<void> {
  const attempts = Math.ceil(timeoutSeconds / stepSeconds);
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      I.waitForText(text, stepSeconds);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        I.refreshPage();
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Text "${text}" was not found after ${timeoutSeconds} seconds`);
}

async function loginAsStudent(I: CodeceptJS.I, email: string): Promise<void> {
  I.amOnPage("/login");
  I.fillField("Email", email);
  I.fillField("Mật khẩu", "SecurePassword123!");
  I.click("Đăng nhập");
  I.waitInUrl("/student/dashboard", 30);
}

async function loginAsInstructor(I: CodeceptJS.I): Promise<void> {
  I.amOnPage("/login");
  I.fillField("Email", "instructor1@apsas");
  I.fillField("Mật khẩu", "SecurePassword123!");
  I.click("Đăng nhập");
  I.waitForText("Quản lý", 20);
  I.waitInUrl("/instructor/dashboard", 20);
}

async function submitAssignmentViaUi(
  I: CodeceptJS.I,
  assignmentId: string,
  fileName: string,
  afterSubmit?: (page: Page, submissionId: string) => Promise<void>,
): Promise<void> {
  const filePath = path.resolve(__dirname, "../../fixtures", fileName);

  I.amOnPage(`/student/submission/${assignmentId}`);
  I.waitForText("Nhập mã code", 20);

  I.usePlaywrightTo(
    "populate Monaco editor and submit code",
    async ({ page }: { page: Page }) => {
      await page.getByRole("tab", { name: "Tải lên tệp" }).click();
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(filePath);

      const responsePromise = page.waitForResponse(
        (response: Response) => {
          return (
            response.url().includes("/api/v1/submissions") &&
            response.request().method() === "POST"
          );
        },
        { timeout: 15000 },
      );

      await page.getByRole("button", { name: "Nộp bài" }).click();

      const response = await responsePromise;
      const payload = await response.json();
      const submissionId: string = payload?.id || "";

      if (afterSubmit) {
        await afterSubmit(page, submissionId);
      }
    },
  );
}

Feature("Evaluation Service");

Scenario(
  "EVL-E2E-001: Show evaluating status after submission",
  async ({ I }) => {
    await allure.epic("evaluation");
    await allure.feature("submission flow");
    await allure.story("student sees submission processing state");
    await allure.severity("critical");
    await allure.tag("e2e");
    await allure.tag("regression");
    await allure.tms("EVL-E2E-001");
    await allure.issue("37");

    await loginAsStudent(I, "student1@apsas");

    await submitAssignmentViaUi(I, HELLO_WORLD_ASSIGNMENT_ID, "hello_world.c");
    I.waitForText("Code của bạn đang được kiểm tra", 15);
    I.see("Bài nộp thành công!");
  },
);

Scenario(
  "EVL-E2E-002: Display PASSED result for correct code",
  async ({ I }) => {
    await allure.epic("evaluation");
    await allure.feature("evaluation flow");
    await allure.story("student sees a passed submission");
    await allure.severity("critical");
    await allure.tag("e2e");
    await allure.tag("regression");
    await allure.tms("EVL-E2E-002");
    await allure.issue("37");

    await loginAsStudent(I, "student2@apsas");

    I.amOnPage(`/student/submissions/${PASSED_SUBMISSION_ID}`);
    I.waitForText("Tóm tắt kết quả", 15);
    I.see("ĐÃ ĐÁNH GIÁ");
    I.see("ĐẠT");
    I.see("Kết quả kiểm tra");
    I.see("Phản hồi từ giáo viên");
  },
);

Scenario(
  "EVL-E2E-003: Display FAILED result for wrong logic",
  async ({ I }) => {
    await allure.epic("evaluation");
    await allure.feature("evaluation flow");
    await allure.story("student sees a failed submission");
    await allure.severity("critical");
    await allure.tag("e2e");
    await allure.tag("regression");
    await allure.tms("EVL-E2E-003");
    await allure.issue("37");

    await loginAsStudent(I, "student1@apsas");

    I.amOnPage(`/student/submissions/${FAILED_SUBMISSION_ID}`);
    I.waitForText("Tóm tắt kết quả", 15);
    I.see("ĐÃ ĐÁNH GIÁ");
    I.see("KHÔNG ĐẠT");
    I.click("Xem chi tiết");
    I.see("No output produced");
  },
);

Scenario("EVL-E2E-004: Display compilation error details", async ({ I }) => {
  await allure.epic("evaluation");
  await allure.feature("evaluation flow");
  await allure.story("student sees a compilation failure");
  await allure.severity("critical");
  await allure.tag("e2e");
  await allure.tag("regression");
  await allure.tms("EVL-E2E-004");
  await allure.issue("37");

  await loginAsStudent(I, "student4@apsas");

  await submitAssignmentViaUi(
    I,
    HELLO_WORLD_ASSIGNMENT_ID,
    "compile_error.c",
    async (page, submissionId) => {
      if (!submissionId) {
        throw new Error(
          `Submission ID was not returned for assignment ${HELLO_WORLD_ASSIGNMENT_ID}`,
        );
      }
      await page.goto(`${APP_URL}/student/submissions/${submissionId}`);
    },
  );

  I.waitForText("Tóm tắt kết quả", 30);
  try {
    await waitForTextWithReload(I, "ĐANG CHỜ", 30, 10);
  } catch {
  }
  await waitForTextWithReload(I, "ĐÃ ĐÁNH GIÁ", 180, 15);
  I.see("Mã đã nộp");
  I.see("c");
  I.click("Xem chi tiết");
  I.see("compile_error.c");
  I.see("error:");
});

Scenario(
  "EVL-E2E-005: Instructor feedback is visible to student",
  async ({ I }) => {
    const feedbackMessage = `Good job! Your code is correct. ${Date.now()}`;

    await allure.epic("evaluation");
    await allure.feature("feedback flow");
    await allure.story("instructor adds feedback and student reads it");
    await allure.severity("normal");
    await allure.tag("e2e");
    await allure.tag("regression");
    await allure.tms("EVL-E2E-005");
    await allure.issue("37");

    await loginAsInstructor(I);
    I.amOnPage(`/instructor/submissions/${PASSED_SUBMISSION_ID}`);
    I.waitForText("Chi tiết Bài nộp", 15);
    I.click("Cung cấp phản hồi");
    I.fillField("Phản hồi chi tiết", feedbackMessage);
    I.click("Gửi phản hồi");
    I.waitForText(feedbackMessage, 30);

    await loginAsStudent(I, "student2@apsas");
    I.amOnPage(`/student/submissions/${PASSED_SUBMISSION_ID}`);
    I.waitForText("Phản hồi từ giáo viên", 30);
    await waitForTextWithReload(I, feedbackMessage, 90, 15);
  },
);
