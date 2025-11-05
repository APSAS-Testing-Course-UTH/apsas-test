/**
 * MSW Mock Configuration
 * Centralized configuration for MSW handlers
 * 
 * CRITICAL: MSW handlers MUST use full absolute URLs to match SDK requests
 * The SDK uses baseURL from generated client (http://localhost:8080 by default)
 */

// Base URL for all MSW handlers - MUST match SDK baseURL
// In test environment, we use localhost:8080 to match the generated SDK
export const MSW_BASE_URL = 'http://localhost:8080'

// API version prefix
export const API_VERSION = 'v1'

// Service-specific URL builders
export const buildServiceUrl = (service: string, endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${MSW_BASE_URL}/api/${API_VERSION}/${service}${cleanEndpoint}`
}

// Helper functions for each service
export const identityUrl = (endpoint: string): string => {
  // IMPORTANT: API uses /api/v1/users, NOT /api/v1/identity/...
  // Auth endpoints use /api/auth (without v1)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  if (endpoint.includes('auth') || endpoint.includes('login') || endpoint.includes('register')) {
    // Auth endpoints: /api/auth/...
    return `${MSW_BASE_URL}/api${cleanEndpoint}`
  }
  // User endpoints: /api/v1/users/...
  return `${MSW_BASE_URL}/api/${API_VERSION}${cleanEndpoint}`
}

export const contentUrl = (endpoint: string): string => {
  // IMPORTANT: API uses /api/v1/assignments, /api/v1/tutorials, etc.
  // NOT /api/v1/content/assignments
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${MSW_BASE_URL}/api/${API_VERSION}${cleanEndpoint}`
}

export const submissionUrl = (endpoint: string): string => {
  // IMPORTANT: API uses /api/v1/submissions directly, NOT /api/v1/submission/...
  // This matches the generated SDK which calls /api/v1/submissions
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${MSW_BASE_URL}/api/${API_VERSION}${cleanEndpoint}`
}

export const evaluationUrl = (endpoint: string): string => {
  // IMPORTANT: API uses /api/v1/evaluations, /api/v1/analytics, etc.
  // NOT /api/v1/evaluation/...
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${MSW_BASE_URL}/api/${API_VERSION}${cleanEndpoint}`
}

export const supportUrl = (endpoint: string): string => {
  // IMPORTANT: API uses /api/v1/support/sessions, not /api/v1/support/support/..
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${MSW_BASE_URL}/api/${API_VERSION}/support${cleanEndpoint}`
}

// Export individual paths for convenience
export const SUPPORT_PATHS = {
  SESSIONS: supportUrl('sessions'),
  SESSION_BY_ID: (id: string) => supportUrl(`sessions/${id}`),
  CLOSE_SESSION: (id: string) => supportUrl(`sessions/${id}/close`),
} as const

export const CONTENT_PATHS = {
  ASSIGNMENTS: contentUrl('assignments'),
  ASSIGNMENT_BY_ID: (id: string) => contentUrl(`assignments/${id}`),
} as const

export const SUBMISSION_PATHS = {
  SUBMISSIONS: submissionUrl('submissions'),
  SUBMISSION_BY_ID: (id: string) => submissionUrl(`submissions/${id}`),
  EVALUATE: (id: string) => submissionUrl(`submissions/${id}/evaluate`),
} as const

export const EVALUATION_PATHS = {
  RESULTS: evaluationUrl('results'),
  RESULT_BY_ID: (id: string) => evaluationUrl(`results/${id}`),
} as const

export const IDENTITY_PATHS = {
  LOGIN: identityUrl('auth/login'),
  REGISTER: identityUrl('auth/register'),
  VERIFY_EMAIL: identityUrl('auth/verify-email'),
  FORGOT_PASSWORD: identityUrl('auth/forgot-password'),
  RESET_PASSWORD: identityUrl('auth/reset-password'),
  RESEND_VERIFICATION: identityUrl('auth/resend-verification'),
  ME: identityUrl('users/me'),
  USERS: identityUrl('users'),
  USER_BY_ID: (id: string) => identityUrl(`users/${id}`),
} as const

console.log('[MSW Config] Initialized with base URL:', MSW_BASE_URL)
