/**
 * Instructor Assignments List Component
 * Displays all assignments in a table with pagination and filtering
 * Allows editing schedule and viewing submissions
 * 
 * Features:
 * - Paginated assignment list
 * - Client-side filtering (search, difficulty, dates, status)
 * - Sort by due date, title, difficulty
 * - Edit schedule button (opens modal)
 * - View submissions link
 * - Loading and error states
 * - Vietnamese UI throughout
 */

import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Table,
  Button,
  Pagination,
  Center,
  Stack,
  Loader,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Group,
} from '@mantine/core'
import { IconEdit, IconEye, IconArrowRight } from '@tabler/icons-react'
import { useInstructorAssignments, useInstructorAssignmentDetail } from '../api/useInstructorAssignments'
import { EditScheduleModal } from './EditScheduleModal'
import { AssignmentsFilter, type AssignmentFilters } from './AssignmentsFilter'
import { formatDateShort, getDeadlineStatusText } from '@/utils/dateUtils'
import styles from './InstructorAssignmentsList.module.css'

interface InstructorAssignmentsListProps {
  onSelectAssignment?: (id: string) => void
}

export function InstructorAssignmentsList({
  onSelectAssignment,
}: InstructorAssignmentsListProps) {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // Filter state
  const [filters, setFilters] = useState<AssignmentFilters>({
    search: '',
    difficulty: null,
    startDateFrom: null,
    startDateTo: null,
    dueDateFrom: null,
    dueDateTo: null,
    status: null,
  })

  // Fetch assignments list
  const { data, isLoading, error } = useInstructorAssignments(page, size)

  // Fetch selected assignment details for modal
  const { data: selectedAssignment } = useInstructorAssignmentDetail(
    selectedAssignmentId || ''
  )
  
  // Client-side filtering
  const filteredAssignments = useMemo(() => {
    const assignments = (data as any)?.content || []
    
    return assignments.filter((assignment: any) => {
      // Search filter
      if (filters.search && !assignment.title?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      
      // Difficulty filter
      if (filters.difficulty && assignment.difficultyLevel !== filters.difficulty) {
        return false
      }
      
      // Status filter
      if (filters.status && assignment.status !== filters.status) {
        return false
      }
      
      // Start date range filter
      if (filters.startDateFrom && assignment.startDate) {
        const startDate = new Date(assignment.startDate)
        const filterDate = new Date(filters.startDateFrom)
        if (startDate < filterDate) {
          return false
        }
      }
      
      if (filters.startDateTo && assignment.startDate) {
        const startDate = new Date(assignment.startDate)
        const endOfDay = new Date(filters.startDateTo)
        endOfDay.setHours(23, 59, 59, 999)
        if (startDate > endOfDay) {
          return false
        }
      }
      
      // Due date range filter
      if (filters.dueDateFrom && assignment.dueDate) {
        const dueDate = new Date(assignment.dueDate)
        const filterDate = new Date(filters.dueDateFrom)
        if (dueDate < filterDate) {
          return false
        }
      }
      
      if (filters.dueDateTo && assignment.dueDate) {
        const dueDate = new Date(assignment.dueDate)
        const endOfDay = new Date(filters.dueDateTo)
        endOfDay.setHours(23, 59, 59, 999)
        if (dueDate > endOfDay) {
          return false
        }
      }
      
      return true
    })
  }, [data, filters])

  const handleEditClick = (id: string) => {
    setSelectedAssignmentId(id)
    setIsEditModalOpen(true)
  }

  const handleViewSubmissions = (id: string) => {
    navigate({ to: `/instructor/submissions?assignmentId=${id}` })
  }

  const handleSelectAssignment = (id: string) => {
    onSelectAssignment?.(id)
    navigate({ to: `/instructor/assignments/${id}` })
  }

  const totalPages = (data as any)?.totalPages || 1

  // Get difficulty badge color
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'green'
      case 'MEDIUM':
        return 'orange'
      case 'HARD':
        return 'red'
      default:
        return 'gray'
    }
  }

  // Get status badge
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'DRAFT':
        return { label: 'Bản nháp', color: 'gray' }
      case 'PUBLISHED':
        return { label: 'Đã công bố', color: 'blue' }
      case 'ARCHIVED':
        return { label: 'Đã lưu trữ', color: 'gray' }
      default:
        return { label: status || 'Không xác định', color: 'gray' }
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <Stack className={styles.container} gap="md">
        <Center className={styles.container}>
          <Stack align="center" gap="md">
            <Loader />
            <Text c="dimmed">Đang tải danh sách bài tập...</Text>
          </Stack>
        </Center>
      </Stack>
    )
  }

  // Render error state
  if (error) {
    return (
      <Stack className={styles.container} gap="md">
        <Center className={styles.container}>
          <Stack align="center" gap="md">
            <Text c="red" fw={600}>
              ❌ Lỗi: Không thể tải danh sách bài tập
            </Text>
            <Text c="dimmed" size="sm">
              {error.message}
            </Text>
            <Button onClick={() => window.location.reload()}>
              Tải lại
            </Button>
          </Stack>
        </Center>
      </Stack>
    )
  }

  // Render empty state
  if (filteredAssignments.length === 0 && !isLoading && !error) {
    const hasFilters = filters.search || filters.difficulty || filters.status || 
                      filters.startDateFrom || filters.startDateTo ||
                      filters.dueDateFrom || filters.dueDateTo
    
    return (
      <Stack className={styles.container} gap="md">
        {/* Filter Component */}
        <AssignmentsFilter filters={filters} onFiltersChange={setFilters} />
        
        <Center className={styles.container}>
          <Stack align="center" gap="md">
            <Text c="dimmed" fw={600}>
              {hasFilters ? '🔍 Không tìm thấy bài tập phù hợp' : '📚 Chưa có bài tập nào'}
            </Text>
            <Text c="dimmed" size="sm">
              {hasFilters ? 'Thử thay đổi bộ lọc để xem kết quả khác' : 'Không tìm thấy bài tập để quản lý'}
            </Text>
          </Stack>
        </Center>
      </Stack>
    )
  }

  return (
    <Stack className={styles.container} gap="md">
      {/* Filter Component */}
      <AssignmentsFilter filters={filters} onFiltersChange={setFilters} />
      
      {/* Assignments Table */}
      <div className={styles.tableWrapper}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tiêu đề</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Độ khó</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Ngày bắt đầu</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Hạn chót</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Trạng thái</Table.Th>
              <Table.Th className={styles.actionsHeader} style={{ textAlign: 'center' }}>Hành động</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredAssignments.map((assignment: any) => {
              const statusBadge = getStatusBadge(assignment.status)
              return (
                <Table.Tr key={assignment.id}>
                  <Table.Td className={styles.titleCell}>
                    <div>
                      <Text fw={600} size="sm">
                        {assignment.title}
                      </Text>
                      <Text c="dimmed" size="xs" mt={4}>
                        {assignment.description?.substring(0, 50)}
                        {(assignment.description?.length || 0) > 50 ? '...' : ''}
                      </Text>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getDifficultyColor(assignment.difficultyLevel)} variant="light">
                      {assignment.difficultyLevel === 'EASY' && 'Dễ'}
                      {assignment.difficultyLevel === 'MEDIUM' && 'Trung bình'}
                      {assignment.difficultyLevel === 'HARD' && 'Khó'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {assignment.startDate
                      ? formatDateShort(new Date(assignment.startDate))
                      : '—'}
                  </Table.Td>
                  <Table.Td>
                    <div>
                      <Text size="sm">
                        {assignment.dueDate
                          ? formatDateShort(new Date(assignment.dueDate))
                          : '—'}
                      </Text>
                      {assignment.dueDate && (
                        <Text c="dimmed" size="xs" mt={2}>
                          {getDeadlineStatusText(new Date(assignment.dueDate), null)}
                        </Text>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={statusBadge.color} variant="light">
                      {statusBadge.label}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      {/* View Details Button */}
                      <Tooltip label="Xem chi tiết">
                        <ActionIcon
                          variant="light"
                          onClick={() => handleSelectAssignment(assignment.id || '')}
                          title="Xem chi tiết"
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>

                      {/* Edit Schedule Button */}
                      <Tooltip label="Chỉnh sửa lịch trình">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleEditClick(assignment.id || '')}
                          title="Chỉnh sửa lịch trình"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>

                      {/* View Submissions Button */}
                      <Tooltip label="Xem bài nộp">
                        <ActionIcon
                          variant="light"
                          color="green"
                          onClick={() => handleViewSubmissions(assignment.id || '')}
                          title="Xem bài nộp"
                        >
                          <IconArrowRight size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Center>
          <Pagination
            value={page + 1}
            onChange={(p) => setPage(p - 1)}
            total={totalPages}
            className={styles.pagination}
          />
        </Center>
      )}

      {/* Edit Schedule Modal */}
      <EditScheduleModal
        assignment={selectedAssignment || null}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedAssignmentId(null)
        }}
      />
    </Stack>
  )
}
