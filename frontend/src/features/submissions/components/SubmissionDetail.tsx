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
 * 
 * Vietnamese UI: All labels in Vietnamese
 */

import { useCallback } from 'react'
import { Stack, Text, Card, Group, Badge, Alert, Center, Loader, Button, Tooltip } from '@mantine/core'
import { IconArrowLeft, IconAlertCircle, IconWifi, IconWifiOff } from '@tabler/icons-react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { submissionServiceGetSubmissionByIdOptions } from '@/api/@tanstack/react-query.gen'
import { TestCaseResults } from './TestCaseResults'
import { InstructorFeedback } from './InstructorFeedback'
import { CodeDisplay } from './CodeDisplay'
import { useWebSocket, type WebSocketMessage } from '../hooks'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { showErrorNotification } from '@/utils/notifications'

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
export function SubmissionDetail() {
  // Get submission ID from route params
  const { id } = useParams({ from: '/_authenticated/student/submissions/$id' })
  const navigate = useNavigate()
  
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
  
  // Error state
  if (error) {
    const isNotFound = (error as any)?.response?.status === 404
    
    return (
      <Stack gap="md" p="md">
        <Alert
          icon={<IconAlertCircle size={20} />}
          title={labels.error}
          color="red"
          variant="filled"
        >
          {isNotFound ? labels.notFound : error.message || labels.error}
        </Alert>
        
        <Group>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate({ to: '/student/dashboard' })}
          >
            {labels.backToList}
          </Button>
          
          {!isNotFound && (
            <Button onClick={() => refetch()}>
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
          onClick={() => navigate({ to: '/student/dashboard' })}
        >
          {labels.backToList}
        </Button>
      </Stack>
    )
  }
  
  // Render submission detail
  return (
    <Stack gap="lg" p="md">
      {/* Back button */}
      <Button
        variant="light"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => navigate({ to: '/student/dashboard' })}
        w="fit-content"
      >
        {labels.backToList}
      </Button>
      
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
      <InstructorFeedback feedback={submission.feedback} />
    </Stack>
  )
}
