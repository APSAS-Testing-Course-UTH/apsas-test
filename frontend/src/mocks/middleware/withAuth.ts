import { HttpResponse } from 'msw'
import { mockUsers } from '../data/users'
import { UserRole, type UserRoleType } from '../types/userRole'

// Re-export for backward compatibility
export { UserRole, type UserRoleType }

// Mock user interface
export interface MockUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRoleType
  isActive: boolean
  isEmailVerified?: boolean
  password?: string
  createdAt?: string
  updatedAt?: string
}

// Extract token from Authorization header
export const extractToken = (request: Request): string | null => {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.replace('Bearer ', '')
}

// Validate token format and extract user info
export const validateToken = (token: string): MockUser | null => {
  try {
    // Handle JWT format tokens (base64url encoded)
    if (token.includes('.') && token.split('.').length === 3) {
      // JWT format: header.payload.signature
      try {
        const payloadBase64 = token.split('.')[1]
        // Decode base64url payload
        const payloadStr = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
        const payload = JSON.parse(payloadStr)
        
        // Extract user ID and role from JWT payload
        const userId = payload.id || payload.sub
        const role = payload.role
        
        if (!userId || !role) {
          // JWT payload missing required fields, fall through to legacy formats
          throw new Error('JWT missing id or role')
        }
        if (!Object.values(UserRole).includes(role as UserRoleType)) {
          throw new Error('JWT has invalid role')
        }
        
        // Return the actual mock user from the data
        const user = Object.values(mockUsers).find((u: MockUser) => u.id === userId)
        return user || null
      } catch (jwtError) {
        // If JWT parsing fails, fall through to legacy token formats
        // This is expected for malformed JWTs or expired tokens
      }
    }

    // Handle different token formats for backward compatibility
    let role: string
    let userId: string

    if (token.includes('_')) {
      // Legacy format: role_userId (e.g., 'instructor_00000000-0000-0000-0000-000000000002')
      const parts = token.split('_')
      if (parts.length !== 2) return null
      role = parts[0]
      userId = parts[1]
    } else if (token.includes('-')) {
      // Check for simple token formats first
      if (token.endsWith('-token')) {
        // Format: role-token (e.g., 'provider-token')
        const rolePart = token.replace('-token', '')
        if (!Object.values(UserRole).includes(rolePart as UserRoleType)) return null
        role = rolePart
        // Map role to default user ID
        const roleToUserId: Record<string, string> = {
          'admin': 'admin-001',
          'instructor': 'instructor-001',
          'student': 'student-001',
          'provider': 'provider-001',
        }
        userId = roleToUserId[role] || role + '-001'
      } else if (token.match(/^[a-z]+-\d+$/)) {
        // Format: role-XXX (e.g., 'student-001', 'instructor-001')
        const parts = token.split('-')
        if (parts.length < 2) return null
        role = parts[0]
        userId = token // Use the full token as userId
      } else {
        // New format: role-userId (e.g., 'admin-admin-001')
        const firstDashIndex = token.indexOf('-')
        if (firstDashIndex === -1) return null
        role = token.substring(0, firstDashIndex)
        userId = token.substring(firstDashIndex + 1)
      }
    } else {
      return null
    }

    if (!Object.values(UserRole).includes(role as UserRoleType)) return null
    if (!userId) return null

    // For UUID-like userIds, map to our mock users
    if (userId.includes('-') && userId.length > 10) {
      // Map UUID-like IDs to our mock user IDs
      const roleToUserId: Record<string, string> = {
        'admin': 'admin-001',
        'instructor': 'instructor-001',
        'student': 'student-001',
        'provider': 'provider-001',
      }
      userId = roleToUserId[role] || userId
    }

    // Return the actual mock user from the data
    const user = Object.values(mockUsers).find((u: MockUser) => u.id === userId)
    return user || null
  } catch {
    return null
  }
}

// Check if user has required role(s)
export const hasRole = (user: MockUser, requiredRoles: UserRoleType | UserRoleType[]): boolean => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  return roles.includes(user.role)
}

// Create unauthorized response
export const unauthorizedResponse = () =>
  HttpResponse.json(
    { error: 'Unauthorized', message: 'No token provided' },
    { status: 401 }
  )

// Create forbidden response
export const forbiddenResponse = () =>
  HttpResponse.json(
    { error: 'Forbidden', message: 'Insufficient permissions' },
    { status: 403 }
  )

// Higher-order resolver that enforces Authorization header
export const withAuth = (resolver: any) => async ({ request, ...context }: any) => {
  const authHeader = request.headers.get('Authorization')

  // Check if Authorization header exists
  if (!authHeader) {
    return HttpResponse.json(
      { error: 'Unauthorized', message: 'Missing Authorization header' },
      { status: 401 }
    )
  }

  // Validate token format (Bearer <token>)
  if (!authHeader.startsWith('Bearer ')) {
    return HttpResponse.json(
      { error: 'Unauthorized', message: 'Invalid token format' },
      { status: 401 }
    )
  }

  const token = authHeader.replace('Bearer ', '')
  const user = validateToken(token)

  if (!user) {
    return HttpResponse.json(
      { error: 'Unauthorized', message: 'Invalid token' },
      { status: 401 }
    )
  }

  // Call the actual resolver with user context
  return resolver({ request, user, ...context })
}