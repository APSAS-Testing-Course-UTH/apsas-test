/**
 * Vietnamese Status Labels
 * Used across the entire Student Portal for consistent Vietnamese UI
 */

export const STATUS_LABELS = {
  PENDING: 'Chưa làm',           // Not started
  IN_PROGRESS: 'Đang làm',       // In progress
  SUBMITTED: 'Đã nộp',           // Submitted
  EVALUATED: 'Đã chấm',          // Evaluated/Graded
  PASSED: 'Đạt',                 // Passed
  FAILED: 'Không đạt',           // Failed
  OVERDUE: 'Quá hạn',            // Overdue
  ARCHIVED: 'Đã lưu trữ',        // Archived
  DRAFT: 'Bản nháp',             // Draft
} as const;

export type StatusType = keyof typeof STATUS_LABELS;

/**
 * Color mapping for status badges
 * Uses Mantine color palette
 */
export const STATUS_COLORS: Record<StatusType, string> = {
  PENDING: 'gray',
  IN_PROGRESS: 'blue',
  SUBMITTED: 'blue',
  EVALUATED: 'yellow',
  PASSED: 'green',
  FAILED: 'red',
  OVERDUE: 'red',
  ARCHIVED: 'gray',
  DRAFT: 'gray',
} as const;

/**
 * Vietnamese button and form labels
 */
export const BUTTON_LABELS = {
  LOGIN: 'Đăng nhập',              // Login
  REGISTER: 'Đăng ký',             // Register
  SUBMIT: 'Nộp bài',               // Submit
  SAVE: 'Lưu',                     // Save
  SAVE_DRAFT: 'Lưu bản nháp',      // Save draft
  DELETE: 'Xóa',                   // Delete
  CANCEL: 'Hủy',                   // Cancel
  SEARCH: 'Tìm kiếm',              // Search
  FILTER: 'Lọc',                   // Filter
  DOWNLOAD: 'Tải xuống',           // Download
  COPY: 'Sao chép',                // Copy
  EDIT: 'Chỉnh sửa',               // Edit
  CONFIRM: 'Xác nhận',             // Confirm
  RESET: 'Đặt lại',                // Reset
  BACK: 'Quay lại',                // Back
  NEXT: 'Tiếp theo',               // Next
  PREVIOUS: 'Trước đó',            // Previous
  CLEAR: 'Xóa hết',                // Clear
  EXPORT: 'Xuất',                  // Export
  VIEW: 'Xem',                     // View
  CLOSE: 'Đóng',                   // Close
  EXPAND: 'Mở rộng',               // Expand
  COLLAPSE: 'Thu gọn',             // Collapse
  LOADING: 'Đang tải...',          // Loading...
  RETRY: 'Thử lại',                // Retry
  SEND: 'Gửi',                     // Send
  REFRESH: 'Làm mới',              // Refresh
} as const;

/**
 * Vietnamese form labels
 */
export const FORM_LABELS = {
  EMAIL: 'Email',                  // Email
  PASSWORD: 'Mật khẩu',            // Password
  CONFIRM_PASSWORD: 'Xác nhận mật khẩu', // Confirm password
  NAME: 'Họ và tên',               // Full name
  FIRST_NAME: 'Họ',                // First name
  LAST_NAME: 'Tên',                // Last name
  PHONE: 'Số điện thoại',          // Phone number
  ADDRESS: 'Địa chỉ',              // Address
  LANGUAGE: 'Ngôn ngữ lập trình',  // Programming language
  DESCRIPTION: 'Mô tả',            // Description
  TITLE: 'Tiêu đề',                // Title
  CODE: 'Mã',                      // Code
  MESSAGE: 'Tin nhắn',             // Message
  COMMENTS: 'Bình luận',           // Comments
  NOTES: 'Ghi chú',                // Notes
  SEARCH: 'Tìm kiếm',              // Search
  FILTER: 'Lọc',                   // Filter
  SORT: 'Sắp xếp',                 // Sort
  STATUS: 'Trạng thái',            // Status
  DATE: 'Ngày',                    // Date
  TIME: 'Giờ',                     // Time
  DURATION: 'Thời lượng',          // Duration
  CATEGORY: 'Danh mục',            // Category
  TYPE: 'Loại',                    // Type
  DIFFICULTY: 'Độ khó',            // Difficulty
  DUE_DATE: 'Hạn chót',            // Due date
  START_DATE: 'Ngày bắt đầu',      // Start date
  END_DATE: 'Ngày kết thúc',       // End date
} as const;

/**
 * Vietnamese error messages
 */
export const ERROR_MESSAGES = {
  REQUIRED: 'Trường này bắt buộc',
  INVALID_EMAIL: 'Email không hợp lệ',
  PASSWORD_TOO_SHORT: 'Mật khẩu phải có ít nhất 8 ký tự',
  PASSWORDS_DO_NOT_MATCH: 'Mật khẩu xác nhận không khớp',
  INVALID_FORMAT: 'Định dạng không hợp lệ',
  FIELD_REQUIRED: 'Vui lòng điền đầy đủ thông tin',
  MUST_AGREE_TERMS: 'Bạn phải đồng ý với điều khoản sử dụng',
  UNKNOWN_ERROR: 'Có lỗi không xác định xảy ra',
  NOT_FOUND: 'Không tìm thấy',
  UNAUTHORIZED: 'Bạn không có quyền truy cập',
  SERVER_ERROR: 'Lỗi máy chủ, vui lòng thử lại sau',
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  SESSION_EXPIRED: 'Phiên làm việc của bạn đã hết hạn',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác',
} as const;

/**
 * Vietnamese success messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công!',
  REGISTER_SUCCESS: 'Đăng ký thành công!',
  SAVED_SUCCESS: 'Lưu thành công!',
  DELETED_SUCCESS: 'Xóa thành công!',
  UPDATED_SUCCESS: 'Cập nhật thành công!',
  SUBMITTED_SUCCESS: 'Nộp bài thành công!',
  COPIED_SUCCESS: 'Đã sao chép vào clipboard!',
  EMAIL_SENT_SUCCESS: 'Email đã được gửi!',
  VERIFICATION_SUCCESS: 'Xác minh thành công!',
} as const;

/**
 * Vietnamese placeholder texts
 */
export const PLACEHOLDERS = {
  EMAIL: 'Nhập email của bạn...',
  PASSWORD: 'Nhập mật khẩu của bạn...',
  SEARCH: 'Tìm kiếm...',
  ENTER_TEXT: 'Nhập văn bản...',
  SELECT_OPTION: 'Chọn một tùy chọn...',
  ENTER_MESSAGE: 'Nhập tin nhắn của bạn...',
  ENTER_CODE: 'Nhập mã...',
} as const;
