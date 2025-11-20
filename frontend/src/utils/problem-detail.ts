/**
 * Utility functions for working with ProblemDetail (RFC 9457)
 * 
 * These utilities help extract and work with ProblemDetail responses
 * from the backend API.
 */

import type { ProblemDetail, ExtendedProblemDetail, ValidationErrors } from '@/types/problem-detail.types';

/**
 * Extract ProblemDetail from hey-api error response
 * 
 * @param error - Error from API call
 * @returns ProblemDetail object or null if not found
 * 
 * @example
 * ```ts
 * try {
 *   await api.call()
 * } catch (error) {
 *   const problemDetail = extractProblemDetail(error)
 *   if (problemDetail) {
 *     console.log(problemDetail.title, problemDetail.detail)
 *   }
 * }
 * ```
 */
export function extractProblemDetail(error: unknown): ProblemDetail | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const apiError = error as { error?: unknown };
  
  if (!apiError.error || typeof apiError.error !== 'object') {
    return null;
  }

  const errorData = apiError.error as Record<string, unknown>;

  // Check if this looks like a ProblemDetail
  if ('title' in errorData || 'detail' in errorData || 'status' in errorData) {
    return errorData as ProblemDetail;
  }

  return null;
}

/**
 * Extract validation errors from ProblemDetail
 * 
 * @param problemDetail - ProblemDetail object
 * @returns Validation errors object or null
 * 
 * @example
 * ```ts
 * const problemDetail = extractProblemDetail(error)
 * const validationErrors = extractValidationErrorsFromProblemDetail(problemDetail)
 * 
 * if (validationErrors) {
 *   Object.entries(validationErrors).forEach(([field, message]) => {
 *     form.setError(field, { message })
 *   })
 * }
 * ```
 */
export function extractValidationErrorsFromProblemDetail(
  problemDetail: ProblemDetail | null
): ValidationErrors | null {
  if (!problemDetail) {
    return null;
  }

  const extended = problemDetail as ExtendedProblemDetail;

  if (!extended.errors || typeof extended.errors !== 'object') {
    return null;
  }

  return extended.errors;
}

/**
 * Get user-friendly error message from ProblemDetail
 * 
 * Priority: detail > title > default message
 * 
 * @param problemDetail - ProblemDetail object
 * @param defaultMessage - Default message if no detail/title found
 * @returns User-friendly error message
 * 
 * @example
 * ```ts
 * const problemDetail = extractProblemDetail(error)
 * const message = getUserMessage(problemDetail, 'Có lỗi xảy ra')
 * showNotification(message)
 * ```
 */
export function getUserMessage(
  problemDetail: ProblemDetail | null,
  defaultMessage: string = 'Có lỗi xảy ra'
): string {
  if (!problemDetail) {
    return defaultMessage;
  }

  return (problemDetail.detail || problemDetail.title || defaultMessage) as string;
}

/**
 * Check if ProblemDetail contains validation errors
 * 
 * @param problemDetail - ProblemDetail object
 * @returns True if has validation errors
 * 
 * @example
 * ```ts
 * const problemDetail = extractProblemDetail(error)
 * 
 * if (hasValidationErrors(problemDetail)) {
 *   const errors = extractValidationErrorsFromProblemDetail(problemDetail)
 *   // Handle validation errors...
 * } else {
 *   // Handle general error...
 * }
 * ```
 */
export function hasValidationErrors(problemDetail: ProblemDetail | null): boolean {
  if (!problemDetail) {
    return false;
  }

  const extended = problemDetail as ExtendedProblemDetail;

  return (
    typeof extended.errors === 'object' &&
    extended.errors !== null &&
    Object.keys(extended.errors).length > 0
  );
}

/**
 * Format ProblemDetail for logging/debugging
 * 
 * @param problemDetail - ProblemDetail object
 * @returns Formatted string for console.log
 * 
 * @example
 * ```ts
 * const problemDetail = extractProblemDetail(error)
 * console.error(formatProblemDetail(problemDetail))
 * ```
 */
export function formatProblemDetail(problemDetail: ProblemDetail | null): string {
  if (!problemDetail) {
    return 'No ProblemDetail found';
  }

  const parts: string[] = [];

  if (problemDetail.status) {
    parts.push(`[${problemDetail.status}]`);
  }

  if (problemDetail.title) {
    parts.push(problemDetail.title);
  }

  if (problemDetail.detail) {
    parts.push(`- ${problemDetail.detail}`);
  }

  if (problemDetail.type) {
    parts.push(`(type: ${problemDetail.type})`);
  }

  const extended = problemDetail as ExtendedProblemDetail;
  if (extended.errors && Object.keys(extended.errors).length > 0) {
    const errorCount = Object.keys(extended.errors).length;
    parts.push(`[${errorCount} validation errors]`);
  }

  return parts.join(' ');
}

/**
 * Check if error is a ProblemDetail error
 * 
 * @param error - Error from API call
 * @returns True if error contains ProblemDetail
 * 
 * @example
 * ```ts
 * try {
 *   await api.call()
 * } catch (error) {
 *   if (isProblemDetailError(error)) {
 *     const problemDetail = extractProblemDetail(error)
 *     // Handle ProblemDetail...
 *   } else {
 *     // Handle other errors...
 *   }
 * }
 * ```
 */
export function isProblemDetailError(error: unknown): boolean {
  return extractProblemDetail(error) !== null;
}
