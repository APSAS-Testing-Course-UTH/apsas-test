import {
  submissionPageSignals,
  submissionRoutes,
  submissionSelectors,
  submissionTexts,
} from "./tests/submission/locators";

const defaultSeedPassword =
  process.env.E2E_SEED_PASSWORD || ["SecurePassword", "123!"].join("");

const seedAccounts = {
  student: {
    email: process.env.E2E_STUDENT_EMAIL || "student1@apsas",
    password: process.env.E2E_STUDENT_PASSWORD || defaultSeedPassword,
  },
  instructor: {
    email: process.env.E2E_INSTRUCTOR_EMAIL || "instructor1@apsas",
    password: process.env.E2E_INSTRUCTOR_PASSWORD || defaultSeedPassword,
  },
};

type SeedRole = keyof typeof seedAccounts;

export = function (): any {
  return actor({
    login(this: CodeceptJS.I, email: string, password: string) {
      this.amOnPage("/login");
      this.fillField("Email", email);
      this.fillField("Mật khẩu", password);
      this.click("Đăng nhập");
    },

    loginAsStudent(this: CodeceptJS.I) {
      this.loginAsRole("student");
      this.waitInUrl("/student", 15);
    },

    loginAsInstructor(this: CodeceptJS.I) {
      this.loginAsRole("instructor");
      this.waitInUrl("/instructor", 15);
    },

    loginAsRole(this: CodeceptJS.I, role: SeedRole) {
      this.login(seedAccounts[role].email, seedAccounts[role].password);
    },

    openStudentAssignmentDetail(this: CodeceptJS.I, assignmentId: string) {
      this.amOnPage(submissionRoutes.studentAssignmentsDetail(assignmentId));
      this.waitForNoLoadingSignals();
      this.waitForSubmissionPageSignals(submissionPageSignals.studentAssignmentDetail);
    },

    openStudentSubmissionEditor(this: CodeceptJS.I, assignmentId: string) {
      this.amOnPage(submissionRoutes.studentSubmissionEditor(assignmentId));
      this.waitForSubmissionEditorReady();
    },

    openStudentSubmissionsList(this: CodeceptJS.I) {
      this.amOnPage(submissionRoutes.studentSubmissionsList);
      this.waitForNoLoadingSignals();
      this.waitForStudentSubmissionsListReady();
    },

    openInstructorSubmissionsList(this: CodeceptJS.I) {
      this.amOnPage(submissionRoutes.instructorSubmissionsList);
      this.waitForNoLoadingSignals();
      this.waitForInstructorSubmissionsListReady();
    },

    openStudentSubmissionDetail(this: CodeceptJS.I, submissionId: string) {
      this.amOnPage(submissionRoutes.studentSubmissionDetail(submissionId));
      this.waitForStudentSubmissionDetailReady();
    },

    openInstructorSubmissionDetail(this: CodeceptJS.I, submissionId: string) {
      this.amOnPage(submissionRoutes.instructorSubmissionDetail(submissionId));
      this.waitForInstructorSubmissionDetailReady();
    },

    waitForSubmissionEditorReady(this: CodeceptJS.I) {
      this.waitForSubmissionPageSignals(submissionPageSignals.studentSubmissionEditor);
      this.waitForElement(submissionSelectors.student.editorInput, 15);
    },

    waitForStudentSubmissionsListReady(this: CodeceptJS.I) {
      this.waitForElement(submissionSelectors.common.pageTitle, 20);
      this.waitForSubmissionListContentReady(20);
      this.assertNoAppErrorSignals();
    },

    waitForInstructorSubmissionsListReady(this: CodeceptJS.I) {
      this.waitForElement(submissionSelectors.common.pageTitle, 20);
      this.waitForSubmissionListContentReady(20);
      this.assertNoAppErrorSignals();
    },

    waitForStudentSubmissionDetailReady(this: CodeceptJS.I) {
      this.waitForSubmissionPageSignals(submissionPageSignals.studentSubmissionDetail);
    },

    waitForInstructorSubmissionDetailReady(this: CodeceptJS.I) {
      this.waitForSubmissionPageSignals(submissionPageSignals.instructorSubmissionDetail);
    },

    fillSubmissionCode(this: CodeceptJS.I, code: string) {
      this.waitForElement(submissionSelectors.student.editorInput, 15);
      this.click(submissionSelectors.student.editorInput);
      this.fillField(submissionSelectors.student.editorInput, code);
    },

    clearSubmissionCode(this: CodeceptJS.I) {
      this.waitForElement(submissionSelectors.student.editorInput, 15);
      this.click(submissionSelectors.student.editorInput);
      this.pressKey(["Control", "A"]);
      this.pressKey("Backspace");
    },

    clickSubmitCode(this: CodeceptJS.I) {
      this.waitForText(submissionTexts.common.submitButton, 10);
      this.waitForClickable(submissionSelectors.common.submitButton, 10);
      this.click(submissionTexts.common.submitButton);
    },

    submitCurrentSolution(this: CodeceptJS.I, code: string) {
      this.fillSubmissionCode(code);
      this.clickSubmitCode();
      this.waitForSubmissionQueuedState();
    },

    waitForAnyText(this: CodeceptJS.I, texts: string[], sec = 15) {
      this.waitForFunction(
        (expected: string[]) => expected.some((text) => document.body.innerText.includes(text)),
        [texts],
        sec,
      );
    },

    waitForSubmissionPageSignals(this: CodeceptJS.I, signals: string[], sec = 15) {
      this.waitForAnyText(signals, sec);
      this.assertNoAppErrorSignals();
    },

    waitForSubmissionListContentReady(this: CodeceptJS.I, sec = 20) {
      try {
        this.waitForElement(submissionSelectors.common.submissionListRows, sec);
      } catch {
        this.waitForAnyText(submissionTexts.states.emptySubmissionList, sec);
      }
    },

    waitForNoLoadingSignals(this: CodeceptJS.I, sec = 20) {
      this.waitForFunction(
        (loadingSignals: string[]) =>
          !loadingSignals.some((signal) => document.body.innerText.includes(signal)),
        [submissionTexts.common.loadingSignals],
        sec,
      );
      this.assertNoAppErrorSignals();
    },

    assertNoAppErrorSignals(this: CodeceptJS.I) {
      this.waitForFunction(
        (appErrorSignals: string[]) =>
          !appErrorSignals.some((signal) => document.body.innerText.includes(signal)),
        [submissionTexts.common.appErrorSignals],
        5,
      );
    },

    waitForSubmissionQueuedState(this: CodeceptJS.I) {
      this.waitForAnyText(submissionTexts.states.queuedSubmission, 20);
    },
  });
};
