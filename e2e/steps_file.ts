import {
  submissionRetryPolicy,
  submissionRoutes,
  submissionSelectors,
  submissionTimeouts,
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

/**
 * Shared steps cho E2E, ưu tiên tái sử dụng cho các flow submission.
 *
 * Ghi chú:
 * - Các hàm wait dựa trên tín hiệu UI thực tế, tránh sleep cứng.
 * - Editor Monaco được thao tác qua focus + keyboard để hạn chế flaky selector.
 */
export = function (): any {
  return actor({
    /** Đăng nhập bằng cặp email/password truyền vào. */
    login(this: CodeceptJS.I, email: string, password: string) {
      this.amOnPage("/login");
      this.executeScript(() => {
        globalThis.localStorage.clear();
        globalThis.sessionStorage.clear();
      });
      this.fillField("Email", email);
      this.fillField("Mật khẩu", password);
      this.click("Đăng nhập");
    },

    /** Đăng nhập nhanh bằng tài khoản student seed. */
    loginAsStudent(this: CodeceptJS.I) {
      this.loginAsRole("student");
      this.waitInUrl("/student", submissionTimeouts.navigation);
    },

    /** Đăng nhập nhanh bằng tài khoản instructor seed. */
    loginAsInstructor(this: CodeceptJS.I) {
      this.loginAsRole("instructor");
      this.waitInUrl("/instructor", submissionTimeouts.navigation);
    },

    loginAsRole(this: CodeceptJS.I, role: SeedRole) {
      this.login(seedAccounts[role].email, seedAccounts[role].password);
    },

    /** Mở trang chi tiết assignment của student và chờ trang sẵn sàng. */
    openStudentAssignmentDetail(this: CodeceptJS.I, assignmentId: string) {
      this.amOnPage(submissionRoutes.studentAssignmentsDetail(assignmentId));
      this.waitForNoLoadingSignals();
      this.waitForFunction(
        () => {
          const body = document.body.innerText;
          return (
            document.querySelector("h1") !== null ||
            body.includes("Bài tập") ||
            body.includes("Nộp bài")
          );
        },
        [],
        submissionTimeouts.contentReady,
      );
      this.assertNoAppErrorSignals();
    },

    /** Mở trang nộp bài của student (web editor). */
    openStudentSubmissionEditor(this: CodeceptJS.I, assignmentId: string) {
      this.amOnPage(submissionRoutes.studentSubmissionEditor(assignmentId));
      this.waitForSubmissionEditorReady();
    },

    openStudentSubmissionsList(this: CodeceptJS.I) {
      this.navigateToStudentSubmissionsList();
      this.assertStudentSubmissionsListReady();
    },

    openInstructorSubmissionsList(this: CodeceptJS.I) {
      this.navigateToInstructorSubmissionsList();
      this.assertInstructorSubmissionsListReady();
    },

    /** Mở trang chi tiết assignment của instructor. */
    openInstructorAssignmentDetail(this: CodeceptJS.I, assignmentId: string) {
      this.amOnPage(submissionRoutes.instructorAssignmentsDetail(assignmentId));
      this.waitForNoLoadingSignals();
      this.waitForFunction(
        () => {
          const body = document.body.innerText;
          return (
            document.querySelector("h1") !== null ||
            body.includes("Bài nộp") ||
            body.includes("Quản lý")
          );
        },
        [],
        submissionTimeouts.contentReady,
      );
      this.assertNoAppErrorSignals();
    },

    /** Chuyển tab Bài nộp trong màn hình chi tiết assignment (instructor). */
    openInstructorAssignmentSubmissionsTab(this: CodeceptJS.I) {
      this.waitForText("Bài nộp", submissionTimeouts.contentReady);
      this.click("Bài nộp");
      this.waitForNoLoadingSignals();
    },

    navigateToStudentSubmissionsList(this: CodeceptJS.I) {
      this.amOnPage(submissionRoutes.studentSubmissionsList);
      this.waitForNoLoadingSignals();
    },

    navigateToInstructorSubmissionsList(this: CodeceptJS.I) {
      this.amOnPage(submissionRoutes.instructorSubmissionsList);
      this.waitForNoLoadingSignals();
    },

    openStudentSubmissionDetail(this: CodeceptJS.I, submissionId: string) {
      this.amOnPage(submissionRoutes.studentSubmissionDetail(submissionId));
      this.waitForStudentSubmissionDetailReady();
    },

    openInstructorSubmissionDetail(this: CodeceptJS.I, submissionId: string) {
      this.amOnPage(submissionRoutes.instructorSubmissionDetail(submissionId));
      this.waitForInstructorSubmissionDetailReady();
    },

    /** Chờ editor Monaco sẵn sàng để thao tác nhập/xóa code. */
    waitForSubmissionEditorReady(this: CodeceptJS.I) {
      this.waitForNoLoadingSignals();
      this.waitForFunction(
        (submitButtonText: string, languageLabel: string) => {
          const body = document.body.innerText;
          const hasEditor =
            document.querySelector(".monaco-editor") !== null ||
            document.querySelector("[data-testid='submission-code-editor']") !== null ||
            document.querySelector("textarea.inputarea, textarea.ime-text-area") !== null;
          const hasSubmissionSignals =
            body.includes(submitButtonText) ||
            body.includes("Biểu mẫu nộp") ||
            body.includes(languageLabel);

          return hasEditor || hasSubmissionSignals;
        },
        [submissionTexts.common.submitButton, submissionTexts.student.languageLabel],
        submissionTimeouts.contentReady,
      );
      this.assertNoAppErrorSignals();
    },

    waitForStudentSubmissionsListReady(this: CodeceptJS.I) {
      this.assertStudentSubmissionsListReady();
    },

    assertStudentSubmissionsListReady(this: CodeceptJS.I) {
      this.waitForElement(submissionSelectors.common.pageTitle, submissionTimeouts.contentReady);
      this.waitForSubmissionListContentReady(submissionTimeouts.contentReady);
      this.assertNoAppErrorSignals();
    },

    waitForInstructorSubmissionsListReady(this: CodeceptJS.I) {
      this.assertInstructorSubmissionsListReady();
    },

    assertInstructorSubmissionsListReady(this: CodeceptJS.I) {
      this.waitForElement(submissionSelectors.common.pageTitle, submissionTimeouts.contentReady);
      this.waitForFunction(
        (emptyTexts: string[]) => {
          const rows = Array.from(document.querySelectorAll("table tbody tr"));
          const body = document.body.innerText;
          return rows.length > 0 || emptyTexts.some((text) => body.includes(text));
        },
        [submissionTexts.states.emptySubmissionList],
        submissionTimeouts.contentReady,
      );
      this.assertNoAppErrorSignals();
    },

    waitForStudentSubmissionDetailReady(this: CodeceptJS.I) {
      this.waitForElement(submissionSelectors.common.pageTitle, submissionTimeouts.contentReady);
      this.waitForText("Tóm tắt kết quả", submissionTimeouts.contentReady);
      this.waitForText("Mã đã nộp", submissionTimeouts.contentReady);
      this.assertNoAppErrorSignals();
    },

    waitForInstructorSubmissionDetailReady(this: CodeceptJS.I) {
      this.waitForElement(submissionSelectors.common.pageTitle, submissionTimeouts.contentReady);
      this.waitForText("Tóm tắt kết quả", submissionTimeouts.contentReady);
      this.waitForText("Mã đã nộp", submissionTimeouts.contentReady);
      this.assertNoAppErrorSignals();
    },

    /** Nhập code vào Monaco qua editor input để tránh flaky khi gõ từng ký tự. */
    fillSubmissionCode(this: CodeceptJS.I, code: string) {
      this.waitForFunction(
        () =>
          document.querySelector(".monaco-editor") !== null ||
          document.querySelector("[data-testid='submission-code-editor']") !== null ||
          document.querySelector("textarea.inputarea, textarea.ime-text-area") !== null,
        [],
        submissionTimeouts.contentReady,
      );
      this.click(".monaco-editor");
      this.executeScript((nextCode: string) => {
        const anyGlobal = globalThis as unknown as {
          monaco?: {
            editor?: {
              getEditors?: () => Array<{ setValue: (value: string) => void }>;
            };
          };
        };

        const editors = anyGlobal.monaco?.editor?.getEditors?.();
        if (editors && editors.length > 0) {
          editors[0].setValue(nextCode);
          return;
        }

        const textarea = document.querySelector(
          ".monaco-editor textarea.inputarea, [data-testid='submission-code-editor'] textarea.inputarea, [data-testid='submission-code-editor'] textarea",
        ) as HTMLTextAreaElement | null;

        if (!textarea) {
          return;
        }

        textarea.focus();
        textarea.value = nextCode;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        textarea.dispatchEvent(new Event("change", { bubbles: true }));
      }, code);
    },

    /** Xóa toàn bộ code hiện tại trong Monaco. */
    clearSubmissionCode(this: CodeceptJS.I) {
      this.fillSubmissionCode("");
    },

    /** Click nút Nộp bài khi nút đã hiển thị trên UI. */
    clickSubmitCode(this: CodeceptJS.I) {
      this.waitForText(submissionTexts.common.submitButton, submissionTimeouts.action);
      this.click(submissionTexts.common.submitButton);
    },

    /** Flow submit solution đầy đủ: nhập code rồi submit. */
    submitCurrentSolution(this: CodeceptJS.I, code: string) {
      this.fillSubmissionCode(code);
      this.clickSubmitCode();
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
        this.waitForFunction(
          (loadingSignals: string[]) => {
            const rows = Array.from(document.querySelectorAll("table tbody tr"));
            if (!rows.length) return true;
            const rowsText = rows.map((row) => row.textContent || "").join(" ");
            return !loadingSignals.some((signal) => rowsText.includes(signal));
          },
          [submissionTexts.common.loadingSignals],
          sec,
        );
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

    /** Assert không có tín hiệu lỗi ứng dụng ở mức toàn trang. */
    assertNoAppErrorSignals(this: CodeceptJS.I) {
      this.waitForFunction(
        (appErrorSignals: string[]) =>
          !appErrorSignals.some((signal) => document.body.innerText.includes(signal)),
        [submissionTexts.common.appErrorSignals],
        submissionTimeouts.appErrorCheck,
      );
    },

    /** Chờ trạng thái queued theo retry policy cho các flow cần polling. */
    waitForSubmissionQueuedState(this: CodeceptJS.I) {
      for (let attempt = 0; attempt < submissionRetryPolicy.queuedStateAttempts; attempt += 1) {
        try {
          this.waitForAnyText(
            submissionTexts.states.queuedSubmission,
            submissionRetryPolicy.queuedStatePerAttemptSec,
          );
          return;
        } catch (error) {
          if (attempt === submissionRetryPolicy.queuedStateAttempts - 1) {
            throw error;
          }
          this.waitForNoLoadingSignals(submissionTimeouts.action);
        }
      }
    },
  });
};
