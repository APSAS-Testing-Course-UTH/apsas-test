/**
 * Performance Chart Component
 * Displays score trends over time using Recharts
 */

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Paper, Text, Stack, Skeleton } from '@mantine/core'
import { PERFORMANCE_LABELS } from '../types'
import type { PerformanceTrendPoint } from '../types'
import styles from './PerformanceChart.module.css'

interface PerformanceChartProps {
  data: PerformanceTrendPoint[]
  isLoading?: boolean
  isEmpty?: boolean
}

/**
 * PerformanceChart - Displays score trends using LineChart
 */
export function PerformanceChart({ data, isLoading = false, isEmpty = false }: PerformanceChartProps) {
  if (isLoading) {
    return (
      <Paper className={styles.container} p="md">
        <Stack gap="md">
          <Skeleton height={30} radius="md" />
          <Skeleton height={300} radius="md" />
        </Stack>
      </Paper>
    )
  }

  if (isEmpty || !data.length) {
    return (
      <Paper className={styles.container} p="md">
        <Text size="sm" c="dimmed" ta="center" py="xl">
          {PERFORMANCE_LABELS.noData}
        </Text>
      </Paper>
    )
  }

  return (
    <Paper className={styles.container} p="md">
      <Stack gap="md">
        <div className={styles.header}>
          <Text fw={600} size="lg">
            {PERFORMANCE_LABELS.scoreOverTime}
          </Text>
        </div>

        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                label={{
                  value: 'Điểm',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px',
                }}
                formatter={(value) => [`${value}`, 'Điểm']}
                labelFormatter={(label) => `Ngày: ${label}`}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={() => 'Điểm số'}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ fill: '#8884d8', r: 4 }}
                activeDot={{ r: 6 }}
                name="Điểm"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.footer}>
          <Text size="xs" c="dimmed">
            Tổng số bài nộp: {data.length}
          </Text>
        </div>
      </Stack>
    </Paper>
  )
}

interface PassRateChartProps {
  totalSubmissions: number
  passedSubmissions: number
  failedSubmissions: number
  isLoading?: boolean
}

/**
 * PassRateChart - Displays passed/failed submissions using BarChart
 */
export function PassRateChart({
  totalSubmissions,
  passedSubmissions,
  failedSubmissions,
  isLoading = false,
}: PassRateChartProps) {
  if (isLoading) {
    return (
      <Paper className={styles.container} p="md">
        <Stack gap="md">
          <Skeleton height={30} radius="md" />
          <Skeleton height={200} radius="md" />
        </Stack>
      </Paper>
    )
  }

  if (totalSubmissions === 0) {
    return (
      <Paper className={styles.container} p="md">
        <Text size="sm" c="dimmed" ta="center" py="xl">
          {PERFORMANCE_LABELS.noData}
        </Text>
      </Paper>
    )
  }

  const data = [
    { name: 'Đạt', value: passedSubmissions, fill: '#52c41a' },
    { name: 'Không đạt', value: failedSubmissions, fill: '#f5222d' },
  ]

  return (
    <Paper className={styles.container} p="md">
      <Stack gap="md">
        <div className={styles.header}>
          <Text fw={600} size="lg">
            Tỷ lệ Đạt/Không đạt
          </Text>
        </div>

        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px',
                }}
                formatter={(value) => [`${value} bài`, 'Số lượng']}
              />
              <Bar dataKey="value" name="Số lượng" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.footer}>
          <Text size="xs" c="dimmed">
            {PERFORMANCE_LABELS.successRate}: {Math.round((passedSubmissions / totalSubmissions) * 100)}%
          </Text>
        </div>
      </Stack>
    </Paper>
  )
}
