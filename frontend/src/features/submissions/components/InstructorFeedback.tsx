import { Card, Text, Group, Avatar, Stack, Box } from '@mantine/core'
import Markdown from 'react-markdown'
import styles from './InstructorFeedback.module.css'

/**
 * InstructorFeedback Component
 * 
 * Displays instructor feedback on student submissions with:
 * - Markdown rendering for rich text feedback
 * - Instructor information (name, avatar)
 * - Timestamp display
 * - Empty state when no feedback
 * - Vietnamese UI
 * 
 * @example
 * ```tsx
 * <InstructorFeedback
 *   feedback="# Great work!\n\nYour code is **well-structured**."
 *   instructor={{ name: 'Prof. Nguyễn Văn A', avatar: '/avatar.jpg' }}
 *   createdAt={new Date()}
 * />
 * ```
 */

export interface InstructorFeedbackProps {
  /** Feedback content in Markdown format */
  feedback?: string
  /** Instructor information */
  instructor?: {
    name: string
    avatar?: string
  }
  /** Feedback creation timestamp */
  createdAt?: Date
}

const labels = {
  title: 'Phản hồi từ giáo viên',
  noFeedback: 'Chưa có phản hồi nào',
  feedbackFrom: 'Đã phản hồi vào',
}

/**
 * Format date in Vietnamese format
 * @example new Date('2025-10-29') => "29 tháng 10, 2025"
 */
function formatVietnameseDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function InstructorFeedback({
  feedback,
  instructor,
  createdAt,
}: InstructorFeedbackProps) {
  // Empty state - no feedback
  if (!feedback || feedback.trim().length === 0) {
    return (
      <Box>
        <Text c="dimmed" ta="center" py="xl">
          {labels.noFeedback}
        </Text>
      </Box>
    )
  }

  return (
    <Card
      role="article"
      withBorder
      shadow="sm"
      radius="md"
      className={styles.feedbackCard}
    >
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Text fw={600} size="lg">
            {labels.title}
          </Text>

          {/* Instructor Info */}
          {instructor && (
            <Group gap="sm">
              <Avatar
                src={instructor.avatar}
                alt={instructor.name}
                name={instructor.name}
                color="initials"
                radius="xl"
                size="md"
              />
              <Text size="sm" fw={500}>
                {instructor.name}
              </Text>
            </Group>
          )}
        </Group>

        {/* Feedback Content - Markdown */}
        <Box className={styles.markdownContent}>
          <Markdown>{feedback}</Markdown>
        </Box>

        {/* Timestamp */}
        {createdAt && (
          <Text size="sm" c="dimmed">
            {labels.feedbackFrom} {formatVietnameseDate(createdAt)}
          </Text>
        )}
      </Stack>
    </Card>
  )
}
