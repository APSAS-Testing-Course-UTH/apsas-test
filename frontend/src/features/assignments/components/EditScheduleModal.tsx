/**
 * Edit Schedule Modal Component
 * Allows instructors to modify assignment start date and due date
 * 
 * Features:
 * - Date pickers for start and due dates
 * - Validation: Due date must be after start date
 * - Vietnamese UI labels and messages
 * - Loading state during submission
 * - Error handling with notifications
 */

import { useState } from 'react'
import { Modal, Button, Stack, Group, Alert } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconAlertCircle } from '@tabler/icons-react'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'
import { useUpdateAssignmentSchedule } from '../api/useInstructorAssignments'
import styles from './EditScheduleModal.module.css'

interface EditScheduleModalProps {
  /**
   * Assignment to edit
   */
  assignment: ContentServiceAssignmentResponse | null
  /**
   * Whether modal is open
   */
  isOpen: boolean
  /**
   * Callback when modal closes
   */
  onClose: () => void
}

export function EditScheduleModal({
  assignment,
  isOpen,
  onClose,
}: EditScheduleModalProps) {
  // Store as strings since DatePickerInput returns strings
  const [startDateStr, setStartDateStr] = useState<string | null>(
    assignment?.startDate ? new Date(assignment.startDate).toISOString().split('T')[0] : null
  )
  const [dueDateStr, setDueDateStr] = useState<string | null>(
    assignment?.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : null
  )
  const [error, setError] = useState<string | null>(null)

  const updateScheduleMutation = useUpdateAssignmentSchedule()

  // Reset form when modal opens/closes
  const handleClose = () => {
    setStartDateStr(assignment?.startDate ? new Date(assignment.startDate).toISOString().split('T')[0] : null)
    setDueDateStr(assignment?.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : null)
    setError(null)
    onClose()
  }

  // Validate and submit
  const handleSubmit = () => {
    setError(null)

    // Validation
    if (!startDateStr) {
      setError('Vui lòng chọn ngày bắt đầu')
      return
    }

    if (!dueDateStr) {
      setError('Vui lòng chọn hạn chót')
      return
    }

    const startDate = new Date(startDateStr)
    const dueDate = new Date(dueDateStr)

    if (dueDate <= startDate) {
      setError('Hạn chót phải sau ngày bắt đầu')
      return
    }

    if (!assignment?.id) {
      setError('Lỗi: Không tìm thấy ID bài tập')
      return
    }

    // Submit
    updateScheduleMutation.mutate(
      {
        assignmentId: assignment.id,
        startDate,
        dueDate,
      },
      {
        onSuccess: () => {
          handleClose()
        },
      }
    )
  }

  if (!assignment) return null

  const isLoading = updateScheduleMutation.isPending
  const hasError = updateScheduleMutation.isError || error

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={`Chỉnh sửa lịch trình: ${assignment.title}`}
      centered
      size="md"
      className={styles.modal}
    >
      <Stack gap="md">
        {/* Error message */}
        {hasError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Lỗi"
            color="red"
            className={styles.alert}
          >
            {error || updateScheduleMutation.error?.message || 'Có lỗi xảy ra'}
          </Alert>
        )}

        {/* Start Date Picker */}
        <div>
          <label className={styles.label}>
            📅 Ngày bắt đầu
            <span className={styles.required}>*</span>
          </label>
          <DatePickerInput
            label="Chọn ngày bắt đầu"
            placeholder="Chọn ngày bắt đầu"
            value={startDateStr}
            onChange={setStartDateStr}
            disabled={isLoading}
            clearable
            className={styles.dateInput}
          />
        </div>

        {/* Due Date Picker */}
        <div>
          <label className={styles.label}>
            ⏰ Hạn chót
            <span className={styles.required}>*</span>
          </label>
          <DatePickerInput
            label="Chọn hạn chót"
            placeholder="Chọn hạn chót"
            value={dueDateStr}
            onChange={setDueDateStr}
            disabled={isLoading}
            clearable
            className={styles.dateInput}
          />
        </div>

        {/* Info message */}
        <div className={styles.info}>
          ℹ️ Hạn chót phải sau ngày bắt đầu. Sinh viên sẽ được thông báo về thay đổi này.
        </div>

        {/* Action buttons */}
        <Group justify="flex-end" gap="md">
          <Button
            variant="default"
            onClick={handleClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!startDateStr || !dueDateStr}
          >
            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
