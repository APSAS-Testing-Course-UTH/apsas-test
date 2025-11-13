// Export error handling utilities
export {
  getErrorMessage,
  mapApiError,
  showErrorNotification,
  showSuccessNotification,
  showWarningNotification,
  showInfoNotification,
  showNetworkErrorNotification,
  showTimeoutNotification,
  showValidationErrorNotification,
  extractValidationErrors,
  isNetworkError,
  isTimeoutError,
  getErrorCategory,
} from './errorHandler'

export type {
  ApiErrorResponse,
  StudentPortalError,
  ValidationError,
} from './errorHandler'
