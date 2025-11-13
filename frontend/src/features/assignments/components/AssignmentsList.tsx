/**
 * AssignmentsList Component
 * Displays paginated list of assignments with search, filter, and sort
 * - Vietnamese UI throughout
 * - Filtering by difficulty, status, and due date range
 * - Search by title/description
 * - Sorting by due date, title, difficulty
 * - Responsive table design
 * - Optimized pagination with TanStack Query
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { AxiosError } from 'axios'
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
} from '@mantine/core'
import { IconArrowRight } from '@tabler/icons-react'
import { useAssignmentsFiltered, type AssignmentFilters } from '../hooks/useAssignmentsFiltered'
import { AssignmentsFilterBar } from './AssignmentsFilterBar'
import { getUrgencyLevel, getUrgencyLabel, formatDateShort, getDeadlineStatusText } from '@/utils/dateUtils'
import { mapUrgencyToBadgeColor } from '@/components/utils/badgeColorUtils'
import { 
  getErrorMessage, 
  isNetworkError, 
  isTimeoutError,
  showErrorNotification,
  showNetworkErrorNotification,
  showTimeoutNotification,
} from '@/features/student/utils'
import styles from './AssignmentsList.module.css'

interface AssignmentsListProps {
  onSelectAssignment?: (id: string) => void
}

export function AssignmentsList({ onSelectAssignment }: AssignmentsListProps) {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [filters, setFilters] = useState<AssignmentFilters>({
    difficultyLevel: null,
    status: null,
    dueDateFrom: null,
    dueDateTo: null,
  })

  // Use optimized hook with filters and pagination
  const { data, isLoading, error } = useAssignmentsFiltered({
    page,
    size,
    sort: 'dueDate,desc',
    filters,
  })

  const handleFiltersChange = (newFilters: AssignmentFilters) => {
    setFilters(newFilters)
    setPage(0) // Reset to first page when filters change
  }

  const handleSelectAssignment = (id: string) => {
    onSelectAssignment?.(id)
    navigate({ to: `/student/assignments/${id}` })
  }

  const assignmentList = data?.content || []

  // Render loading state
  if (isLoading) {
    return (
      <Stack className={styles.container} gap="md">
        <AssignmentsFilterBar filters={filters} onFiltersChange={handleFiltersChange} isLoading />
        <Center className={styles.container}>
          <Stack align="center" gap="md">
            <Loader />
            <Text>Đang tải danh sách bài tập...</Text>
          </Stack>
        </Center>
      </Stack>
    )
  }

  // Render error state
  if (error) {
    const isNetwork = isNetworkError(error as AxiosError)
    const isTimeout = isTimeoutError(error as AxiosError)
    const errorMessage = getErrorMessage(error)

    return (
      <Stack className={styles.container} gap="md">
        <AssignmentsFilterBar filters={filters} onFiltersChange={handleFiltersChange} isLoading={false} />
        <Center className={styles.container}>
          <Stack align="center" gap="md">
            <Badge color={isNetwork || isTimeout ? 'orange' : 'red'}>
              {isNetwork ? '🌐 Lỗi kết nối' : isTimeout ? '⏱️ Hết thời gian chờ' : 'Lỗi'}
            </Badge>
            <Text>{errorMessage}</Text>
            <Stack gap="xs">
              <Button 
                onClick={() => window.location.reload()}
                variant="light"
              >
                Tải lại trang
              </Button>
              {isNetwork && (
                <Text size="sm" c="dimmed">
                  💡 Gợi ý: Kiểm tra kết nối mạng của bạn
                </Text>
              )}
              {isTimeout && (
                <Text size="sm" c="dimmed">
                  💡 Gợi ý: Máy chủ đang chậm, hãy thử lại trong vài giây
                </Text>
              )}
            </Stack>
          </Stack>
        </Center>
      </Stack>
    )
  }

  // Render empty state
  if (!assignmentList || assignmentList.length === 0) {
    return (
      <Stack className={styles.container} gap="md">
        <AssignmentsFilterBar filters={filters} onFiltersChange={handleFiltersChange} isLoading={false} />
        <Center className={styles.container}>
          <Stack align="center" gap="md">
            <Text size="lg">Không tìm thấy bài tập nào</Text>
          </Stack>
        </Center>
      </Stack>
    )
  }

  return (
    <Stack className={styles.container} gap="md">
      {/* Filter Bar */}
      <AssignmentsFilterBar filters={filters} onFiltersChange={handleFiltersChange} isLoading={isLoading} />

      {/* Assignments Table */}
      <div className={styles.tableWrapper}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th className={styles.titleCol}>Tiêu đề</Table.Th>
              <Table.Th className={styles.difficultyCol}>Độ khó</Table.Th>
              <Table.Th className={styles.dueCol}>Hạn chót</Table.Th>
              <Table.Th className={styles.statusCol}>Trạng thái</Table.Th>
              <Table.Th className={styles.statusCol}>Độ ưu tiên</Table.Th>
              <Table.Th className={styles.actionCol}>Hành động</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {assignmentList.map((assignment) => (
              <Table.Tr key={assignment.id!} className={styles.row}>
                <Table.Td className={styles.titleCol}>
                  <div className={styles.titleContent}>
                    <Text size="sm" fw={500}>
                      {assignment.title}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {assignment.description?.substring(0, 60)}...
                    </Text>
                  </div>
                </Table.Td>

                <Table.Td className={styles.difficultyCol}>
                  <Badge
                    color={
                      assignment.difficultyLevel === 'EASY'
                        ? 'green'
                        : assignment.difficultyLevel === 'MEDIUM'
                          ? 'yellow'
                          : 'red'
                    }
                  >
                    {assignment.difficultyLevel === 'EASY'
                      ? 'Dễ'
                      : assignment.difficultyLevel === 'MEDIUM'
                        ? 'Trung bình'
                        : 'Khó'}
                  </Badge>
                </Table.Td>

                <Table.Td className={styles.dueCol}>
                  <div>
                    <Text size="sm">
                      {assignment.dueDate ? formatDateShort(new Date(assignment.dueDate)) : 'N/A'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {assignment.dueDate && getDeadlineStatusText(
                        assignment.startDate ? new Date(assignment.startDate) : undefined,
                        new Date(assignment.dueDate)
                      )}
                    </Text>
                  </div>
                </Table.Td>

                <Table.Td className={styles.statusCol}>
                  <Badge
                    variant="light"
                    color={
                      assignment.status === 'DRAFT'
                        ? 'gray'
                        : assignment.status === 'PUBLISHED'
                          ? 'blue'
                          : 'grape'
                    }
                  >
                    {assignment.status === 'DRAFT'
                      ? 'Bản nháp'
                      : assignment.status === 'PUBLISHED'
                        ? 'Đã công bố'
                        : 'Đã lưu trữ'}
                  </Badge>
                </Table.Td>

                <Table.Td className={styles.statusCol}>
                  {assignment.dueDate && (
                    <Badge
                      color={mapUrgencyToBadgeColor(
                        getUrgencyLevel(
                          assignment.startDate ? new Date(assignment.startDate) : undefined,
                          new Date(assignment.dueDate),
                          assignment.status
                        )
                      )}
                    >
                      {getUrgencyLabel(
                        getUrgencyLevel(
                          assignment.startDate ? new Date(assignment.startDate) : undefined,
                          new Date(assignment.dueDate),
                          assignment.status
                        )
                      )}
                    </Badge>
                  )}
                </Table.Td>

                <Table.Td className={styles.actionCol}>
                  <Tooltip label="Xem chi tiết">
                    <ActionIcon
                      onClick={() => handleSelectAssignment(assignment.id!)}
                      color="blue"
                      variant="light"
                    >
                      <IconArrowRight size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      {/* Pagination */}
      {data?.totalPages && data.totalPages > 1 && (
        <Center>
          <Pagination
            value={page + 1}
            onChange={(value) => setPage(value - 1)}
            total={data.totalPages}
            size="sm"
          />
        </Center>
      )}
    </Stack>
  )
}

export default AssignmentsList
