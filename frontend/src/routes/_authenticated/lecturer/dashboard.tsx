import { createFileRoute, redirect } from '@tanstack/react-router'
import { Container, Title, Text, Card, Stack } from '@mantine/core'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES, ROLE_REDIRECTS } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'

// Component dashboard cho giảng viên
const InstructorDashboard = () => {
  return (
    <Container size="lg" py="xl">
      <Stack>
        <Title order={1}>Dashboard Giảng viên</Title>
        <Text c="dimmed">
          Quản lý khóa học và theo dõi tiến độ học sinh
        </Text>

        <Card withBorder shadow="sm" p="lg">
          <Title order={3} mb="md">Khóa học đang dạy</Title>
          <Text>Chưa có khóa học nào được giao.</Text>
        </Card>

        <Card withBorder shadow="sm" p="lg">
          <Title order={3} mb="md">Bài tập cần chấm</Title>
          <Text>Không có bài tập nào cần chấm.</Text>
        </Card>
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute('/_authenticated/lecturer/dashboard')({
  beforeLoad: () => {
    // Auth check được xử lý bởi parent layout (_authenticated.tsx)
    // Chỉ cần check role-specific access
    const { user } = useAuthStore.getState()

    const hasAccess = checkRoleAccess(USER_ROLES.INSTRUCTOR)
    logRoleAccessAttempt(USER_ROLES.INSTRUCTOR, user?.role, hasAccess)

    if (!hasAccess) {
      const redirectUrl = user?.role
        ? ROLE_REDIRECTS[user.role as keyof typeof ROLE_REDIRECTS]
        : '/login'

      throw redirect({
        to: redirectUrl || '/login',
      })
    }
  },
  component: InstructorDashboard,
})
