export const submissionRoutes = {
  studentAssignmentsDetail: (assignmentId: string) => `/student/assignments/${assignmentId}`,
  studentSubmissionEditor: (assignmentId: string) => `/student/submission/${assignmentId}`,
  studentSubmissionsList: "/student/submissions",
  studentSubmissionDetail: (submissionId: string) => `/student/submissions/${submissionId}`,
  instructorSubmissionsList: "/instructor/submissions",
  instructorSubmissionDetail: (submissionId: string) => `/instructor/submissions/${submissionId}`,
};

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
};

export const submissionSelectors = {
  common: {
    submitButton: "button[type='submit']",
    pageTitle: "h1",
    submissionListRows: "table tbody tr",
  },
  student: {
    // Prefer data-testid when available; Monaco selector is a controlled fallback.
    editorInput: "[data-testid='submission-code-editor'] textarea, .monaco-editor textarea.inputarea",
  },
};

export const submissionPageSignals = {
  studentAssignmentDetail: ["Bài tập", "Danh sách các bài tập của bạn"],
  studentSubmissionEditor: ["Biểu mẫu nộp", "Nộp bài"],
  studentSubmissionsList: ["Bài nộp", "Lịch sử các bài nộp của bạn"],
  instructorSubmissionsList: ["Quản lý Bài nộp", "Xem bài nộp, cấp điểm"],
  studentSubmissionDetail: ["Chi tiết Bài nộp", "Tóm tắt kết quả", "Mã đã nộp", "Kết quả kiểm tra"],
  instructorSubmissionDetail: ["Chi tiết Bài nộp", "Tóm tắt kết quả", "Mã đã nộp", "Kết quả kiểm tra"],
};

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
    // Provide deterministic IDs from environment for real-stack runs.
    openAssignmentId: process.env.E2E_OPEN_ASSIGNMENT_ID || "",
    overdueAssignmentId: process.env.E2E_OVERDUE_ASSIGNMENT_ID || "",
  },
};

export const s03Policy = {
  mode: "ui-only" as const,
  note:
    "R4 mặc định assert theo UI-only. Nếu backend enforce deadline được triển khai, bổ sung assert API reject trong scenario riêng.",
};

export const submissionLocatorPolicy = {
  priority: ["role", "label", "text", "css-fallback"],
  editorUpgradeNote:
    "Editor should migrate to stable data-testid selectors when frontend supports them consistently.",
};
