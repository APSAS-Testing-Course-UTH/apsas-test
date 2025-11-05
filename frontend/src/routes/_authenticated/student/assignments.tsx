import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { Container, Stack, Title, Text } from '@mantine/core'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES, ROLE_REDIRECTS } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'

// Parent route - renders list at /student/assignments, then child routes render in detail
const AssignmentsPage = () => {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Bài tập</Title>
          <Text c="dimmed" mt="xs">
            Danh sách các bài tập của bạn
          </Text>
        </div>

        {/* Child routes (e.g., index.tsx with list, $id for detail) render here */}
        <Outlet />
      </Stack>
    </Container>
  )
}

// Protected route - chỉ STUDENT role có thể access
export const Route = createFileRoute('/_authenticated/student/assignments')({
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
  component: AssignmentsPage,
})
