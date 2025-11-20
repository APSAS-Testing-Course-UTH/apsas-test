/**\n * Performance Page Component
 * Main dashboard for displaying student performance analytics
 */

import { useState, useMemo } from 'react'
import { Container, Grid, Stack, Group, Text, ThemeIcon, Paper, Skeleton, Center, Pagination } from '@mantine/core'
import { IconTrendingUp, IconTarget, IconCheck, IconX } from '@tabler/icons-react'
import { useStudentPerformance, useStudentHistory, useAllAssignments } from '../api/hooks'
import { PerformanceChart, PassRateChart } from './PerformanceChart'
import { ScoreDistributionChart } from './ScoreDistributionChart'
import { SubmissionHistory } from './SubmissionHistory'
import { PERFORMANCE_LABELS } from '../types'
import styles from './PerformancePage.module.css'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  isLoading?: boolean
}

function StatCard({ icon, label, value, color, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Paper p="md" className={styles.statCard}>
        <Stack gap="xs">
          <Skeleton height={24} width="30%" radius="md" />
          <Skeleton height={32} radius="md" />
        </Stack>
      </Paper>
    )
  }

  return (
    <Paper p="md" className={`${styles.statCard} ${styles[`statCard${color}`]}`}>
      <Group justify="space-between">
        <Stack gap={0}>
          <Text size="sm" fw={500} c="dimmed">
            {label}
          </Text>
          <Text size="xl" fw={700} mt="xs">
            {value}
          </Text>
        </Stack>
        <ThemeIcon size="lg" radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  )
}

/**
 * PerformancePage - Main performance analytics dashboard
 */
export function PerformancePage() {
  const [historyPage, setHistoryPage] = useState(0)
  const historyPageSize = 10
  
  const { data: overviewData, isLoading: overviewLoading } = useStudentPerformance()
  const { data: historyData, isLoading: historyLoading } = useStudentHistory(historyPage, historyPageSize)
  const { data: assignments = [] } = useAllAssignments()

  const isLoading = overviewLoading || historyLoading
  const error = null

  // Transform new API data to existing component structure
  const stats = useMemo(() => {
    if (!overviewData || typeof overviewData !== 'object') {
      return {
        totalSubmissions: 0,
        passedSubmissions: 0,
        failedSubmissions: 0,
        successRate: 0,
        averageScore: 0,
        totalSkillsAttempted: 0,
        skillsPassedCount: 0,
      }
    }

    return {
      totalSubmissions: overviewData.totalSubmissions || 0,
      passedSubmissions: overviewData.passedSubmissions || 0,
      failedSubmissions: overviewData.failedSubmissions || 0,
      successRate: Math.round(overviewData.successRate || 0),
      averageScore: Math.round(overviewData.averageScore || 0),
      totalSkillsAttempted: overviewData.totalSubmissions || 0,
      skillsPassedCount: overviewData.passedSubmissions || 0,
    }
  }, [overviewData])

  // Transform submission history to trend data with assignment names
  const trendData = useMemo(() => {
    if (!historyData || typeof historyData !== 'object') return []

    if (!historyData.content || !Array.isArray(historyData.content)) return []

    // Create assignment name map
    const assignmentMap = new Map()
    assignments.forEach((assignment: any) => {
      assignmentMap.set(assignment.id, assignment.title)
    })

    return historyData.content.map((item) => ({
      date: item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('vi-VN') : 'N/A',
      score: item.score || 0,
      status: item.result === 'PASSED' ? ('passed' as const) : ('failed' as const),
      assignmentTitle: assignmentMap.get(item.assignmentId) || item.assignmentId || 'Bài tập không xác định',
      submissionId: item.id || '',
    }))
  }, [historyData, assignments])

  const isEmpty = !overviewData || overviewData.totalSubmissions === 0

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Page Header */}
        <div className={styles.header}>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xl" fw={700}>
                Biểu đồ Hiệu suất
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Xem chi tiết hiệu suất học tập và tiến độ của bạn
              </Text>
            </div>
            {/* {!isLoading && (
              <Button variant="light" size="sm" onClick={() => window.location.reload()}>
                {PERFORMANCE_LABELS.refresh}
              </Button>
            )} */}
          </Group>
        </div>

        {error && (
          <Paper p="md" bg="red.0" c="red.9" radius="md" className={styles.errorMessage}>
            <Text fw={500}>{PERFORMANCE_LABELS.error}</Text>
            <Text size="sm">Vui lòng thử lại sau</Text>
          </Paper>
        )}

        {isLoading ? (
          // Comprehensive Loading Skeleton
          <>
            {/* Statistics Cards Skeleton */}
            <Grid gutter="md">
              {[1, 2, 3, 4].map((i) => (
                <Grid.Col key={i} span={{ base: 12, sm: 6, md: 3 }}>
                  <Paper p="md" className={styles.statCard}>
                    <Stack gap="xs">
                      <Skeleton height={14} width="40%" radius="md" />
                      <Skeleton height={32} width="60%" radius="md" />
                    </Stack>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>

            {/* Charts Section Skeleton */}
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="md" className={styles.chartCard}>
                  <Stack gap="md">
                    <Skeleton height={24} width="40%" radius="md" />
                    <Skeleton height={300} radius="md" />
                  </Stack>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="md" className={styles.chartCard}>
                  <Stack gap="md">
                    <Skeleton height={24} width="40%" radius="md" />
                    <Skeleton height={300} radius="md" />
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>

            {/* Submission History Skeleton */}
            <Paper p="md" className={styles.historyCard}>
              <Stack gap="md">
                <Skeleton height={24} width="35%" radius="md" />
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} height={70} radius="md" />
                ))}
              </Stack>
            </Paper>
          </>
        ) : isEmpty && !isLoading ? (
          <Paper p="xl" ta="center" className={styles.emptyState}>
            <ThemeIcon size="xl" radius="md" variant="light" mb="md">
              <IconTarget size={28} />
            </ThemeIcon>
            <Text fw={500} mb="xs">
              Chưa có dữ liệu hiệu suất
            </Text>
            <Text size="sm" c="dimmed">
              Hãy nộp bài tập để xem hiệu suất của bạn
            </Text>
          </Paper>
        ) : (
          <>
            {/* Statistics Cards */}
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<IconTrendingUp size={20} />}
                  label={PERFORMANCE_LABELS.totalSubmissions}
                  value={stats.totalSubmissions}
                  color="blue"
                  isLoading={isLoading}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<IconCheck size={20} />}
                  label={PERFORMANCE_LABELS.passedSubmissions}
                  value={stats.passedSubmissions}
                  color="green"
                  isLoading={isLoading}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<IconX size={20} />}
                  label={PERFORMANCE_LABELS.failedSubmissions}
                  value={stats.failedSubmissions}
                  color="red"
                  isLoading={isLoading}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<IconTarget size={20} />}
                  label={PERFORMANCE_LABELS.successRate}
                  value={`${stats.successRate}%`}
                  color="cyan"
                  isLoading={isLoading}
                />
              </Grid.Col>
            </Grid>

            {/* Charts Section */}
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <PerformanceChart
                  data={trendData}
                  isLoading={isLoading}
                  isEmpty={!trendData.length}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <PassRateChart
                  totalSubmissions={stats.totalSubmissions}
                  passedSubmissions={stats.passedSubmissions}
                  failedSubmissions={stats.failedSubmissions}
                  isLoading={isLoading}
                />
              </Grid.Col>
            </Grid>

            {/* Score Distribution Chart */}
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 12 }}>
                <ScoreDistributionChart
                  submissions={
                    historyData && Array.isArray(historyData.content)
                      ? historyData.content
                      : []
                  }
                  isLoading={isLoading}
                  isEmpty={isEmpty}
                />
              </Grid.Col>
            </Grid>

            {/* Submission History Section with Pagination */}
            <Stack gap="md">
              <SubmissionHistory
                submissions={trendData}
                isLoading={isLoading}
              />

              {/* Show pagination if there are multiple pages */}
              {historyData && typeof historyData === 'object' && 'totalPages' in historyData && (historyData as any).totalPages > 1 ? (
                <Center>
                  <Pagination
                    value={historyPage + 1}
                    onChange={(value) => setHistoryPage(value - 1)}
                    total={(historyData as any).totalPages}
                    size="sm"
                  />
                </Center>
              ) : null}
            </Stack>

            {/* Additional Stats */}
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Paper p="md" className={styles.infoCard}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed" fw={500}>
                        {PERFORMANCE_LABELS.averageScore}
                      </Text>
                      <Text size="xl" fw={700} mt="xs">
                        {stats.averageScore}
                      </Text>
                    </div>
                    <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                      <Text fw={700}>/100</Text>
                    </ThemeIcon>
                  </Group>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Paper p="md" className={styles.infoCard}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed" fw={500}>
                        {PERFORMANCE_LABELS.skillsPassedCount}
                      </Text>
                      <Text size="xl" fw={700} mt="xs">
                        {stats.skillsPassedCount} / {stats.totalSkillsAttempted}
                      </Text>
                    </div>
                    <ThemeIcon variant="light" color="green" size="lg" radius="md">
                      <IconCheck size={20} />
                    </ThemeIcon>
                  </Group>
                </Paper>
              </Grid.Col>
            </Grid>
          </>
        )}
      </Stack>
    </Container>
  )
}