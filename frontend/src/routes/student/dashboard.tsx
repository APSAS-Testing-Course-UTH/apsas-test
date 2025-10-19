import { createFileRoute, redirect } from '@tanstack/react-router'
import { Container, Title, Text, Card, Stack } from '@mantine/core'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES, ROLE_REDIRECTS } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'

// Component dashboard cho sinh viên
const StudentDashboard = () => {
  return (
    <Container size="lg" py="xl">
      <Stack>
        <Title order={1}>Dashboard Sinh viên</Title>
        <Text c="dimmed">
          Chào mừng bạn đến với hệ thống quản lý học tập APSAS
        </Text>

        <Card withBorder shadow="sm" p="lg">
          <Title order={3} mb="md">Khóa học của tôi</Title>
          <Text>Chưa có khóa học nào. Hãy bắt đầu học tập!</Text>
        </Card>

        <Card withBorder shadow="sm" p="lg">
          <Title order={3} mb="md">Bài tập cần nộp</Title>
          <Text>Không có bài tập nào cần nộp trong thời gian tới.</Text>
        </Card>
      </Stack>
    </Container>
  )
}

// Protected route - chỉ STUDENT role có thể access
export const Route = createFileRoute('/student/dashboard')({
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

    // Check role access
    const hasAccess = checkRoleAccess(USER_ROLES.STUDENT)
    logRoleAccessAttempt(USER_ROLES.STUDENT, user?.role, hasAccess)

    // Nếu không có quyền, redirect về dashboard phù hợp với role
    if (!hasAccess) {
      const redirectUrl = user?.role
        ? ROLE_REDIRECTS[user.role as keyof typeof ROLE_REDIRECTS]
        : '/login'

      throw redirect({
        to: redirectUrl || '/login',
      })
    }
  },
  component: StudentDashboard,
})