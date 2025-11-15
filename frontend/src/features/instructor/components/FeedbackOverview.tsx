/**
 * Feedback Overview Component
 * Vietnamese: Tổng quan Phản hồi
 * 
 * Displays:
 * - Feedback statistics
 * - Submissions with/without feedback
 * - Feedback provided history
 * - Analytics on grading progress
 */

import { useState } from 'react'
import { Card, Stack, Title, Text, Grid, Badge, Button, Table, Tabs, Skeleton, Alert, Group } from '@mantine/core'
import { IconCircleCheck, IconAlertCircle, IconClock } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'

export interface FeedbackStats {
  totalSubmissions: number
  submissionsWithFeedback: number
  submissionsPending: number
  submissionsWithoutFeedback: number
  avgFeedbackTime: number // in hours
}

export interface FeedbackItem {
  submissionId: string
  studentName: string
  studentEmail: string
  assignmentTitle: string
  submittedAt: string
  feedbackProvidedAt?: string
  feedbackText?: string
  score?: number
}

interface FeedbackOverviewProps {
  stats?: FeedbackStats
  feedbackHistory?: FeedbackItem[]
  isLoading?: boolean
}

export function FeedbackOverview({ 
  stats, 
  feedbackHistory, 
  isLoading = false 
}: FeedbackOverviewProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string | null>('overview')

  // Default empty stats
  const defaultStats: FeedbackStats = {
    totalSubmissions: 0,
    submissionsWithFeedback: 0,
    submissionsPending: 0,
    submissionsWithoutFeedback: 0,
    avgFeedbackTime: 0,
  }

  const displayStats = stats || defaultStats

  // Loading state
  if (isLoading) {
    return (
      <Card withBorder shadow="sm" p="lg" radius="md">
        <Stack gap="md">
          <Title order={3}>Phản hồi</Title>
          <Skeleton height={300} radius="md" />
        </Stack>
      </Card>
    )
  }

  const feedbackPercentage = displayStats.totalSubmissions > 0
    ? Math.round((displayStats.submissionsWithFeedback / displayStats.totalSubmissions) * 100)
    : 0

  const pendingPercentage = displayStats.totalSubmissions > 0
    ? Math.round((displayStats.submissionsPending / displayStats.totalSubmissions) * 100)
    : 0

  return (
    <Stack gap="lg">
      {/* Stats Cards */}
      <Grid gutter="lg">
        {/* Total Submissions Card */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow="sm" p="lg" radius="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" fw={500} c="dimmed">
                  Tổng bài nộp
                </Text>
              </Group>
              <Text size="h2" fw={700}>
                {displayStats.totalSubmissions}
              </Text>
              <Text size="xs" c="dimmed">
                Số lượng bài nộp tất cả
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Feedback Completed Card */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow="sm" p="lg" radius="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" fw={500} c="dimmed">
                  Đã phản hồi
                </Text>
                <IconCircleCheck size={20} color="var(--mantine-color-green-6)" />
              </Group>
              <Text size="h2" fw={700}>
                {displayStats.submissionsWithFeedback}
              </Text>
              <Badge size="lg" color="green" variant="light">
                {feedbackPercentage}%
              </Badge>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Pending Feedback Card */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow="sm" p="lg" radius="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" fw={500} c="dimmed">
                  Chưa phản hồi
                </Text>
                <IconAlertCircle size={20} color="var(--mantine-color-orange-6)" />
              </Group>
              <Text size="h2" fw={700}>
                {displayStats.submissionsPending}
              </Text>
              <Badge size="lg" color="orange" variant="light">
                {pendingPercentage}%
              </Badge>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Avg Feedback Time Card */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder shadow="sm" p="lg" radius="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" fw={500} c="dimmed">
                  Thời gian trung bình
                </Text>
                <IconClock size={20} color="var(--mantine-color-blue-6)" />
              </Group>
              <Text size="h2" fw={700}>
                {displayStats.avgFeedbackTime.toFixed(1)}h
              </Text>
              <Text size="xs" c="dimmed">
                Từ nộp đến phản hồi
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Feedback History & Analytics */}
      <Card withBorder shadow="sm" p="lg" radius="md">
        <Stack gap="md">
          <Title order={3}>Lịch sử Phản hồi</Title>

          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="overview">
                Tổng quan
              </Tabs.Tab>
              <Tabs.Tab value="provided">
                Đã phản hồi ({displayStats.submissionsWithFeedback})
              </Tabs.Tab>
              <Tabs.Tab value="pending">
                Chờ phản hồi ({displayStats.submissionsPending})
              </Tabs.Tab>
            </Tabs.List>

            {/* Overview Tab */}
            <Tabs.Panel value="overview" pt="md">
              <Stack gap="md">

                {feedbackHistory && feedbackHistory.length > 0 && (
                  <div>
                    <Text fw={500} mb="xs">
                      Phản hồi gần đây
                    </Text>
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Sinh viên</Table.Th>
                          <Table.Th>Bài tập</Table.Th>
                          <Table.Th>Trạng thái</Table.Th>
                          <Table.Th>Hành động</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {feedbackHistory.slice(0, 5).map((item) => (
                          <Table.Tr key={item.submissionId}>
                            <Table.Td>
                              <Stack gap={0}>
                                <Text size="sm" fw={500}>
                                  {item.studentName}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {item.studentEmail}
                                </Text>
                              </Stack>
                            </Table.Td>
                            <Table.Td>{item.assignmentTitle}</Table.Td>
                            <Table.Td>
                              <Badge color={item.feedbackProvidedAt ? 'green' : 'orange'}>
                                {item.feedbackProvidedAt ? 'Đã phản hồi' : 'Chưa phản hồi'}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Button
                                size="xs"
                                onClick={() =>
                                  navigate({
                                    to: '/instructor/submissions/$id',
                                    params: { id: item.submissionId },
                                  })
                                }
                              >
                                Chi tiết
                              </Button>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </div>
                )}
              </Stack>
            </Tabs.Panel>

            {/* Provided Tab */}
            <Tabs.Panel value="provided" pt="md">
              {feedbackHistory && feedbackHistory.filter(f => f.feedbackProvidedAt).length > 0 ? (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Sinh viên</Table.Th>
                      <Table.Th>Bài tập</Table.Th>
                      <Table.Th>Điểm</Table.Th>
                      <Table.Th>Phản hồi lúc</Table.Th>
                      <Table.Th>Hành động</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {feedbackHistory
                      .filter(f => f.feedbackProvidedAt)
                      .map((item) => (
                        <Table.Tr key={item.submissionId}>
                          <Table.Td>
                            <Stack gap={0}>
                              <Text size="sm" fw={500}>
                                {item.studentName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {item.studentEmail}
                              </Text>
                            </Stack>
                          </Table.Td>
                          <Table.Td>{item.assignmentTitle}</Table.Td>
                          <Table.Td>
                            <Badge color={item.score && item.score >= 70 ? 'green' : 'orange'}>
                              {item.score || 0}%
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" c="dimmed">
                              {item.feedbackProvidedAt
                                ? new Date(item.feedbackProvidedAt).toLocaleDateString('vi-VN')
                                : '—'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Button
                              size="xs"
                              onClick={() =>
                                navigate({
                                  to: '/instructor/submissions/$id',
                                  params: { id: item.submissionId },
                                })
                              }
                            >
                              Xem
                            </Button>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                  </Table.Tbody>
                </Table>
              ) : (
                <Text c="dimmed" ta="center" py="lg">
                  Chưa có phản hồi nào
                </Text>
              )}
            </Tabs.Panel>

            {/* Pending Tab */}
            <Tabs.Panel value="pending" pt="md">
              {feedbackHistory && feedbackHistory.filter(f => !f.feedbackProvidedAt).length > 0 ? (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Sinh viên</Table.Th>
                      <Table.Th>Bài tập</Table.Th>
                      <Table.Th>Nộp lúc</Table.Th>
                      <Table.Th>Hành động</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {feedbackHistory
                      .filter(f => !f.feedbackProvidedAt)
                      .map((item) => (
                        <Table.Tr key={item.submissionId}>
                          <Table.Td>
                            <Stack gap={0}>
                              <Text size="sm" fw={500}>
                                {item.studentName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {item.studentEmail}
                              </Text>
                            </Stack>
                          </Table.Td>
                          <Table.Td>{item.assignmentTitle}</Table.Td>
                          <Table.Td>
                            <Text size="sm" c="dimmed">
                              {new Date(item.submittedAt).toLocaleDateString('vi-VN')}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Button
                              size="xs"
                              color="orange"
                              onClick={() =>
                                navigate({
                                  to: '/instructor/submissions/$id',
                                  params: { id: item.submissionId },
                                })
                              }
                            >
                              Phản hồi
                            </Button>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                  </Table.Tbody>
                </Table>
              ) : (
                <Text c="dimmed" ta="center" py="lg">
                  Không có bài chờ phản hồi
                </Text>
              )}
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Card>
    </Stack>
  )
}
