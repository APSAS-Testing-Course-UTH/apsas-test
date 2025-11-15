/**
 * Assignments Filter Component
 * 
 * Provides frontend-only filtering for instructor assignments list
 * Features:
 * - Search by title
 * - Filter by difficulty level
 * - Filter by start date range
 * - Filter by due date range
 * - Filter by status
 * 
 * Vietnamese UI
 */

import { useState } from 'react'
import { TextInput, Select, Group, Stack, Button, Paper } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconSearch, IconFilter, IconX } from '@tabler/icons-react'
import '@mantine/dates/styles.css'

export interface AssignmentFilters {
  search: string
  difficulty: string | null
  startDateFrom: Date | null
  startDateTo: Date | null
  dueDateFrom: Date | null
  dueDateTo: Date | null
  status: string | null
}

interface AssignmentsFilterProps {
  filters: AssignmentFilters
  onFiltersChange: (filters: AssignmentFilters) => void
}

const difficultyOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'EASY', label: 'Dễ' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'HARD', label: 'Khó' },
]

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'PUBLISHED', label: 'Đã công bố' },
  { value: 'ARCHIVED', label: 'Đã lưu trữ' },
]

export function AssignmentsFilter({ filters, onFiltersChange }: AssignmentsFilterProps) {
  const handleReset = () => {
    onFiltersChange({
      search: '',
      difficulty: null,
      startDateFrom: null,
      startDateTo: null,
      dueDateFrom: null,
      dueDateTo: null,
      status: null,
    })
  }

  const hasActiveFilters = 
    filters.search ||
    filters.difficulty ||
    filters.startDateFrom ||
    filters.startDateTo ||
    filters.dueDateFrom ||
    filters.dueDateTo ||
    filters.status

  return (
    <Paper shadow="xs" p="md" radius="md" withBorder>
      <Stack gap="sm">
        {/* Row 1: Search + Main Filters */}
        <Group gap="xs" wrap="nowrap">
          {/* Search Bar - Wider */}
          <TextInput
            placeholder="Tìm kiếm theo tiêu đề..."
            leftSection={<IconSearch size={16} />}
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.currentTarget.value })}
            style={{ flex: '1 1 200px', minWidth: 150 }}
          />

          {/* Difficulty Filter */}
          <Select
            placeholder="Độ khó"
            data={difficultyOptions}
            value={filters.difficulty || ''}
            onChange={(value) => onFiltersChange({ ...filters, difficulty: value || null })}
            clearable
            style={{ flex: '0 1 120px', minWidth: 100 }}
          />

          {/* Status Filter */}
          <Select
            placeholder="Trạng thái"
            data={statusOptions}
            value={filters.status || ''}
            onChange={(value) => onFiltersChange({ ...filters, status: value || null })}
            clearable
            style={{ flex: '0 1 140px', minWidth: 120 }}
          />

          {/* Start Date From */}
          <DatePickerInput
            placeholder="Bắt đầu từ"
            value={filters.startDateFrom}
            onChange={(value) => onFiltersChange({ ...filters, startDateFrom: value })}
            clearable
            valueFormat="DD/MM/YYYY"
            style={{ flex: '0 1 140px', minWidth: 120 }}
          />

          {/* Start Date To */}
          <DatePickerInput
            placeholder="Bắt đầu đến"
            value={filters.startDateTo}
            onChange={(value) => onFiltersChange({ ...filters, startDateTo: value })}
            clearable
            valueFormat="DD/MM/YYYY"
            minDate={filters.startDateFrom || undefined}
            style={{ flex: '0 1 140px', minWidth: 120 }}
          />

          {/* Due Date From */}
          <DatePickerInput
            placeholder="Hạn từ"
            value={filters.dueDateFrom}
            onChange={(value) => onFiltersChange({ ...filters, dueDateFrom: value })}
            clearable
            valueFormat="DD/MM/YYYY"
            style={{ flex: '0 1 120px', minWidth: 100 }}
          />

          {/* Due Date To */}
          <DatePickerInput
            placeholder="Hạn đến"
            value={filters.dueDateTo}
            onChange={(value) => onFiltersChange({ ...filters, dueDateTo: value })}
            clearable
            valueFormat="DD/MM/YYYY"
            minDate={filters.dueDateFrom || undefined}
            style={{ flex: '0 1 120px', minWidth: 100 }}
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
