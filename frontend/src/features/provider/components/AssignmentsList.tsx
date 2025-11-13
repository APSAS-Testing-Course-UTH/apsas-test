/**
 * AssignmentsList Component - For Content Provider
 *
 * Displays paginated list of assignments with:
 * - Assignment management (view, edit, delete, publish, archive)
 * - Status badges (DRAFT, PUBLISHED, ARCHIVED)
 * - Difficulty level indicators
 * - Created/Updated dates
 * - Vietnamese UI 100%
 * - Pagination with TanStack Query
 * - Client-side filtering (search, status, difficulty)
 * - Column sorting support
 * - Row actions (Edit, Delete, Publish)
 *
 * @see useAssignmentsQuery for data fetching
 * @see useFilteredData for client-side filtering
 * @see provider.types.ts for type definitions
 */

import { useState, useCallback } from 'react'
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
  Menu,
  Modal,
  TextInput,
  Select,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import {
  IconArrowRight,
  IconEdit,
  IconTrash,
  IconDownload,
  IconDots,
  IconSearch,
  IconX,
  IconCalendar,
} from '@tabler/icons-react'
import { useAssignmentsQuery } from '../api'
import { useDeleteAssignmentMutation, usePublishAssignmentMutation, useArchiveAssignmentMutation } from '../api'
import { useFilteredData, createAssignmentFilterFunctions } from '../hooks'
import type { Assignment } from '../types/provider.types'
import { formatDateShort } from '@/utils/dateUtils'
import styles from './AssignmentsList.module.css'

interface AssignmentsListProps {
  onSelectAssignment?: (id: string) => void
}

/**
 * Assignment status badge color mapping
 * DRAFT: gray (not published)
 * PUBLISHED: blue (live)
 * ARCHIVED: grape (archived)
 */
const getStatusBadgeColor = (status?: string) => {
  switch (status) {
    case 'DRAFT':
      return 'gray'
    case 'PUBLISHED':
      return 'blue'
    case 'ARCHIVED':
      return 'grape'
    default:
      return 'gray'
  }
}

/**
 * Assignment status label in Vietnamese
 */
const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'DRAFT':
      return 'Bản nháp'
    case 'PUBLISHED':
      return 'Đã công bố'
    case 'ARCHIVED':
      return 'Đã lưu trữ'
    default:
      return 'Không xác định'
  }
}

/**
 * Difficulty level badge color mapping
 * EASY: green
 * MEDIUM: yellow
 * HARD: red
 */
const getDifficultyColor = (level?: string) => {
  switch (level) {
    case 'EASY':
      return 'green'
    case 'MEDIUM':
      return 'yellow'
    case 'HARD':
      return 'red'
    default:
      return 'gray'
  }
}

/**
 * Difficulty level label in Vietnamese
 */
const getDifficultyLabel = (level?: string) => {
  switch (level) {
    case 'EASY':
      return 'Dễ'
    case 'MEDIUM':
      return 'Trung bình'
    case 'HARD':
      return 'Khó'
    default:
      return 'N/A'
  }
}

export function AssignmentsList({ onSelectAssignment }: AssignmentsListProps) {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null)
  const [createdAtRange, setCreatedAtRange] = useState<[string | null, string | null]>([
    null,
    null,
  ])
  const [updatedAtRange, setUpdatedAtRange] = useState<[string | null, string | null]>([
    null,
    null,
  ])
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    assignmentId?: string
    assignmentTitle?: string
  }>({ open: false })

  // Fetch assignments with pagination
  const { data, isLoading, error } = useAssignmentsQuery({
    page,
    size: pageSize,
  })

  // Mutations
  const deleteAssignment = useDeleteAssignmentMutation()
  const publishAssignment = usePublishAssignmentMutation()
  const archiveAssignment = useArchiveAssignmentMutation()

  const assignmentList = data?.content || []

  // Client-side filtering
  const filterFunctions = createAssignmentFilterFunctions()
  const filteredAssignments = useFilteredData(
    assignmentList,
    {
      searchTerm,
      status: statusFilter,
      difficulty: difficultyFilter,
      createdAtRange,
      updatedAtRange,
    },
    {
      searchFields: ['title', 'description'],
      filterFunctions,
    }
  )

  // Handle select assignment (navigate to edit form)
  const handleSelectAssignment = useCallback(
    (id: string) => {
      onSelectAssignment?.(id)
      navigate({ to: `/provider/assignments/${id}` })
    },
    [navigate, onSelectAssignment]
  )

  // Handle edit assignment
  const handleEditAssignment = useCallback(
    (id: string) => {
      navigate({ to: `/provider/assignments/${id}/edit` })
    },
    [navigate]
  )

  // Handle delete with confirmation
  const handleDeleteClick = useCallback((assignment: Assignment) => {
    setDeleteConfirm({
      open: true,
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
    })
  }, [])

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (deleteConfirm.assignmentId && deleteConfirm.assignmentTitle) {
      await deleteAssignment.mutateAsync({
        id: deleteConfirm.assignmentId,
        title: deleteConfirm.assignmentTitle,
      })
      setDeleteConfirm({ open: false })
    }
  }, [deleteConfirm.assignmentId, deleteConfirm.assignmentTitle, deleteAssignment])

  // Handle publish
  const handlePublish = useCallback(
    (id: string) => {
      publishAssignment.mutate(id)
    },
    [publishAssignment]
  )

  // Handle archive
  const handleArchive = useCallback(
    (id: string) => {
      archiveAssignment.mutate(id)
    },
    [archiveAssignment]
  )

  // Render loading state
  if (isLoading) {
    return (
      <Center className={styles.container}>
        <Stack align="center" gap="md">
          <Loader />
          <Text>Đang tải danh sách bài tập...</Text>
        </Stack>
      </Center>
    )
  }

  // Render error state
  if (error) {
    return (
      <Center className={styles.container}>
        <Stack align="center" gap="md">
          <Badge color="red">Lỗi</Badge>
          <Text>Không thể tải danh sách bài tập. Vui lòng thử lại.</Text>
          <Button onClick={() => window.location.reload()}>Tải lại trang</Button>
        </Stack>
      </Center>
    )
  }

  // Render empty state
  if (!assignmentList || assignmentList.length === 0) {
    return (
      <Center className={styles.container}>
        <Stack align="center" gap="md">
          <Text size="lg" fw={500}>
            Chưa có bài tập nào
          </Text>
          <Text c="dimmed" size="sm">
            Bắt đầu bằng cách tạo bài tập mới
          </Text>
          <Button onClick={() => navigate({ to: '/provider/assignments/create' })}>
            Tạo bài tập
          </Button>
        </Stack>
      </Center>
    )
  }

  return (
    <Stack className={styles.container} gap="md">
      {/* Header with create button */}
      <Group justify="space-between">
        <Text fw={500}>
          Tổng cộng: {filteredAssignments.length} / {data?.totalElements || 0} bài tập
        </Text>
        <Button onClick={() => navigate({ to: '/provider/assignments/create' })}>
          Tạo bài tập mới
        </Button>
      </Group>

      {/* Filters Row: Search + Status + Difficulty + Date Filters */}
      <Group grow align="flex-end">
        <TextInput
          placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
          leftSection={<IconSearch size={16} />}
          rightSection={
            searchTerm && (
              <ActionIcon
                size="xs"
                color="gray"
                radius="xl"
                variant="transparent"
                onClick={() => setSearchTerm('')}
              >
                <IconX size={16} />
              </ActionIcon>
            )
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
        />
        <Select
          label="Trạng thái"
          placeholder="Tất cả"
          data={[
            { value: 'DRAFT', label: 'Bản nháp' },
            { value: 'PUBLISHED', label: 'Đã công bố' },
            { value: 'ARCHIVED', label: 'Đã lưu trữ' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
        />
        <Select
          label="Độ khó"
          placeholder="Tất cả"
          data={[
            { value: 'EASY', label: 'Dễ' },
            { value: 'MEDIUM', label: 'Trung bình' },
            { value: 'HARD', label: 'Khó' },
          ]}
          value={difficultyFilter}
          onChange={setDifficultyFilter}
          clearable
        />
        <DatePickerInput
          type="range"
          label="Ngày tạo"
          placeholder="Chọn phạm vi ngày tạo"
          leftSection={<IconCalendar size={16} />}
          value={createdAtRange}
          onChange={setCreatedAtRange}
          clearable
          maxDate={new Date().toISOString().split('T')[0]}
        />
        <DatePickerInput
          type="range"
          label="Ngày cập nhật"
          placeholder="Chọn phạm vi ngày cập nhật"
          leftSection={<IconCalendar size={16} />}
          value={updatedAtRange}
          onChange={setUpdatedAtRange}
          clearable
          maxDate={new Date().toISOString().split('T')[0]}
        />
      </Group>

      {/* Reset all filters button */}
      {(searchTerm || statusFilter || difficultyFilter || createdAtRange[0] || createdAtRange[1] || updatedAtRange[0] || updatedAtRange[1]) && (
        <Button
          variant="subtle"
          color="red"
          size="sm"
          onClick={() => {
            setSearchTerm('')
            setStatusFilter(null)
            setDifficultyFilter(null)
            setCreatedAtRange([null, null])
            setUpdatedAtRange([null, null])
          }}
        >
          Xóa tất cả bộ lọc
        </Button>
      )}

      {/* No results message */}
      {filteredAssignments.length === 0 && (searchTerm || statusFilter || difficultyFilter || createdAtRange[0] || createdAtRange[1] || updatedAtRange[0] || updatedAtRange[1]) && (
        <Center py="xl">
          <Text c="dimmed">Không tìm thấy bài tập nào phù hợp</Text>
        </Center>
      )}

      {/* Assignments Table */}
      {filteredAssignments.length > 0 && (
        <div className={styles.tableWrapper}>
          <Table striped highlightOnHover stickyHeader layout="fixed">
            <Table.Thead>
            <Table.Tr>
              <Table.Th w="35%">Tiêu đề</Table.Th>
              <Table.Th w="12%" style={{ textAlign: 'center' }}>Độ khó</Table.Th>
              <Table.Th w="12%" style={{ textAlign: 'center' }}>Trạng thái</Table.Th>
              <Table.Th w="12%">Ngày tạo</Table.Th>
              <Table.Th w="12%">Cập nhật</Table.Th>
              <Table.Th w="17%" style={{ textAlign: 'right' }}>Hành động</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredAssignments.map((assignment) => (
              <Table.Tr
                key={assignment.id}
                className={styles.row}
                onClick={() => handleSelectAssignment(assignment.id!)}
                style={{ cursor: 'pointer' }}
              >
                <Table.Td w="35%">
                  <div className={styles.titleContent}>
                    <Text size="sm" fw={500}>
                      {assignment.title}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {assignment.description || 'Không có mô tả'}
                    </Text>
                  </div>
                </Table.Td>

                <Table.Td w="12%" style={{ textAlign: 'center' }}>
                  <Badge
                    color={getDifficultyColor(assignment.difficultyLevel)}
                    variant="light"
                  >
                    {getDifficultyLabel(assignment.difficultyLevel)}
                  </Badge>
                </Table.Td>

                <Table.Td w="12%" style={{ textAlign: 'center' }}>
                  <Badge
                    color={getStatusBadgeColor(assignment.status)}
                    variant="filled"
                  >
                    {getStatusLabel(assignment.status)}
                  </Badge>
                </Table.Td>

                <Table.Td w="12%">
                  <Text size="sm">
                    {assignment.createdAt
                      ? formatDateShort(new Date(assignment.createdAt))
                      : 'N/A'}
                  </Text>
                </Table.Td>

                <Table.Td w="12%">
                  <Text size="sm">
                    {assignment.updatedAt
                      ? formatDateShort(new Date(assignment.updatedAt))
                      : 'N/A'}
                  </Text>
                </Table.Td>

                <Table.Td w="17%" style={{ textAlign: 'right' }}>
                  <Group gap={0} justify="flex-end">
                    <Tooltip label="Xem chi tiết">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectAssignment(assignment.id!)
                        }}
                      >
                        <IconArrowRight size={18} />
                      </ActionIcon>
                    </Tooltip>

                    <Menu shadow="md" position="bottom-end">
                      <Menu.Target>
                        <ActionIcon
                          variant="light"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconDots size={18} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditAssignment(assignment.id!)
                          }}
                        >
                          Chỉnh sửa
                        </Menu.Item>

                        {assignment.status === 'DRAFT' && (
                          <Menu.Item
                            leftSection={<IconDownload size={14} />}
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePublish(assignment.id!)
                            }}
                            color="green"
                          >
                            Công bố
                          </Menu.Item>
                        )}

                        {assignment.status === 'PUBLISHED' && (
                          <>
                            <Menu.Item
                              onClick={(e) => {
                                e.stopPropagation()
                                handleArchive(assignment.id!)
                              }}
                              color="orange"
                            >
                              Lưu trữ
                            </Menu.Item>
                          </>
                        )}

                        <Menu.Divider />

                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(assignment)
                          }}
                          color="red"
                        >
                          Xóa
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
            </Table>
          </div>
        )}

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

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false })}
        title="Xác nhận xóa bài tập"
        centered
      >
        <Stack gap="md">
          <Text>
            Bạn có chắc chắn muốn xóa bài tập &quot;{deleteConfirm.assignmentTitle}&quot;?
          </Text>
          <Text size="sm" c="dimmed">
            Hành động này không thể hoàn tác.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => setDeleteConfirm({ open: false })}
            >
              Hủy
            </Button>
            <Button
              color="red"
              onClick={handleConfirmDelete}
              loading={deleteAssignment.isPending}
            >
              Xóa
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}

export default AssignmentsList
