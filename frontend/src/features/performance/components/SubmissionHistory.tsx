/**
 * Submission History Component
 * Displays optimized list of recent submissions with navigation to details
 */

import { Paper, Stack, Group, Text, Badge, ThemeIcon, Skeleton, Button } from '@mantine/core'
import { IconExternalLink } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import type { PerformanceTrendPoint } from '../types'
import { PERFORMANCE_LABELS } from '../types'
import styles from './SubmissionHistory.module.css'

interface SubmissionHistoryProps {
  submissions: PerformanceTrendPoint[]
  isLoading?: boolean
}

interface SubmissionCardProps {
  submission: PerformanceTrendPoint
  onView: (submissionId: string) => void
}

/**
 * Individual Submission Card Component
 * Displays submission details in a compact card format
 */
function SubmissionCard({ submission, onView }: SubmissionCardProps) {
  const isPassedStatus = submission.status === 'passed'
  const statusLabel = isPassedStatus ? '✅ Đạt' : '❌ Không đạt'
  const statusColor = isPassedStatus ? 'green' : 'red'

  return (
    <Paper
      p="md"
      className={styles.submissionCard}
      withBorder
      style={{
        borderLeft: `4px solid ${isPassedStatus ? '#51cf66' : '#ff6b6b'}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <Stack gap="sm">
        {/* Header: Title and Status */}
        <Group justify="space-between" align="flex-start">
          <div style={{ flex: 1 }}>
            <Text fw={600} size="sm" lineClamp={2}>
              {submission.assignmentTitle}
            </Text>
            <Text size="xs" c="dimmed" mt="4px">
              {submission.date}
            </Text>
          </div>
          <Badge color={statusColor} variant="light" size="sm">
            {statusLabel}
          </Badge>
        </Group>

        {/* Content: Score */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon
              variant="light"
              size="sm"
              radius="md"
              color={submission.score >= 70 ? 'green' : submission.score >= 50 ? 'yellow' : 'red'}
            >
              <Text fw={700} size="xs">
                {submission.score}
              </Text>
            </ThemeIcon>
            <Text size="sm" c="dimmed">
              / 100
            </Text>
          </Group>
          <Button
            variant="subtle"
            size="xs"
            rightSection={<IconExternalLink size={14} />}
            onClick={() => onView(submission.submissionId)}
          >
            Chi tiết
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}

export function SubmissionHistory({ submissions, isLoading = false }: SubmissionHistoryProps) {
  const navigate = useNavigate()

  const handleViewSubmission = (submissionId: string) => {
    navigate({
      to: '/student/submissions/$id',
      params: { id: submissionId },
    })
  }

  if (isLoading) {
    return (
      <Paper className={styles.container} p="md">
        <Stack gap="md">
          <Skeleton height={24} width="40%" radius="md" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={100} radius="md" />
          ))}
        </Stack>
      </Paper>
    )
  }

  if (!submissions.length) {
    return (
      <Paper className={styles.container} p="md">
        <Text size="sm" c="dimmed" ta="center" py="xl">
          {PERFORMANCE_LABELS.noData}
        </Text>
      </Paper>
    )
  }

  // Sort submissions by date, most recent first
  const sortedSubmissions = [...submissions].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })

  const passedCount = sortedSubmissions.filter((s) => s.status === 'passed').length
  const successRate = Math.round((passedCount / sortedSubmissions.length) * 100)

  return (
    <Paper className={styles.container} p="md">
      <Stack gap="md">
        {/* Header */}
        <div className={styles.header}>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text fw={600} size="lg">
                {PERFORMANCE_LABELS.submissionHistory}
              </Text>
              <Text size="xs" c="dimmed" mt="4px">
                {sortedSubmissions.length} bài nộp • Tỷ lệ thành công: {successRate}%
              </Text>
            </div>
          </Group>
        </div>

        {/* Summary Stats */}
        <Group justify="space-around" mt="xs" p="xs" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <div>
            <Text size="xs" c="dimmed">
              Tổng bài nộp
            </Text>
            <Text fw={700} size="lg">
              {sortedSubmissions.length}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Đạt
            </Text>
            <Text fw={700} size="lg" c="green">
              {passedCount}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Không đạt
            </Text>
            <Text fw={700} size="lg" c="red">
              {sortedSubmissions.length - passedCount}
            </Text>
          </div>
        </Group>

        {/* Submission List */}
        <Stack gap="sm">
          {sortedSubmissions.slice(0, 10).map((submission) => (
            <SubmissionCard
              key={submission.submissionId}
              submission={submission}
              onView={handleViewSubmission}
            />
          ))}
        </Stack>

        {/* Show more indicator if more than 10 submissions */}
        {sortedSubmissions.length > 10 && (
          <Text size="sm" c="dimmed" ta="center" mt="md">
            Và {sortedSubmissions.length - 10} bài nộp khác...
          </Text>
        )}
      </Stack>
    </Paper>
  )
}
