/**
 * Bộ route chuẩn cho flow Submission E2E.
 * Dùng một nguồn khai báo để tránh hard-code URL trong test.
 */
export const submissionRoutes = {
  studentAssignmentsDetail: (assignmentId: string) => `/student/assignments/${assignmentId}`,
  studentSubmissionEditor: (assignmentId: string) => `/student/submission/${assignmentId}`,
  studentSubmissionsList: "/student/submissions",
  studentSubmissionDetail: (submissionId: string) => `/student/submissions/${submissionId}`,
  instructorAssignmentsDetail: (assignmentId: string) => `/instructor/assignments/${assignmentId}`,
  instructorSubmissionsList: "/instructor/submissions",
  instructorSubmissionDetail: (submissionId: string) => `/instructor/submissions/${submissionId}`,
}

/**
 * Tập text/label dùng để assert theo góc nhìn người dùng.
 * Ưu tiên text thật trên UI để giảm phụ thuộc implementation chi tiết.
 */
export const submissionTexts = {
  common: {
    submitButton: "Nộp bài",
    queuedText: "Đang nộp...",
    viewDetailButton: "Xem chi tiết",
    loadingSignals: ["Đang tải bài tập...", "Đang tải..."],
    appErrorSignals: [
      "404 - Not Found",
      "This site can't be reached",
      "ERR_CONNECTION_REFUSED",
      "Invalid response from API",
    ],
  },
  student: {
    assignmentListHeading: "Bài tập",
    submissionFormHeading: "Biểu mẫu nộp",
    submissionsHeading: "Bài nộp",
    languageLabel: "Ngôn ngữ",
    languagePlaceholder: "Chọn ngôn ngữ lập trình",
  },
  instructor: {
    submissionsHeading: "Quản lý Bài nộp",
  },
  states: {
    emptySubmissionCode: ["Code không được trống", "Lỗi nộp bài", "Vui lòng nhập mã nguồn"],
    queuedSubmission: ["Đang nộp...", "Code của bạn đang được kiểm tra..."],
    emptySubmissionList: ["Chưa có bài nộp nào", "Không tìm thấy bài tập nào để quản lý"],
  },
}

/**
 * Selector fallback cho các vùng khó định danh ổn định (vd: Monaco).
 * Ưu tiên data-testid, chỉ fallback CSS khi chưa có test id.
 */
export const submissionSelectors = {
  common: {
    submitButton: "button[type='submit']",
    pageTitle: "h1",
    submissionListRows: "table tbody tr",
  },
  student: {
    // Ưu tiên data-testid nếu có; chỉ fallback về Monaco selector khi test id chưa ổn định.
    editorInput:
      "[data-testid='submission-code-editor'] textarea, .monaco-editor textarea.ime-text-area, .ime-text-area, .monaco-editor textarea.inputarea",
  },
}

export const submissionPageSignals = {
  studentAssignmentDetail: ["Bài tập", "Danh sách các bài tập của bạn"],
  studentSubmissionEditor: ["Biểu mẫu nộp", "Nộp bài"],
  studentSubmissionsList: ["Bài nộp", "Lịch sử các bài nộp của bạn"],
  instructorSubmissionsList: ["Quản lý Bài nộp", "Xem bài nộp, cấp điểm"],
  studentSubmissionDetail: ["Chi tiết Bài nộp", "Tóm tắt kết quả", "Mã đã nộp", "Kết quả kiểm tra"],
  instructorSubmissionDetail: ["Chi tiết Bài nộp", "Tóm tắt kết quả", "Mã đã nộp", "Kết quả kiểm tra"],
}

/**
 * Seed test data dùng chung cho local/CI.
 * Có thể override bằng biến môi trường để chủ động theo từng stack.
 */
export const submissionSeed = {
  accounts: {
    student: {
      email: "student1@apsas",
    },
    instructor: {
      email: "instructor1@apsas",
    },
  },
  assignments: {
    // Uses seeded "Hello World" assignment (001) from the stock seed data.
    // Override via env vars if a specific assignment is needed.
    openAssignmentId: process.env.E2E_OPEN_ASSIGNMENT_ID || "550e8400-e29b-41d4-a716-446655440001",
    // Overdue assignment requires explicit opt-in; no reliable default in stock seed.
    overdueAssignmentId: process.env.E2E_OVERDUE_ASSIGNMENT_ID || "",
  },
}

/**
 * Chính sách hiện tại cho S-03 (quá hạn nộp bài).
 * R4 đang chạy theo ui-only, chưa ép assert API reject.
 */
export const s03Policy = {
  mode: "ui-only" as const,
  note: "R4 mặc định assert theo UI-only. Nếu backend enforce deadline được triển khai, bổ sung assert API reject trong scenario riêng.",
}

/**
 * Quy tắc ưu tiên locator để giữ test ổn định và dễ bảo trì.
 */
export const submissionLocatorPolicy = {
  priority: ["role", "label", "text", "css-fallback"],
  editorUpgradeNote: "Cần chuyển sang selector data-testid ổn định khi frontend hỗ trợ nhất quán.",
}

/**
 * Timeout chuẩn cho các thao tác trong flow submission.
 */
export const submissionTimeouts = {
  navigation: 15,
  editor: 15,
  action: 10,
  contentReady: 20,
  appErrorCheck: 5,
}

/**
 * Retry policy cho các trạng thái bất đồng bộ (queued/evaluating).
 */
export const submissionRetryPolicy = {
  queuedStateAttempts: 3,
  queuedStatePerAttemptSec: 8,
}
