import { createFileRoute, redirect } from '@tanstack/react-router'
import { Container, Title, Text, Card, Stack } from '@mantine/core'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES, ROLE_REDIRECTS } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'

// Component dashboard cho admin
const AdminDashboard = () => {
  return (
    <Container size="lg" py="xl">
      <Stack>
        <Title order={1}>Dashboard Quản trị viên</Title>
        <Text c="dimmed">
          Quản lý hệ thống và người dùng
        </Text>

        <Card withBorder shadow="sm" p="lg">
          <Title order={3} mb="md">Thống kê hệ thống</Title>
          <Text>Đang tải dữ liệu thống kê...</Text>
        </Card>

        <Card withBorder shadow="sm" p="lg">
          <Title order={3} mb="md">Quản lý người dùng</Title>
          <Text>Quản lý tài khoản và quyền truy cập.</Text>
        </Card>
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute('/admin/dashboard')({
  beforeLoad: ({ location }) => {
    const { isAuthenticated, isLoading, user } = useAuthStore.getState()

    if (isLoading) {
      return
    }

    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }

    const hasAccess = checkRoleAccess(USER_ROLES.ADMIN)
    logRoleAccessAttempt(USER_ROLES.ADMIN, user?.role, hasAccess)

    if (!hasAccess) {
      const redirectUrl = user?.role
        ? ROLE_REDIRECTS[user.role as keyof typeof ROLE_REDIRECTS]
        : '/login'

      throw redirect({
        to: redirectUrl || '/login',
      })
    }
  },
  component: AdminDashboard,
})