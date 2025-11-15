import { createFileRoute, redirect, Outlet, useLocation } from '@tanstack/react-router'
import { Container, Stack, Title, Text } from '@mantine/core'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'
import { InstructorAssignmentsList } from '@/features/assignments/components/InstructorAssignmentsList'

/**
 * Instructor Assignments Management Page
 * Vietnamese: Quản lý Bài tập
 * 
 * Features:
 * - View all assignments (paginated)
 * - Edit assignment schedule (start date, due date)
 * - View submission list for each assignment
 * - Click "Xem chi tiết" to navigate to detail page at /instructor/assignments/{id}
 * 
 * Route Structure:
 * - /instructor/assignments → Shows list only
 * - /instructor/assignments/{id} → Shows detail page (via Outlet, list is hidden)
 * 
 * Created: Week 1, Day 1-3
 * Updated: Week 2, Day 4 - Fixed routing with proper child route structure
 */
const InstructorAssignmentsPage = () => {
  const location = useLocation()
  // Check if we're on a child route (has assignment ID in path)
  const isDetailView = /^\/instructor\/assignments\/[^/]+$/.test(location.pathname)

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Only show header and list on parent route, not on detail route */}
        {!isDetailView && (
          <>
            <div>
              <Title order={1}>Quản lý Bài tập</Title>
              <Text c="dimmed" mt="xs">
                Quản lý lịch trình bài tập, xem bài nộp và phản hồi cho sinh viên
              </Text>
            </div>
            
            {/* Assignments List Component */}
            <InstructorAssignmentsList />
          </>
        )}
        
        {/* Child route outlet - renders detail page when accessing /instructor/assignments/{id} */}
        <Outlet />
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute('/_authenticated/instructor/assignments')({
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
  component: InstructorAssignmentsPage,
})
