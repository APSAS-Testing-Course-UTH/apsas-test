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
        throw redirect({ to: '/instructor/dashboard' })
      } else if (user?.role === USER_ROLES.ADMIN) {
        // Admin portal is server-side (MVC), not React SPA
        // Redirect to login with message that admin should use separate admin portal
        throw redirect({ 
          to: '/login',
          search: {
            redirect: undefined,
            message: 'Admin users should access the Admin Portal directly',
          },
        })
      } else if (user?.role === USER_ROLES.CONTENT_PROVIDER) {
        throw redirect({ to: '/provider/dashboard' })
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
