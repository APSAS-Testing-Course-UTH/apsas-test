import { useMemo } from 'react'
import {
  Container,
  Grid,
  Paper,
  Stack,
  Title,
  Text,
  SimpleGrid,
  Group,
  ThemeIcon,
  Skeleton,
  Center,
} from '@mantine/core'
import {
  BarChart as ReChartsBarChart,
  LineChart as ReChartsLineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  IconTrendingUp,
  IconFileText,
  IconCheck,
  IconClock,
  IconAlertCircle,
} from '@tabler/icons-react'

import { useAssignmentsQuery } from '../api/useAssignmentsQuery'
import { useSkillsQuery } from '../api/useSkillsQuery'
import { useTutorialsQuery } from '../api/useTutorialsQuery'
import styles from './AnalyticsDashboard.module.css'

interface StatCard {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  description?: string
}

/**
 * AnalyticsDashboard Component
 * Hiển thị thống kê chi tiết về assignments, skills, tutorials
 * và hiệu suất của content provider
 *
 * @example
 * <AnalyticsDashboard />
 */
export function AnalyticsDashboard() {
  // Fetch data
  const { data: assignmentsData, isLoading: assignmentsLoading } = useAssignmentsQuery()
  const { data: skillsData, isLoading: skillsLoading } = useSkillsQuery()
  const { data: tutorialsData, isLoading: tutorialsLoading } = useTutorialsQuery()

  // Calculate statistics
  const stats = useMemo(() => {
    const assignments = assignmentsData?.content || []
    const skills = skillsData?.content || []
    const tutorials = tutorialsData?.content || []

    // Count by status
    const publishedAssignments = assignments.filter(a => a.status === 'PUBLISHED').length
    const draftAssignments = assignments.filter(a => a.status === 'DRAFT').length
    const archivedAssignments = assignments.filter(a => a.status === 'ARCHIVED').length

    return {
      totalAssignments: assignments.length,
      publishedAssignments,
      draftAssignments,
      archivedAssignments,
      totalSkills: skills.length,
      totalTutorials: tutorials.length,
    }
  }, [assignmentsData, skillsData, tutorialsData])

  // Prepare chart data for content distribution
  const contentDistributionData = useMemo(() => {
    return [
      { name: 'Bài tập', value: stats.totalAssignments, fill: '#1971c2' },
      { name: 'Kỹ năng', value: stats.totalSkills, fill: '#20c997' },
      { name: 'Hướng dẫn', value: stats.totalTutorials, fill: '#51cf66' },
    ]
  }, [stats])

  // Prepare chart data for assignment status
  const assignmentStatusData = useMemo(() => {
    return [
      { status: 'Đã xuất bản', count: stats.publishedAssignments, fill: '#1971c2' },
      { status: 'Bản nháp', count: stats.draftAssignments, fill: '#ffd43b' },
      { status: 'Đã lưu trữ', count: stats.archivedAssignments, fill: '#868e96' },
    ]
  }, [stats])

  // Prepare trending data (simulated)
  // TODO: Replace with real API call when backend provides historical/trending endpoint
  // Currently, no endpoint available in submission-service.json for historical data
  const trendingData = useMemo(() => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']
    return months.map((month) => ({
      month,
      'Bài tập mới': Math.floor(Math.random() * 10) + stats.totalAssignments * 0.3,
      'Kỹ năng mới': Math.floor(Math.random() * 5) + stats.totalSkills * 0.2,
    }))
  }, [stats])

  const isLoading = assignmentsLoading || skillsLoading || tutorialsLoading

  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Skeleton height={300} radius="md" />
          <Skeleton height={300} radius="md" />
        </Stack>
      </Container>
    )
  }

  const statCards: StatCard[] = [
    {
      title: 'Tổng bài tập',
      value: stats.totalAssignments,
      icon: <IconFileText size={24} />,
      color: 'blue',
      description: `${stats.publishedAssignments} xuất bản`,
    },
    {
      title: 'Tổng kỹ năng',
      value: stats.totalSkills,
      icon: <IconTrendingUp size={24} />,
      color: 'teal',
      description: `${stats.totalSkills} kỹ năng`,
    },
    {
      title: 'Tổng hướng dẫn',
      value: stats.totalTutorials,
      icon: <IconCheck size={24} />,
      color: 'green',
      description: 'Tài nguyên học tập',
    },
    {
      title: 'Bản nháp',
      value: stats.draftAssignments,
      icon: <IconClock size={24} />,
      color: 'yellow',
      description: 'Chờ xuất bản',
    },
  ]

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Title order={1}>Bảng phân tích</Title>
          <Text c="dimmed" size="sm">
            Theo dõi hiệu suất nội dung và quản lý tài nguyên của bạn
          </Text>
        </div>

        {/* Stats Grid */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          {statCards.map((stat, idx) => (
            <Paper key={idx} p="md" radius="md" withBorder className={styles.statCard}>
              <Group justify="space-between">
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Text size="sm" fw={500} c="dimmed">
                    {stat.title}
                  </Text>
                  <Text size="xl" fw={700}>
                    {stat.value}
                  </Text>
                  {stat.description && (
                    <Text size="xs" c="dimmed">
                      {stat.description}
                    </Text>
                  )}
                </Stack>
                <ThemeIcon size="lg" radius="md" variant="light" color={stat.color}>
                  {stat.icon}
                </ThemeIcon>
              </Group>
            </Paper>
          ))}
        </SimpleGrid>

        {/* Charts Grid */}
        <Grid gutter="md">
          {/* Content Distribution Chart */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="md" radius="md" withBorder>
              <Stack gap="md">
                <div>
                  <Title order={3}>Phân phối nội dung</Title>
                  <Text size="sm" c="dimmed">
                    Tổng số bài tập, kỹ năng và hướng dẫn
                  </Text>
                </div>
                {contentDistributionData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <ReChartsBarChart data={contentDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Số lượng" />
                    </ReChartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <Center h={300}>
                    <Stack gap="sm" align="center">
                      <IconAlertCircle size={32} color="gray" />
                      <Text c="dimmed">Chưa có dữ liệu</Text>
                    </Stack>
                  </Center>
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Assignment Status Chart */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="md" radius="md" withBorder>
              <Stack gap="md">
                <div>
                  <Title order={3}>Trạng thái bài tập</Title>
                  <Text size="sm" c="dimmed">
                    Phân bổ bài tập theo trạng thái
                  </Text>
                </div>
                {assignmentStatusData.some(d => d.count > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <ReChartsBarChart data={assignmentStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Số lượng" fill="#20c997" />
                    </ReChartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <Center h={300}>
                    <Stack gap="sm" align="center">
                      <IconAlertCircle size={32} color="gray" />
                      <Text c="dimmed">Chưa có dữ liệu</Text>
                    </Stack>
                  </Center>
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Trending Chart */}
          <Grid.Col span={12}>
            <Paper p="md" radius="md" withBorder>
              <Stack gap="md">
                <div>
                  <Title order={3}>Xu hướng 6 tháng gần đây</Title>
                  <Text size="sm" c="dimmed">
                    Số lượng bài tập và kỹ năng mới được tạo
                  </Text>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ReChartsLineChart data={trendingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Bài tập mới"
                      stroke="#1971c2"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Kỹ năng mới"
                      stroke="#20c997"
                      strokeWidth={2}
                    />
                  </ReChartsLineChart>
                </ResponsiveContainer>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}
