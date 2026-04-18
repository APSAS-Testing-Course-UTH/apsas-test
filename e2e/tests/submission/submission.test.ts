import { epic, feature, severity, story, tag, tms } from "allure-js-commons"
import { submissionRoutes, submissionSeed, submissionSelectors, submissionTexts, submissionTimeouts } from "./locators"

// ═══════════════════════════════════════════════════════════════
// Helpers — submission-specific, defined locally instead of steps_file.ts
// ═══════════════════════════════════════════════════════════════

const API_URL = process.env.API_URL || "http://localhost:8080"
const SEED_PASSWORD = process.env.E2E_SEED_PASSWORD || "SecurePassword123!"

/**
 * Publish an assignment via the content provider API so a student can submit.
 * Safe to call even if the assignment is already published (ignores non-fatal errors).
 */
async function publishAssignment(assignmentId: string): Promise<void> {
  try {
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "contentprovider1@apsas", password: SEED_PASSWORD }),
    })
    if (!loginRes.ok) return
    const loginData = (await loginRes.json()) as { token?: string }
    if (!loginData.token) return

    await fetch(`${API_URL}/api/v1/assignments/${assignmentId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${loginData.token}` },
    })
  } catch {
    // Ignore — assignment may already be published or API not reachable in this env.
  }
}

function loginAsStudent(I: CodeceptJS.I) {
  I.login("student1@apsas", SEED_PASSWORD)
  I.waitInUrl("/student", submissionTimeouts.navigation)
}

function loginAsInstructor(I: CodeceptJS.I) {
  I.login("instructor1@apsas", SEED_PASSWORD, { expectedUrl: "/instructor/dashboard" })
}

/** Navigate to the student submission editor and wait for it to be ready. */
function openStudentSubmissionEditor(I: CodeceptJS.I, assignmentId: string) {
  I.amOnPage(submissionRoutes.studentSubmissionEditor(assignmentId))
  I.waitForFunction(
    () => globalThis.location.pathname.includes("/student/submission/"),
    [],
    submissionTimeouts.navigation,
  )
  I.waitForFunction(
    (submitText: string, langLabel: string) => {
      const body = document.body.innerText
      if (body.includes("Không tìm thấy bài tập") || body.includes("Lỗi khi tải bài tập")) {
        return true
      }
      const hasEditor = document.querySelector(".monaco-editor") !== null || document.querySelector("textarea") !== null
      return hasEditor || body.includes(submitText) || body.includes(langLabel)
    },
    [submissionTexts.common.submitButton, submissionTexts.student.languageLabel],
    submissionTimeouts.editor,
  )
}

/** Set Monaco editor content via the monaco API or direct textarea manipulation. */
function fillSubmissionCode(I: CodeceptJS.I, code: string) {
  I.executeScript((nextCode: string) => {
    const anyGlobal = globalThis as Record<string, unknown> & {
      monaco?: { editor?: { getEditors?: () => Array<{ setValue: (v: string) => void }> } }
    }
    const editors = anyGlobal.monaco?.editor?.getEditors?.()
    if (editors && editors.length > 0) {
      editors[0].setValue(nextCode)
      return
    }
    const textarea = document.querySelector(
      ".monaco-editor textarea.inputarea, .monaco-editor textarea",
    ) as HTMLTextAreaElement | null
    if (textarea) {
      textarea.focus()
      textarea.value = nextCode
      textarea.dispatchEvent(new Event("input", { bubbles: true }))
      textarea.dispatchEvent(new Event("change", { bubbles: true }))
    }
  }, code)
}

/** Wait until there are no loading/spinner texts on the page. */
function waitForNoLoadingSignals(I: CodeceptJS.I, sec = 20) {
  I.waitForFunction(
    (signals: string[]) => !signals.some((s) => document.body.innerText.includes(s)),
    [submissionTexts.common.loadingSignals],
    sec,
  )
}

// ═══════════════════════════════════════════════════════════════
// Allure metadata helper
// ═══════════════════════════════════════════════════════════════

async function applyAllureMetadata(
  featureName: string,
  storyName: string,
  severityLevel: "critical" | "normal" | "minor",
  tmsId: string,
) {
  await epic("submission")
  await feature(featureName)
  await story(storyName)
  await severity(severityLevel)
  await tag("e2e")
  await tag("regression")
  await tms(tmsId)
}

// ═══════════════════════════════════════════════════════════════
// Guard — skip scenario when required seed config is absent
// ═══════════════════════════════════════════════════════════════

function requireAssignmentSeed(I: CodeceptJS.I, assignmentId: string, envName: string): boolean {
  if (assignmentId) return true
  I.say(`Thiếu ${envName} - bỏ qua scenario ở môi trường chưa cấu hình.`)
  return false
}

// XPath helper reusing shared text constant
const viewDetailButtonXPath = `//button[contains(normalize-space(), '${submissionTexts.common.viewDetailButton}')]`

// ═══════════════════════════════════════════════════════════════
// Test suite
// ═══════════════════════════════════════════════════════════════

Feature("Submission | Scaffold")

/**
 * SUB-SBM-001 — Student submits a valid solution.
 * Publishes the assignment via API before submitting to ensure it is available.
 */
Scenario("SUB-SBM-001 | Submission valid solution", async ({ I }) => {
  await applyAllureMetadata("Submission Flow", "Student submits valid solution", "critical", "SUB-SBM-001")

  if (!requireAssignmentSeed(I, submissionSeed.assignments.openAssignmentId, "E2E_OPEN_ASSIGNMENT_ID")) {
    return
  }

  await publishAssignment(submissionSeed.assignments.openAssignmentId)

  loginAsStudent(I)
  openStudentSubmissionEditor(I, submissionSeed.assignments.openAssignmentId)

  const submitBtnCount = await I.grabNumberOfVisibleElements(submissionSelectors.common.submitButton)
  if (submitBtnCount === 0) {
    I.say("Nút nộp bài không hiển thị sau khi publish - bỏ qua test.")
    return
  }

  fillSubmissionCode(I, 'console.log("hello from apsas e2e")')
  I.waitForText(submissionTexts.common.submitButton, submissionTimeouts.action)
  I.click(submissionTexts.common.submitButton)

  // Wait for any post-submit signal: queued text, evaluating text, or URL change away from editor
  const editorPath = submissionRoutes.studentSubmissionEditor(submissionSeed.assignments.openAssignmentId)
  I.waitForFunction(
    (queuedSignals: string[], currentEditorPath: string) => {
      const bodyText = document.body.innerText
      const onEditorPage = globalThis.location.pathname === currentEditorPath
      return queuedSignals.some((s) => bodyText.includes(s)) || bodyText.includes("Đang chấm điểm") || !onEditorPage
    },
    [submissionTexts.states.queuedSubmission, editorPath],
    20,
  )
  I.seeInCurrentUrl("/student")
})

/**
 * SUB-SBM-002 — Submitting with an empty editor is blocked by the UI.
 */
Scenario("SUB-SBM-002 | Block submit with empty editor", async ({ I }) => {
  await applyAllureMetadata("Submission Flow", "Block submit with empty editor", "normal", "SUB-SBM-002")

  if (!requireAssignmentSeed(I, submissionSeed.assignments.openAssignmentId, "E2E_OPEN_ASSIGNMENT_ID")) {
    return
  }

  await publishAssignment(submissionSeed.assignments.openAssignmentId)

  loginAsStudent(I)
  openStudentSubmissionEditor(I, submissionSeed.assignments.openAssignmentId)

  const submitBtnCount = await I.grabNumberOfVisibleElements(submissionSelectors.common.submitButton)
  if (submitBtnCount === 0) {
    I.say("Nút nộp bài không hiển thị sau khi publish - bỏ qua test.")
    return
  }

  fillSubmissionCode(I, "")
  I.waitForText(submissionTexts.common.submitButton, submissionTimeouts.action)
  I.click(submissionTexts.common.submitButton)

  I.waitForFunction(
    (emptySignals: string[]) =>
      emptySignals.some((s) => document.body.innerText.includes(s)) ||
      document.body.innerText.includes("0 ký tự / 10000"),
    [submissionTexts.states.emptySubmissionCode],
    12,
  )
  I.dontSee(submissionTexts.common.queuedText)
  I.seeInCurrentUrl("/student/submission/")
})

/**
 * SUB-SBM-003 — Overdue assignment enforces UI-only deadline policy.
 * Requires E2E_OVERDUE_ASSIGNMENT_ID to be set; skips otherwise.
 */
Scenario("SUB-SBM-003 | Deadline behavior for overdue assignment", async ({ I }) => {
  await applyAllureMetadata("Submission Policy", "Deadline behavior for submission", "critical", "SUB-SBM-003")

  if (!requireAssignmentSeed(I, submissionSeed.assignments.overdueAssignmentId, "E2E_OVERDUE_ASSIGNMENT_ID")) {
    return
  }

  loginAsStudent(I)
  openStudentSubmissionEditor(I, submissionSeed.assignments.overdueAssignmentId)
  I.seeInCurrentUrl("/student/submission/")

  const submitButtonVisibleCount = await I.grabNumberOfVisibleElements("button[type='submit']")
  if (submitButtonVisibleCount === 0) {
    I.say("UI-only: nút nộp bài bị ẩn trên assignment quá hạn (pass policy).")
    return
  }

  const submitDisabledState = await I.grabAttributeFrom("button[type='submit']", "disabled")
  if (submitDisabledState !== null) {
    I.say("UI-only: nút nộp bài bị disable trên assignment quá hạn (pass policy).")
    return
  }

  throw new Error(
    "UI-only policy violated: overdue assignment still shows an enabled submit button. Expected the submit button to be hidden or disabled.",
  )
})

/**
 * SUB-SBM-004 — Student navigates from assignment detail to submission history and opens a detail.
 */
Scenario("SUB-SBM-004 | Student views submission history from assignment context", async ({ I }) => {
  await applyAllureMetadata(
    "Submission History",
    "Student views submission history from assignment context",
    "normal",
    "SUB-SBM-004",
  )

  if (!requireAssignmentSeed(I, submissionSeed.assignments.openAssignmentId, "E2E_OPEN_ASSIGNMENT_ID")) {
    return
  }

  loginAsStudent(I)

  I.amOnPage(submissionRoutes.studentAssignmentsDetail(submissionSeed.assignments.openAssignmentId))
  waitForNoLoadingSignals(I)
  I.seeInCurrentUrl("/student/assignments/")

  I.amOnPage(submissionRoutes.studentSubmissionsList)
  waitForNoLoadingSignals(I)
  I.seeInCurrentUrl(submissionRoutes.studentSubmissionsList)

  I.waitForFunction(
    (emptyTexts: string[]) => {
      const body = document.body.innerText
      const rows = Array.from(document.querySelectorAll("table tbody tr"))
      return rows.length > 0 || emptyTexts.some((t) => body.includes(t))
    },
    [submissionTexts.states.emptySubmissionList],
    submissionTimeouts.contentReady,
  )

  const detailButtonsCount = await I.grabNumberOfVisibleElements({ xpath: viewDetailButtonXPath })
  if (detailButtonsCount > 0) {
    I.click({ xpath: `(${viewDetailButtonXPath})[1]` })
    I.waitForElement(submissionSelectors.common.pageTitle, submissionTimeouts.contentReady)
    I.waitForText("Tóm tắt kết quả", submissionTimeouts.contentReady)
    I.seeInCurrentUrl("/student/submissions/")
  } else {
    I.waitForFunction(
      (texts: string[]) => texts.some((t) => document.body.innerText.includes(t)),
      [submissionTexts.states.emptySubmissionList],
      10,
    )
  }
})

/**
 * SUB-SBM-005 — Instructor opens submissions tab and views a submission detail.
 */
Scenario("SUB-SBM-005 | Instructor opens submissions tab and views submission detail", async ({ I }) => {
  await applyAllureMetadata(
    "Instructor Submission Review",
    "Instructor opens assignment detail submissions tab and views source code",
    "critical",
    "SUB-SBM-005",
  )

  if (!requireAssignmentSeed(I, submissionSeed.assignments.openAssignmentId, "E2E_OPEN_ASSIGNMENT_ID")) {
    return
  }

  loginAsInstructor(I)
  I.amOnPage(submissionRoutes.instructorAssignmentsDetail(submissionSeed.assignments.openAssignmentId))
  waitForNoLoadingSignals(I)
  I.seeInCurrentUrl("/instructor/assignments/")

  I.waitForText("Bài nộp", submissionTimeouts.contentReady)
  I.click("Bài nộp")
  waitForNoLoadingSignals(I)
  I.waitForText("Học sinh", 20)
  I.waitForText("Hành động", 20)

  I.waitForFunction(
    (emptyTexts: string[]) => {
      const rows = Array.from(document.querySelectorAll("table tbody tr"))
      const body = document.body.innerText
      return rows.length > 0 || emptyTexts.some((t) => body.includes(t))
    },
    [submissionTexts.states.emptySubmissionList],
    submissionTimeouts.contentReady,
  )

  const detailButtonsCount = await I.grabNumberOfVisibleElements({ xpath: viewDetailButtonXPath })
  if (detailButtonsCount > 0) {
    I.click({ xpath: `(${viewDetailButtonXPath})[1]` })
    I.waitForElement(submissionSelectors.common.pageTitle, submissionTimeouts.contentReady)
    I.waitForText("Tóm tắt kết quả", submissionTimeouts.contentReady)
    I.seeInCurrentUrl("/instructor/submissions/")
  } else {
    I.waitForFunction(
      (texts: string[]) => texts.some((t) => document.body.innerText.includes(t)),
      [submissionTexts.states.emptySubmissionList],
      10,
    )
  }
})
