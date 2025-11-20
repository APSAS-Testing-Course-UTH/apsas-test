/**
 * Error Handling Hooks for Student Portal
 * Custom hooks for common error scenarios
 *
 * Hooks included:
 * - useErrorHandler: Generic error handling
 * - useSubmissionErrorHandler: Submission-specific errors
 * - useDownloadErrorHandler: Download/file operation errors
 * - useNetworkErrorHandler: Network connectivity errors
 */

import { useCallback } from 'react'
import type { ApiErrorResponse } from '@/configs/api-error-handler'
import {
  getErrorMessage,
  mapApiError,
  showErrorNotification,
  showNetworkErrorNotification,
  showTimeoutNotification,
  showValidationErrorNotification,
  isNetworkError,
  isTimeoutError,
  extractValidationErrors,
  getErrorCategory,
  type StudentPortalError,
} from '../utils/errorHandler'

/**
 * useErrorHandler Hook
 * Generic error handling for any operation
 *
 * @returns Object with error handler functions
 *
 * @example
 * ```tsx
 * const { handleError, showError } = useErrorHandler()
 *
 * try {
 *   await apiCall()
 * } catch (error) {
 *   handleError(error, 'Lỗi khi tải dữ liệu')
 * }
 * ```
 */
export type UseErrorHandlerReturn = ReturnType<typeof useErrorHandler>

export function useErrorHandler() {
  const handleError = useCallback(
    (error: ApiErrorResponse | Error | unknown, title: string = 'Lỗi') => {
      const category = getErrorCategory(error)
      const message = getErrorMessage(error)

      // Handle network errors specially
      if (category === 'network') {
        showNetworkErrorNotification(error)
        return
      }

      // Handle timeout errors specially
      if (category === 'timeout') {
        showTimeoutNotification()
        return
      }

      // Show standard error notification
      showErrorNotification(title, message)
    },
    []
  )

  const showError = useCallback((error: ApiErrorResponse | Error | unknown, title?: string) => {
    handleError(error, title || 'Lỗi')
  }, [handleError])

  const getMappedError = useCallback((error: ApiErrorResponse | Error | unknown): StudentPortalError => {
    return mapApiError(error)
  }, [])

  return {
    handleError,
    showError,
    getMappedError,
    getErrorMessage,
    getErrorCategory,
  }
}

/**
 * useSubmissionErrorHandler Hook
 * Specialized error handling for code submission operations
 *
 * @returns Object with submission-specific error handlers
 *
 * @example
 * ```tsx
 * const { handleSubmissionError, handleCompilationError } = useSubmissionErrorHandler()
 *
 * mutation.mutate(code, {
 *   onError: (error) => handleSubmissionError(error)
 * })
 * ```
 */
export function useSubmissionErrorHandler() {
  const { handleError } = useErrorHandler()

  const handleSubmissionError = useCallback(
    (error: ApiErrorResponse | Error | unknown) => {
      const category = getErrorCategory(error)

      if (category === 'validation') {
        const validationErrors = extractValidationErrors(error)
        if (validationErrors.length > 0) {
          showValidationErrorNotification(validationErrors)
          return
        }
      }

      handleError(error, 'Lỗi nộp bài')
    },
    [handleError]
  )

  const handleCompilationError = useCallback(
    (error: ApiErrorResponse | Error | unknown) => {
      handleError(error, 'Lỗi biên dịch/chạy chương trình')
    },
    [handleError]
  )

  const handleTestcaseError = useCallback(
    (error: ApiErrorResponse | Error | unknown) => {
      handleError(error, 'Lỗi khi chạy test case')
    },
    [handleError]
  )

  return {
    handleSubmissionError,
    handleCompilationError,
    handleTestcaseError,
  }
}

/**
 * useDownloadErrorHandler Hook
 * Specialized error handling for file download operations
 *
 * @returns Object with download-specific error handlers
 *
 * @example
 * ```tsx
 * const { handleDownloadError } = useDownloadErrorHandler()
 *
 * button.onClick(async () => {
 *   try {
 *     await downloadFile()
 *   } catch (error) {
 *     handleDownloadError(error, 'assignment.pdf')
 *   }
 * })
 * ```
 */
export function useDownloadErrorHandler() {
  const { handleError } = useErrorHandler()

  const handleDownloadError = useCallback(
    (error: ApiErrorResponse | Error | unknown, filename?: string) => {
      const fileInfo = filename ? ` (${filename})` : ''
      handleError(error, `Lỗi tải tệp${fileInfo}`)
    },
    [handleError]
  )

  const handleFileAccessError = useCallback(
    (error: ApiErrorResponse | Error | unknown) => {
      handleError(error, 'Lỗi truy cập tệp')
    },
    [handleError]
  )

  return {
    handleDownloadError,
    handleFileAccessError,
  }
}

/**
 * useNetworkErrorHandler Hook
 * Specialized error handling for network-related errors
 *
 * @returns Object with network-specific error handlers
 *
 * @example
 * ```tsx
 * const { handleNetworkError, isNetworkDown } = useNetworkErrorHandler()
 *
 * useEffect(() => {
 *   window.addEventListener('offline', () => handleNetworkError())
 * }, [])
 * ```
 */
export function useNetworkErrorHandler() {
  const handleNetworkError = useCallback(
    (error?: ApiErrorResponse | Error | unknown) => {
      showNetworkErrorNotification(error)
    },
    []
  )

  const handleTimeoutError = useCallback(() => {
    showTimeoutNotification()
  }, [])

  const isOffline = useCallback((error: ApiErrorResponse | Error | unknown): boolean => {
    return isNetworkError(error)
  }, [])

  const isTimeout = useCallback((error: ApiErrorResponse | Error | unknown): boolean => {
    return isTimeoutError(error)
  }, [])

  return {
    handleNetworkError,
    handleTimeoutError,
    isOffline,
    isTimeout,
  }
}

/**
 * useFormErrorHandler Hook
 * Specialized error handling for form operations
 *
 * @returns Object with form-specific error handlers
 *
 * @example
 * ```tsx
 * const { handleFormValidationError, handleFormSubmitError } = useFormErrorHandler()
 *
 * form.onSubmit(async (values) => {
 *   try {
 *     await apiCall(values)
 *   } catch (error) {
 *     handleFormSubmitError(error, form)
 *   }
 * })
 * ```
 */
export function useFormErrorHandler() {
  const { handleError } = useErrorHandler()

  const handleFormValidationError = useCallback(
    (error: ApiErrorResponse | Error | unknown) => {
      const validationErrors = extractValidationErrors(error)

      if (validationErrors.length > 0) {
        showValidationErrorNotification(validationErrors)
        return validationErrors
      }

      handleError(error, 'Lỗi xác thực biểu mẫu')
      return []
    },
    [handleError]
  )

  const handleFormSubmitError = useCallback(
    (error: ApiErrorResponse | Error | unknown) => {
      const validationErrors = extractValidationErrors(error)

      if (validationErrors.length > 0) {
        showValidationErrorNotification(validationErrors)
        return validationErrors
      }

      handleError(error, 'Lỗi gửi biểu mẫu')
      return []
    },
    [handleError]
  )

  return {
    handleFormValidationError,
    handleFormSubmitError,
  }
}
