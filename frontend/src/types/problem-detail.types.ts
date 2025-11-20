/**
 * ProblemDetail Type Definitions
 * 
 * Based on RFC 9457 (Problem Details for HTTP APIs)
 * https://www.rfc-editor.org/rfc/rfc9457.html
 * 
 * This type matches the Spring Framework ProblemDetail structure
 * returned by the backend GlobalExceptionHandler
 */

/**
 * Standard RFC 9457 ProblemDetail structure
 * 
 * @see https://www.rfc-editor.org/rfc/rfc9457.html
 * @see backend/sources/shared/exception/src/apsas/shared/exception/GlobalExceptionHandler.java
 */
export interface ProblemDetail {
  /**
   * URI reference that identifies the problem type
   * @example "https://example.com/probs/validation-error"
   */
  type?: string;

  /**
   * Short, human-readable summary of the problem type
   * @example "Lỗi xác thực dữ liệu"
   */
  title?: string;

  /**
   * HTTP status code
   * @example 400
   */
  status?: number;

  /**
   * Human-readable explanation specific to this occurrence
   * @example "Dữ liệu đầu vào không hợp lệ."
   */
  detail?: string;

  /**
   * URI reference that identifies the specific occurrence of the problem
   * @example "/api/v1/users"
   */
  instance?: string;

  /**
   * Additional properties (extensions)
   * 
   * Spring ProblemDetail allows additional properties via setProperty()
   * 
   * Common extensions from backend:
   * - errors: Map<string, string> - Field validation errors
   * - timestamp: string - Error timestamp
   * - path: string - Request path
   * - code: string - Custom error code
   */
  [key: string]: unknown;
}

/**
 * Validation error structure from backend
 * 
 * Backend structure (in ProblemDetail.errors property):
 * {
 *   "field1": "Error message 1",
 *   "field2": "Error message 2"
 * }
 */
export interface ValidationErrors {
  [fieldName: string]: string;
}

/**
 * Extended ProblemDetail with typed extensions
 * 
 * This interface provides type-safe access to common extension properties
 */
export interface ExtendedProblemDetail extends ProblemDetail {
  /**
   * Field validation errors (from MethodArgumentNotValidException)
   * @example { "email": "Email không hợp lệ", "password": "Mật khẩu quá ngắn" }
   */
  errors?: ValidationErrors;

  /**
   * Error timestamp
   * @example "2025-11-20T10:30:00Z"
   */
  timestamp?: string;

  /**
   * Request path where error occurred
   * @example "/api/v1/users"
   */
  path?: string;

  /**
   * Custom error code
   * @example "VALIDATION_ERROR"
   */
  code?: string;
}

/**
 * Type guard to check if an object is a ProblemDetail
 */
export function isProblemDetail(obj: unknown): obj is ProblemDetail {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const problemDetail = obj as ProblemDetail;

  // Check if it has at least one of the standard ProblemDetail properties
  return (
    typeof problemDetail.type === 'string' ||
    typeof problemDetail.title === 'string' ||
    typeof problemDetail.status === 'number' ||
    typeof problemDetail.detail === 'string' ||
    typeof problemDetail.instance === 'string'
  );
}

/**
 * Type guard to check if a ProblemDetail has validation errors
 */
export function hasValidationErrors(
  problemDetail: ProblemDetail
): problemDetail is ExtendedProblemDetail {
  const extended = problemDetail as ExtendedProblemDetail;
  return (
    typeof extended.errors === 'object' &&
    extended.errors !== null &&
    Object.keys(extended.errors).length > 0
  );
}
