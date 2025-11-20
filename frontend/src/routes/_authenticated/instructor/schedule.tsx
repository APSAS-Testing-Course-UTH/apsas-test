import { createFileRoute, redirect } from '@tanstack/react-router'
import { Container, Stack, Title, Text, Tabs, Card } from '@mantine/core'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'
import { ScheduleCalendarView, UpcomingDeadlines } from '@/features/instructor/components'
import { useUpcomingDeadlines } from '@/features/instructor/api/useDashboardStats'

/**
 * Instructor Schedule Management Page
 * Vietnamese: Lịch trình
 * 
 * Features:
 * - View all assignment deadlines in calendar
 * - View deadlines list (next 30 days)
 * - Edit deadline dates
 * - Filter and manage assignments
 * 
 * Created: Week 3, Day 1-2
 */
const InstructorSchedulePage = () => {
  // Fetch all deadlines (no limit, for calendar view)
  const { data: deadlines, isLoading, error } = useUpcomingDeadlines()

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1}>Lịch trình</Title>
          <Text c="dimmed" mt="xs">
            Quản lý lịch trình bài tập, deadline, và thời gian bắt đầu
          </Text>
        </div>

        {/* Content */}
        <Tabs defaultValue="calendar">
          <Tabs.List>
            <Tabs.Tab value="calendar" leftSection="📆">
              Lịch
            </Tabs.Tab>
            <Tabs.Tab value="list" leftSection="📋">
              Danh sách
            </Tabs.Tab>
          </Tabs.List>

          {/* Calendar Tab */}
          <Tabs.Panel value="calendar" pt="lg">
            {error && (
              <Card withBorder shadow="sm" p="lg" radius="md" bg="red.0">
                <Stack gap="xs">
                  <Text fw={500} c="red">
                    Lỗi: Không thể tải lịch trình
                  </Text>
                  <Text size="sm" c="dimmed">
                    {error instanceof Error ? error.message : 'Vui lòng thử lại sau'}
                  </Text>
                </Stack>
              </Card>
            )}
            {!error && (
              <ScheduleCalendarView deadlines={deadlines} isLoading={isLoading} />
            )}
          </Tabs.Panel>

          {/* List Tab */}
          <Tabs.Panel value="list" pt="lg">
            {error && (
              <Card withBorder shadow="sm" p="lg" radius="md" bg="red.0">
                <Stack gap="xs">
                  <Text fw={500} c="red">
                    Lỗi: Không thể tải danh sách deadline
                  </Text>
                  <Text size="sm" c="dimmed">
                    {error instanceof Error ? error.message : 'Vui lòng thử lại sau'}
                  </Text>
                </Stack>
              </Card>
            )}
            {!error && (
              <UpcomingDeadlines deadlines={deadlines} isLoading={isLoading} />
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute('/_authenticated/instructor/schedule')({
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
  component: InstructorSchedulePage,
})

