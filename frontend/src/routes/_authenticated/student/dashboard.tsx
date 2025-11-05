import { createFileRoute, redirect } from '@tanstack/react-router'
import { Container, Title, Text, Card, Stack, SimpleGrid, Skeleton } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { IconBook, IconCheck, IconChartBar, IconTrendingUp } from '@tabler/icons-react'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES, ROLE_REDIRECTS } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'
import { contentServiceGetAllAssignments, submissionServiceGetAllSubmissions } from '@/api/sdk.gen'
import type { ContentServiceAssignmentResponse, SubmissionServiceSubmissionResponse } from '@/api/types.gen'
import { StatsCard, RecentSubmissions, UpcomingDeadlines, QuickActions, StudentInfoCard, CalendarWidget } from '@/features/dashboard/components'

// Component dashboard cho sinh viên
const StudentDashboard = () => {
  const { user } = useAuthStore()

  // Fetch assignments (reduced from 100 to 20 for better performance)
  const { data: assignmentsResponse, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['student', 'assignments'],
    queryFn: () => contentServiceGetAllAssignments({
      query: { page: '0', size: '20' }
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })

  // Fetch submissions (reduced from 100 to 10 for better performance)
  const { data: submissionsResponse, isLoading: submissionsLoading } = useQuery({
    queryKey: ['student', 'submissions'],
    queryFn: () => submissionServiceGetAllSubmissions({
      query: { page: '0', size: '10' }
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })

  const isLoading = assignmentsLoading || submissionsLoading

  // Extract data with type guards
  const assignments = (assignmentsResponse?.data?.content || []) as ContentServiceAssignmentResponse[]
  const submissions = (submissionsResponse?.data?.content || []) as SubmissionServiceSubmissionResponse[]

  // Create assignment map for quickly looking up assignment names
  const assignmentMap = new Map<string, string>()
  assignments.forEach(assignment => {
    assignmentMap.set(assignment.id!, assignment.title)
  })

  // Calculate stats
  const totalAssignments = assignments.length
  const submittedCount = submissions.filter(s => s.status === 'EVALUATED').length
  const scores = submissions.map(s => s.score).filter(Boolean) as number[]
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const progress = totalAssignments > 0 ? Math.round((submittedCount / totalAssignments) * 100) : 0

  // Loading skeleton UI
  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <Stack gap="xl">
          {/* Header skeleton */}
          <Skeleton height={40} width="60%" mb="md" />
          <Skeleton height={24} width="80%" />

          {/* Student info + Calendar skeleton */}
          <SimpleGrid cols={{ base: 1, md: 3 }}>
            <Stack gap="md">
              <Skeleton height={160} />
            </Stack>
            <Stack gap="md" style={{ gridColumn: 'span 2' }}>
              <Skeleton height={160} />
            </Stack>
          </SimpleGrid>

          {/* Stats cards skeleton */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
            {[1, 2, 3, 4].map((i) => (
              <Stack key={i} gap="md">
                <Skeleton height={120} />
              </Stack>
            ))}
          </SimpleGrid>

          {/* Widgets skeleton */}
          <SimpleGrid cols={{ base: 1, lg: 2 }}>
            <Stack gap="md">
              <Skeleton height={300} />
            </Stack>
            <Stack gap="md">
              <Skeleton height={300} />
            </Stack>
          </SimpleGrid>

          {/* Quick Actions skeleton */}
          <Skeleton height={150} />
        </Stack>
      </Container>
    )
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1}>Xin chào, {user?.displayName || 'Sinh viên'}! 👋</Title>
          <Text c="dimmed" size="lg" mt="xs">
            Chào mừng bạn đến với hệ thống quản lý học tập APSAS
          </Text>
        </div>

        {/* Student Info Card + Calendar */}
        <SimpleGrid cols={{ base: 1, md: 3 }}>
          <div style={{ gridColumn: 'span 1' }}>
            <StudentInfoCard />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <CalendarWidget assignments={assignments} isLoading={assignmentsLoading} />
          </div>
        </SimpleGrid>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <StatsCard
            title="Tổng bài tập"
            value={totalAssignments}
            icon={<IconBook size={24} />}
            color="blue"
          />
          <StatsCard
            title="Đã nộp"
            value={submittedCount}
            icon={<IconCheck size={24} />}
            color="green"
          />
          <StatsCard
            title="Điểm trung bình"
            value={`${avgScore}%`}
            icon={<IconChartBar size={24} />}
            color="yellow"
          />
          <StatsCard
            title="Tiến độ"
            value={`${progress}%`}
            icon={<IconTrendingUp size={24} />}
            color="teal"
          />
        </SimpleGrid>

        {/* Widgets - Recent Submissions and Upcoming Deadlines */}
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          <Card withBorder shadow="sm">
            <Card.Section inheritPadding py="md" withBorder>
              <Title order={3}>Bài nộp gần đây</Title>
            </Card.Section>
            <Card.Section inheritPadding py="md">
              <RecentSubmissions data={submissions} limit={5} assignmentMap={assignmentMap} />
            </Card.Section>
          </Card>

          <Card withBorder shadow="sm">
            <Card.Section inheritPadding py="md" withBorder>
              <Title order={3}>Hạn chót sắp tới</Title>
            </Card.Section>
            <Card.Section inheritPadding py="md">
              <UpcomingDeadlines data={assignments} limit={5} />
            </Card.Section>
          </Card>
        </SimpleGrid>

        {/* Quick Actions */}
        <Card withBorder shadow="sm">
          <Card.Section inheritPadding py="md" withBorder>
            <Title order={3}>Hành động nhanh</Title>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <QuickActions />
          </Card.Section>
        </Card>
      </Stack>
    </Container>
  )
}

// Protected route - chỉ STUDENT role có thể access
// Route này là child của _authenticated, nên tự động có StudentPortalLayout wrapper
export const Route = createFileRoute('/_authenticated/student/dashboard')({
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
