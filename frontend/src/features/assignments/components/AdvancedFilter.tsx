/**
 * AdvancedFilter Component
 * Reusable filtering UI component with Vietnamese labels
 * Supports filtering by search, difficulty, and status
 */

import { TextInput, Select, Button, Group, Stack, Paper } from '@mantine/core'
import { IconSearch, IconFilterOff } from '@tabler/icons-react'
import type { AssignmentFilterState, SubmissionFilterState } from '../hooks/useAdvancedFilter'
import styles from './AdvancedFilter.module.css'

interface AdvancedFilterProps {
  filters: AssignmentFilterState | SubmissionFilterState
  onFilterChange: <K extends keyof (AssignmentFilterState | SubmissionFilterState)>(
    key: K,
    value: (AssignmentFilterState | SubmissionFilterState)[K]
  ) => void
  onClear: () => void
  isLoading?: boolean
  filterType?: 'assignments' | 'submissions'
}

/**
 * Assignment filter options
 */
const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: 'Dễ' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'HARD', label: 'Khó' },
]

const ASSIGNMENT_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'PUBLISHED', label: 'Đã xuất bản' },
  { value: 'ARCHIVED', label: 'Đã lưu trữ' },
]

const SUBMISSION_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Chưa chấm' },
  { value: 'EVALUATED', label: 'Đã chấm' },
  { value: 'FAILED', label: 'Thất bại' },
]

/**
 * AdvancedFilter - Reusable filtering component
 */
export function AdvancedFilter({
  filters,
  onFilterChange,
  onClear,
  isLoading = false,
  filterType = 'assignments',
}: AdvancedFilterProps) {
  const isAssignmentFilter = filterType === 'assignments'
  const assignmentFilters = filters as AssignmentFilterState
  const submissionFilters = filters as SubmissionFilterState

  return (
    <Paper className={styles.filterContainer} p="md" radius="md" withBorder>
      <Stack gap="md">
        {/* Filter Title */}
        <div className={styles.filterHeader}>
          <h3 className={styles.filterTitle}>Bộ lọc nâng cao</h3>
        </div>

        {/* Search Input */}
        <TextInput
          leftSection={<IconSearch size={18} />}
          placeholder="Tìm kiếm..."
          label="Tìm kiếm"
          value={
            isAssignmentFilter ? assignmentFilters.search || '' : submissionFilters.search || ''
          }
          onChange={(e) => onFilterChange('search' as any, e.currentTarget.value)}
          disabled={isLoading}
        />

        {/* Filters Grid */}
        <Group grow>
          {/* Difficulty Filter (Assignments only) */}
          {isAssignmentFilter && (
            <Select
              label="Mức độ"
              placeholder="Chọn mức độ"
              data={DIFFICULTY_OPTIONS}
              value={assignmentFilters.difficulty || null}
              onChange={(value) => onFilterChange('difficulty' as any, value)}
              disabled={isLoading}
              clearable
              searchable
            />
          )}

          {/* Status Filter */}
          <Select
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            data={isAssignmentFilter ? ASSIGNMENT_STATUS_OPTIONS : SUBMISSION_STATUS_OPTIONS}
            value={
              isAssignmentFilter ? assignmentFilters.status || null : submissionFilters.status || null
            }
            onChange={(value) => onFilterChange('status' as any, value)}
            disabled={isLoading}
            clearable
            searchable
          />
        </Group>

        {/* Action Buttons */}
        <Group justify="flex-end" gap="sm">
          <Button
            variant="light"
            leftSection={<IconFilterOff size={16} />}
            onClick={onClear}
            disabled={isLoading}
          >
            Xóa bộ lọc
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}
