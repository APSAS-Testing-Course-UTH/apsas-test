import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react';
import type { ApiError } from '@/types/auth.types';
import type { ProblemDetail } from '@/types/problem-detail.types';

// API Error Handler cho APSAS Frontend

/**
 * Generic API Error interface compatible with both Generated Client and legacy Axios errors
 * 
 * This type covers:
 * - Hey API Generated Client errors: { response?: Response, error?: unknown }
 * - Legacy Axios-style errors (for backward compatibility during migration)
 * - Standard JavaScript Error objects
 * 
 * @see https://github.com/hey-api/openapi-ts - Generated Client documentation
 */
export interface ApiErrorResponse {
  /**
   * HTTP response object (Generated Client structure)
   */
  response?: {
    status?: number;
    statusText?: string;
    data?: unknown;
  };
  /**
   * Error details from Generated Client
   * For API errors, this contains the ProblemDetail object
   */
  error?: unknown | ProblemDetail;
  /**
   * Legacy Axios compatibility flag
   */
  isAxiosError?: boolean;
  /**
   * Error message
   */
  message?: string;
  /**
   * Error code (e.g., NETWORK_ERROR, TIMEOUT, HTTP_401)
   */
  code?: string;
}

/**
 * Extended error interface với additional properties
 */
export interface ExtendedApiError extends ApiError {
  field?: string;
  code?: string;
  details?: Record<string, unknown>;
  originalError?: Error;
}

/**
 * Validation error cho form fields
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Map các loại error thành ExtendedApiError với Vietnamese messages
 * 
 * Hỗ trợ cả Axios errors VÀ hey-api Fetch errors
 * Tự động translate HTTP error codes thành Vietnamese user messages
 * 
 * @param {ApiErrorResponse | Error | unknown} error - Error object từ API call hoặc exception
 * @returns {ExtendedApiError} - Normalized error object với:
 *   - message: Vietnamese user-friendly message
 *   - code: Error code (HTTP_XXX, NETWORK_ERROR, etc.)
 *   - details: Additional error details
 *   - timestamp: ISO timestamp khi error xảy ra
 *   - originalError: Original error object để debug
 *
 * @example
 * try {
 *   await apiCall()
 * } catch (error) {
 *   const mappedError = mapApiError(error)
 *   console.error(mappedError.message) // "Phiên đăng nhập đã hết hạn..."
 *   showNotification(mappedError.message)
 * }
 */
export const mapApiError = (error: ApiErrorResponse | Error | unknown): ExtendedApiError => {
  // Check if error is already a ProblemDetail object (from interceptor)
  const possibleProblemDetail = error as Record<string, unknown>
  if (possibleProblemDetail && typeof possibleProblemDetail === 'object' && 
      ('title' in possibleProblemDetail || 'detail' in possibleProblemDetail || 'status' in possibleProblemDetail)) {
    const problemDetail = possibleProblemDetail as ProblemDetail
    const status = (problemDetail.status as number) || 500
    const message = (problemDetail.title || problemDetail.detail || '') as string
    const code = (problemDetail.code as string) || `HTTP_${status}`
    
    // Extract all properties as details (excluding standard ProblemDetail fields)
    const { type: _type, title: _title, status: _pdStatus, detail: _detail, instance: _instance, ...rest } = problemDetail
    
    // Use detail from ProblemDetail if available, otherwise map status code
    let userMessage = (problemDetail.detail || problemDetail.title) as string
    
    // Only override with default messages if we don't have a meaningful backend message
    if (!problemDetail.detail && !problemDetail.title) {
      userMessage = getDefaultMessageForStatus(status, code, message)
    }
    
    return {
      message: userMessage,
      code,
      details: rest,
      timestamp: new Date().toISOString(),
      originalError: error as Error,
    }
  }
  
  // Handle hey-api Fetch errors (structure: { response?: Response, error?: unknown })
  const heyApiError = error as { response?: { status?: number; statusText?: string }; error?: unknown }
  
  if (heyApiError?.response) {
    // This is a hey-api Fetch error
    const status = heyApiError.response.status
    const statusText = heyApiError.response.statusText || ''
    
    // Extract ProblemDetail from error field
    let problemDetail: ProblemDetail | null = null
    let message = statusText
    let code = `HTTP_${status}`
    let details: Record<string, unknown> = {}
    
    if (heyApiError.error && typeof heyApiError.error === 'object') {
      const errorData = heyApiError.error as Record<string, unknown>
      
      // Check if this is a ProblemDetail structure
      if ('title' in errorData || 'detail' in errorData || 'status' in errorData) {
        problemDetail = errorData as ProblemDetail
        message = (problemDetail.title || problemDetail.detail || statusText) as string
        code = (problemDetail.code as string) || `HTTP_${status}`
        
        // Extract all properties as details (excluding standard ProblemDetail fields)
        const { type: _type, title: _title, status: _pdStatus, detail: _detail, instance: _instance, ...rest } = problemDetail
        details = rest
      } else {
        // Fallback to generic error data extraction
        message = (errorData.title as string) || (errorData.message as string) || message
        code = (errorData.code as string) || code
        details = errorData
      }
    }
    
    // Use detail from ProblemDetail if available, otherwise use default mapping
    let userMessage = problemDetail?.detail as string || message
    
    // Only override with default messages if we don't have a meaningful backend message
    if (!problemDetail?.detail || userMessage === statusText) {
      userMessage = getDefaultMessageForStatus(status, code, message)
    }
    
    return {
      message: userMessage,
      code,
      details,
      timestamp: new Date().toISOString(),
      originalError: error as Error,
    }
  }
  
  // Handle legacy Axios-style errors (backward compatibility)
  // Check if error is Axios-style error with proper typing
  const errorDetail = error as ApiErrorResponse
  if (errorDetail?.isAxiosError || (errorDetail?.response && !heyApiError?.response)) {
    const legacyError = error as ApiErrorResponse
    const status = legacyError.response?.status
    const data = legacyError.response?.data as Record<string, unknown> | undefined

    // Extract error details from response
    const message = (typeof data === 'object' && data?.message) ? String(data.message) : legacyError.message || ''
    const code = (typeof data === 'object' && data?.code) ? String(data.code) : `HTTP_${status}`
    const details = (typeof data === 'object' && data?.details && typeof data.details === 'object') ? (data.details as Record<string, unknown>) : {}

    // Map HTTP status codes to Vietnamese messages
    let userMessage = message;

    if (!userMessage || userMessage === legacyError.message) {
      switch (status) {
        case 400:
          userMessage = map400Errors(code, message);
          break;
        case 401:
          userMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          break;
        case 403:
          userMessage = 'Bạn không có quyền truy cập tài nguyên này.';
          break;
        case 404:
          userMessage = 'Không tìm thấy tài nguyên yêu cầu.';
          break;
        case 409:
          userMessage = map409Errors(code, message);
          break;
        case 422:
          userMessage = 'Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại.';
          break;
        case 429:
          userMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.';
          break;
        case 500:
          userMessage = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
          break;
        case 502:
        case 503:
        case 504:
          userMessage = 'Máy chủ đang bảo trì. Vui lòng thử lại sau.';
          break;
        default:
          userMessage = status ? `Lỗi ${status}: ${message}` : 'Có lỗi xảy ra từ máy chủ.';
      }
    }

    return {
      message: userMessage,
      code,
      details,
      timestamp: new Date().toISOString(),
      originalError: legacyError as Error,
    };
  }

  // Handle network errors
  if (errorDetail?.code === 'NETWORK_ERROR' || !errorDetail?.response) {
    return {
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
      code: 'NETWORK_ERROR',
      timestamp: new Date().toISOString(),
      originalError: error as Error,
    };
  }

  // Handle generic errors
  return {
    message: typeof (error as Record<string, unknown>)?.message === 'string' 
      ? String((error as Record<string, unknown>)?.message) 
      : 'Có lỗi không xác định xảy ra.',
    code: 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
    originalError: error as Error,
  };
};

/**
 * Get default Vietnamese message for HTTP status code
 */
const getDefaultMessageForStatus = (status: number | undefined, code: string, message: string): string => {
  switch (status) {
    case 400:
      return map400Errors(code, message)
    case 401:
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    case 403:
      return 'Bạn không có quyền truy cập tài nguyên này.'
    case 404:
      return 'Không tìm thấy tài nguyên yêu cầu.'
    case 409:
      return map409Errors(code, message)
    case 422:
      return 'Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại.'
    case 429:
      return 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.'
    case 500:
      return 'Lỗi server nội bộ. Vui lòng thử lại sau.'
    case 502:
    case 503:
    case 504:
      return 'Server đang bận. Vui lòng thử lại sau.'
    default:
      return message || `Lỗi không xác định (HTTP ${status})`
  }
}

/**
 * Map lỗi 400 Bad Request thành messages cụ thể
 */
const map400Errors = (code: string, message: string): string => {
  const errorMappings: Record<string, string> = {
    'EMAIL_ALREADY_EXISTS': 'Email này đã được sử dụng. Vui lòng chọn email khác.',
    'INVALID_EMAIL_FORMAT': 'Định dạng email không hợp lệ.',
    'PASSWORD_TOO_WEAK': 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.',
    'PASSWORD_TOO_SHORT': 'Mật khẩu phải có ít nhất 8 ký tự.',
    'INVALID_CREDENTIALS': 'Thông tin đăng nhập không đúng.',
    'ACCOUNT_DISABLED': 'Tài khoản đã bị vô hiệu hóa.',
    'ACCOUNT_NOT_VERIFIED': 'Tài khoản chưa được xác minh. Vui lòng kiểm tra email.',
    'INVALID_TOKEN': 'Token không hợp lệ hoặc đã hết hạn.',
    'MISSING_REQUIRED_FIELD': 'Thiếu thông tin bắt buộc.',
    'INVALID_REQUEST_FORMAT': 'Định dạng yêu cầu không hợp lệ.',
  };

  return errorMappings[code] || message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
};

/**
 * Map lỗi 409 Conflict thành messages cụ thể
 */
const map409Errors = (code: string, message: string): string => {
  const errorMappings: Record<string, string> = {
    'USER_ALREADY_EXISTS': 'Người dùng đã tồn tại.',
    'EMAIL_ALREADY_REGISTERED': 'Email đã được đăng ký.',
    'USERNAME_ALREADY_TAKEN': 'Tên người dùng đã được sử dụng.',
    'RESOURCE_ALREADY_EXISTS': 'Tài nguyên đã tồn tại.',
    'CONCURRENT_MODIFICATION': 'Tài nguyên đang được chỉnh sửa bởi người khác.',
  };

  return errorMappings[code] || message || 'Dữ liệu đã tồn tại hoặc có xung đột.';
};


/**
 * Extract validation errors từ API response
 * 
 * Parse form-level validation errors từ API response
 * Hỗ trợ cả flat error array và nested details object
 * 
 * @param {ApiErrorResponse | unknown} error - Error object từ API call (thường là 400 hoặc 422)
 * @returns {ValidationError[]} - Array of validation errors với field, message, và code
 *
 * @example
 * // API response structure (HANDLEd):
 * // {
 * //   "errors": [
 * //     { "field": "email", "message": "Invalid email format", "code": "INVALID_EMAIL" },
 * //     { "field": "password", "message": "Too weak", "code": "PASSWORD_TOO_WEAK" }
 * //   ],
 * //   "details": {
 * //     "firstName": ["First name is required"],
 * //     "lastName": "Last name is too long"
 * //   }
 * // }
 * 
 * const validationErrors = extractValidationErrors(error)
 * const formErrors = validationErrorsToFormErrors(validationErrors)
 * // Use formErrors in form validation library (React Hook Form, etc.)
 */
export const extractValidationErrors = (error: ApiErrorResponse | unknown): ValidationError[] => {
  const errors: ValidationError[] = []

  // Try to extract from hey-api error structure first
  const heyApiError = error as { response?: { status?: number }; error?: unknown }
  
  if (heyApiError?.error && typeof heyApiError.error === 'object') {
    const errorData = heyApiError.error as Record<string, unknown>
    
    // Check if this is a ProblemDetail with validation errors
    // Backend structure: { errors: { "field1": "message1", "field2": "message2" } }
    if (errorData.errors && typeof errorData.errors === 'object') {
      const validationErrors = errorData.errors as Record<string, string>
      
      Object.entries(validationErrors).forEach(([field, message]) => {
        if (typeof message === 'string') {
          errors.push({
            field,
            message,
          })
        }
      })
    }
  }

  // Fallback: Try legacy Axios structure
  if (errors.length === 0) {
    const errorObj = error as ApiErrorResponse
    const responseData = errorObj?.response?.data
    if (responseData && typeof responseData === 'object') {
      const data = responseData as Record<string, unknown>

      // Handle field-specific errors (array format)
      if (data.errors && Array.isArray(data.errors)) {
        data.errors.forEach((err: unknown) => {
          if (typeof err === 'object' && err !== null) {
            const errObj = err as Record<string, unknown>
            if (typeof errObj.field === 'string' && typeof errObj.message === 'string') {
              errors.push({
                field: errObj.field,
                message: errObj.message,
                code: typeof errObj.code === 'string' ? errObj.code : undefined,
              })
            }
          }
        })
      }
      // Handle field-specific errors (object format - same as ProblemDetail)
      else if (data.errors && typeof data.errors === 'object') {
        const validationErrors = data.errors as Record<string, string>
        Object.entries(validationErrors).forEach(([field, message]) => {
          if (typeof message === 'string') {
            errors.push({
              field,
              message,
            })
          }
        })
      }

      // Handle nested validation errors in details
      if (data.details && typeof data.details === 'object') {
        Object.entries(data.details).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((message) => {
              errors.push({
                field,
                message: String(message),
              })
            })
          } else if (typeof messages === 'string') {
            errors.push({
              field,
              message: messages,
            })
          }
        })
      }
    }
  }

  return errors
}

/**
 * Convert validation errors thành form field errors
 */
export const validationErrorsToFormErrors = (
  validationErrors: ValidationError[]
): Record<string, string> => {
  const formErrors: Record<string, string> = {};

  validationErrors.forEach((error) => {
    formErrors[error.field] = error.message;
  });

  return formErrors;
};

/**
 * Log error để debug (development only)
 */
export const logError = (error: ExtendedApiError, context?: string): void => {
  if (import.meta.env.DEV) {
    console.group(`🚨 API Error${context ? ` - ${context}` : ''}`);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Details:', error.details);
    console.error('Timestamp:', error.timestamp);
    if (error.originalError) {
      console.error('Original Error:', error.originalError);
    }
    console.groupEnd();
  }
};

/**
 * Report error lên monitoring service (future enhancement)
 */
export const reportError = (_error: ExtendedApiError): void => {
  // TODO: Implement error reporting to monitoring service
  // Example: Sentry, LogRocket, etc.
  if (import.meta.env.PROD) {
    // reportToMonitoringService(error);
  }
};

/**
 * Kiểm tra error có liên quan đến authentication
 */
export const isAuthError = (error: ExtendedApiError): boolean => {
  return error.code === 'AUTH_EXPIRED' ||
         error.code === 'HTTP_401' ||
         error.message.includes('đăng nhập');
};

/**
 * Kiểm tra error có liên quan đến network
 */
export const isNetworkError = (error: ExtendedApiError): boolean => {
  return error.code === 'NETWORK_ERROR' ||
         error.message.includes('kết nối') ||
         error.message.includes('mạng');
};

/**
 * Kiểm tra error có liên quan đến validation
 */
export const isValidationError = (error: ExtendedApiError): boolean => {
  return error.code === 'HTTP_400' ||
         error.code === 'HTTP_422' ||
         error.message.includes('không hợp lệ');
};

/**
 * Lấy level severity của error
 */
export const getErrorSeverity = (error: ExtendedApiError): 'low' | 'medium' | 'high' | 'critical' => {
  if (isNetworkError(error)) return 'high'
  if (isAuthError(error)) return 'medium'
  if (typeof error.code === 'string' && error.code.startsWith('HTTP_5')) return 'high'
  if (error.code === 'HTTP_429') return 'medium'
  return 'low'
}

/**
 * Global error handler callback type
 */
export type ErrorHandlerCallback = (error: ExtendedApiError) => void;

/**
 * Register global error handler
 */
let globalErrorHandler: ErrorHandlerCallback | null = null;

export const setGlobalErrorHandler = (handler: ErrorHandlerCallback): void => {
  globalErrorHandler = handler;
};

/**
 * Handle error với global handler và logging
 */
export const handleApiError = (
  error: ApiErrorResponse | Error | unknown,
  context?: string,
  _showToast: boolean = true
): ExtendedApiError => {
  const mappedError = mapApiError(error);

  // Log error
  logError(mappedError, context);

  // Report error
  reportError(mappedError);

  // Call global error handler
  if (globalErrorHandler) {
    globalErrorHandler(mappedError);
  }

  return mappedError;
};

/**
 * Show error notification with Vietnamese message
 * 
 * @param error - Error object hoặc error message string
 * @param title - Custom title (optional, default: "Lỗi")
 * @param autoClose - Auto close duration in ms (optional, default: 6000)
 * 
 * @example
 * try {
 *   await API.call()
 * } catch (error) {
 *   showErrorNotification(error, "Không thể tải dữ liệu")
 * }
 */
export function showErrorNotification(
  error: ApiErrorResponse | Error | unknown | string,
  title: string = 'Lỗi',
  autoClose: number = 6000
): void {
  const message = typeof error === 'string' 
    ? error 
    : mapApiError(error).message;

  notifications.show({
    title,
    message,
    color: 'red',
    icon: <IconAlertCircle size={16} />,
    autoClose,
  });
}

/**
 * Show success notification
 * 
 * @param message - Success message
 * @param title - Custom title (optional, default: "Thành công")
 * @param autoClose - Auto close duration in ms (optional, default: 4000)
 * 
 * @example
 * showSuccessNotification("Dữ liệu đã được lưu thành công")
 */
export function showSuccessNotification(
  message: string,
  title: string = 'Thành công',
  autoClose: number = 4000
): void {
  notifications.show({
    title,
    message,
    color: 'green',
    icon: <IconCheck size={16} />,
    autoClose,
  });
}

/**
 * Show info notification
 * 
 * @param message - Info message
 * @param title - Custom title (optional, default: "Thông tin")
 * @param autoClose - Auto close duration in ms (optional, default: 4000)
 * 
 * @example
 * showInfoNotification("Đang xử lý yêu cầu của bạn...")
 */
export function showInfoNotification(
  message: string,
  title: string = 'Thông tin',
  autoClose: number = 4000
): void {
  notifications.show({
    title,
    message,
    color: 'blue',
    icon: <IconInfoCircle size={16} />,
    autoClose,
  });
}

/**
 * Show warning notification
 * 
 * @param message - Warning message
 * @param title - Custom title (optional, default: "Cảnh báo")
 * @param autoClose - Auto close duration in ms (optional, default: 5000)
 * 
 * @example
 * showWarningNotification("Bạn chưa lưu thay đổi")
 */
export function showWarningNotification(
  message: string,
  title: string = 'Cảnh báo',
  autoClose: number = 5000
): void {
  notifications.show({
    title,
    message,
    color: 'yellow',
    icon: <IconAlertTriangle size={16} />,
    autoClose,
  });
}
