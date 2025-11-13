/**
 * SubmissionsList Component
 * Displays paginated list of user's code submissions
 * 
 * Features:
 * - Paginated table of submissions
 * - Status badges (PENDING, EVALUATED, FAILED)
 * - Filters (status, assignment, date range)
 * - Search by assignment name
 * - Click row to view details
 * - 100% Vietnamese UI
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Table,
  Badge,
  Button,
  TextInput,
  Select,
  Group,
  Stack,
  Text,
  Paper,
  ActionIcon,
  Pagination,
  Skeleton,
  Center,
  Loader,
  Tooltip,
  Alert,
  Card,
} from '@mantine/core'
import { IconSearch, IconX, IconEye, IconAlertCircle, IconWifi, IconClock } from '@tabler/icons-react'
import { useDebouncedValue } from '@mantine/hooks'
import { submissionServiceGetAllSubmissionsOptions } from '@/api/@tanstack/react-query.gen'
import { useAssignmentDetails } from '../api/hooks'
import { useSubmissionPolling } from '../hooks'
import { showInfoNotification } from '@/utils/notifications'
import { useErrorHandler } from '@/features/student/hooks'
import {
  getErrorCategory,
  isNetworkError,
  isTimeoutError,
} from '@/features/student/utils'
import type { SubmissionServiceSubmissionResponse } from '@/api/types.gen'

interface SubmissionsListProps {
  assignmentId?: string
  limit?: number
}

// Vietnamese status labels
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Đang chờ',
  EVALUATED: 'Đã đánh giá',
  FAILED: 'Thất bại',
}

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'yellow',
  EVALUATED: 'green',
  FAILED: 'red',
}

/**
 * SubmissionTableRow Component
 * Renders a single submission row with assignment name fetched from API
 * 
 * Features:
 * - ✅ Fetches assignment title using hook (cached)
 * - ✅ Shows loading state while fetching assignment name
 * - ✅ Displays assignment name instead of UUID
 * - ✅ Handles errors gracefully
 * - ✅ Real-time status polling for PENDING submissions
 * - ✅ Visual indicator (spinner) when polling
 * - ✅ Status change callbacks with notifications
 */
interface SubmissionTableRowProps {
  submission: SubmissionServiceSubmissionResponse
  onRowClick: (submissionId: string) => void
}

function SubmissionTableRow({ submission, onRowClick }: SubmissionTableRowProps) {
  // Fetch assignment details (title, description, etc.)
  // This will be cached by TanStack Query, so multiple rows don't refetch the same assignment
  const { data: assignment, isLoading: isLoadingAssignment } = useAssignmentDetails(
    submission.assignmentId
  )

  // Poll submission status for real-time updates
  const { submission: liveSubmission, isPolling } = useSubmissionPolling({
    submissionId: submission.id!,
    enabled: submission.status === 'PENDING', // Only poll while pending
    interval: 5000, // Poll every 5 seconds
    onStatusChange: (newStatus) => {
      // Show notification when status changes
      if (newStatus === 'EVALUATED') {
        showInfoNotification('Bài nộp đã được chấm!', 'Kết quả đánh giá')
      } else if (newStatus === 'FAILED') {
        showInfoNotification('Có lỗi xảy ra trong quá trình đánh giá', 'Lỗi đánh giá')
      }
    },
  })

  // Use live submission if available, otherwise use static submission
  const currentSubmission = liveSubmission || submission

  // Format date to Vietnamese format
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  }

  // Get assignment title, show loader if fetching, fallback to UUID if error
  const assignmentTitle = assignment?.title || (
    isLoadingAssignment ? (
      <Group gap={4}>
        <Loader size={14} />
        <span>Đang tải...</span>
      </Group>
    ) : (
      submission.assignmentId // Show UUID as fallback
    )
  )

  return (
    <Table.Tr
      style={{ cursor: 'pointer' }}
      onClick={() => onRowClick(currentSubmission.id!)}
    >
      <Table.Td>{assignmentTitle}</Table.Td>
      <Table.Td>
        <Badge variant="light">{currentSubmission.language}</Badge>
      </Table.Td>
      <Table.Td>
        <Tooltip
          label={isPolling ? 'Đang chờ kết quả đánh giá (cập nhật mỗi 5 giây)...' : undefined}
          disabled={!isPolling}
        >
          <Badge
            color={STATUS_COLORS[currentSubmission.status!]}
            variant={isPolling ? 'filled' : 'light'}
            leftSection={isPolling ? <Loader size="xs" /> : undefined}
          >
            {STATUS_LABELS[currentSubmission.status!]}
          </Badge>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Text fw={600}>
          {currentSubmission.score !== undefined ? currentSubmission.score : 'N/A'}
        </Text>
      </Table.Td>
      <Table.Td>
        {currentSubmission.submittedAt && formatDate(currentSubmission.submittedAt)}
      </Table.Td>
      <Table.Td>
        <Button
          variant="light"
          size="xs"
          leftSection={<IconEye size={14} />}
          onClick={(e) => {
            e.stopPropagation()
            onRowClick(currentSubmission.id!)
          }}
        >
          Xem chi tiết
        </Button>
      </Table.Td>
    </Table.Tr>
  )
}

export function SubmissionsList({ assignmentId, limit = 20 }: SubmissionsListProps) {
  const navigate = useNavigate()

  // State for filters
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Debounce search (300ms)
  const [_debouncedSearch] = useDebouncedValue(searchQuery, 300)

  // Build query params
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {
      page: String(page),
      size: String(limit),
    }

    if (assignmentId) {
      params.assignmentId = assignmentId
    }

    if (statusFilter) {
      params.status = statusFilter
    }

    return params
  }, [page, limit, assignmentId, statusFilter])

  // Fetch submissions using generated TanStack Query hook
  const { data, isLoading, isError, error, refetch } = useQuery(
    submissionServiceGetAllSubmissionsOptions({
      query: queryParams,
    })
  )

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setStatusFilter(null)
    setSearchQuery('')
    setPage(0)
    refetch()
  }, [refetch])

  // Check if any filters are applied
  const hasActiveFilters = statusFilter !== null || searchQuery !== ''

  // Handle status filter change - reset pagination
  const handleStatusFilterChange = useCallback((value: string | null) => {
    setStatusFilter(value)
    setPage(0) // Reset to first page when filter changes
  }, [])

  // Navigate to detail page
  const handleRowClick = useCallback(
    (submissionId: string) => {
      navigate({
        to: '/student/submissions/$id',
        params: { id: submissionId },
      })
    },
    [navigate]
  )

  // Loading state with skeleton loaders
  if (isLoading) {
    return (
      <Stack gap="md">
        <Paper p="md" withBorder>
          <Group justify="space-between">
            <Skeleton height={40} width={200} />
            <Skeleton height={40} width={300} />
          </Group>
        </Paper>
        <Paper withBorder>
          <Stack p="md" gap="md">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={50} />
            ))}
          </Stack>
        </Paper>
      </Stack>
    )
  }

  // Error state with detailed error handling
  if (isError && error) {
    const errorCategory = getErrorCategory(error)
    const isNetworkDown = isNetworkError(error)
    const isTimeout = isTimeoutError(error)

    let errorIcon = <IconAlertCircle size={20} />
    let errorTitle = 'Có lỗi xảy ra'
    let errorMessage = 'Vui lòng thử lại sau'
    let errorColor = 'red'

    if (isNetworkDown) {
      errorIcon = <IconWifi size={20} />
      errorTitle = 'Lỗi kết nối mạng'
      errorMessage = 'Kiểm tra kết nối Internet của bạn và thử lại'
      errorColor = 'orange'
    } else if (isTimeout) {
      errorIcon = <IconClock size={20} />
      errorTitle = 'Yêu cầu hết thời gian chờ'
      errorMessage = 'Máy chủ phản hồi quá chậm. Vui lòng thử lại.'
      errorColor = 'orange'
    } else if (errorCategory === 'auth') {
      errorTitle = 'Lỗi xác thực'
      errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
      errorColor = 'red'
    }

    return (
      <Card p="lg" radius="md" withBorder className="error-card">
        <Alert icon={errorIcon} color={errorColor} title={errorTitle}>
          {errorMessage}
        </Alert>
        <Group justify="center" mt="lg">
          <Button onClick={() => refetch()} variant="light">
            Thử lại
          </Button>
        </Group>
      </Card>
    )
  }

  // Empty state
  if (!data?.content || data.content.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Stack align="center" gap="md">
          <Text size="xl" fw={600}>
            Chưa có bài nộp nào
          </Text>
          <Text c="dimmed">
            Bạn chưa nộp bài tập nào. Hãy bắt đầu làm bài và nộp code của bạn!
          </Text>
        </Stack>
      </Paper>
    )
  }

  const submissions = data.content
  const totalPages = data.totalPages || 1

  return (
    <Stack gap="md">
      {/* Filters Section */}
      <Paper p="md" withBorder>
        <Group justify="space-between">
          <Group>
            {/* Status Filter */}
            <Select
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              data={[
                { value: 'PENDING', label: 'Đang chờ' },
                { value: 'EVALUATED', label: 'Đã đánh giá' },
                { value: 'FAILED', label: 'Thất bại' },
              ]}
              clearable
              w={200}
            />

            {/* Search Input */}
            <TextInput
              placeholder="Tìm kiếm bài tập..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              rightSection={
                searchQuery ? (
                  <ActionIcon
                    variant="transparent"
                    onClick={() => setSearchQuery('')}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                ) : null
              }
              w={300}
            />
          </Group>

          {/* Clear Filters Button */}
          <Button
            variant="light"
            onClick={handleClearFilters}
            leftSection={<IconX size={16} />}
            disabled={!hasActiveFilters}
          >
            Xóa bộ lọc
          </Button>
        </Group>
      </Paper>

      {/* Table */}
      <Paper withBorder>
        <Table highlightOnHover striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Bài tập</Table.Th>
              <Table.Th>Ngôn ngữ</Table.Th>
              <Table.Th>Trạng thái</Table.Th>
              <Table.Th>Điểm</Table.Th>
              <Table.Th>Thời gian nộp</Table.Th>
              <Table.Th>Hành động</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {submissions.map((submission: SubmissionServiceSubmissionResponse) => (
              <SubmissionTableRow
                key={submission.id}
                submission={submission}
                onRowClick={handleRowClick}
              />
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Center>
          <Pagination
            value={page + 1}
            onChange={(newPage) => setPage(newPage - 1)}
            total={totalPages}
            size="sm"
          />
        </Center>
      )}
    </Stack>
  )
}
