// Export error handling utilities
export {
  getErrorMessage,
  showErrorNotification,
  showSuccessNotification,
  isNetworkError,
  isTimeoutError,
  getErrorCategory,
} from './errorHandler'

/**
 * @deprecated Type exports removed
 * - ApiErrorResponse: Student-specific, defined in errorHandler.tsx
 * - StudentPortalError: Student-specific, defined in errorHandler.tsx  
 * - ValidationError: Use centralized version from @/configs/api-error-handler
 * 
 * Import directly from ./errorHandler if needed for student-specific types
 */

