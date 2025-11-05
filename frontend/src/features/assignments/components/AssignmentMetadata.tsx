/**
 * Assignment Metadata Component
 * Displays assignment metadata: difficulty, max score, due date, status
 * Vietnamese labels throughout
 */

import { Badge, Group, Stack, Text } from '@mantine/core'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'

interface AssignmentMetadataProps {
  assignment: ContentServiceAssignmentResponse
}

/**
 * Vietnamese labels for display
 */
const labels = {
  difficulty: 'Độ khó',
  maxScore: 'Điểm tối đa',
  dueDate: 'Hạn chót',
  status: 'Trạng thái',
  createdBy: 'Người tạo',
}

const difficultyLabels: Record<string, { label: string; color: string }> = {
  EASY: { label: 'Dễ', color: 'green' },
  MEDIUM: { label: 'Trung bình', color: 'blue' },
  HARD: { label: 'Khó', color: 'red' },
}

const statusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Bản nháp', color: 'gray' },
  PUBLISHED: { label: 'Đã công bố', color: 'green' },
  ARCHIVED: { label: 'Đã lưu trữ', color: 'gray' },
}

export function AssignmentMetadata({ assignment }: AssignmentMetadataProps) {
  const difficultyConfig =
    difficultyLabels[assignment.difficultyLevel || 'MEDIUM'] || difficultyLabels.MEDIUM

  const statusConfig = statusLabels[assignment.status || 'DRAFT'] || statusLabels.DRAFT

  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Không có'
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Stack gap="md" className="assignment-metadata">
      <Group justify="space-between" wrap="wrap">
        <div>
          <Text fw={500} size="sm" c="dimmed">
            {labels.difficulty}
          </Text>
          <Badge color={difficultyConfig.color} variant="light" size="lg">
            {difficultyConfig.label}
          </Badge>
        </div>

        <div>
          <Text fw={500} size="sm" c="dimmed">
            {labels.maxScore}
          </Text>
          <Text fw={600} size="lg">
            {assignment.maxScore} điểm
          </Text>
        </div>

        <div>
          <Text fw={500} size="sm" c="dimmed">
            {labels.status}
          </Text>
          <Badge color={statusConfig.color} variant="light" size="lg">
            {statusConfig.label}
          </Badge>
        </div>
      </Group>

      <div>
        <Text fw={500} size="sm" c="dimmed">
          {labels.dueDate}
        </Text>
        <Text size="md">{formatDate(assignment.dueDate)}</Text>
      </div>
    </Stack>
  )
}
