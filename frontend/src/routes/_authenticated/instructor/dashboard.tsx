import { createFileRoute, redirect } from '@tanstack/react-router'
import { Container, Title, Text, Card, Stack, Grid } from '@mantine/core'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'
import { DashboardStatsCards, RecentSubmissions, UpcomingDeadlines } from '@/features/instructor/components'
import { useDashboardStats, useRecentSubmissions, useUpcomingDeadlines } from '@/features/instructor/api/useDashboardStats'

/**
 * Instructor Dashboard Component
 * Vietnamese: Bảng điều khiển Giảng viên
 * 
 * Main entry point for instructor portal showing:
 * - Recent submissions to evaluate
 * - Upcoming assignment deadlines
 * - Class statistics
 * - Quick actions
 * 
 * Created: Week 1, Day 1
 * Enhanced: Week 2, Day 2 - Added real data and components
 */
const InstructorDashboard = () => {
  const { user } = useAuthStore()
  
  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats()
  
  // Fetch recent submissions (limit to 5)
  const { data: recentSubmissions, isLoading: submissionsLoading, error: submissionsError } = useRecentSubmissions(5)
  
  // Fetch upcoming deadlines (next 7 days, limit to 5)
  const { data: deadlines, isLoading: deadlinesLoading, error: deadlinesError } = useUpcomingDeadlines(7, 5)

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Title order={1}>Bảng điều khiển Giảng viên</Title>
          <Text c="dimmed" size="sm" mt="xs">
            Chào mừng, {user?.firstName} {user?.lastName}. Quản lý khóa học và bài nộp của sinh viên.
          </Text>
        </div>

        {/* Stats Cards Section */}
        {statsError ? (
          <Card withBorder shadow="sm" p="lg" radius="md" bg="red.0">
            <Stack gap="xs">
              <Text size="sm" fw={500} c="red">
                Không thể tải thống kê. Vui lòng thử lại.
              </Text>
            </Stack>
          </Card>
        ) : (
          <DashboardStatsCards stats={stats} isLoading={statsLoading} />
        )}

        {/* Main Content Areas - Each component in its own row */}
        <Grid gutter="lg">
          <Grid.Col span={12}>
            {submissionsError ? (
              <Card withBorder shadow="sm" p="lg" radius="md" bg="red.0" h="100%" style={{ minHeight: '500px' }}>
                <Stack gap="md">
                  <Title order={3}>Bài nộp gần đây cần chấm</Title>
                  <Text c="red" size="sm">
                    Không thể tải bài nộp. Vui lòng thử lại.
                  </Text>
                </Stack>
              </Card>
            ) : (
              <RecentSubmissions submissions={recentSubmissions || []} isLoading={submissionsLoading} />
            )}
          </Grid.Col>

          <Grid.Col span={12}>
            {deadlinesError ? (
              <Card withBorder shadow="sm" p="lg" radius="md" bg="red.0" h="100%" style={{ minHeight: '500px' }}>
                <Stack gap="md">
                  <Title order={3}>Lịch trình gần đây (1 tháng)</Title>
                  <Text c="red" size="sm">
                    Không thể tải deadline. Vui lòng thử lại.
                  </Text>
                </Stack>
              </Card>
            ) : (
              <UpcomingDeadlines deadlines={deadlines || []} isLoading={deadlinesLoading} />
            )}
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute('/_authenticated/instructor/dashboard')({
  beforeLoad: () => {
    // Auth check được xử lý bởi parent layout (_authenticated.tsx)
    // Chỉ cần check role-specific access
    const { user } = useAuthStore.getState()

    const hasAccess = checkRoleAccess(USER_ROLES.INSTRUCTOR)
    logRoleAccessAttempt(USER_ROLES.INSTRUCTOR, user?.role, hasAccess)

    if (!hasAccess) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: InstructorDashboard,
})
