import { Stack, Text, Group, Badge, Anchor } from '@mantine/core'
import { IconArrowRight } from '@tabler/icons-react'
import type { SubmissionServiceSubmissionResponse } from '@/api/types.gen'
import { STATUS_LABELS, STATUS_COLORS } from '@/components/constants/statusLabels'
import classes from './RecentSubmissions.module.css'

interface RecentSubmissionsProps {
  /** Danh sách bài nộp */
  data: SubmissionServiceSubmissionResponse[]
  /** Số lượng hiển thị tối đa (default: 5) */
  limit?: number
  /** Map assignment IDs to titles */
  assignmentMap?: Map<string, string>
}

// Mapping từ submission status sang STATUS_LABELS
const submissionStatusMap = {
  PENDING: STATUS_LABELS.PENDING,
  EVALUATED: STATUS_LABELS.EVALUATED,
  FAILED: STATUS_LABELS.FAILED,
} as const

const submissionColorMap = {
  PENDING: STATUS_COLORS.PENDING,
  EVALUATED: STATUS_COLORS.EVALUATED,
  FAILED: STATUS_COLORS.FAILED,
} as const

/**
 * RecentSubmissions - Widget hiển thị các bài nộp gần đây
 * 
 * @example
 * ```tsx
 * <RecentSubmissions data={submissions} limit={5} />
 * ```
 */
export function RecentSubmissions({ data, limit = 5, assignmentMap }: RecentSubmissionsProps) {
  const displayData = data.slice(0, limit)

  if (displayData.length === 0) {
    return (
      <Stack align="center" py="xl">
        <Text c="dimmed" size="sm">
          Chưa có bài nộp nào
        </Text>
      </Stack>
    )
  }

  return (
    <Stack gap="md">
      {displayData.map((submission) => (
        <div key={submission.id} className={classes.submissionItem}>
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Text fw={500} className={classes.title}>
                {assignmentMap?.get(submission.assignmentId!) || `Bài tập #${submission.assignmentId?.slice(0, 8) || 'N/A'}`}
              </Text>
              <Text size="sm" c="dimmed">
                {submission.submittedAt
                  ? new Date(submission.submittedAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Chưa nộp'}
              </Text>
            </Stack>

            <Group gap="xs">
              {submission.score !== undefined && submission.score !== null && (
                <Badge color={submission.score >= 70 ? 'green' : submission.score >= 50 ? 'yellow' : 'red'} variant="light">
                  {submission.score} điểm
                </Badge>
              )}
              <Badge
                color={submission.status ? submissionColorMap[submission.status] : 'gray'}
                variant="light"
              >
                {submission.status ? submissionStatusMap[submission.status] : 'Không rõ'}
              </Badge>
            </Group>
          </Group>
        </div>
      ))}

      <Anchor
        href="/student/submissions"
        size="sm"
        className={classes.viewAllLink}
      >
        <Group gap="xs">
          <Text>Xem tất cả bài nộp</Text>
          <IconArrowRight size={16} />
        </Group>
      </Anchor>
    </Stack>
  )
}
