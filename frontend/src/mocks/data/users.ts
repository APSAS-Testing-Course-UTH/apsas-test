import type { MockUser } from '../middleware/withAuth'
import { UserRole } from '../types/userRole'

/**
 * Mock Users for Development & Testing
 *
 * Tài khoản test sẵn sàng để login:
 * - Admin: admin@apsas.edu.vn / Admin@123
 * - Instructor: instructor@apsas.edu.vn / Instructor@123
 * - Student: student@apsas.edu.vn / Student@123
 * - Provider: provider@apsas.edu.vn / Provider@123
 */

// Mock users for different roles
export const mockUsers: Record<string, MockUser> = {
  // Admin users
  admin1: {
    id: 'admin-001',
    email: 'admin@apsas.edu.vn',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    isActive: true,
    isEmailVerified: true,
    password: 'Admin@123',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },

  // Instructor users
  instructor1: {
    id: 'instructor-001',
    email: 'instructor@apsas.edu.vn',
    firstName: 'Bịp',
    lastName: 'Instructor',
    role: UserRole.INSTRUCTOR,
    isActive: true,
    isEmailVerified: true,
    password: 'Instructor@123',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },

  // Student users
  student1: {
    id: 'student-001',
    email: 'student@apsas.edu.vn',
    firstName: 'Huỳnh',
    lastName: 'Sang',
    role: UserRole.STUDENT,
    isActive: true,
    isEmailVerified: true,
    password: 'Student@123',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },

  // Provider users
  provider1: {
    id: 'provider-001',
    email: 'provider@apsas.edu.vn',
    firstName: 'Bob',
    lastName: 'Provider',
    role: UserRole.PROVIDER,
    isActive: true,
    isEmailVerified: true,
    password: 'Provider@123',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
}

// Mock JWT tokens for testing (proper JWT format: header.payload.signature)
// These are mock tokens - NOT real JWTs, but have correct structure for testing
export const mockTokens = {
  admin: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AYXBzYXMuZWR1LnZuIn0.mockSignatureAdmin001',
  instructor: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Imluc3RydWN0b3ItMDAxIiwicm9sZSI6Imluc3RydWN0b3IiLCJlbWFpbCI6Imluc3RydWN0b3JAYXBzYXMuZWR1LnZuIn0.mockSignatureInstructor001',
  student: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InN0dWRlbnQtMDAxIiwicm9sZSI6InN0dWRlbnQiLCJlbWFpbCI6InN0dWRlbnRAYXBzYXMuZWR1LnZuIn0.mockSignatureStudent001',
  provider: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InByb3ZpZGVyLTAwMSIsInJvbGUiOiJwcm92aWRlciIsImVtYWlsIjoicHJvdmlkZXJAYXBzYXMuZWR1LnZuIn0.mockSignatureProvider001',
} as const

// Get user by ID
export const getUserById = (id: string): MockUser | undefined => {
  return Object.values(mockUsers).find(user => user.id === id)
}

// Get users by role
export const getUsersByRole = (role: typeof UserRole[keyof typeof UserRole]): MockUser[] => {
  return Object.values(mockUsers).filter(user => user.role === role)
}

// Get all active users
export const getActiveUsers = (): MockUser[] => {
  return Object.values(mockUsers).filter(user => user.isActive)
}

// Default mock user for testing
export const defaultMockUser = mockUsers.student1