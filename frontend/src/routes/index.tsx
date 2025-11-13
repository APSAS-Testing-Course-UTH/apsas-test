import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES } from '@/constants/roles'

/**
 * Root route handler for "/"
 * Redirects to appropriate page based on auth status:
 * - If authenticated: Redirect to role-based dashboard route
 * - If not authenticated: Redirect to /login
 */
export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    // Check if auth context is available
    if (!context || !context.auth) {
      // No context, redirect to login (safe default)
      throw redirect({
        to: '/login',
        search: {
          redirect: undefined,
        },
      })
    }

    const { isAuthenticated, isLoading } = context.auth

    // While loading, don't redirect (let auth complete)
    if (isLoading) {
      return
    }

    // If authenticated, redirect to appropriate dashboard based on role
    if (isAuthenticated) {
      // Get user info from Zustand store for role-based routing
      const { user } = useAuthStore.getState()

      // Route based on user role (API roles are uppercase: STUDENT, INSTRUCTOR, ADMIN, CONTENT_PROVIDER)
      if (user?.role === USER_ROLES.STUDENT) {
        throw redirect({ to: '/student/dashboard' })
      } else if (user?.role === USER_ROLES.INSTRUCTOR) {
        throw redirect({ to: '/lecturer/dashboard' })
      } else if (user?.role === USER_ROLES.ADMIN) {
        throw redirect({ to: '/admin/dashboard' })
      } else if (user?.role === USER_ROLES.CONTENT_PROVIDER) {
        throw redirect({ to: '/student/dashboard' })
      }

      // Fallback: redirect to student dashboard if role unknown
      throw redirect({ to: '/student/dashboard' })
    }

    // Not authenticated, redirect to login
    throw redirect({
      to: '/login',
      search: {
        redirect: undefined,
      },
    })
  },
  // Component that won't be rendered (always redirects in beforeLoad)
  component: () => null,
})
