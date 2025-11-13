 import { AxiosError } from 'axios';
import type { ApiError } from '@/types/auth.types';

// API Error Handler cho APSAS Frontend

/**
 * Extended error interface với additional properties
 */
/**
 * Extended Axios error interface with additional properties
 * Provides type-safe access to Axios error details
 */
export interface AxiosErrorDetail {
  isAxiosError?: boolean;
  response?: {
    status?: number;
    data?: unknown;
  };
  message?: string;
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
 * Xử lý ba loại error: Axios, Network, và Generic errors
 * Tự động translate HTTP error codes thành Vietnamese user messages
 * 
 * @param {AxiosError | Error | unknown} error - Error object từ API call hoặc exception
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
export const mapApiError = (error: AxiosError | Error | unknown): ExtendedApiError => {
  // Handle Axios errors
  // Check if error is Axios error with proper typing
  const errorDetail = error as AxiosErrorDetail
  if (errorDetail?.isAxiosError || errorDetail?.response) {
    const axiosError = error as AxiosError
    const status = axiosError.response?.status
    const data = axiosError.response?.data as Record<string, unknown> | undefined

    // Extract error details from response
    const message = (typeof data === 'object' && data?.message) ? String(data.message) : axiosError.message
    const code = (typeof data === 'object' && data?.code) ? String(data.code) : `HTTP_${status}`
    const details = (typeof data === 'object' && data?.details && typeof data.details === 'object') ? (data.details as Record<string, unknown>) : {}

    // Map HTTP status codes to Vietnamese messages
    let userMessage = message;

    if (!userMessage || userMessage === axiosError.message) {
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
      originalError: axiosError,
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
 * @param {AxiosError | unknown} error - Error object từ API call (thường là 400 hoặc 422)
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
export const extractValidationErrors = (error: AxiosError | unknown): ValidationError[] => {
  const errors: ValidationError[] = []

  const errorObj = error as AxiosErrorDetail
  const responseData = errorObj?.response?.data
  if (responseData && typeof responseData === 'object') {
    const data = responseData as Record<string, unknown>

    // Handle field-specific errors
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

    // Handle nested validation errors
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
  error: AxiosError | Error | unknown,
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