/**
 * Provide Feedback Modal Component
 *
 * Allows instructors to provide detailed feedback on submissions
 */

import { useState } from 'react'
import {
  Modal,
  Button,
  Textarea,
  Group,
  Stack,
  Text,
  Alert,
  Badge,
} from '@mantine/core'
import { useInstructorSubmissionDetail, useProvideFeedback } from '../api/useInstructorSubmissions'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import styles from './ProvideFeedbackModal.module.css'

interface ProvideFeedbackModalProps {
  isOpen: boolean
  submissionId?: string
  onClose: () => void
}

/**
 * Modal for providing feedback on a submission
 */
export function ProvideFeedbackModal({
  isOpen,
  submissionId,
  onClose,
}: ProvideFeedbackModalProps) {
  const [feedback, setFeedback] = useState('')
  const { data: submission } = useInstructorSubmissionDetail(submissionId)
  const { user } = useAuthStore()
  const provideFeedback = useProvideFeedback()

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      alert('Vui lòng nhập phản hồi')
      return
    }

    if (feedback.length < 10) {
      alert('Phản hồi phải có ít nhất 10 ký tự')
      return
    }

    if (feedback.length > 5000) {
      alert('Phản hồi không được vượt quá 5000 ký tự')
      return
    }

    if (!submissionId) return

    // Format new feedback with timestamp and instructor name
    const instructorName = user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : 'Giảng viên'
    const timestamp = new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    
    const newFeedbackEntry = `─────────────────────────────\n📝 Phản hồi từ ${instructorName} - ${timestamp}\n${feedback.trim()}`
    
    // Concatenate with existing feedback (new feedback on top)
    const combinedFeedback = submission?.feedback 
      ? `${newFeedbackEntry}\n\n${submission.feedback}`
      : newFeedbackEntry

    provideFeedback.mutate(
      { submissionId, feedback: combinedFeedback },
      {
        onSuccess: () => {
          setFeedback('')
          onClose()
        },
      }
    )
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Cung cấp phản hồi"
      size="lg"
    >
      <Stack gap="md">
        {submission && (
          <div className={styles.submissionInfo}>
            <Group justify="space-between">
              <Stack gap={0}>
                <Text fw={500}>Sinh viên ID: {submission.studentId}</Text>
                <Text size="sm" c="dimmed">
                  Bài nộp: {submission.id}
                </Text>
              </Stack>
              <Badge
                color={
                  submission.score && submission.score >= 70
                    ? 'green'
                    : 'orange'
                }
              >
                {submission.score || 0}%
              </Badge>
            </Group>
          </div>
        )}

        <div className={styles.feedbackContainer}>
          <Textarea
            label="Phản hồi chi tiết"
            placeholder="Viết phản hồi để giúp sinh viên cải thiện kỹ năng của mình..."
            value={feedback}
            onChange={(e) => setFeedback(e.currentTarget.value)}
            minRows={6}
            maxRows={12}
            autoFocus
            description={`${feedback.length}/5000 ký tự`}
          />
        </div>

        <Alert icon={<span>ℹ️</span>} color="blue">
          <Text size="sm">
            💡 Gợi ý: Hãy cung cấp phản hồi xây dựng giúp sinh viên hiểu rõ
            cách cải thiện code của mình.
          </Text>
        </Alert>

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose} disabled={provideFeedback.isPending}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            loading={provideFeedback.isPending}
            disabled={!feedback.trim() || feedback.length < 10}
          >
            Gửi phản hồi
          </Button>
        </Group>

        {provideFeedback.error && (
          <Alert icon={<span>❌</span>} color="red">
            Lỗi: {(provideFeedback.error as any).message || 'Không thể gửi phản hồi'}
          </Alert>
        )}
      </Stack>
    </Modal>
  )
}
