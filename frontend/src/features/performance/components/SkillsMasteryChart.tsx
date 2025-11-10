/**
 * SkillsMasteryChart Component
 * Displays skills mastery levels using a RadarChart
 * Shows proficiency percentage for each skill attempted
 */

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Paper, Text, Stack, Skeleton } from '@mantine/core'
import type { SkillProgress } from '../types'
import styles from './PerformanceChart.module.css'

interface SkillsMasteryChartProps {
  skillsProgress?: SkillProgress[]
  isLoading?: boolean
  isEmpty?: boolean
}

interface SkillRadarData {
  name: string
  value: number
  fullMark: 100
}

/**
 * Transform skills progress to radar chart format
 */
function transformSkillsForRadar(
  skillsProgress: SkillProgress[] | undefined
): SkillRadarData[] {
  if (!skillsProgress || skillsProgress.length === 0) {
    return []
  }

  // Map skills to radar data format, limiting to top 4 skills for readability
  const result = skillsProgress.slice(0, 4).map((skill) => ({
    name: skill.skillName.replace('Assignment ', ''),  // Shorten label for display
    value: Math.round(skill.progressPercentage),
    fullMark: 100,
  }));
  
  return result;
}

/**
 * SkillsMasteryChart - Radar chart showing skill proficiency levels
 */
export function SkillsMasteryChart({
  skillsProgress,
  isLoading = false,
  isEmpty = false,
}: SkillsMasteryChartProps) {
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

  const radarData = transformSkillsForRadar(skillsProgress);

  if (isEmpty || radarData.length === 0) {
    return (
      <Paper className={styles.container} p="md">
        <Text size="sm" c="dimmed" ta="center" py="xl">
          Chưa thử bất kỳ kỹ năng nào
        </Text>
      </Paper>
    )
  }

  return (
    <Paper className={styles.container} p="md">
      <Stack gap="md">
        <div className={styles.header}>
          <Text fw={600} size="lg">
            Thành Thạo Kỹ Năng
          </Text>
        </div>

        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart
              data={radarData}
              margin={{ top: 40, right: 100, bottom: 40, left: 100 }}
            >
              <PolarGrid stroke="#e0e0e0" strokeDasharray="0" />
              <PolarAngleAxis
                dataKey="name"
                tick={({ x, y, payload }) => (
                  <text
                    x={x}
                    y={y}
                    textAnchor={x > 300 ? 'start' : x < 100 ? 'end' : 'middle'}
                    fill="#666"
                    fontSize="11"
                  >
                    {payload.value}
                  </text>
                )}
                angle={90}
                type="category"
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#666' }}
                angle={0}
                type="number"
              />
              <Radar
                name="Mức độ Thành Thạo (%)"
                dataKey="value"
                stroke="#1890ff"
                fill="#1890ff"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px',
                }}
                formatter={(value: number) => [`${value}%`, 'Mức độ']}
                labelFormatter={(label) => `${label}`}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                verticalAlign="bottom"
                height={36}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.footer}>
          <Text size="xs" c="dimmed">
            Được cập nhật lần cuối từ lần nộp gần nhất
          </Text>
        </div>
      </Stack>
    </Paper>
  )
}
