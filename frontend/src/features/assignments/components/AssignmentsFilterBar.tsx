/**
 * AssignmentsFilterBar Component
 * Provides UI for filtering assignments by difficulty, status, and due date
 * - Vietnamese labels and placeholders
 * - Responsive grid layout
 * - Integrated with Mantine UI components
 */

import { useState, useCallback } from 'react'
import { Grid, Select, Button, Group, Stack } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconX } from '@tabler/icons-react'
import type { AssignmentFilters } from '../hooks/useAssignmentsFiltered'
import styles from './AssignmentsFilterBar.module.css'

interface AssignmentsFilterBarProps {
  filters: AssignmentFilters
  onFiltersChange: (filters: AssignmentFilters) => void
  isLoading?: boolean
}

export function AssignmentsFilterBar({
  filters,
  onFiltersChange,
  isLoading = false,
}: AssignmentsFilterBarProps) {
  // Mantine 8.x DatePickerInput uses string format (YYYY-MM-DD) for values
  const [dueDateFrom, setDueDateFrom] = useState<string | null>(null)
  const [dueDateTo, setDueDateTo] = useState<string | null>(null)

  const handleDifficultyChange = useCallback(
    (value: string | null) => {
      onFiltersChange({
        ...filters,
        difficultyLevel: (value as any) || null,
      })
    },
    [filters, onFiltersChange]
  )

  const handleStatusChange = useCallback(
    (value: string | null) => {
      onFiltersChange({
        ...filters,
        status: (value as any) || null,
      })
    },
    [filters, onFiltersChange]
  )

  const handleApplyDateFilter = useCallback(() => {
    onFiltersChange({
      ...filters,
      dueDateFrom: dueDateFrom ? new Date(dueDateFrom) : null,
      dueDateTo: dueDateTo ? new Date(dueDateTo) : null,
    })
  }, [dueDateFrom, dueDateTo, filters, onFiltersChange])

  const handleClearFilters = useCallback(() => {
    onFiltersChange({
      difficultyLevel: null,
      status: null,
      dueDateFrom: null,
      dueDateTo: null,
    })
    setDueDateFrom(null)
    setDueDateTo(null)
  }, [onFiltersChange])

  const hasActiveFilters =
    filters.difficultyLevel ||
    filters.status ||
    filters.dueDateFrom ||
    filters.dueDateTo

return (
  <Stack className={styles.filterBar} gap="md">
    <Grid gutter="md" align="flex-end">
      {/* Difficulty */}
      <Grid.Col span={{ base: 12, sm: 6, md: 6, lg: 3 }}>
        <Select
          label="Độ khó"
          placeholder="Chọn độ khó..."
          searchable
          clearable
          disabled={isLoading}
          value={filters.difficultyLevel || null}
          onChange={handleDifficultyChange}
          data={[
            { value: 'EASY', label: 'Dễ' },
            { value: 'MEDIUM', label: 'Trung bình' },
            { value: 'HARD', label: 'Khó' },
          ]}
        />
      </Grid.Col>

      {/* Status */}
      <Grid.Col span={{ base: 12, sm: 6, md: 6, lg: 3 }}>
        <Select
          label="Trạng thái"
          placeholder="Chọn trạng thái..."
          searchable
          clearable
          disabled={isLoading}
          value={filters.status || null}
          onChange={handleStatusChange}
          data={[
            { value: 'DRAFT', label: 'Bản nháp' },
            { value: 'PUBLISHED', label: 'Đã công bố' },
            { value: 'ARCHIVED', label: 'Đã lưu trữ' },
          ]}
        />
      </Grid.Col>

      {/* From date */}
      <Grid.Col span={{ base: 12, sm: 6, md: 6, lg: 2 }}>
        <DatePickerInput
          label="Từ ngày"
          placeholder="Chọn từ ngày..."
          value={dueDateFrom ? new Date(dueDateFrom) : null}
          onChange={(date) => {
            if (date) {
              const dateStr =
                (date as any).toISOString?.().split('T')[0] || (date as string)
              setDueDateFrom(dateStr)
            } else {
              setDueDateFrom(null)
            }
          }}
          disabled={isLoading}
          clearable
        />
      </Grid.Col>

      {/* To date */}
      <Grid.Col span={{ base: 12, sm: 6, md: 6, lg: 2 }}>
        <DatePickerInput
          label="Đến ngày"
          placeholder="Chọn đến ngày..."
          value={dueDateTo ? new Date(dueDateTo) : null}
          onChange={(date) => {
            if (date) {
              const dateStr =
                (date as any).toISOString?.().split('T')[0] || (date as string)
              setDueDateTo(dateStr)
            } else {
              setDueDateTo(null)
            }
          }}
          disabled={isLoading}
          clearable
        />
      </Grid.Col>

      {/* Actions */}
      <Grid.Col span={{ base: 12, sm: 12, md: 12, lg: 2 }}>
        <Group justify="flex-end" gap="xs" wrap="nowrap">
          <Button
            size="sm"
            variant="default"
            onClick={handleApplyDateFilter}
            disabled={!dueDateFrom && !dueDateTo}
            loading={isLoading}
            // Ở mobile, cho fullWidth để không bị bó chặt
            fullWidth
          >
            Áp dụng
          </Button>

          {hasActiveFilters && (
            <Button
              size="sm"
              variant="subtle"
              leftSection={<IconX size={16} />}
              onClick={handleClearFilters}
              disabled={isLoading}
              fullWidth
            >
              Xóa bộ lọc
            </Button>
          )}
        </Group>
      </Grid.Col>
    </Grid>
  </Stack>
)


}

export default AssignmentsFilterBar
