/**
 * SkillManager Component - For Content Provider
 *
 * Displays paginated list of skills with:
 * - Skill management (view, edit, delete)
 * - Created/Updated dates
 * - Vietnamese UI 100%
 * - Pagination with TanStack Query
 * - Client-side search filtering (name, description)
 * - Row actions (Edit, Delete)
 *
 * @see useSkillsQuery for data fetching
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
  TextInput,
  Checkbox,
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
import { useSkillsQuery, useDeleteSkillMutation } from '../api'
import { useFilteredData, createSkillFilterFunctions } from '../hooks'
import type { ContentServiceSkillResponse } from '@/api/types.gen'
import { formatDateShort } from '@/utils/dateUtils'
import styles from './SkillManager.module.css'

interface SkillManagerProps {
  onSelectSkill?: (id: string) => void
}

export function SkillManager({ onSelectSkill }: SkillManagerProps) {
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
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    skillId?: string
    skillName?: string
  }>({ open: false })

  // Fetch skills with pagination
  const { data, isLoading, error } = useSkillsQuery({
    page,
    size: pageSize,
  })

  // Mutations
  const deleteSkill = useDeleteSkillMutation()

  const skillList = data?.content || []

  // Client-side filtering by search term and date ranges
  const filteredSkills = useFilteredData(
    skillList,
    { searchTerm, createdAtRange, updatedAtRange },
    {
      searchFields: ['name', 'description'],
      filterFunctions: createSkillFilterFunctions(),
    }
  )

  // Handle select skill (navigate to detail)
  const handleSelectSkill = useCallback(
    (id: string) => {
      onSelectSkill?.(id)
      navigate({ to: `/provider/skills/${id}` })
    },
    [navigate, onSelectSkill]
  )

  // Handle edit skill
  const handleEditSkill = useCallback(
    (id: string) => {
      navigate({ to: `/provider/skills/${id}/edit` })
    },
    [navigate]
  )

  // Handle delete with confirmation
  const handleDeleteClick = useCallback((skill: ContentServiceSkillResponse) => {
    setDeleteConfirm({
      open: true,
      skillId: skill.id,
      skillName: skill.name,
    })
  }, [])

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (deleteConfirm.skillId === 'bulk' && selectedRows.size > 0) {
      // Bulk delete
      for (const id of selectedRows) {
        const skillName = filteredSkills.find(s => s.id === id)?.name || 'Unknown'
        await deleteSkill.mutateAsync({ id, name: skillName })
      }
      setSelectedRows(new Set())
    } else if (deleteConfirm.skillId && deleteConfirm.skillName) {
      // Single delete
      await deleteSkill.mutateAsync({
        id: deleteConfirm.skillId,
        name: deleteConfirm.skillName,
      })
    }
    setDeleteConfirm({ open: false })
  }, [deleteConfirm.skillId, deleteConfirm.skillName, deleteSkill, selectedRows, filteredSkills])

  // Toggle row selection
  const toggleRow = useCallback((id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }, [])

  // Toggle all rows
  const toggleAllRows = useCallback(() => {
    if (selectedRows.size === filteredSkills.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredSkills.map(s => s.id || '')))
    }
  }, [selectedRows.size, filteredSkills])

  // Handle bulk delete
  const handleBulkDelete = useCallback(() => {
    setDeleteConfirm({
      open: true,
      skillId: 'bulk',
      skillName: `${selectedRows.size} kỹ năng`,
    })
  }, [selectedRows.size])
  if (isLoading) {
    return (
      <Center className={styles.container}>
        <Stack align="center" gap="md">
          <Loader />
          <Text>Đang tải danh sách kỹ năng...</Text>
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
          <Text>Không thể tải danh sách kỹ năng. Vui lòng thử lại.</Text>
          <Button onClick={() => window.location.reload()}>Tải lại trang</Button>
        </Stack>
      </Center>
    )
  }

  // Render empty state
  if (!skillList || skillList.length === 0) {
    return (
      <Center className={styles.container}>
        <Stack align="center" gap="md">
          <Text size="lg" fw={500}>
            Chưa có kỹ năng nào
          </Text>
          <Text c="dimmed" size="sm">
            Bắt đầu bằng cách tạo kỹ năng mới
          </Text>
          <Button onClick={() => navigate({ to: '/provider/skills/create' })}>
            Tạo kỹ năng mới
          </Button>
        </Stack>
      </Center>
    )
  }

  // Render component with filters
  return (
    <Stack className={styles.container} gap="md">
      {/* Header with create button */}
      <Group justify="space-between">
        <Text fw={500}>
          Tổng cộng: {filteredSkills.length} / {data?.totalElements || 0} kỹ năng
        </Text>
        <Button onClick={() => navigate({ to: '/provider/skills/create' })}>
          Tạo kỹ năng mới
        </Button>
      </Group>

      {/* Bulk Action Toolbar */}
      {selectedRows.size > 0 && (
        <Group bg="blue.0" p="md" justify="space-between">
          <Text fw={500}>Đã chọn {selectedRows.size} kỹ năng</Text>
          <Group gap="sm">
            <Button
              variant="light"
              color="red"
              size="sm"
              onClick={handleBulkDelete}
              loading={deleteSkill.isPending}
            >
              Xóa
            </Button>
            <Button
              variant="light"
              size="sm"
              onClick={() => setSelectedRows(new Set())}
            >
              Bỏ chọn
            </Button>
          </Group>
        </Group>
      )}

      {/* Filters Row: Search + Date Filters */}
      <Group grow align="flex-end">
        <TextInput
          placeholder="Tìm kiếm theo tên hoặc mô tả..."
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
      {filteredSkills.length === 0 && (searchTerm || createdAtRange[0] || createdAtRange[1] || updatedAtRange[0] || updatedAtRange[1]) && (
        <Center py="xl">
          <Text c="dimmed">Không tìm thấy kỹ năng nào phù hợp với bộ lọc</Text>
        </Center>
      )}

      {/* Skills Table */}
      {filteredSkills.length > 0 && (
        <div className={styles.tableWrapper}>
          <Table striped highlightOnHover stickyHeader layout="fixed">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w="5%">
                  <Checkbox
                    checked={selectedRows.size === filteredSkills.length}
                    indeterminate={selectedRows.size > 0 && selectedRows.size < filteredSkills.length}
                    onChange={toggleAllRows}
                  />
                </Table.Th>
                <Table.Th w="25%">Tên kỹ năng</Table.Th>
                <Table.Th w="30%">Mô tả</Table.Th>
                <Table.Th w="12%" style={{ textAlign: 'center' }}>Ngày tạo</Table.Th>
                <Table.Th w="12%" style={{ textAlign: 'center' }}>Cập nhật</Table.Th>
                <Table.Th w="16%" style={{ textAlign: 'right' }}>Hành động</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredSkills.map((skill) => {
                const isSelected = selectedRows.has(skill.id || '')
                return (
                  <Table.Tr
                    key={skill.id}
                    className={styles.row}
                    style={{
                      backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
                      cursor: 'pointer',
                    }}
                  >
                    <Table.Td w="5%" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleRow(skill.id || '')}
                      />
                    </Table.Td>
                    <Table.Td w="25%" onClick={() => handleSelectSkill(skill.id!)}>
                      <Text size="sm" fw={500}>
                        {skill.name}
                      </Text>
                    </Table.Td>
                    <Table.Td w="30%" onClick={() => handleSelectSkill(skill.id!)}>
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {skill.description || 'Không có mô tả'}
                      </Text>
                    </Table.Td>
                    <Table.Td w="12%" style={{ textAlign: 'center' }} onClick={() => handleSelectSkill(skill.id!)}>
                      <Text size="sm">
                        {skill.createdAt
                          ? formatDateShort(new Date(skill.createdAt))
                          : 'N/A'}
                      </Text>
                    </Table.Td>
                    <Table.Td w="12%" style={{ textAlign: 'center' }} onClick={() => handleSelectSkill(skill.id!)}>
                      <Text size="sm">
                        {skill.updatedAt
                          ? formatDateShort(new Date(skill.updatedAt))
                          : 'N/A'}
                      </Text>
                    </Table.Td>
                    <Table.Td w="16%" style={{ textAlign: 'right' }}>
                      <Group gap="sm" justify="flex-end">
                        <Tooltip label="Xem chi tiết">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectSkill(skill.id!)
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
                                handleEditSkill(skill.id!)
                              }}
                            >
                              Chỉnh sửa
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteClick(skill)
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
                )
              })}
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
        title="Xác nhận xóa kỹ năng"
        centered
      >
        <Stack gap="md">
          <Text>
            Bạn có chắc chắn muốn xóa kỹ năng &quot;{deleteConfirm.skillName}&quot;?
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
              loading={deleteSkill.isPending}
            >
              Xóa
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
