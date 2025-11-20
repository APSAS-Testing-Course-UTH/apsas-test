/**
 * CodeSubmissionPage Component
 * 3-column responsive layout for code submission:
 * - Left: Problem description and assignment details
 * - Center: Code submission form
 * - Right: Test information panel
 * Vietnamese UI throughout, responsive for mobile/tablet/desktop
 */

import { Grid, Container, Stack, Text, Badge, Group, Loader, Center, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useParams } from '@tanstack/react-router'
import { useCallback } from 'react'
import { useAssignmentDetails, useRuntimesQuery } from '../api/hooks'
import { SubmissionEditor } from './SubmissionEditor'
import { submissionServiceCreateSubmission } from '@/api/sdk.gen'
import { mapApiError } from '@/configs/api-error-handler'
import { showSuccessNotification, showErrorNotification } from '@/utils/notifications'
import { MarkdownContent } from '@/components/MarkdownContent'
import styles from './CodeSubmissionPage.module.css'

const labels = {
  description: 'Mô tả bài toán',
  submissionForm: 'Biểu mẫu nộp',
  testInfo: 'Thông tin kiểm tra',
  loading: 'Đang tải bài tập...',
  error: 'Lỗi khi tải bài tập',
  notFound: 'Không tìm thấy bài tập',
  total: 'Tổng',
  visible: 'Hiển thị',
  hidden: 'Ẩn',
  difficulty: 'Độ khó',
  dueDate: 'Hạn chót',
  score: 'Điểm',
  skills: 'Kỹ năng cần có',
  languages: 'Ngôn ngữ hỗ trợ',
  examples: 'Ví dụ',
  constraints: 'Ràng buộc',
  notes: 'Ghi chú',
}

/**
 * CodeSubmissionPage - Main submission page component
 * Displays assignment details and code submission form in responsive 3-column layout
 * 
 * Layout:
 * Desktop: [30% - Description | 40% - Form | 30% - Test Info]
 * Tablet:  [50% - Description/Form | 50% - Test Info] (stacked)
 * Mobile:  [100% - Description] → [100% - Form] → [100% - Test Info] (vertical)
 * 
 * @example
 * // Route: /student/submission/$id
 * <CodeSubmissionPage /> // Rendered by route
 */
export function CodeSubmissionPage() {
  // Route param is the ASSIGNMENT ID (not submission ID)
  const { id: assignmentId } = useParams({ from: '/_authenticated/student/submission/$id' })
  
  // Fetch assignment details to show problem description and test information
  const { data: assignment, isLoading, error } = useAssignmentDetails(assignmentId)
  const runtimesResult = useRuntimesQuery()
  const runtimes = runtimesResult.data || []

  // Form submission handler
  const handleSubmit = useCallback(async (data: {
    assignmentId: string
    code: string
    language: string
  }) => {
    const result = await submissionServiceCreateSubmission({ body: data })
    if (result.error) {
      throw new Error(result.error?.toString() || 'Submission failed')
    }
    return result.data!
  }, [])

  // Success callback - show notification
  const handleSuccess = useCallback(() => {
    showSuccessNotification('Code của bạn đang được kiểm tra...', 'Bài nộp thành công!')
  }, [])

  // Error callback - show error notification
  const handleError = useCallback((error: Error) => {
    const mappedError = mapApiError(error)
    const message = mappedError.message
    showErrorNotification(message, 'Lỗi nộp bài')
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <Center style={{ height: '60vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">{labels.loading}</Text>
        </Stack>
      </Center>
    )
  }

  // Error state
  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle />} color="red" title={labels.error}>
          {error.message || 'Có lỗi xảy ra khi tải dữ liệu bài tập.'}
        </Alert>
      </Container>
    )
  }

  // Not found
  if (!assignment) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle />} color="yellow" title={labels.notFound}>
          Bài tập không tồn tại hoặc đã bị xóa.
        </Alert>
      </Container>
    )
  }

  // Parse test case counts
  const totalTests = assignment.testCases?.length || 0
  const visibleTests = assignment.testCases?.filter((tc) => !(tc as Record<string, unknown>).isHidden).length || 0
  const hiddenTests = totalTests - visibleTests

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header: Assignment title and metadata */}
        <div>
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
            <Stack gap="xs" flex={1}>
              <Text fw={700} size="xl">
                {assignment.title}
              </Text>
              <Group gap="xs">
                <Badge variant="light">{assignment.difficultyLevel || 'N/A'}</Badge>
                {assignment.maxScore && <Badge variant="dot">{assignment.maxScore} điểm</Badge>}
              </Group>
            </Stack>
          </Group>
        </div>

        {/* 3-Column Layout */}
        <Grid gutter="lg">
          {/* LEFT COLUMN: Problem Description (30%) */}
          <Grid.Col span={{ base: 12, sm: 12, md: 4, lg: 3 }}>
            <Stack gap="md" className={styles.leftPanel}>
              {/* Description section */}
              <div>
                <Text fw={600} size="md" mb="xs">
                  {labels.description}
                </Text>
                {assignment.description ? (
                  <MarkdownContent content={assignment.description} />
                ) : (
                  <Text size="sm" c="dimmed" fs="italic">
                    Không có mô tả
                  </Text>
                )}
              </div>

              {/* Metadata section */}
              <div>
                <Text fw={600} size="md" mb="xs">
                  Thông tin
                </Text>
                <Stack gap="xs">
                  {assignment.dueDate && (
                    <Group justify="space-between" gap="sm">
                      <Text c="dimmed">{labels.dueDate}:</Text>
                      <Text fw={500}>{new Date(assignment.dueDate).toLocaleDateString('vi-VN')}</Text>
                    </Group>
                  )}
                  {assignment.difficultyLevel && (
                    <Group justify="space-between" gap="sm">
                      <Text c="dimmed">{labels.difficulty}:</Text>
                      <Badge size="sm" variant="light">
                        {assignment.difficultyLevel}
                      </Badge>
                    </Group>
                  )}
                </Stack>
              </div>

              {/* Skills section */}
              {assignment.skills && assignment.skills.length > 0 && (
                <div>
                  <Text fw={600} size="md" mb="xs">
                    {labels.skills}
                  </Text>
                  <Group gap="xs">
                    {assignment.skills.map((skill) => (
                      <Badge key={skill.id || skill.name} size="sm" variant="dot">
                        {skill.name}
                      </Badge>
                    ))}
                  </Group>
                </div>
              )}

              {/* Languages section */}
              {assignment.languages && assignment.languages.length > 0 && (
                <div>
                  <Text fw={600} size="md" mb="xs">
                    {labels.languages}
                  </Text>
                  <Group gap="xs">
                    {assignment.languages.map((lang: string) => (
                      <Badge key={lang} size="sm" variant="light">
                        {lang}
                      </Badge>
                    ))}
                  </Group>
                </div>
              )}
            </Stack>
          </Grid.Col>

          {/* CENTER COLUMN: Submission Form (40%) */}
          <Grid.Col span={{ base: 12, sm: 12, md: 5, lg: 6 }}>
            <Stack gap="md" className={styles.centerPanel}>
              <SubmissionEditor
                assignmentId={assignmentId}
                runtimes={runtimes}
                onSubmit={handleSubmit}
                onError={handleError}
                onSuccess={handleSuccess}
              />
            </Stack>
          </Grid.Col>

          {/* RIGHT COLUMN: Test Information (30%) */}
          <Grid.Col span={{ base: 12, sm: 12, md: 3, lg: 3 }}>
            <Stack gap="md" className={styles.rightPanel}>
              <div>
                <Text fw={600} size="md" mb="md">
                  {labels.testInfo}
                </Text>

                {/* Test counts */}
                <Stack gap="md">
                  {/* Total tests */}
                  <div className={styles.testCard}>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        {labels.total}
                      </Text>
                      <Badge size="lg" variant="dot">
                        {totalTests}
                      </Badge>
                    </Group>
                  </div>

                  {/* Visible tests */}
                  {visibleTests > 0 && (
                    <div className={styles.testCard}>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {labels.visible}
                        </Text>
                        <Badge size="lg" variant="light" color="blue">
                          {visibleTests}
                        </Badge>
                      </Group>
                    </div>
                  )}

                  {/* Hidden tests */}
                  {hiddenTests > 0 && (
                    <div className={styles.testCard}>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {labels.hidden}
                        </Text>
                        <Badge size="lg" variant="light" color="gray">
                          {hiddenTests}
                        </Badge>
                      </Group>
                    </div>
                  )}
                </Stack>

                {/* Info note */}
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color="blue"
                  title="Thông tin kiểm tra"
                  mt="md"
                >
                  <Text size="xs">
                    Bài nộp của bạn sẽ được kiểm tra tự động với tất cả các test case. 
                    Một số test case có thể ẩn để đánh giá toàn diện.
                  </Text>
                </Alert>
              </div>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}
