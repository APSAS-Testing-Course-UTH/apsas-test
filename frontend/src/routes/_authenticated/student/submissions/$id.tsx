/**
 * Student Submission Detail Route
 * Path: /_authenticated/student/submissions/$id
 * 
 * Displays detailed evaluation results for a specific submission
 * Protected: STUDENT role only
 */

import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES, ROLE_REDIRECTS } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'
import { SubmissionDetail } from '@/features/submissions/components/SubmissionDetail'

export const Route = createFileRoute('/_authenticated/student/submissions/$id')({
  component: SubmissionDetail,
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
