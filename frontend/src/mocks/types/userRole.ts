// Mock user roles
export const UserRole = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
  PROVIDER: 'provider',
} as const

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole]
