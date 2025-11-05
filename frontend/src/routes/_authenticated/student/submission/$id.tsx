import { createFileRoute, redirect } from '@tanstack/react-router'
import { Container } from '@mantine/core'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES, ROLE_REDIRECTS } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'
import { CodeSubmissionPage } from '@/features/submissions/components'

/**
 * Code Submission Page Route
 * Route: /_authenticated/student/submission/:id
 * Protected: STUDENT role only
 * Displays 3-column layout for code submission with assignment details
 */
const CodeSubmissionPageRoute = () => {
  return (
    <Container size="xl" py="xl">
      <CodeSubmissionPage />
    </Container>
  )
}

// Protected route - chỉ STUDENT role có thể access
export const Route = createFileRoute('/_authenticated/student/submission/$id')({
  component: CodeSubmissionPageRoute,
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
})
