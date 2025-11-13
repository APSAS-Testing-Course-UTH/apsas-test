/**
 * TutorialManager Component - For Content Provider
 *
 * Displays paginated list of tutorials with:
 * - Tutorial management (view, edit, delete)
 * - Tags display
 * - Created/Updated dates
 * - Vietnamese UI 100%
 * - Pagination with TanStack Query
 * - Client-side search filtering (title, tags)
 * - Row actions (Edit, Delete)
 *
 * @see useTutorialsQuery for data fetching
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
  ActionIcon,
  Tooltip,
  Group,
  Menu,
  Modal,
  Badge,
  TextInput,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import {
  IconArrowRight,
  IconEdit,
  IconTrash,
  IconDots,
  IconSearch,
  IconX,
  IconCalendar,
} from '@tabler/icons-react'
import { useTutorialsQuery, useDeleteTutorialMutation } from '../api'
import { useFilteredData, createTutorialFilterFunctions } from '../hooks'
import type { ContentServiceTutorialResponse } from '@/api/types.gen'
import { formatDateShort } from '@/utils/dateUtils'
import styles from './TutorialManager.module.css'

interface TutorialManagerProps {
  onSelectTutorial?: (id: string) => void
}

export function TutorialManager({ onSelectTutorial }: TutorialManagerProps) {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
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
    tutorialId?: string
    tutorialTitle?: string
  }>({ open: false })

  // Fetch tutorials with pagination
  const { data, isLoading, error } = useTutorialsQuery({
    page,
    size: pageSize,
  })

  // Mutations
  const deleteTutorial = useDeleteTutorialMutation()

  const tutorialList = data?.content || []

  // Client-side filtering by search term and date ranges
  const filteredTutorials = useFilteredData(
    tutorialList,
    { searchTerm, createdAtRange, updatedAtRange },
    {
      searchFields: ['title', 'tags'],
      filterFunctions: createTutorialFilterFunctions(),
    }
  )

  // Handle select tutorial (navigate to detail)
  const handleSelectTutorial = useCallback(
    (id: string) => {
      onSelectTutorial?.(id)
      navigate({ to: `/provider/tutorials/${id}` })
    },
    [navigate, onSelectTutorial]
  )

  // Handle edit tutorial
  const handleEditTutorial = useCallback(
    (id: string) => {
      navigate({ to: `/provider/tutorials/${id}/edit` })
    },
    [navigate]
  )

  // Handle delete with confirmation
  const handleDeleteClick = useCallback((tutorial: ContentServiceTutorialResponse) => {
    setDeleteConfirm({
      open: true,
      tutorialId: tutorial.id,
      tutorialTitle: tutorial.title,
    })
  }, [])

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (deleteConfirm.tutorialId && deleteConfirm.tutorialTitle) {
      await deleteTutorial.mutateAsync({
        id: deleteConfirm.tutorialId,
        title: deleteConfirm.tutorialTitle,
      })
      setDeleteConfirm({ open: false })
    }
  }, [deleteConfirm.tutorialId, deleteConfirm.tutorialTitle, deleteTutorial])

  // Render loading state
  if (isLoading) {
    return (
      <Center className={styles.container}>
        <Stack align="center" gap="md">
          <Loader />
          <Text>Đang tải danh sách hướng dẫn...</Text>
        </Stack>
      </Center>
    )
  }

  // Render error state
  if (error) {
    return (
      <Center className={styles.container}>
        <Stack align="center" gap="md">
          <Text c="red">Lỗi</Text>
          <Text>Không thể tải danh sách hướng dẫn. Vui lòng thử lại.</Text>
          <Button onClick={() => window.location.reload()}>Tải lại trang</Button>
        </Stack>
      </Center>
    )
  }

  // Render empty state
  if (!tutorialList || tutorialList.length === 0) {
    return (
      <Center className={styles.container}>
        <Stack align="center" gap="md">
          <Text size="lg" fw={500}>
            Chưa có hướng dẫn nào
          </Text>
          <Text c="dimmed" size="sm">
            Bắt đầu bằng cách tạo hướng dẫn mới
          </Text>
          <Button onClick={() => navigate({ to: '/provider/tutorials/create' })}>
            Tạo hướng dẫn mới
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
          Tổng cộng: {filteredTutorials.length} / {data?.totalElements || 0} hướng dẫn
        </Text>
        <Button onClick={() => navigate({ to: '/provider/tutorials/create' })}>
          Tạo hướng dẫn mới
        </Button>
      </Group>

      {/* Filters Row: Search + Date Filters */}
      <Group grow align="flex-end">
        <TextInput
          placeholder="Tìm kiếm theo tiêu đề hoặc thẻ..."
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
      {(searchTerm || createdAtRange[0] || createdAtRange[1] || updatedAtRange[0] || updatedAtRange[1]) && (
        <Button
          variant="subtle"
          color="red"
          size="sm"
          onClick={() => {
            setSearchTerm('')
            setCreatedAtRange([null, null])
            setUpdatedAtRange([null, null])
          }}
        >
          Xóa tất cả bộ lọc
        </Button>
      )}

      {/* No results message */}
      {filteredTutorials.length === 0 && (searchTerm || createdAtRange[0] || createdAtRange[1] || updatedAtRange[0] || updatedAtRange[1]) && (
        <Center py="xl">
          <Text c="dimmed">Không tìm thấy hướng dẫn nào phù hợp với bộ lọc</Text>
        </Center>
      )}

      {/* Tutorials Table */}
      {filteredTutorials.length > 0 && (
        <div className={styles.tableWrapper}>
          <Table striped highlightOnHover stickyHeader layout="fixed">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w="31%">Tiêu đề</Table.Th>
                <Table.Th w="31%">Thẻ</Table.Th>
                <Table.Th w="12%" style={{ textAlign: 'center' }}>Ngày tạo</Table.Th>
                <Table.Th w="12%" style={{ textAlign: 'center' }}>Cập nhật</Table.Th>
                <Table.Th w="14%" style={{ textAlign: 'right' }}>Hành động</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredTutorials.map((tutorial) => (
                <Table.Tr
                  key={tutorial.id}
                  className={styles.row}
                  onClick={() => handleSelectTutorial(tutorial.id!)}
                  style={{ cursor: 'pointer' }}
                >
                  <Table.Td w="31%">
                    <Text size="sm" fw={500}>
                      {tutorial.title}
                    </Text>
                  </Table.Td>

                <Table.Td w="31%">
                  {Array.isArray(tutorial.tags) && tutorial.tags.length > 0 ? (
                    <Group gap={4}>
                      {tutorial.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} size="sm" variant="light">
                          {tag}
                        </Badge>
                      ))}
                      {tutorial.tags.length > 3 && (
                        <Badge size="sm" variant="light">
                          +{tutorial.tags.length - 3}
                        </Badge>
                      )}
                    </Group>
                  ) : (
                    <Text size="xs" c="dimmed">
                      Không có thẻ
                    </Text>
                  )}
                </Table.Td>

                <Table.Td w="12%" style={{ textAlign: 'center' }}>
                  <Text size="sm">
                    {tutorial.createdAt
                      ? formatDateShort(new Date(tutorial.createdAt))
                      : 'N/A'}
                  </Text>
                </Table.Td>

                <Table.Td w="12%" style={{ textAlign: 'center' }}>
                  <Text size="sm">
                    {tutorial.updatedAt
                      ? formatDateShort(new Date(tutorial.updatedAt))
                      : 'N/A'}
                  </Text>
                </Table.Td>

                <Table.Td w="14%" style={{ textAlign: 'right' }}>
                  <Group gap={0} justify="flex-end">
                    <Tooltip label="Xem chi tiết">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectTutorial(tutorial.id!)
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
                            handleEditTutorial(tutorial.id!)
                          }}
                        >
                          Chỉnh sửa
                        </Menu.Item>

                        <Menu.Divider />

                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(tutorial)
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
        title="Xác nhận xóa hướng dẫn"
        centered
      >
        <Stack gap="md">
          <Text>
            Bạn có chắc chắn muốn xóa hướng dẫn &quot;{deleteConfirm.tutorialTitle}&quot;?
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
              loading={deleteTutorial.isPending}
            >
              Xóa
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}

export default TutorialManager
