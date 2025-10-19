import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '../features/auth/stores/useAuthStore'
import { ROLE_REDIRECTS } from '../constants/roles'

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const { isAuthenticated, user, isLoading } = useAuthStore.getState()

    // Nếu đang loading, không redirect
    if (isLoading) {
      return
    }

    // Nếu đã authenticated, redirect về dashboard theo role
    if (isAuthenticated && user?.role) {
      const dashboardUrl = ROLE_REDIRECTS[user.role as keyof typeof ROLE_REDIRECTS] || '/login'
      throw redirect({
        to: dashboardUrl,
        replace: true,
      })
    }

    // Nếu chưa authenticated, redirect về login
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: undefined },
        replace: true,
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  // Component này sẽ không bao giờ được render vì beforeLoad luôn redirect
  return null
}
