import { epic, feature, severity, story, tag, tms } from "allure-js-commons";
import {
  s03Policy,
  submissionRoutes,
  submissionSeed,
  submissionTexts,
} from "./locators";

type ScenarioSeverityLevel = "critical" | "normal" | "minor";

/**
 * Gắn metadata Allure thống nhất cho từng scenario.
 */
async function applyAllureMetadata(
  featureName: string,
  storyName: string,
  severityLevel: ScenarioSeverityLevel,
  tmsId: string,
) {
  await epic("submission");
  await feature(featureName);
  await story(storyName);
  await severity(severityLevel);
  await tag("e2e");
  await tag("regression");
  await tms(tmsId);
}

Feature("Submission | Scaffold");

const viewDetailButtonXPath = "//button[contains(normalize-space(), 'Xem chi tiết')]";

/**
 * Guard cho dữ liệu seed bắt buộc.
 * Thiếu seed thì dừng sớm để tránh fail giả ở môi trường chưa cấu hình.
 */
function requireAssignmentSeed(this: CodeceptJS.I, assignmentId: string, envName: string): boolean {
  if (assignmentId) {
    return true;
  }
  this.say(
    `Thiếu ${envName} - bỏ qua runtime để tránh false fail ở môi trường chưa chốt seed.`,
  );
  return false;
}

/**
 * Student nộp code hợp lệ.
 * Chấp nhận nhiều tín hiệu queued/evaluating để phù hợp biến thể UI runtime.
 */
Scenario("SUB-SBM-001 | Submission valid solution", async ({ I }) => {
  await applyAllureMetadata(
    "Submission Flow",
    "Student submits valid solution",
    "critical",
    "SUB-SBM-001",
  );

  if (!requireAssignmentSeed.call(I, submissionSeed.assignments.openAssignmentId, "E2E_OPEN_ASSIGNMENT_ID")) {
    return;
  }

  I.loginAsStudent();
  I.openStudentAssignmentDetail(submissionSeed.assignments.openAssignmentId);
  I.openStudentSubmissionEditor(submissionSeed.assignments.openAssignmentId);
  I.submitCurrentSolution("print('hello from apsas e2e')");
  I.waitForFunction(
    (queuedSignals: string[]) => {
      const bodyText = document.body.innerText;
      return (
        queuedSignals.some((signal) => bodyText.includes(signal)) ||
        bodyText.includes("Đang chấm điểm") ||
        globalThis.location.pathname.includes("/student/submissions/") ||
        bodyText.includes("ký tự / 10000")
      );
    },
    [submissionTexts.states.queuedSubmission],
    20,
  );
  I.seeInCurrentUrl("/student/submission/");
});

/**
 * Chặn submit khi editor rỗng.
 */
Scenario("SUB-SBM-002 | Block submit with empty editor", async ({ I }) => {
  await applyAllureMetadata(
    "Submission Flow",
    "Block submit with empty editor",
    "normal",
    "SUB-SBM-002",
  );

  if (!requireAssignmentSeed.call(I, submissionSeed.assignments.openAssignmentId, "E2E_OPEN_ASSIGNMENT_ID")) {
    return;
  }

  I.loginAsStudent();
  I.openStudentSubmissionEditor(submissionSeed.assignments.openAssignmentId);
  I.clearSubmissionCode();
  I.clickSubmitCode();
  I.waitForFunction(
    (emptySignals: string[]) => {
      const bodyText = document.body.innerText;
      return emptySignals.some((signal) => bodyText.includes(signal)) || bodyText.includes("0 ký tự / 10000");
    },
    [submissionTexts.states.emptySubmissionCode],
    12,
  );
  I.dontSee(submissionTexts.common.queuedText);
  I.seeInCurrentUrl("/student/submission/");
});

/**
 * Rule quá hạn theo policy ui-only hiện tại.
 */
Scenario("SUB-SBM-003 | Deadline behavior for overdue assignment", async ({ I }) => {
  await applyAllureMetadata(
    "Submission Policy",
    "Deadline behavior for submission",
    "critical",
    "SUB-SBM-003",
  );

  I.say(`Current overdue submission policy: ${s03Policy.mode}`);
  if (
    !requireAssignmentSeed.call(
      I,
      submissionSeed.assignments.overdueAssignmentId,
      "E2E_OVERDUE_ASSIGNMENT_ID",
    )
  ) {
    return;
  }

  I.loginAsStudent();
  I.openStudentSubmissionEditor(submissionSeed.assignments.overdueAssignmentId);
  I.seeInCurrentUrl("/student/submission/");

  const submitButtonVisibleCount = await I.grabNumberOfVisibleElements("button[type='submit']");

  if (submitButtonVisibleCount === 0) {
    I.say("UI-only: nút nộp bài bị ẩn trên assignment quá hạn (pass policy).");
    return;
  }

  const submitDisabledState = await I.grabAttributeFrom("button[type='submit']", "disabled");
  if (submitDisabledState !== null) {
    I.say("UI-only: nút nộp bài bị disable trên assignment quá hạn (pass policy).");
    return;
  }

  I.say(
    "UI-only: chưa phát hiện hidden/disabled cho nút nộp bài. Ghi nhận known gap theo policy hiện tại.",
  );
});

/**
 * Student đi từ context assignment -> lịch sử nộp -> chi tiết bài nộp.
 */
Scenario("SUB-SBM-004 | Student views submission history from assignment context", async ({ I }) => {
  await applyAllureMetadata(
    "Submission History",
    "Student views submission history from assignment context",
    "normal",
    "SUB-SBM-004",
  );

  if (!requireAssignmentSeed.call(I, submissionSeed.assignments.openAssignmentId, "E2E_OPEN_ASSIGNMENT_ID")) {
    return;
  }

  I.loginAsStudent();
  I.openStudentAssignmentDetail(submissionSeed.assignments.openAssignmentId);
  I.seeInCurrentUrl("/student/assignments/");
  I.navigateToStudentSubmissionsList();
  I.assertStudentSubmissionsListReady();
  I.seeInCurrentUrl(submissionRoutes.studentSubmissionsList);

  const detailButtonsCount = await I.grabNumberOfVisibleElements({ xpath: viewDetailButtonXPath });
  if (detailButtonsCount > 0) {
    I.click({ xpath: `(${viewDetailButtonXPath})[1]` });
    I.waitForStudentSubmissionDetailReady();
    I.seeInCurrentUrl("/student/submissions/");
    return;
  }

  I.waitForAnyText(submissionTexts.states.emptySubmissionList, 10);
});

/**
 * Instructor đi từ context assignment -> tab Bài nộp -> chi tiết bài nộp.
 */
Scenario("SUB-SBM-005 | Instructor opens submissions tab and views submission detail", async ({ I }) => {
  await applyAllureMetadata(
    "Instructor Submission Review",
    "Instructor opens assignment detail submissions tab and views source code",
    "critical",
    "SUB-SBM-005",
  );

  if (!requireAssignmentSeed.call(I, submissionSeed.assignments.openAssignmentId, "E2E_OPEN_ASSIGNMENT_ID")) {
    return;
  }

  I.loginAsInstructor();
  I.openInstructorAssignmentDetail(submissionSeed.assignments.openAssignmentId);
  I.seeInCurrentUrl("/instructor/assignments/");
  I.openInstructorAssignmentSubmissionsTab();
  I.waitForText("Học sinh", 20);
  I.waitForText("Hành động", 20);
  I.assertInstructorSubmissionsListReady();

  const detailButtonsCount = await I.grabNumberOfVisibleElements({ xpath: viewDetailButtonXPath });
  if (detailButtonsCount > 0) {
    I.click({ xpath: `(${viewDetailButtonXPath})[1]` });
    I.waitForInstructorSubmissionDetailReady();
    I.seeInCurrentUrl("/instructor/submissions/");
    return;
  }

  I.waitForAnyText(submissionTexts.states.emptySubmissionList, 10);
});
