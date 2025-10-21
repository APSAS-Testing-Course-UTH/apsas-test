import { HttpResponse } from 'msw'

// Standard API error responses
export const createErrorResponse = (
  status: number,
  message: string,
  error?: string
) => {
  return HttpResponse.json(
    {
      error: error || 'Error',
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

// Common error responses
export const errorResponses = {
  // 400 Bad Request
  badRequest: (message = 'Bad request') =>
    createErrorResponse(400, message, 'Bad Request'),

  // 401 Unauthorized
  unauthorized: (message = 'Authentication required') =>
    createErrorResponse(401, message, 'Unauthorized'),

  // 403 Forbidden
  forbidden: (message = 'Access denied') =>
    createErrorResponse(403, message, 'Forbidden'),

  // 404 Not Found
  notFound: (message = 'Resource not found') =>
    createErrorResponse(404, message, 'Not Found'),

  // 409 Conflict
  conflict: (message = 'Resource conflict') =>
    createErrorResponse(409, message, 'Conflict'),

  // 422 Unprocessable Entity
  validationError: (message = 'Validation failed', details?: any) =>
    HttpResponse.json(
      {
        error: 'Validation Error',
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      { status: 422 }
    ),

  // 500 Internal Server Error
  internalServerError: (message = 'Internal server error') =>
    createErrorResponse(500, message, 'Internal Server Error'),
}

// Validation error helper
export const createValidationError = (field: string, message: string) => {
  return errorResponses.validationError('Validation failed', {
    [field]: [message],
  })
}

// Simulate network delay (for testing loading states)
export const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

// Simulate random failures (for testing error states)
export const randomFailure = (failureRate = 0.1) => {
  return Math.random() < failureRate
}