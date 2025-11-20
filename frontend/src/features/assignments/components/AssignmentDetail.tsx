/**
 * Assignment Detail Page Component
 * Displays full assignment information including:
 * - Title, description, metadata (difficulty, score, due date)
 * - Test cases (visible only)
 * - Related skills and learning resources
 * Uses generated API types and SDK, Vietnamese UI throughout
 */

import { useParams, useNavigate } from '@tanstack/react-router'
import type { ApiErrorResponse } from '@/configs/api-error-handler'
import { Container, Stack, Text, Button, Group, Loader, Center, Alert, Paper } from '@mantine/core'
import { IconArrowLeft, IconAlertCircle, IconRefresh } from '@tabler/icons-react'
import { useAssignmentDetailQuery } from '../api/useAssignmentDetailQuery'
import { AssignmentMetadata } from './AssignmentMetadata'
import { AssignmentTimeline } from './AssignmentTimeline'
import { TestCaseList } from './TestCaseList'
import { SkillBadges } from './SkillBadges'
import { TutorialLinks } from './TutorialLinks'
import { MarkdownContent } from '@/components/MarkdownContent'
import { 
  getErrorMessage,
  isNetworkError,
  isTimeoutError,
} from '@/features/student/utils'

const labels = {
  description: 'Mô tả bài toán',
  notFound: 'Không tìm thấy bài tập',
  error: 'Lỗi khi tải bài tập',
  back: 'Quay lại danh sách',
  submit: 'Nộp bài',
  tryAgain: 'Thử lại',
}

/**
 * AssignmentDetail Component
 * Gets assignment ID from route params `/student/assignments/$id`
 * Displays all assignment details with sub-components
 *
 * @example
 * // URL: /student/assignments/550e8400-e29b-41d4-a716-446655440000
 * <AssignmentDetail /> // Rendered by route handler
 */
export function AssignmentDetail() {
  const { id } = useParams({ from: '/_authenticated/student/assignments/$id' })
  const navigate = useNavigate()
  const { data: assignment, isLoading, error, refetch } = useAssignmentDetailQuery(id)

  // Loading state
  if (isLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Đang tải bài tập...</Text>
        </Stack>
      </Center>
    )
  }

  // Error state
  if (error) {
    const statusCode = (error as ApiErrorResponse)?.response?.status
    const isNotFound = statusCode === 404
    const isNetwork = isNetworkError(error as ApiErrorResponse)
    const isTimeout = isTimeoutError(error as ApiErrorResponse)
    const errorMessage = getErrorMessage(error)

    return (
      <Container size="lg" py="xl">
        <Stack gap="md">
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="subtle"
            onClick={() => navigate({ to: '/student/assignments' })}
          >
            Quay lại danh sách
          </Button>

          <Alert 
            icon={<IconAlertCircle />} 
            color={isNetwork || isTimeout ? 'orange' : isNotFound ? 'yellow' : 'red'} 
            title={isNetwork ? '🌐 Lỗi kết nối' : isTimeout ? '⏱️ Hết thời gian chờ' : 'Lỗi tải bài tập'}
          >
            {isNotFound ? 'Bài tập không tồn tại.' : errorMessage}
          </Alert>

          <Group>
            <Button onClick={() => refetch()} leftSection={<IconRefresh size={16} />} variant="light">
              Thử lại
            </Button>
            {isNetwork && (
              <Text size="sm" c="dimmed">
                💡 Kiểm tra kết nối mạng của bạn
              </Text>
            )}
            {isTimeout && (
              <Text size="sm" c="dimmed">
                💡 Máy chủ đang chậm, hãy thử lại sau
              </Text>
            )}
          </Group>
        </Stack>
      </Container>
    )
  }

  // Not found
  if (!assignment) {
    return (
      <Container size="lg" py="xl">
        <Stack gap="md">
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="subtle"
            onClick={() => navigate({ to: '/student/assignments' })}
          >
            {labels.back}
          </Button>

          <Alert icon={<IconAlertCircle />} color="yellow" title={labels.notFound}>
            Bài tập không tồn tại hoặc đã bị xóa.
          </Alert>
        </Stack>
      </Container>
    )
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header with back button */}
        <Group justify="space-between" wrap="wrap">
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="subtle"
            onClick={() => navigate({ to: '/student/assignments' })}
          >
            {labels.back}
          </Button>
          <Button onClick={() => navigate({ to: '/student/submission/$id', params: { id } })}>
            {labels.submit}
          </Button>
        </Group>

        {/* Title */}
        <div>
          <Text fw={700} size="xl">
            {assignment.title}
          </Text>
          <Text c="dimmed" size="sm" mt="xs">
            Mã bài tập: {assignment.id}
          </Text>
        </div>

        {/* Metadata */}
        <AssignmentMetadata assignment={assignment} />

        {/* Timeline & Scheduling */}
        <AssignmentTimeline assignment={assignment} />

        {/* Description */}
        {assignment.description && (
          <Paper withBorder p="lg" radius="md" shadow="sm">
            <Text fw={600} size="lg" mb="md">
              {labels.description}
            </Text>
            <MarkdownContent content={assignment.description} />
          </Paper>
        )}

        {/* Test Cases */}
        <TestCaseList testCases={assignment.testCases} />

        {/* Skills */}
        <SkillBadges skills={assignment.skills} />

        {/* Tutorials */}
        <TutorialLinks tutorials={assignment.tutorials} />

        {/* Languages */}
        {assignment.languages && assignment.languages.length > 0 && (
          <div>
            <Text fw={600} size="lg" mb="md">
              Ngôn ngữ hỗ trợ
            </Text>
            <Group gap="xs">
              {assignment.languages.map((lang: string) => (
                <Text key={lang} component="span" c="dimmed" size="sm">
                  {lang}
                </Text>
              ))}
            </Group>
          </div>
        )}

        {/* Action buttons */}
        <Group justify="center" mt="xl">
          <Button
            size="lg"
            onClick={() => navigate({ to: '/student/submission/$id', params: { id } })}
          >
            {labels.submit}
          </Button>
        </Group>
      </Stack>
    </Container>
  )
}
