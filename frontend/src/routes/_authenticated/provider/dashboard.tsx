import { createFileRoute, redirect } from '@tanstack/react-router'
import { Container, Title, Text, Card, Stack } from '@mantine/core'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES, ROLE_REDIRECTS } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'

// Component dashboard cho nhà cung cấp nội dung
const ContentProviderDashboard = () => {
  return (
    <Container size="lg" py="xl">
      <Stack>
        <Title order={1}>Dashboard Nhà cung cấp nội dung</Title>
        <Text c="dimmed">
          Quản lý nội dung học tập và tài liệu
        </Text>

        <Card withBorder shadow="sm" p="lg">
          <Title order={3} mb="md">Nội dung đã tải lên</Title>
          <Text>Chưa có nội dung nào được tải lên.</Text>
        </Card>

        <Card withBorder shadow="sm" p="lg">
          <Title order={3} mb="md">Thống kê sử dụng</Title>
          <Text>Chưa có dữ liệu thống kê.</Text>
        </Card>
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute('/_authenticated/provider/dashboard')({
  beforeLoad: () => {
    // Auth check được xử lý bởi parent layout (_authenticated.tsx)
    // Chỉ cần check role-specific access
    const { user } = useAuthStore.getState()

    const hasAccess = checkRoleAccess(USER_ROLES.CONTENT_PROVIDER)
    logRoleAccessAttempt(USER_ROLES.CONTENT_PROVIDER, user?.role, hasAccess)

    if (!hasAccess) {
      const redirectUrl = user?.role
        ? ROLE_REDIRECTS[user.role as keyof typeof ROLE_REDIRECTS]
        : '/login'

      throw redirect({
        to: redirectUrl || '/login',
      })
    }
  },
  component: ContentProviderDashboard,
})
