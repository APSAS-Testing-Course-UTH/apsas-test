/**
 * REST API Helper for Integration Tests
 * 
 * Provides direct REST API calls that bypass SDK/MSW by using globalThis.fetch
 * This avoids the MSW + undici URL parsing incompatibility in integration tests
 * 
 * Rationale:
 * - MSW v2 doesn't properly handle undici Request objects
 * - Using globalThis.fetch (native fetch) works with MSW correctly
 * - Direct REST calls are more direct representation of actual API usage
 * - This is essentially testing the true end-to-end flow
 */

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  token?: string
}

const BASE_URL = 'http://localhost:8080/api'

/**
 * Helper function to make REST API calls using globalThis.fetch
 * This bypasses SDK and uses native fetch which MSW handles correctly
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data?: T; error?: any; status: number }> {
  const url = `${BASE_URL}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Add authorization header if token provided
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`
  }

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
  }

  // Add body if provided
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body)
  }

  try {
    const response = await globalThis.fetch(url, fetchOptions)

    // Try to parse JSON response
    let data: T | undefined
    try {
      data = await response.json()
    } catch {
      // If response is not JSON, leave data undefined
      // (e.g., for 204 No Content)
    }

    return {
      data,
      status: response.status,
      error: !response.ok ? data : undefined,
    }
  } catch (error) {
    return {
      error,
      status: 0, // Network error
    }
  }
}

/**
 * Authentication API Calls
 */
export const authApi = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string, rememberMe?: boolean) => {
    return fetchApi('/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
        ...(rememberMe && { rememberMe }),
      },
    })
  },

  /**
   * Register new account
   */
  register: async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    return fetchApi('/auth/register', {
      method: 'POST',
      body: {
        firstName,
        lastName,
        email,
        password,
      },
    })
  },

  /**
   * Get current user profile (requires token)
   */
  getCurrentUser: async (token: string) => {
    return fetchApi('/v1/users/me', {
      method: 'GET',
      token,
    })
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string) => {
    return fetchApi('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    })
  },

  /**
   * Reset password with token
   */
  resetPassword: async (
    token: string,
    password: string,
    passwordConfirm: string
  ) => {
    return fetchApi('/auth/reset-password', {
      method: 'POST',
      body: {
        token,
        password,
        passwordConfirm,
      },
    })
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string) => {
    return fetchApi('/auth/verify-email', {
      method: 'POST',
      body: { token },
    })
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async (email: string) => {
    return fetchApi('/auth/resend-verification', {
      method: 'POST',
      body: { email },
    })
  },
}

/**
 * Submission API Calls (for integration tests)
 */
export const submissionApi = {
  /**
   * Get submissions list
   */
  getSubmissions: async (token: string, page: number = 0, size: number = 10) => {
    return fetchApi(`/submissions?page=${page}&size=${size}`, {
      method: 'GET',
      token,
    })
  },

  /**
   * Create submission
   */
  createSubmission: async (
    token: string,
    assignmentId: string,
    code: string
  ) => {
    return fetchApi('/submissions', {
      method: 'POST',
      token,
      body: {
        assignmentId,
        code,
      },
    })
  },

  /**
   * Get submission details
   */
  getSubmission: async (token: string, submissionId: string) => {
    return fetchApi(`/submissions/${submissionId}`, {
      method: 'GET',
      token,
    })
  },
}

/**
 * Content API Calls (for integration tests)
 */
export const contentApi = {
  /**
   * Get assignments list
   */
  getAssignments: async (token: string, page: number = 0, size: number = 10) => {
    return fetchApi(`/assignments?page=${page}&size=${size}`, {
      method: 'GET',
      token,
    })
  },

  /**
   * Get assignment details
   */
  getAssignment: async (token: string, assignmentId: string) => {
    return fetchApi(`/assignments/${assignmentId}`, {
      method: 'GET',
      token,
    })
  },
}

/**
 * Evaluation API Calls (for integration tests)
 */
export const evaluationApi = {
  /**
   * Get evaluations for a submission
   */
  getEvaluations: async (token: string, submissionId: string) => {
    return fetchApi(`/evaluations/submission/${submissionId}`, {
      method: 'GET',
      token,
    })
  },

  /**
   * Get performance analytics
   */
  getPerformance: async (token: string) => {
    return fetchApi('/analytics/performance', {
      method: 'GET',
      token,
    })
  },
}
