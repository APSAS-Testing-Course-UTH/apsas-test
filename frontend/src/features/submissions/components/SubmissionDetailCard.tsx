/**
 * Submission Detail Card Component
 *
 * Displays detailed information about a submission including:
 * - Submission metadata (student ID, assignment ID, timestamps)
 * - Submission status and result
 * - Score and test results summary
 * - Feedback (if exists)
 * - Code display
 */

import { Card, Stack, Group, Badge, Text, Divider, Textarea, Alert } from '@mantine/core'
import type { SubmissionServiceSubmissionResponse } from '@/api/types.gen'
import styles from './SubmissionDetailCard.module.css'

interface SubmissionDetailCardProps {
  submission: SubmissionServiceSubmissionResponse
  isLoading?: boolean
}

const statusBadgeConfig = {
  PENDING: { color: 'blue', label: 'Chưa chấm' },
  EVALUATED: { color: 'green', label: 'Đã chấm' },
  FAILED: { color: 'red', label: 'Không đạt' },
}

const resultBadgeConfig = {
  PASSED: { color: 'green', label: '✅ Tất cả test pass' },
  FAILED: { color: 'red', label: '❌ Có test fail' },
  PARTIAL: { color: 'orange', label: '⚠️ Một số test fail' },
}

export function SubmissionDetailCard({
  submission,
}: SubmissionDetailCardProps) {
  const status = submission.status || 'PENDING'
  const result = submission.result || 'FAILED'
  const statusConfig = statusBadgeConfig[status as keyof typeof statusBadgeConfig]
  const resultConfig = resultBadgeConfig[result as keyof typeof resultBadgeConfig]

  const formatDate = (date?: Date | string) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleString('vi-VN')
  }

  const calculatePassedTests = () => {
    if (!submission.testCaseResults) return 0
    return submission.testCaseResults.filter((t) => t.passed).length
  }

  const totalTests = submission.testCaseResults?.length || 0
  const passedTests = calculatePassedTests()

  return (
    <Card className={styles.card} withBorder>
      <Stack gap="md">
        {/* Header - Status and Score */}
        <div>
          <Group justify="space-between" mb="md">
            <div>
              <Text fw={500} mb="xs">
                Thông tin Bài nộp
              </Text>
              <Group gap="xs">
                <Badge color={statusConfig.color}>{statusConfig.label}</Badge>
                {result && <Badge color={resultConfig.color}>{resultConfig.label}</Badge>}
              </Group>
            </div>
            {submission.score !== undefined && (
              <div className={styles.scoreBox}>
                <Text fw={700} size="xl" c={submission.score >= 70 ? 'green' : 'orange'}>
                  {submission.score}%
                </Text>
              </div>
            )}
          </Group>
        </div>

        <Divider />

        {/* Submission Metadata */}
        <div>
          <Text fw={500} mb="md">
            Thông tin Chi tiết
          </Text>
          <Stack gap="xs" className={styles.metadata}>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                ID Bài nộp:
              </Text>
              <Text size="sm" className={styles.code}>
                {submission.id || 'N/A'}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                ID Sinh viên:
              </Text>
              <Text size="sm">{submission.studentId || 'N/A'}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                ID Bài tập:
              </Text>
              <Text size="sm" className={styles.code}>
                {submission.assignmentId || 'N/A'}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Ngôn ngữ:
              </Text>
              <Badge size="sm" variant="light">
                {submission.language || 'N/A'}
              </Badge>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Thời gian nộp:
              </Text>
              <Text size="sm">{formatDate(submission.submittedAt)}</Text>
            </Group>
            {submission.evaluatedAt && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Thời gian chấm:
                </Text>
                <Text size="sm">{formatDate(submission.evaluatedAt)}</Text>
              </Group>
            )}
          </Stack>
        </div>

        <Divider />

        {/* Test Results Summary */}
        {totalTests > 0 && (
          <div>
            <Text fw={500} mb="md">
              Kết quả Test Case
            </Text>
            <Alert icon="ℹ️" color="blue">
              <Text size="sm">
                <strong>{passedTests}/{totalTests}</strong> test case đã pass
              </Text>
            </Alert>
          </div>
        )}

        <Divider />

        {/* Feedback Section */}
        {submission.feedback && (
          <div>
            <Text fw={500} mb="md">
              Phản hồi từ Giáo viên
            </Text>
            <Textarea
              value={submission.feedback}
              readOnly
              minRows={4}
              maxRows={8}
              placeholder="Không có phản hồi"
              className={styles.feedbackArea}
            />
          </div>
        )}

        {!submission.feedback && (
          <Alert icon="ℹ️" color="yellow">
            Bài nộp này chưa có phản hồi
          </Alert>
        )}
      </Stack>
    </Card>
  )
}
