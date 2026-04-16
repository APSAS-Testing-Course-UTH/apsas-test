import * as allure from "allure-js-commons";

const STUDENT_PASSED_SUBMISSION_ID = "80000000-0000-0000-0000-000000000001";
const PASSED_SUBMISSION_ID = "80000000-0000-0000-0000-000000000002";
const FAILED_SUBMISSION_ID = "80000000-0000-0000-0000-000000000005";
const PARTIAL_SUBMISSION_ID = "80000000-0000-0000-0000-000000000003";
const MAX_LOGIN_ATTEMPTS = 2;
const LOGIN_TIMEOUT_SECONDS = 30;

async function loginAsStudent(I: CodeceptJS.I, email: string): Promise<void> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_LOGIN_ATTEMPTS; attempt++) {
    I.amOnPage("/login");
    I.fillField("Email", email);
    I.fillField("Mật khẩu", "SecurePassword123!");
    I.click("Đăng nhập");

    try {
      await I.waitInUrl("/student/dashboard", LOGIN_TIMEOUT_SECONDS);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Failed to login as student ${email}`);
}

Feature("Evaluation Service");

Scenario(
  "EVL-E2E-001: Show evaluated summary for seeded submission",
  async ({ I }) => {
    await allure.epic("evaluation");
    await allure.feature("submission flow");
    await allure.story("student sees summary of an evaluated submission");
    await allure.severity("critical");
    await allure.tag("e2e");
    await allure.tag("regression");
    await allure.tms("EVL-E2E-001");
    await allure.issue("37");

    await loginAsStudent(I, "student1@apsas");

    I.amOnPage(`/student/submissions/${STUDENT_PASSED_SUBMISSION_ID}`);
    I.waitForText("Tóm tắt kết quả", 15);
    I.see("ĐÃ ĐÁNH GIÁ");
    I.see("Điểm số");
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

Scenario("EVL-E2E-004: Display PARTIAL result details", async ({ I }) => {
  await allure.epic("evaluation");
  await allure.feature("evaluation flow");
  await allure.story("student sees a partial evaluation result");
  await allure.severity("critical");
  await allure.tag("e2e");
  await allure.tag("regression");
  await allure.tms("EVL-E2E-004");
  await allure.issue("37");

  await loginAsStudent(I, "student3@apsas");

  I.amOnPage(`/student/submissions/${PARTIAL_SUBMISSION_ID}`);
  I.waitForText("Tóm tắt kết quả", 30);
  I.see("ĐÃ ĐÁNH GIÁ");
  I.see("ĐẠT MỘT PHẦN");
  I.see("Kết quả kiểm tra");
});

Scenario(
  "EVL-E2E-005: Instructor feedback is visible to student",
  async ({ I }) => {
    await allure.epic("evaluation");
    await allure.feature("feedback flow");
    await allure.story("student reads instructor feedback");
    await allure.severity("normal");
    await allure.tag("e2e");
    await allure.tag("regression");
    await allure.tms("EVL-E2E-005");
    await allure.issue("37");

    await loginAsStudent(I, "student2@apsas");
    I.amOnPage(`/student/submissions/${PASSED_SUBMISSION_ID}`);
    I.waitForText("Phản hồi từ giáo viên", 30);
    I.see("Excellent! Clean and efficient code.");
  },
);
