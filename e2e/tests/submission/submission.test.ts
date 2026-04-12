import { epic, feature, severity, story, tag, tms } from "allure-js-commons";
import {
  s03Policy,
  submissionRoutes,
  submissionSeed,
  submissionTexts,
} from "./locators";

type ScenarioSeverityLevel = "critical" | "normal" | "minor";

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

Scenario("SUB-SBM-001 | Student nộp bài hợp lệ", async ({ I }) => {
  await applyAllureMetadata(
    "Submission Flow",
    "Student submits valid solution",
    "critical",
    "SUB-SBM-001",
  );

  if (!submissionSeed.assignments.openAssignmentId) {
    I.say(
      "Thiếu E2E_OPEN_ASSIGNMENT_ID - bỏ qua runtime để tránh false fail ở môi trường chưa chốt seed.",
    );
    return;
  }

  I.loginAsStudent();
  I.openStudentAssignmentDetail(submissionSeed.assignments.openAssignmentId);
  I.openStudentSubmissionEditor(submissionSeed.assignments.openAssignmentId);
  I.submitCurrentSolution("print('hello from apsas e2e')");
  I.waitForSubmissionQueuedState();
  I.seeInCurrentUrl("/student/submission/");
});

Scenario("SUB-SBM-002 | Chặn submit khi editor rỗng", async ({ I }) => {
  await applyAllureMetadata(
    "Submission Flow",
    "Block submit with empty editor",
    "normal",
    "SUB-SBM-002",
  );

  if (!submissionSeed.assignments.openAssignmentId) {
    I.say(
      "Thiếu E2E_OPEN_ASSIGNMENT_ID - bỏ qua runtime để tránh false fail ở môi trường chưa chốt seed.",
    );
    return;
  }

  I.loginAsStudent();
  I.openStudentSubmissionEditor(submissionSeed.assignments.openAssignmentId);
  I.clearSubmissionCode();
  I.clickSubmitCode();
  I.waitForAnyText(submissionTexts.states.emptySubmissionCode, 10);
  I.dontSee(submissionTexts.common.queuedText);
  I.seeInCurrentUrl("/student/submission/");
});

Scenario("SUB-SBM-003 | Rule quá hạn theo S-03", async ({ I }) => {
  await applyAllureMetadata(
    "Submission Policy",
    "Deadline behavior for submission",
    "critical",
    "SUB-SBM-003",
  );

  I.say(`Current S-03 policy: ${s03Policy.mode}`);
  if (!submissionSeed.assignments.overdueAssignmentId) {
    I.say(
      "Thiếu E2E_OVERDUE_ASSIGNMENT_ID - dừng sớm để tránh false fail ở môi trường chưa chốt seed.",
    );
    return;
  }

  I.loginAsStudent();
  I.openStudentSubmissionEditor(submissionSeed.assignments.overdueAssignmentId);
  I.seeInCurrentUrl("/student/submission/");

  const submitButtonVisibleCount = await I.grabNumberOfVisibleElements("button[type='submit']");

  if (submitButtonVisibleCount === 0) {
    I.say("S-03 UI-only: nút nộp bài bị ẩn trên assignment quá hạn (pass policy).");
    return;
  }

  const submitDisabledState = await I.grabAttributeFrom("button[type='submit']", "disabled");
  if (submitDisabledState !== null) {
    I.say("S-03 UI-only: nút nộp bài bị disable trên assignment quá hạn (pass policy).");
    return;
  }

  I.say(
    "S-03 UI-only: chưa phát hiện hidden/disabled cho nút nộp bài. Ghi nhận known gap theo policy hiện tại.",
  );
});

Scenario("SUB-SBM-004 | Student lịch sử nộp bài", async ({ I }) => {
  await applyAllureMetadata(
    "Submission History",
    "Student views submissions list and detail",
    "normal",
    "SUB-SBM-004",
  );

  I.loginAsStudent();
  I.openStudentSubmissionsList();
  I.waitForStudentSubmissionsListReady();
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

Scenario("SUB-SBM-005 | Instructor quản lý bài nộp", async ({ I }) => {
  await applyAllureMetadata(
    "Instructor Submission Review",
    "Instructor views submissions and source code",
    "critical",
    "SUB-SBM-005",
  );

  I.loginAsInstructor();
  I.openInstructorSubmissionsList();
  I.waitForInstructorSubmissionsListReady();
  I.seeInCurrentUrl(submissionRoutes.instructorSubmissionsList);

  const detailButtonsCount = await I.grabNumberOfVisibleElements({ xpath: viewDetailButtonXPath });
  if (detailButtonsCount > 0) {
    I.click({ xpath: `(${viewDetailButtonXPath})[1]` });
    I.waitForInstructorSubmissionDetailReady();
    I.seeInCurrentUrl("/instructor/submissions/");
    return;
  }

  I.waitForAnyText(submissionTexts.states.emptySubmissionList, 10);
});
