import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { useAuthStore } from '../features/auth/stores/useAuthStore'
import { Loader, Center } from '@mantine/core'

// Layout route cho tất cả protected routes
// Tự động redirect về /login nếu chưa authenticated
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { isAuthenticated, isLoading } = useAuthStore.getState()

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

  // Render protected content
  return <Outlet />
}