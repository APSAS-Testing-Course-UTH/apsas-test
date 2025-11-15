import { http, HttpResponse } from 'msw'
import type { MockUser } from '../middleware/withAuth'
import type {
  IdentityServiceLoginRequest,
  IdentityServiceLoginResponses,
  IdentityServiceRegisterRequest,
  IdentityServiceRegisterResponses,
  IdentityServiceEmailRequest,
  IdentityServiceResetPasswordRequest,
  IdentityServiceTokenRequest,
  IdentityServiceUserResponse,
  IdentityServiceUpdateProfileRequest,
  IdentityServicePageResponseUserResponse,
  IdentityServiceCreateUserRequest,
} from '@/api/types.gen'
// Import from centralized mock data registry
import { MOCK_DATA_REGISTRY, getStudentOverallPerformance } from '../factory/mockDataRegistry'
import { UserRole, withAuth, mapRoleToApi } from '../middleware/withAuth'
import type { UserRoleType } from '../middleware/withAuth'
import { errorResponses } from '../middleware/errorHandler'
import { factory, primaryKey } from '@mswjs/data'
import { MSW_BASE_URL } from '../config'

console.log('[Identity Handlers] Using base URL:', MSW_BASE_URL)

// Create MSW Data database for persistent mock data
const db = factory({
  user: {
    id: primaryKey(String),
    email: String,
    password: String,
    role: String,
    isVerified: Boolean,
    resetToken: String,
    resetTokenExpiry: Number,
    createdAt: Number,
    updatedAt: Number,
  },
})

// Initialize database with default users if not already persisted
const initializeDatabase = () => {
  // Check if users already exist (don't recreate)
  const existingUsers = db.user.findMany({})
  if (existingUsers.length > 0) {
    return
  }

  // Create default users
  const defaultUsers = [
    {
      id: 'admin-001',
      email: 'admin@apsas.edu.vn',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
      resetToken: '',
      resetTokenExpiry: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'instructor-001',
      email: 'instructor@apsas.edu.vn',
      password: 'Instructor@123',
      role: 'instructor',
      isVerified: true,
      resetToken: '',
      resetTokenExpiry: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'student-001',
      email: 'student@apsas.edu.vn',
      password: 'Student@123',
      role: 'student',
      isVerified: true,
      resetToken: '',
      resetTokenExpiry: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'provider-001',
      email: 'provider@apsas.edu.vn',
      password: 'Provider@123',
      role: 'provider',
      isVerified: true,
      resetToken: '',
      resetTokenExpiry: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ]

  defaultUsers.forEach(user => db.user.create(user))
}

// Persist database to localStorage (optional - can be simplified)
const persistDatabase = () => {
  // For now, skip persistence to avoid localStorage issues in tests
  // Data is kept in memory during the test
}

// Initialize database on first handler call (lazy initialization)
let isDatabaseInitialized = false
const ensureDatabaseInitialized = () => {
  if (!isDatabaseInitialized) {
    try {
      initializeDatabase()
      isDatabaseInitialized = true
    } catch (error) {
      // If primary key violation, just mark as initialized
      if (error instanceof Error && error.message.includes('already')) {
        isDatabaseInitialized = true
      }
      // Don't rethrow - keep going
    }
  }
}

// Helper function to get user by email
const getUserByEmail = (email: string) => {
  return db.user.findFirst({
    where: { email: { equals: email } },
  })
}



// ============================================
// PUBLIC ENDPOINTS (No Auth Required)
// ============================================

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
export const loginHandler = http.post(
  '**/api/auth/login',
  async ({ request }) => {
    ensureDatabaseInitialized()
    try {
      const body = await request.json() as IdentityServiceLoginRequest

      // Validate input
      if (!body.email || !body.password) {
        return errorResponses.badRequest('Email and password are required')
      }

      // Find user by email and password
      const user = db.user.findFirst({
        where: {
          email: { equals: body.email },
          password: { equals: body.password },
        },
      })

      if (!user) {
        return errorResponses.unauthorized('Invalid email or password')
      }

      // Get user details from mockUsers
      const mockUser = (MOCK_DATA_REGISTRY.users as any)[`${user.role}1` as keyof typeof MOCK_DATA_REGISTRY.users]

      // Return AuthResponse with token
      const response: IdentityServiceLoginResponses[200] = {
        token: (MOCK_DATA_REGISTRY.tokens as any)[user.role as keyof typeof MOCK_DATA_REGISTRY.tokens],
        type: 'Bearer',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mapRoleToApi(user.role as UserRoleType),
          isActive: mockUser.isActive,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      return HttpResponse.json(response, {
        status: 200,
        headers: {
          'Set-Cookie': `token=${(MOCK_DATA_REGISTRY.tokens as any)[user.role as keyof typeof MOCK_DATA_REGISTRY.tokens]}; Path=/; HttpOnly; SameSite=Strict`,
        },
      })
    } catch (error) {
      return errorResponses.internalServerError('Login failed')
    }
  }
)

/**
 * POST /api/auth/register
 * Register new user account (Student role by default)
 */
export const registerHandler = http.post('**/api/auth/register',
  async ({ request }) => {
    try {
      const body = await request.json() as IdentityServiceRegisterRequest

      // Validate input
      if (!body.email || !body.password || body.password.length < 8) {
        return errorResponses.badRequest('Invalid input. Password must be at least 8 characters.')
      }

      // Check if email already exists in database
      const existingUser = getUserByEmail(body.email)
      if (existingUser) {
        return errorResponses.conflict('Email already registered')
      }

      // Create new user in database (Student role by default)
      const newUserId = `student-${Date.now()}`
      const newUser = {
        id: newUserId,
        email: body.email,
        password: body.password,
        role: 'student',
        isVerified: true,
        resetToken: '',
        resetTokenExpiry: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      db.user.create(newUser)
      persistDatabase()

      // Return AuthResponse with the newly created user's details
      const response: IdentityServiceRegisterResponses[201] = {
        token: (MOCK_DATA_REGISTRY.tokens as any).student,
        type: 'Bearer',
        user: {
          id: newUserId,
          email: body.email,
          firstName: body.firstName || 'New',
          lastName: body.lastName || 'User',
          role: 'STUDENT' as const,
          isActive: true,
        },
      }

      return HttpResponse.json(response, {
        status: 201, // HTTP 201 Created for new user registration
        headers: {
          'Set-Cookie': `token=${(MOCK_DATA_REGISTRY.tokens as any).student}; Path=/; HttpOnly; SameSite=Strict`,
        },
      })
    } catch (error) {
      return errorResponses.internalServerError('Registration failed')
    }
  }
)

/**
 * POST /api/auth/forgot-password
 * Send password reset email to user
 */
export const forgotPasswordHandler = http.post('**/api/auth/forgot-password',
  async ({ request }) => {
    try {
      const body = await request.json() as IdentityServiceEmailRequest

      // Validate input
      if (!body.email) {
        return errorResponses.badRequest('Email is required')
      }

      // Check if user exists in database
      const user = getUserByEmail(body.email)
      if (!user) {
        // For security, don't reveal if email exists or not
        // Return success message anyway
        return HttpResponse.json(null, { status: 204 })
      }

      // Generate reset token and expiry (24 hours from now)
      const resetToken = `reset-${user.id}-${Date.now()}`
      const resetTokenExpiry = Date.now() + (24 * 60 * 60 * 1000) // 24 hours

      // Update user with reset token
      db.user.update({
        where: { id: { equals: user.id } },
        data: {
          resetToken,
          resetTokenExpiry,
          updatedAt: Date.now(),
        },
      })
      persistDatabase()

      // In a real implementation, this would send an email with the reset link
      // For mocking, just return success with 204 No Content
      return HttpResponse.json(null, { status: 204 })
    } catch (error) {
      return errorResponses.internalServerError('Failed to process password reset request')
    }
  }
)

/**
 * POST /api/auth/reset-password
 * Reset user password using reset token
 */
export const resetPasswordHandler = http.post('**/api/auth/reset-password',
  async ({ request }) => {
    try {
      const body = await request.json() as IdentityServiceResetPasswordRequest

      // Validate input - both token and newPassword are required
      if (!body.token || !body.newPassword || body.newPassword.trim() === '') {
        return errorResponses.badRequest('Token and new password are required')
      }

      // Validate password strength (minimum 8 characters)
      if (body.newPassword.length < 8) {
        return errorResponses.badRequest('Password must be at least 8 characters long')
      }

      // Check for invalid tokens (explicit test case)
      if (body.token === 'invalid-token') {
        return errorResponses.badRequest('Invalid or expired reset token')
      }

      // Accept known valid test tokens and update the corresponding user
      if (body.token === 'valid-reset-token' || body.token === 'valid-token') {
        // For test tokens, assume it's for the student user
        const studentUser = db.user.findFirst({
          where: { email: { equals: 'student@apsas.edu.vn' } },
        })

        if (studentUser) {
          // Update the student's password
          db.user.update({
            where: { id: { equals: studentUser.id } },
            data: {
              password: body.newPassword,
              resetToken: '',
              resetTokenExpiry: 0,
              updatedAt: Date.now(),
            },
          })
          persistDatabase()
        }

        return HttpResponse.json(null, { status: 204 })
      }

      // Find user by reset token in database
      const user = db.user.findFirst({
        where: { resetToken: { equals: body.token } },
      })

      if (!user) {
        return errorResponses.badRequest('Invalid or expired reset token')
      }

      // Check if token is expired
      if (user.resetTokenExpiry && user.resetTokenExpiry < Date.now()) {
        return errorResponses.badRequest('Reset token has expired')
      }

      // Update password and clear reset token
      db.user.update({
        where: { id: { equals: user.id } },
        data: {
          password: body.newPassword,
          resetToken: '',
          resetTokenExpiry: 0,
          updatedAt: Date.now(),
        },
      })
      persistDatabase()

      return HttpResponse.json(null, { status: 204 })
    } catch (error) {
      return errorResponses.internalServerError('Failed to reset password')
    }
  }
)

/**
 * POST /api/auth/verify-email
 * Verify user email using verification token
 */
export const verifyEmailHandler = http.post('**/api/auth/verify-email',
  async ({ request }) => {
    try {
      const body = await request.json() as IdentityServiceTokenRequest

      // Validate input
      if (!body.token || body.token.trim() === '') {
        return errorResponses.badRequest('Verification token is required')
      }

      // Check for invalid tokens
      if (body.token === 'invalid-token') {
        return errorResponses.badRequest('Invalid verification token')
      }

      // Check for expired tokens
      if (body.token === 'expired-token-123') {
        return errorResponses.unauthorized('Verification token has expired')
      }

      // Accept valid tokens (like 'valid-verification-token-123')
      return HttpResponse.json(null, { status: 204 })
    } catch (error) {
      return errorResponses.internalServerError('Failed to verify email')
    }
  }
)

/**
 * POST /api/auth/resend-verification
 * Resend email verification to user
 */
export const resendVerificationHandler = http.post('**/api/auth/resend-verification',
  async ({ request }) => {
    try {
      const body = await request.json() as IdentityServiceEmailRequest

      // Validate input
      if (!body.email) {
        return errorResponses.badRequest('Email is required')
      }

      // Check if email exists in mock users
      const userExists = Object.values(MOCK_DATA_REGISTRY.users).some(user => user.email === body.email)
      if (!userExists) {
        // For security, don't reveal if email exists or not
        // Return success message anyway
        return HttpResponse.json(null, { status: 204 })
      }

      // In a real implementation, this would send a new verification email
      // For mocking, just return success
      return HttpResponse.json(null, { status: 204 })
    } catch (error) {
      return errorResponses.internalServerError('Failed to resend verification email')
    }
  }
)

// ============================================
// AUTHENTICATED ENDPOINTS
// ============================================

/**
 * GET /api/v1/users/me
 * Get current user profile (Authenticated users only)
 */
const getCurrentUserHandler = http.get('**/api/v1/users/me',
  withAuth(({ user }: { user: MockUser }) => {
    try {
      // Phase 10: Add user metadata for dashboard and performance views
      const metadata = user.role === UserRole.STUDENT 
        ? getStudentOverallPerformance(user.id)
        : undefined

      const response: IdentityServiceUserResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: mapRoleToApi(user.role as UserRoleType),
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
        // Phase 10: Metadata for enhanced profile views
        ...(metadata && {
          metadata: {
            performance: metadata
          }
        })
      }

      return HttpResponse.json(response, { status: 200 })
    } catch (error) {
      return errorResponses.internalServerError('Failed to get user profile')
    }
  })
)

/**
 * PUT /api/v1/users/me
 * Update current user profile (Authenticated users only)
 */
const updateCurrentUserHandler = http.put('**/api/v1/users/me',
  withAuth(async ({ request, user }: { request: Request, user: MockUser }) => {
    try {
      // Parse request body
      const body = await request.json() as IdentityServiceUpdateProfileRequest

      // Validate input
      if (!body.firstName && !body.lastName) {
        return errorResponses.badRequest('At least one field (firstName or lastName) must be provided')
      }
      // Update user profile
      const updatedUser = {
        ...user,
        firstName: body.firstName ?? user.firstName,
        lastName: body.lastName ?? user.lastName,
        updatedAt: new Date().toISOString(),
      }

      // Update mock data (in real app, this would be persisted)
      const userKey = `${user.role}1` as keyof typeof MOCK_DATA_REGISTRY.users
      (MOCK_DATA_REGISTRY.users as any)[userKey] = updatedUser

      const response: IdentityServiceUserResponse = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: mapRoleToApi(updatedUser.role as UserRoleType),
        isActive: updatedUser.isActive,
        isEmailVerified: updatedUser.isEmailVerified,
        createdAt: updatedUser.createdAt ? new Date(updatedUser.createdAt) : undefined,
        updatedAt: new Date(updatedUser.updatedAt),
      }

      return HttpResponse.json(response, { status: 200 })
    } catch (error) {
      return errorResponses.internalServerError('Failed to update user profile')
    }
  })
)

/**
 * POST /api/v1/users/me/change-password
 * Change current user password (Authenticated users only)
 */
export const changePasswordHandler = http.post('**/api/v1/users/me/change-password',
  withAuth(async (context: any) => {
  const { request, user } = context
    
    try {
      ensureDatabaseInitialized()
      
      
      // Parse request body
      let body: any
      try {
        const text = await request.clone().text()
        body = JSON.parse(text)
      } catch {
        // JSON parse errors should return 500, not 400
        return errorResponses.internalServerError('Failed to parse request body')
      }

      // Validate input
      if (!body.currentPassword || !body.newPassword) {
        return errorResponses.badRequest('Current password and new password are required')
      }

      if (body.newPassword.length < 8) {
        return errorResponses.badRequest('New password must be at least 8 characters long')
      }

      // Get user from database to verify current password
      const dbUser = db.user.findFirst({ where: { email: { equals: user.email } } })

      if (!dbUser) {
        return errorResponses.notFound('User not found')
      }

      // Verify current password
      if (body.currentPassword !== dbUser.password) {
        return errorResponses.badRequest('Current password is incorrect')
      }

      // Update password in database
      db.user.update({
        where: { id: { equals: dbUser.id } },
        data: { password: body.newPassword, updatedAt: Date.now() },
      })

      try { persistDatabase() } catch { /* ignore persistence errors */ }

      

      // Return success response
      return HttpResponse.json(
        { message: 'Password changed successfully' },
        { status: 200 }
      )
    } catch {
      return errorResponses.internalServerError('Failed to change password')
    }
  })
)

// ============================================
// ADMIN USER MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /api/v1/users
 * Get all users with pagination (Admin only)
 */
const getUsersHandler = http.post('**/api/v1/users',
  withAuth(({ request, user }: { request: Request, user: MockUser }) => {
    try {
      // Check if user is admin
      if (user.role !== UserRole.ADMIN) {
        return errorResponses.forbidden('Admin access required')
      }

      // Parse query parameters
      const url = new URL(request.url)
      const page = parseInt(url.searchParams.get('page') || '0', 10)
      const size = parseInt(url.searchParams.get('size') || '10', 10)

      // Get all users
      const allUsers = Object.values(MOCK_DATA_REGISTRY.users)
      const totalElements = allUsers.length
      const totalPages = Math.ceil(totalElements / size)

      // Calculate pagination
      const startIndex = page * size
      const endIndex = startIndex + size
      const content = allUsers.slice(startIndex, endIndex).map(user => ({
        ...user,
        role: mapRoleToApi(user.role),
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
      }))

      const response: IdentityServicePageResponseUserResponse = {
        content,
        pageNumber: page,
        pageSize: size,
        totalElements: totalElements as any, // Cast to any to avoid BigInt serialization issues
        totalPages,
        first: page === 0,
        last: page >= totalPages - 1,
        hasNext: page < totalPages - 1,
        hasPrevious: page > 0,
      }

      return HttpResponse.json(response, { status: 200 })
    } catch (error) {
      return errorResponses.internalServerError('Failed to fetch users')
    }
  })
)

/**
 * POST /api/v1/users
 * Create new user (Admin only)
 */
const createUserHandler = http.post('**/api/v1/users',
  withAuth(async ({ request, user }: { request: Request, user: MockUser }) => {
    try {
      // Check if user is admin
      if (user.role !== UserRole.ADMIN) {
        return errorResponses.forbidden('Admin access required')
      }

      // Parse request body
      const body = await request.json() as IdentityServiceCreateUserRequest

      // Validate required fields
      if (!body.email || !body.password || !body.firstName || !body.lastName) {
        return errorResponses.badRequest('Email, password, firstName, and lastName are required')
      }

      // Check if email already exists
      const existingUser = Object.values(MOCK_DATA_REGISTRY.users).find(user => user.email === body.email)
      if (existingUser) {
        return errorResponses.badRequest('User with this email already exists')
      }

      // Create new user
      const newUserId = crypto.randomUUID()
      const now = new Date()

      const newUser: IdentityServiceUserResponse = {
        id: newUserId,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role || 'STUDENT',
        isActive: body.isActive ?? true,
        isEmailVerified: body.isEmailVerified ?? true,
        createdAt: now,
        updatedAt: now,
      }

      // In a real app, this would be saved to database
      // For mocking, we'll just return the created user

      return HttpResponse.json(newUser, { status: 201 })
    } catch (error) {
      return errorResponses.internalServerError('Failed to create user')
    }
  })
)

/**
 * GET /api/v1/users/{userId}
 * Get user by ID (Admin only)
 */
const getUserByIdHandler = http.get<{ userId: string }>(
  '/api/v1/users/:userId',
  withAuth(({ params, user: authUser }: { params: { userId: string }, user: MockUser }) => {
    try {
      // Check if user is admin
      if (authUser.role !== UserRole.ADMIN) {
        return errorResponses.forbidden('Admin access required')
      }

      const { userId } = params

      // Find user by ID
      const user = Object.values(MOCK_DATA_REGISTRY.users).find(u => u.id === userId)

      if (!user) {
        return errorResponses.notFound('User not found')
      }

      // Map role to API format and convert dates
      const response: IdentityServiceUserResponse = {
        ...user,
        role: mapRoleToApi(user.role),
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
      }

      return HttpResponse.json(response, { status: 200 })
    } catch (error) {
      return errorResponses.internalServerError('Failed to fetch user')
    }
  })
)

/**
 * DELETE /api/v1/users/{userId}
 * Delete user (Admin only)
 */
const deleteUserHandler = http.delete<{ userId: string }>(
  '/api/v1/users/:userId',
  withAuth(({ params, user: authUser }: { params: { userId: string }, user: MockUser }) => {
    try {
      // Check if user is admin
      if (authUser.role !== UserRole.ADMIN) {
        return errorResponses.forbidden('Admin access required')
      }

      const { userId } = params

      // Find user by ID
      const user = Object.values(MOCK_DATA_REGISTRY.users).find(u => u.id === userId)

      if (!user) {
        return errorResponses.notFound('User not found')
      }

      // In a real app, this would delete from database
      // For mocking, we'll just return success

      return HttpResponse.json(
        { message: 'User deleted successfully' },
        { status: 200 }
      )
    } catch (error) {
      return errorResponses.internalServerError('Failed to delete user')
    }
  })
)

/**
 * PUT /api/v1/users/{userId}/activate
 * Activate user (Admin only)
 */
const activateUserHandler = http.put<{ userId: string }>(
  '/api/v1/users/:userId/activate',
  withAuth(({ params, user: authUser }: { params: { userId: string }, user: MockUser }) => {
    try {
      // Check if user is admin
      if (authUser.role !== UserRole.ADMIN) {
        return errorResponses.forbidden('Admin access required')
      }

      const { userId } = params

      // Find user by ID
      const user = Object.values(MOCK_DATA_REGISTRY.users).find(u => u.id === userId)

      if (!user) {
        return errorResponses.notFound('User not found')
      }

      // Map role to API format and return activated user
      const response: IdentityServiceUserResponse = {
        ...user,
        role: mapRoleToApi(user.role),
        isActive: true,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: new Date(),
      }

      return HttpResponse.json(response, { status: 200 })
    } catch (error) {
      return errorResponses.internalServerError('Failed to activate user')
    }
  })
)

/**
 * PUT /api/v1/users/{userId}/deactivate
 * Deactivate user (Admin only)
 */
const deactivateUserHandler = http.put<{ userId: string }>(
  '/api/v1/users/:userId/deactivate',
  withAuth(({ params, user: authUser }: { params: { userId: string }, user: MockUser }) => {
    try {
      // Check if user is admin
      if (authUser.role !== UserRole.ADMIN) {
        return errorResponses.forbidden('Admin access required')
      }

      const { userId } = params

      // Find user by ID
      const user = Object.values(MOCK_DATA_REGISTRY.users).find(u => u.id === userId)

      if (!user) {
        return errorResponses.notFound('User not found')
      }

      // Map role to API format and return deactivated user
      const response: IdentityServiceUserResponse = {
        ...user,
        role: mapRoleToApi(user.role),
        isActive: false,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: new Date(),
      }

      return HttpResponse.json(response, { status: 200 })
    } catch (error) {
      return errorResponses.internalServerError('Failed to deactivate user')
    }
  })
)

// Export all identity handlers
export const identityHandlers = [
  loginHandler,
  registerHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  verifyEmailHandler,
  resendVerificationHandler,
  getCurrentUserHandler,
  updateCurrentUserHandler,
  changePasswordHandler,
  getUsersHandler,
  createUserHandler,
  getUserByIdHandler,
  deleteUserHandler,
  activateUserHandler,
  deactivateUserHandler,
]


