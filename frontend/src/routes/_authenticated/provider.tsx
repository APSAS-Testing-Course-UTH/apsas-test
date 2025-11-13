import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES, ROLE_REDIRECTS } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'

/**
 * Provider Portal Root Route
 * 
 * Tất cả các route provider con sẽ render dưới Outlet này
 * Bảo vệ bằng role-based access control (CONTENT_PROVIDER role only)
 */
export const Route = createFileRoute('/_authenticated/provider')(
  {
    beforeLoad: ({ location }) => {
      const { isAuthenticated, isLoading, user } = useAuthStore.getState()

      // Nếu đang loading, không redirect
      if (isLoading) {
        return
      }

      // Nếu chưa authenticated, redirect về login
      if (!isAuthenticated) {
        throw redirect({
          to: '/login',
          search: {
            redirect: location.href,
          },
        })
      }

      // Check role access - CONTENT_PROVIDER role required
      const hasAccess = checkRoleAccess(USER_ROLES.CONTENT_PROVIDER)
      logRoleAccessAttempt(USER_ROLES.CONTENT_PROVIDER, user?.role, hasAccess)

      // Nếu không có quyền (không phải CONTENT_PROVIDER), redirect về dashboard phù hợp với role
      if (!hasAccess) {
        const redirectPath = user?.role ? ROLE_REDIRECTS[user.role] : '/login'
        throw redirect({
          to: redirectPath as any,
        })
      }
    },
    component: () => <Outlet />,
  }
)
