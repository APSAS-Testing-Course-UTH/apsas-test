import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '../features/auth/stores/useAuthStore'
import { Loader, Center } from '@mantine/core'
import { StudentPortalLayout } from '@/layouts/StudentPortalLayout'

// Layout route cho tất cả protected routes
// Tự động redirect về /login nếu chưa authenticated
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    // DEFENSIVE: Check if context and auth exist (safety guard)
    if (!context || !context.auth) {
      console.warn('[_authenticated] Auth context not ready, redirecting to login')
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
    
    // Use context.auth instead of useAuthStore directly
    // This ensures consistency with TanStack Router patterns
    const { isAuthenticated, isLoading } = context.auth

    // Nếu đang loading, không redirect (để tránh flash)
    if (isLoading) {
      return
    }

    // Nếu chưa authenticated, redirect về login với return URL
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          // Lưu URL hiện tại để redirect sau khi login thành công
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { isLoading } = useAuthStore()

  // Hiển thị loading khi đang check auth
  if (isLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" />
      </Center>
    )
  }

  // Render protected content with StudentPortalLayout
  return <StudentPortalLayout />
}