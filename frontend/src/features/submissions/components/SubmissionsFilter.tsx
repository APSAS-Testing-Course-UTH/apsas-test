/**
 * Submissions Filter Component
 * 
 * Provides frontend-only filtering for instructor submissions list
 * Features:
 * - Search by student email
 * - Filter by submission status
 * - Filter by score range
 * - Filter by feedback status
 * 
 * Vietnamese UI
 */

import { TextInput, Select, Group, Stack, Button, Paper, NumberInput } from '@mantine/core'
import { IconSearch, IconX } from '@tabler/icons-react'

export interface SubmissionFilters {
  searchEmail: string
  status: string | null
  scoreMin: number | string
  scoreMax: number | string
  hasFeedback: string | null
}

interface SubmissionsFilterProps {
  filters: SubmissionFilters
  onFiltersChange: (filters: SubmissionFilters) => void
}

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Đang chờ' },
  { value: 'EVALUATED', label: 'Đã đánh giá' },
  { value: 'FAILED', label: 'Thất bại' },
]

const feedbackOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'yes', label: 'Có phản hồi' },
  { value: 'no', label: 'Chưa có phản hồi' },
]

export function SubmissionsFilter({ filters, onFiltersChange }: SubmissionsFilterProps) {
  const handleReset = () => {
    onFiltersChange({
      searchEmail: '',
      status: null,
      scoreMin: '',
      scoreMax: '',
      hasFeedback: null,
    })
  }

  const hasActiveFilters = 
    filters.searchEmail ||
    filters.status ||
    filters.scoreMin !== '' ||
    filters.scoreMax !== '' ||
    filters.hasFeedback

  return (
    <Paper shadow="xs" p="md" radius="md" withBorder>
      <Stack gap="sm">
        {/* Single Row: Search + All Filters */}
        <Group gap="xs" wrap="nowrap">
          {/* Search Bar - Wider */}
          <TextInput
            placeholder="Tìm kiếm theo email..."
            leftSection={<IconSearch size={16} />}
            value={filters.searchEmail}
            onChange={(e) => onFiltersChange({ ...filters, searchEmail: e.currentTarget.value })}
            style={{ flex: '1 1 200px', minWidth: 150 }}
          />

          {/* Status Filter */}
          <Select
            placeholder="Trạng thái"
            data={statusOptions}
            value={filters.status || ''}
            onChange={(value) => onFiltersChange({ ...filters, status: value || null })}
            clearable
            style={{ flex: '0 1 140px', minWidth: 110 }}
          />

          {/* Feedback Filter */}
          <Select
            placeholder="Phản hồi"
            data={feedbackOptions}
            value={filters.hasFeedback || ''}
            onChange={(value) => onFiltersChange({ ...filters, hasFeedback: value || null })}
            clearable
            style={{ flex: '0 1 140px', minWidth: 110 }}
          />

          {/* Score Min */}
          <NumberInput
            placeholder="Điểm ≥"
            min={0}
            max={100}
            value={filters.scoreMin}
            onChange={(value) => onFiltersChange({ ...filters, scoreMin: value })}
            clampBehavior="strict"
            style={{ flex: '0 1 100px', minWidth: 80 }}
          />

          {/* Score Max */}
          <NumberInput
            placeholder="Điểm ≤"
            min={0}
            max={100}
            value={filters.scoreMax}
            onChange={(value) => onFiltersChange({ ...filters, scoreMax: value })}
            clampBehavior="strict"
            style={{ flex: '0 1 100px', minWidth: 80 }}
          />

          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              variant="light"
              color="gray"
              leftSection={<IconX size={16} />}
              onClick={handleReset}
              size="sm"
              style={{ flex: '0 0 auto' }}
            >
              Xóa
            </Button>
          )}
        </Group>
      </Stack>
    </Paper>
  )
}
