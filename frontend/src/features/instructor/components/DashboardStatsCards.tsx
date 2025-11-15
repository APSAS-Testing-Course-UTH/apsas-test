/**
 * Dashboard Stats Cards
 * Vietnamese: Thẻ thống kê bảng điều khiển
 * 
 * Displays key metrics for instructor dashboard using StatsCard component
 * Reuses pattern from student dashboard for consistency
 */

import { Grid, Skeleton, Alert, Stack, Text } from '@mantine/core'
import {
  IconUsers,
  IconAlertCircle,
  IconTrendingUp,
} from '@tabler/icons-react'
import { StatsCard } from '@/features/dashboard/components'
import type { InstructorDashboardStats } from '../types/instructor.types'

export interface DashboardStatsCardsProps {
  stats: InstructorDashboardStats | undefined
  isLoading: boolean
}

export function DashboardStatsCards({ stats, isLoading }: DashboardStatsCardsProps) {
  // Loading state: Show skeleton for 5 cards
  if (isLoading) {
    return (
      <Grid gutter="lg">
        {[1, 2, 3, 4, 5].map((i) => (
          <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
            <Skeleton height={140} radius="md" />
          </Grid.Col>
        ))}
      </Grid>
    )
  }

  // Error state: Show alert if no stats
  if (!stats) {
    return (
      <Alert icon="⚠️" color="red" title="Lỗi">
        <Stack gap="xs">
          <Text size="sm">Không thể tải thống kê. Vui lòng thử lại sau.</Text>
        </Stack>
      </Alert>
    )
  }

  return (
    <Grid gutter="lg">
      {/* 1. Active Assignments Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
        <StatsCard
          title="Bài tập đang hoạt động"
          value={stats.activeAssignments}
          icon={<IconUsers size={20} />}
          color="blue"
          trend={{
            value: 0,
            label: "Công bố cho sinh viên",
            direction: "up",
          }}
        />
      </Grid.Col>

      {/* 2. Pending Evaluations Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
        <StatsCard
          title="Bài nộp chờ chấm"
          value={stats.pendingEvaluations}
          icon={<IconAlertCircle size={20} />}
          color={stats.pendingEvaluations > 0 ? 'orange' : 'green'}
          trend={{
            value: Math.max(0, stats.pendingEvaluations),
            label: "Cần được đánh giá",
            direction: "down",
          }}
        />
      </Grid.Col>

      {/* 3. Total Students Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
        <StatsCard
          title="Sinh viên trong khóa"
          value={stats.totalStudents}
          icon={<IconUsers size={20} />}
          color="green"
          trend={{
            value: 0,
            label: "Đã đăng ký",
            direction: "up",
          }}
        />
      </Grid.Col>

      {/* 4. Completion Rate Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
        <StatsCard
          title="Tỷ lệ hoàn thành"
          value={`${stats.completionRate}%`}
          icon={<IconTrendingUp size={20} />}
          color="purple"
          trend={{
            value: Math.max(0, stats.completionRate),
            label: "Của sinh viên",
            direction: "up",
          }}
        />
      </Grid.Col>

      {/* 5. Average Score Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 2.4 }}>
        <StatsCard
          title="Điểm trung bình"
          value={stats.averageScore.toFixed(1)}
          icon={<IconTrendingUp size={20} />}
          color="cyan"
          trend={{
            value: Math.round(stats.averageScore),
            label: "Điểm tất cả sinh viên",
            direction: "up",
          }}
        />
      </Grid.Col>
    </Grid>
  )
}
