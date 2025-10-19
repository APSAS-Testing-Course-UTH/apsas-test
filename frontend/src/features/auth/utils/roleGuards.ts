/**
 * Role-based guard utilities cho TanStack Router
 * Dùng trong beforeLoad để protect routes theo role
 */

import { useAuthStore } from '../stores/useAuthStore'
import { ROLE_REDIRECTS } from '@/constants/roles'
import type { UserRole } from '@/types/auth.types'

/**
 * Check nếu user có quyền access route này
 * Nếu không, redirect về unauthorized hoặc home
 */
export const checkRoleAccess = (requiredRole: UserRole) => {
  const { user, isAuthenticated } = useAuthStore.getState()

  if (!isAuthenticated || !user) {
    return false
  }

  return user.role === requiredRole
}

/**
 * Check multiple roles - user phải có một trong các roles này
 */
export const checkRolesAccess = (requiredRoles: UserRole[]) => {
  const { user, isAuthenticated } = useAuthStore.getState()

  if (!isAuthenticated || !user) {
    return false
  }

  return requiredRoles.includes(user.role as UserRole)
}

/**
 * Get redirect URL based on user role
 */
export const getRedirectByRole = (user: ReturnType<typeof useAuthStore.getState>['user']): string => {
  if (!user?.role) {
    return '/'
  }

  return ROLE_REDIRECTS[user.role as keyof typeof ROLE_REDIRECTS] || '/'
}

/**
 * Log role access attempt (for debugging/auditing)
 */
export const logRoleAccessAttempt = (
  attemptedRole: UserRole,
  userRole: UserRole | null | undefined,
  allowed: boolean
) => {
  console.log(
    `[Role Guard] Attempted: ${attemptedRole}, User: ${userRole}, Allowed: ${allowed}`
  )
}
