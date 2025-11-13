/**
 * ScoreDistributionChart Component
 * Displays distribution of scores across grade ranges using a PieChart
 * Shows breakdown of submissions by grade (A, B, C, D, F)
 */

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Paper, Text, Stack, Skeleton } from '@mantine/core'
import type { SubmissionServiceSubmissionResponse } from '@/api/types.gen'
import styles from './PerformanceChart.module.css'

interface ScoreDistributionChartProps {
  submissions?: SubmissionServiceSubmissionResponse[]
  isLoading?: boolean
  isEmpty?: boolean
}

interface GradeDistribution {
  name: string
  value: number
  fill: string
  grade: string
}

/**
 * Calculate grade distribution from submissions
 * Grades: A (90-100), B (80-89), C (70-79), D (60-69), F (0-59)
 */
function calculateGradeDistribution(
  submissions: SubmissionServiceSubmissionResponse[] | undefined
): GradeDistribution[] {
  if (!submissions || submissions.length === 0) {
    return []
  }

  // Initialize grade counters
  const grades = {
    A: 0, // 90-100
    B: 0, // 80-89
    C: 0, // 70-79
    D: 0, // 60-69
    F: 0, // 0-59
  }

  // Count submissions by grade
  submissions.forEach((submission) => {
    const score = submission.score ?? 0
    if (score >= 90) grades.A++
    else if (score >= 80) grades.B++
    else if (score >= 70) grades.C++
    else if (score >= 60) grades.D++
    else grades.F++
  })

  // Transform to chart data format
  const data: GradeDistribution[] = [
    { name: 'Loại A (90-100)', value: grades.A, fill: '#52c41a', grade: 'A' },
    { name: 'Loại B (80-89)', value: grades.B, fill: '#1890ff', grade: 'B' },
    { name: 'Loại C (70-79)', value: grades.C, fill: '#faad14', grade: 'C' },
    { name: 'Loại D (60-69)', value: grades.D, fill: '#ff7a45', grade: 'D' },
    { name: 'Loại F (0-59)', value: grades.F, fill: '#f5222d', grade: 'F' },
  ]

  // Filter out grades with 0 submissions
  return data.filter((d) => d.value > 0)
}

/**
 * ScoreDistributionChart - Pie chart showing score distribution by grade
 */
export function ScoreDistributionChart({
  submissions,
  isLoading = false,
  isEmpty = false,
}: ScoreDistributionChartProps) {
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

  const gradeData = calculateGradeDistribution(submissions)

  if (isEmpty || gradeData.length === 0) {
    return (
      <Paper className={styles.container} p="md">
        <Text size="sm" c="dimmed" ta="center" py="xl">
          Không có dữ liệu điểm số
        </Text>
      </Paper>
    )
  }

  const totalSubmissions = gradeData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Paper className={styles.container} p="md">
      <Stack gap="md">
        <div className={styles.header}>
          <Text fw={600} size="lg">
            Phân Bố Điểm Số
          </Text>
        </div>

        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gradeData as any}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) =>
                  `${name}: ${value} (${((percent as number) * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {gradeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px',
                }}
                formatter={(value: number) => {
                  const percentage = ((value / totalSubmissions) * 100).toFixed(1)
                  return [`${value} bài (${percentage}%)`, 'Số lượng']
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                verticalAlign="bottom"
                height={36}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.footer}>
          <Text size="xs" c="dimmed">
            Tổng cộng: {totalSubmissions} bài nộp
          </Text>
        </div>
      </Stack>
    </Paper>
  )
}
