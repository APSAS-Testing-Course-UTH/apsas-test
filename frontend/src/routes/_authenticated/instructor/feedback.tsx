import { createFileRoute, redirect } from '@tanstack/react-router'
import { Container, Stack, Title, Text, Card, Alert } from '@mantine/core'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'
import { FeedbackOverview } from '@/features/instructor/components'
import { useFeedbackStats, useFeedbackHistory } from '@/features/instructor/api/useFeedbackStats'

/**
 * Instructor Feedback Overview Page
 * Vietnamese: Phản hồi
 * 
 * Features:
 * - View feedback statistics
 * - Track feedback provided to students
 * - View submissions pending feedback
 * - Analytics on grading progress
 * - View feedback history
 * 
 * Created: Week 3, Day 1-2
 */
const InstructorFeedbackPage = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useFeedbackStats()
  const { data: feedbackHistory, isLoading: historyLoading, error: historyError } = useFeedbackHistory()

  const isLoading = statsLoading || historyLoading
  const error = statsError || historyError

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1}>💬 Phản hồi</Title>
          <Text c="dimmed" mt="xs">
            Quản lý phản hồi, điểm số và theo dõi tiến độ chấm bài
          </Text>
        </div>

        {/* Info Alert */}
        <Alert icon="ℹ️" color="blue" title="Gợi ý">
          <Text size="sm">
            Phản hồi chi tiết giúp sinh viên cải thiện kỹ năng lập trình. 
            Hãy cung cấp phản hồi xây dựng và gợi ý cải thiện.
          </Text>
        </Alert>

        {/* Error State */}
        {error && (
          <Card withBorder shadow="sm" p="lg" radius="md" bg="red.0">
            <Stack gap="xs">
              <Text fw={500} c="red">
                Lỗi: Không thể tải dữ liệu phản hồi
              </Text>
              <Text size="sm" c="dimmed">
                Vui lòng thử lại sau hoặc liên hệ hỗ trợ.
              </Text>
            </Stack>
          </Card>
        )}

        {/* Feedback Overview Component */}
        {!error && (
          <FeedbackOverview
            stats={stats}
            feedbackHistory={feedbackHistory}
            isLoading={isLoading}
          />
        )}
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute('/_authenticated/instructor/feedback')({
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
  component: InstructorFeedbackPage,
})

