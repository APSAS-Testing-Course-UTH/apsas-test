/**
 * SubmissionDetail Component
 * 
 * Displays detailed evaluation results for a student's code submission
 * 
 * Features:
 * - Summary card with score, status, language, timestamp
 * - Submitted code viewer (CodeDisplay component)
 * - Test case results table
 * - Instructor feedback section
 * - Real-time polling for PENDING status
 * - Comprehensive error handling with retry
 * 
 * Vietnamese UI: All labels in Vietnamese
 */

import { useCallback } from 'react'
import { Stack, Text, Card, Group, Badge, Alert, Center, Loader, Button, Tooltip } from '@mantine/core'
import { IconArrowLeft, IconAlertCircle, IconWifi, IconWifiOff, IconRefresh } from '@tabler/icons-react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { submissionServiceGetSubmissionByIdOptions } from '@/api/@tanstack/react-query.gen'
import { TestCaseResults } from './TestCaseResults'
import { InstructorFeedback } from './InstructorFeedback'
import { CodeDisplay } from './CodeDisplay'
import { useWebSocket, type WebSocketMessage } from '../hooks'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { showErrorNotification } from '@/utils/notifications'
import { getErrorCategory, isNetworkError, isTimeoutError } from '@/features/student/utils'

/**
 * Vietnamese labels for UI
 */
const labels = {
  // Page & section titles
  summary: 'Tóm tắt kết quả',
  submittedCode: 'Mã đã nộp',
  testResults: 'Kết quả kiểm tra',
  instructorFeedback: 'Phản hồi từ giáo viên',
  
  // Summary card fields
  score: 'Điểm số',
  status: 'Trạng thái',
  language: 'Ngôn ngữ',
  submittedAt: 'Thời gian nộp',
  
  // Status labels
  statusPending: 'Đang chờ',
  statusEvaluated: 'Đã đánh giá',
  statusFailed: 'Thất bại',
  
  // Result labels
  resultPassed: 'Đạt',
  resultFailed: 'Không đạt',
  resultPartial: 'Đạt một phần',
  
  // Empty states
  noTestResults: 'Chưa có kết quả kiểm tra',
  noFeedback: 'Chưa có phản hồi nào',
  
  // Error messages
  loading: 'Đang tải kết quả...',
  error: 'Có lỗi xảy ra',
  notFound: 'Không tìm thấy bài nộp',
  retry: 'Thử lại',
  
  // Navigation
  backToList: 'Quay lại danh sách',
  
  // WebSocket connection status
  connectionConnected: 'Kết nối trực tiếp',
  connectionDisconnected: 'Chế độ polling',
  connectionTooltipConnected: 'Đang nhận cập nhật thời gian thực qua WebSocket',
  connectionTooltipDisconnected: 'Đang sử dụng polling để cập nhật (cứ 5 giây)',
}

/**
 * Status badge color mapping
 */
const statusColors = {
  PENDING: 'yellow',
  EVALUATED: 'blue',
  FAILED: 'red',
} as const

/**
 * Result badge color mapping
 */
const resultColors = {
  PASSED: 'green',
  FAILED: 'red',
  PARTIAL: 'orange',
} as const

/**
 * Format date in Vietnamese format (dd/mm/yyyy HH:mm)
 */
function formatDate(date?: Date): string {
  if (!date) return 'N/A'
  
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * SubmissionDetail Component
 */
export function SubmissionDetail({ 
  submissionId,
  onProvideFeedback,
}: { 
  submissionId?: string
  onProvideFeedback?: () => void
}) {
  // Get submission ID from route params OR prop
  const routeParams = useParams({ strict: false }) as { id?: string }
  const id = submissionId || routeParams.id
  const navigate = useNavigate()
  
  // Early return if no ID
  if (!id) {
    return (
      <Alert color="red">
        Không tìm thấy ID bài nộp
      </Alert>
    )
  }
  
  // Fetch submission data
  const {
    data: submission,
    isLoading,
    error,
    refetch,
  } = useQuery(
    submissionServiceGetSubmissionByIdOptions({
      path: { id },
    })
  )
  
  // Get user for WebSocket subscription
  const user = useAuthStore((state) => state.user)

  // WebSocket message handler - refetch data when evaluation completes
  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'SUBMISSION_EVALUATED' && message.submissionId === id) {
      // Refresh submission data
      refetch()
      
      // Show Vietnamese notification
      showErrorNotification('Kết quả đánh giá đã được cập nhật.', 'Đã có kết quả!')
    }
  }, [id, refetch])

  // WebSocket connection for real-time updates
  const { isConnected } = useWebSocket({
    userId: user?.id,
    autoConnect: true,
    enableNotifications: false, // Handle notifications manually
    onMessage: handleMessage,
  })
  
  // Loading state
  if (isLoading) {
    return (
      <Center style={{ height: '80vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed" size="lg">
            {labels.loading}
          </Text>
        </Stack>
      </Center>
    )
  }
  
  // Error state with detailed error handling
  if (error) {
    const errorStatus = (error as any)?.response?.status
    const isNotFound = errorStatus === 404
    const isNetworkDown = isNetworkError(error)
    const isTimeout = isTimeoutError(error)
    const errorCategory = getErrorCategory(error)

    let errorIcon = <IconAlertCircle size={20} />
    let errorTitle = labels.error
    let errorMessage = 'Vui lòng thử lại sau'
    let errorColor = 'red'

    if (isNotFound) {
      errorTitle = 'Không tìm thấy'
      errorMessage = labels.notFound
      errorColor = 'yellow'
    } else if (isNetworkDown) {
      errorTitle = 'Lỗi kết nối mạng'
      errorMessage = 'Kiểm tra kết nối Internet của bạn và thử lại'
      errorColor = 'orange'
    } else if (isTimeout) {
      errorTitle = 'Yêu cầu hết thời gian chờ'
      errorMessage = 'Máy chủ phản hồi quá chậm. Vui lòng thử lại.'
      errorColor = 'orange'
    } else if (errorCategory === 'auth') {
      errorTitle = 'Lỗi xác thực'
      errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
      errorColor = 'red'
    } else if (errorCategory === 'server') {
      errorTitle = 'Lỗi máy chủ'
      errorMessage = 'Máy chủ gặp sự cố. Vui lòng thử lại sau.'
      errorColor = 'red'
    } else {
      errorMessage = error?.message || errorMessage
    }
    
    return (
      <Stack gap="md" p="md">
        <Alert
          icon={errorIcon}
          title={errorTitle}
          color={errorColor}
          variant="filled"
        >
          {errorMessage}
        </Alert>
        
        <Group>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate({ to: '/instructor/submissions' })}
          >
            {labels.backToList}
          </Button>
          
          {!isNotFound && (
            <Button
              onClick={() => refetch()}
              leftSection={<IconRefresh size={16} />}
              variant="default"
            >
              {labels.retry}
            </Button>
          )}
        </Group>
      </Stack>
    )
  }
  
  // No data
  if (!submission) {
    return (
      <Stack gap="md" p="md">
        <Alert color="gray">
          {labels.notFound}
        </Alert>
        
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate({ to: '/instructor/submissions' })}
          >
            {labels.backToList}
          </Button>
      </Stack>
    )
  }
  
  // Render submission detail
  return (
    <Stack gap="lg" p="md">
      
      {/* Summary Card */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text size="xl" fw={700}>
            {labels.summary}
          </Text>
          
          <Group gap="xl">
            {/* Score */}
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                {labels.score}
              </Text>
              <Text size="lg" fw={600}>
                {submission.score !== undefined ? `${submission.score}` : 'N/A'}
              </Text>
            </div>
            
            {/* Status */}
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                {labels.status}
              </Text>
              <Badge
                color={submission.status ? statusColors[submission.status] : 'gray'}
                size="lg"
                variant="filled"
              >
                {submission.status === 'PENDING' && labels.statusPending}
                {submission.status === 'EVALUATED' && labels.statusEvaluated}
                {submission.status === 'FAILED' && labels.statusFailed}
              </Badge>
            </div>
            
            {/* Result */}
            {submission.result && (
              <div>
                <Text size="sm" c="dimmed" mb={4}>
                  Kết quả
                </Text>
                <Badge
                  color={submission.result ? resultColors[submission.result] : 'gray'}
                  size="lg"
                  variant="filled"
                >
                  {submission.result === 'PASSED' && labels.resultPassed}
                  {submission.result === 'FAILED' && labels.resultFailed}
                  {submission.result === 'PARTIAL' && labels.resultPartial}
                </Badge>
              </div>
            )}
            
            {/* Language */}
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                {labels.language}
              </Text>
              <Badge size="lg" variant="light">
                {submission.language || 'N/A'}
              </Badge>
            </div>
            
            {/* Connection Status */}
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                Kết nối
              </Text>
              <Tooltip 
                label={isConnected ? labels.connectionTooltipConnected : labels.connectionTooltipDisconnected}
                position="top"
              >
                <Badge
                  color={isConnected ? 'green' : 'gray'}
                  size="lg"
                  variant="light"
                  leftSection={isConnected ? <IconWifi size={16} /> : <IconWifiOff size={16} />}
                >
                  {isConnected ? 'Trực tiếp' : 'Polling'}
                </Badge>
              </Tooltip>
            </div>
            
            {/* Submission time */}
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                {labels.submittedAt}
              </Text>
              <Text size="sm">
                {formatDate(submission.submittedAt)}
              </Text>
            </div>
          </Group>
        </Stack>
      </Card>
      
      {/* Submitted Code */}
      <Stack gap="md">
        <Text size="lg" fw={600}>
          {labels.submittedCode}
        </Text>
        
        {submission.code ? (
          <CodeDisplay
            code={submission.code}
            language={submission.language || 'text'}
            showLineNumbers={true}
            readOnly={true}
            showCopyButton={true}
          />
        ) : (
          <Card withBorder>
            <Text c="dimmed">Không có mã nguồn</Text>
          </Card>
        )}
      </Stack>
      
      {/* Test Results Section */}
      <Stack gap="md">
        <Text size="lg" fw={600}>
          {labels.testResults}
        </Text>
        
        <Card withBorder>
          {submission.testCaseResults && submission.testCaseResults.length > 0 ? (
            <TestCaseResults testCases={submission.testCaseResults} />
          ) : (
            <Text c="dimmed">{labels.noTestResults}</Text>
          )}
        </Card>
      </Stack>
      
      {/* Instructor Feedback */}
      <InstructorFeedback 
        feedback={submission.feedback}
        onProvideFeedback={onProvideFeedback}
      />
      
      {/* Back button - improved styling */}
      <Group justify="center" mt="xl">
        <Button
          variant="default"
          size="md"
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => navigate({ to: '/instructor/submissions' })}
        >
          {labels.backToList}
        </Button>
      </Group>
    </Stack>
  )
}
