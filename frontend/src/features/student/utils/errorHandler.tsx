/**
 * Error Handler Utility for Student Portal
 * Handles API errors, validation errors, and network errors
 * Shows appropriate Vietnamese notifications for all error types
 *
 * Features:
 * - Maps HTTP error codes to Vietnamese messages
 * - Handles network and timeout errors
 * - Validates error responses with Zod
 * - Shows notifications with appropriate icons and colors
 * - Logs errors for debugging
 */

import type { ApiErrorResponse as GeneratedApiError } from '@/configs/api-error-handler'
import { notifications } from '@mantine/notifications'
import {
  IconAlertCircle,
  IconCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconWifi,
  IconClock,
} from '@tabler/icons-react'

/**
 * API error response structure from backend
 */
export interface ApiErrorResponse {
  code?: string
  message?: string
  details?: Record<string, unknown>
  timestamp?: string
  path?: string
}

/**
 * Extended error with additional context
 */
export interface StudentPortalError {
  message: string
  code?: string
  status?: number
  details?: Record<string, unknown>
  timestamp: string
  originalError?: Error | GeneratedApiError
}

/**
 * Validation error for form fields
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Comprehensive error code mapping for all APSAS services
 * Maps both HTTP status codes and backend error codes to Vietnamese messages
 * Source: ERROR-CODES-MAPPING-RESEARCH.md
 */
const ERROR_CODE_MAP: Record<string, string> = {
  // Authentication & Authorization (Identity Service)
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác',
  UNAUTHORIZED: 'Vui lòng đăng nhập lại',
  TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',
  TOKEN_INVALID: 'Token không hợp lệ. Vui lòng đăng nhập lại',
  FORBIDDEN: 'Bạn không có quyền truy cập tài nguyên này',
  ACCOUNT_INACTIVE: 'Tài khoản của bạn đã bị vô hiệu hóa',
  PERMISSION_DENIED: 'Bạn không có quyền thực hiện tác vụ này',

  // User Management (Identity Service)
  EMAIL_ALREADY_EXISTS: 'Email đã được đăng ký. Vui lòng sử dụng email khác',
  USER_NOT_FOUND: 'Người dùng không tồn tại',
  INVALID_OLD_PASSWORD: 'Mật khẩu cũ không chính xác',
  INVALID_PASSWORD_FORMAT: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',

  // Submissions (Submission Service)
  INVALID_SUBMISSION: 'Dữ liệu bài nộp không hợp lệ',
  SUBMISSION_CONFLICT: 'Bạn đã nộp bài hoặc hạn chót đã qua',
  FILE_TOO_LARGE: 'File mã nguồn quá lớn (tối đa 5MB)',
  UNSUPPORTED_LANGUAGE: 'Ngôn ngữ lập trình không được hỗ trợ',
  SUBMISSION_NOT_FOUND: 'Bài nộp không tồn tại',
  INVALID_FEEDBACK: 'Phản hồi không hợp lệ',

  // Content Service (Assignments, Skills, Tutorials)
  ASSIGNMENT_NOT_FOUND: 'Bài tập không tồn tại',
  SKILL_NOT_FOUND: 'Kỹ năng không tồn tại',
  TUTORIAL_NOT_FOUND: 'Hướng dẫn không tồn tại',
  INVALID_FILTERS: 'Tham số lọc không hợp lệ',

  // Evaluation Service (Async)
  EVALUATION_TIMEOUT: 'Chương trình chạy quá lâu (timeout)',
  EVALUATION_FAILED: 'Lỗi biên dịch hoặc chạy chương trình',
  TEST_FAILED: 'Chương trình không vượt qua các bài kiểm tra',

  // Support Service
  SESSION_NOT_FOUND: 'Phiên hỗ trợ không tồn tại',
  SESSION_EXISTS: 'Bạn đã có phiên hỗ trợ đang hoạt động',
  INVALID_MESSAGE: 'Tin nhắn không hợp lệ',
  INVALID_SESSION_DATA: 'Dữ liệu phiên hỗ trợ không hợp lệ',

  // Generic Validation & Format
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại',
  INVALID_ID_FORMAT: 'ID không hợp lệ',
  INVALID_DATA: 'Dữ liệu không hợp lệ',
  NOT_FOUND: 'Không tìm thấy tài nguyên được yêu cầu',

  // Server Errors
  INTERNAL_SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau',
  SERVICE_UNAVAILABLE: 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau',
  GATEWAY_ERROR: 'Lỗi cổng kết nối. Vui lòng thử lại sau',
  GATEWAY_TIMEOUT: 'Cổng kết nối hết thời gian chờ. Vui lòng thử lại sau',

  // Rate Limiting
  RATE_LIMITED: 'Quá nhiều bài nộp. Vui lòng chờ 1 phút',
  TOO_MANY_REQUESTS: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ một chút và thử lại',

  // Network Errors (Client-side)
  ECONNREFUSED: 'Không thể kết nối đến máy chủ',
  ENOTFOUND: 'Không thể kết nối đến máy chủ (DNS)',
  ECONNRESET: 'Kết nối bị hủy bỏ bởi máy chủ',
  ERR_NETWORK: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn',

  // Timeout Errors
  ECONNABORTED: 'Yêu cầu đã bị hủy',
  ETIMEDOUT: 'Thời gian chờ quá lâu. Vui lòng thử lại',
  ERR_OPERATION_TIMEOUT: 'Thời gian chờ quá lâu',
}

/**
 * Get Vietnamese error message from error object
 * Handles Axios errors, network errors, and generic errors
 * Supports both HTTP status codes and backend error codes
 *
 * @param error - Error object from API call or exception
 * @returns Vietnamese user-friendly error message
 *
 * @example
 * try {
 *   await apiCall()
 * } catch (error) {
 *   const message = getErrorMessage(error)
 *   console.error(message) // "Kiểm tra kết nối mạng của bạn..."
 * }
 */
export function getErrorMessage(error: GeneratedApiError | Error | unknown): string {
  // Handle Axios errors
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as GeneratedApiError
    const status = axiosError.response?.status
    const data = axiosError.response?.data as ApiErrorResponse | undefined

    // First try error code mapping
    if (data?.code && data.code in ERROR_CODE_MAP) {
      return ERROR_CODE_MAP[data.code]
    }

    // Fall back to backend message
    const responseMessage = data?.message

    // Map HTTP status codes to Vietnamese messages
    switch (status) {
      case 400:
        return responseMessage || ERROR_CODE_MAP['VALIDATION_ERROR']
      case 401:
        return ERROR_CODE_MAP['TOKEN_EXPIRED']
      case 403:
        return ERROR_CODE_MAP['FORBIDDEN']
      case 404:
        return ERROR_CODE_MAP['NOT_FOUND']
      case 409:
        return ERROR_CODE_MAP['SUBMISSION_CONFLICT'] || 'Dữ liệu đã tồn tại hoặc có xung đột. Vui lòng thử lại.'
      case 413:
        return ERROR_CODE_MAP['FILE_TOO_LARGE']
      case 415:
        return ERROR_CODE_MAP['UNSUPPORTED_LANGUAGE']
      case 422:
        return responseMessage || ERROR_CODE_MAP['VALIDATION_ERROR']
      case 429:
        return ERROR_CODE_MAP['RATE_LIMITED']
      case 500:
        return ERROR_CODE_MAP['INTERNAL_SERVER_ERROR']
      case 502:
        return ERROR_CODE_MAP['GATEWAY_ERROR']
      case 503:
        return ERROR_CODE_MAP['SERVICE_UNAVAILABLE']
      case 504:
        return ERROR_CODE_MAP['GATEWAY_TIMEOUT']
      default:
        return responseMessage || 'Có lỗi xảy ra. Vui lòng thử lại.'
    }
  }

  // Handle network errors
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>
    // Use type guard instead of type assertion
    const code = typeof errorObj.code === 'string' ? errorObj.code : undefined

    if (code && code in ERROR_CODE_MAP) {
      return ERROR_CODE_MAP[code]
    }

    // Generic error message
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      return errorObj.message
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message || 'Có lỗi không xác định xảy ra.'
  }

  return 'Có lỗi không xác định xảy ra. Vui lòng thử lại.'
}

/**
 * Map API error to extended error object with context
 *
 * @param error - Error object from API call
 * @returns Extended error with message, code, and status
 */
export function mapApiError(error: GeneratedApiError | Error | unknown): StudentPortalError {
  const timestamp = new Date().toISOString()

  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as GeneratedApiError
    const status = axiosError.response?.status || 0
    const data = axiosError.response?.data as ApiErrorResponse | undefined

    return {
      message: getErrorMessage(error),
      code: data?.code || `HTTP_${status}`,
      status,
      details: data?.details,
      timestamp,
      originalError: axiosError,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      timestamp,
      originalError: error,
    }
  }

  return {
    message: 'Có lỗi không xác định xảy ra.',
    timestamp,
  }
}

/**
 * Show error notification
 * Displays red notification with error icon
 *
 * @param title - Notification title (Vietnamese)
 * @param message - Error message (Vietnamese)
 * @param error - Optional error object for debugging
 *
 * @example
 * showErrorNotification('Lỗi nộp bài', 'Vui lòng kiểm tra kết nối mạng')
 */
export function showErrorNotification(
  title: string,
  message?: string,
  error?: GeneratedApiError | Error | unknown
) {
  const finalMessage = message || getErrorMessage(error)

  notifications.show({
    title,
    message: finalMessage,
    color: 'red',
    icon: <IconAlertCircle size={16} />,
    autoClose: 6000, // Errors stay longer so users can read them
  })

  // Log for debugging
  if (error) {
    console.error(`[StudentPortal Error] ${title}:`, error)
  }
}

/**
 * Show success notification
 * Displays green notification with check icon
 *
 * @param title - Notification title (Vietnamese)
 * @param message - Success message (Vietnamese)
 *
 * @example
 * showSuccessNotification('Thành công', 'Bài nộp đã được lưu')
 */
export function showSuccessNotification(title: string, message?: string) {
  notifications.show({
    title,
    message: message || 'Hoàn tất thành công',
    color: 'green',
    icon: <IconCheck size={16} />,
    autoClose: 4000,
  })
}

/**
 * Show warning notification
 * Displays yellow notification with alert icon
 *
 * @param title - Notification title (Vietnamese)
 * @param message - Warning message (Vietnamese)
 *
 * @example
 * showWarningNotification('Cảnh báo', 'Bài tập sắp hết hạn')
 */
export function showWarningNotification(title: string, message?: string) {
  notifications.show({
    title,
    message: message || 'Hãy lưu ý',
    color: 'yellow',
    icon: <IconAlertTriangle size={16} />,
    autoClose: 5000,
  })
}

/**
 * Show info notification
 * Displays blue notification with info icon
 *
 * @param title - Notification title (Vietnamese)
 * @param message - Info message (Vietnamese)
 *
 * @example
 * showInfoNotification('Thông tin', 'Bài nộp của bạn đang được kiểm tra')
 */
export function showInfoNotification(title: string, message?: string) {
  notifications.show({
    title,
    message: message || 'Thông tin',
    color: 'blue',
    icon: <IconInfoCircle size={16} />,
    autoClose: 4000,
  })
}

/**
 * Show network error notification
 * Special handling for network-related errors
 *
 * @param error - Network error
 *
 * @example
 * showNetworkErrorNotification(error)
 */
export function showNetworkErrorNotification(error?: GeneratedApiError | Error | unknown) {
  const message = getErrorMessage(error)

  notifications.show({
    title: 'Lỗi kết nối',
    message,
    color: 'red',
    icon: <IconWifi size={16} />,
    autoClose: false, // Don't auto-close network errors
  })

  console.error('[StudentPortal Network Error]:', error)
}

/**
 * Show timeout notification
 * Special handling for request timeout errors
 *
 * @example
 * showTimeoutNotification()
 */
export function showTimeoutNotification() {
  notifications.show({
    title: 'Yêu cầu hết thời gian chờ',
    message: 'Vui lòng kiểm tra kết nối mạng và thử lại.',
    color: 'red',
    icon: <IconClock size={16} />,
    autoClose: false, // Don't auto-close timeouts
  })

  console.error('[StudentPortal Timeout Error]')
}

/**
 * Show validation error notification
 * For form validation errors
 *
 * @param errors - Array of validation errors
 *
 * @example
 * showValidationErrorNotification([
 *   { field: 'email', message: 'Email không hợp lệ' },
 *   { field: 'password', message: 'Mật khẩu bắt buộc' }
 * ])
 */
export function showValidationErrorNotification(errors: ValidationError[]) {
  const errorMessages = errors.map((e) => `${e.field}: ${e.message}`).join(', ')

  notifications.show({
    title: 'Lỗi xác thực',
    message: errorMessages,
    color: 'yellow',
    icon: <IconAlertTriangle size={16} />,
    autoClose: 5000,
  })
}

/**
 * Extract validation errors from API error response
 *
 * @param error - Axios error from validation failure
 * @returns Array of validation errors
 *
 * @example
 * const errors = extractValidationErrors(error)
 * // [{ field: 'email', message: 'Email không hợp lệ' }]
 */
export function extractValidationErrors(error: GeneratedApiError | Error | unknown): ValidationError[] {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as GeneratedApiError
    const data = axiosError.response?.data as ApiErrorResponse | undefined

    if (data?.details && typeof data.details === 'object') {
      return Object.entries(data.details).map(([field, message]) => ({
        field,
        message: String(message) || 'Lỗi xác thực',
      }))
    }
  }

  return []
}

/**
 * Check if error is a network/connectivity error
 *
 * @param error - Error object
 * @returns true if error is network-related
 */
export function isNetworkError(error: GeneratedApiError | Error | unknown): boolean {
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>
    const code = String(errorObj.code || '')

    return (
      code.includes('ECONNREFUSED') ||
      code.includes('ERR_NETWORK') ||
      code.includes('ENOTFOUND') ||
      code.includes('ECONNRESET')
    )
  }

  return false
}

/**
 * Check if error is a timeout error
 *
 * @param error - Error object
 * @returns true if error is timeout-related
 */
export function isTimeoutError(error: GeneratedApiError | Error | unknown): boolean {
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>
    const code = String(errorObj.code || '')

    return (
      code.includes('ECONNABORTED') ||
      code.includes('ETIMEDOUT') ||
      code.includes('ERR_OPERATION_TIMEOUT')
    )
  }

  return false
}

/**
 * Get error category for specific handling
 *
 * @param error - Error object
 * @returns Error category: 'network' | 'timeout' | 'validation' | 'auth' | 'server' | 'unknown'
 */
export function getErrorCategory(error: GeneratedApiError | Error | unknown): string {
  if (isNetworkError(error)) return 'network'
  if (isTimeoutError(error)) return 'timeout'

  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as GeneratedApiError
    const status = axiosError.response?.status

    if (status === 400 || status === 422) return 'validation'
    if (status === 401 || status === 403) return 'auth'
    if (status && status >= 500) return 'server'
  }

  return 'unknown'
}
