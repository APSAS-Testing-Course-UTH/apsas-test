import type { MockUser } from '../middleware/withAuth'
import { UserRole } from '../middleware/withAuth'

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
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },

  // Instructor users
  instructor1: {
    id: 'instructor-001',
    email: 'instructor@apsas.edu.vn',
    firstName: 'John',
    lastName: 'Instructor',
    role: UserRole.INSTRUCTOR,
    isActive: true,
    isEmailVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },

  // Student users
  student1: {
    id: 'student-001',
    email: 'student@apsas.edu.vn',
    firstName: 'Jane',
    lastName: 'Student',
    role: UserRole.STUDENT,
    isActive: true,
    isEmailVerified: true,
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
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
}

// Mock tokens for testing (format: role-userId)
export const mockTokens = {
  admin: 'admin-admin-001',
  instructor: 'instructor-instructor-001',
  student: 'student-student-001',
  provider: 'provider-provider-001',
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