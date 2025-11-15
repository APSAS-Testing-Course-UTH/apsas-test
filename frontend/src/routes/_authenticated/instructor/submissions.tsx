import { createFileRoute, redirect, useNavigate, Outlet, useLocation } from '@tanstack/react-router'
import { Container, Stack, Title, Text, Alert } from '@mantine/core'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'
import { InstructorSubmissionsList } from '@/features/submissions'

/**
 * Instructor Submissions List Page
 * Vietnamese: Danh sách Bài nộp
 * 
 * Routing behavior:
 * - /instructor/submissions → Shows list only
 * - /instructor/submissions/{id} → Shows detail page (via Outlet, list is hidden)
 * 
 * Features:
 * - View all submissions with pagination
 * - Filter by assignment, student, status
 * - View submission detail with code
 * - Provide feedback to students
 * - Track feedback status per submission
 * 
 * Created: Week 1, Day 3-4
 * Updated: Week 2 - Added Outlet for child detail route
 */
const InstructorSubmissionsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check if we're viewing a detail page (has submission ID in path)
  const isDetailView = /\/instructor\/submissions\/[0-9a-f-]+/i.test(location.pathname)

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Child route outlet - renders detail page when accessing /instructor/submissions/{id} */}
        <Outlet />
        
        {/* Only show list when NOT viewing detail */}
        {!isDetailView && (
          <>
            {/* Header Section */}
            <div>
              <Title order={1} mb="xs">
                Quản lý Bài nộp
              </Title>
              <Text c="dimmed" mt="xs">
                Xem bài nộp, cấp điểm và cung cấp phản hồi cho sinh viên
              </Text>
            </div>

            {/* Submissions List Component */}
            <InstructorSubmissionsList
              onViewSubmission={(submissionId: string) =>
                navigate({ to: `/instructor/submissions/${submissionId}` })
              }
              onProvideFeedback={(submissionId: string) =>
                navigate({ to: `/instructor/submissions/${submissionId}` })
              }
            />
          </>
        )}
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute('/_authenticated/instructor/submissions')({
  beforeLoad: () => {
    const { user } = useAuthStore.getState()

    const hasAccess = checkRoleAccess(USER_ROLES.INSTRUCTOR)
    logRoleAccessAttempt(USER_ROLES.INSTRUCTOR, user?.role, hasAccess)

    if (!hasAccess) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: InstructorSubmissionsPage,
})
