import { Card, Group, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react'
import type { MantineColor } from '@mantine/core'
import classes from './StatsCard.module.css'

interface StatsCardProps {
  /** Tiêu đề thẻ thống kê (Vietnamese) */
  title: string
  /** Giá trị hiển thị (số hoặc chuỗi) */
  value: string | number
  /** Icon cho thẻ */
  icon: React.ReactNode
  /** Màu chủ đạo (default: blue) */
  color?: MantineColor
  /** Xu hướng thay đổi (optional) */
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down'
  }
}

/**
 * StatsCard - Thẻ hiển thị thống kê với icon, giá trị và xu hướng
 * 
 * @example
 * ```tsx
 * <StatsCard 
 *   title="Tổng bài tập"
 *   value={24}
 *   icon={<IconBook />}
 *   color="blue"
 *   trend={{ value: 15, label: "so với tuần trước", direction: "up" }}
 * />
 * ```
 */
export function StatsCard({ title, value, icon, color = 'blue', trend }: StatsCardProps) {
  return (
    <Card 
      withBorder 
      shadow="sm" 
      p="lg" 
      className={classes.card} 
      style={{ height: '160px', display: 'flex', flexDirection: 'column' }}
    >
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Text size="sm" fw={500} c="dimmed" className={classes.title} lineClamp={1} style={{ flex: 1, overflow: 'hidden' }}>
          {title}
        </Text>
        <ThemeIcon color={color} variant="light" size="lg" radius="md" style={{ flexShrink: 0 }}>
          {icon}
        </ThemeIcon>
      </Group>

      <Stack gap="xs" style={{ flex: 1, overflow: 'hidden' }}>
        <Text size="xl" fw={700} className={classes.value}>
          {value}
        </Text>

        {trend && (
          <Group gap="xs" wrap="nowrap" style={{ overflow: 'hidden' }}>
            <Group gap={4} style={{ flexShrink: 0 }}>
              {trend.direction === 'up' ? (
                <IconArrowUp size={16} className={classes.trendIconUp} />
              ) : (
                <IconArrowDown size={16} className={classes.trendIconDown} />
              )}
              <Text size="sm" fw={500} className={trend.direction === 'up' ? classes.trendUp : classes.trendDown} style={{ whiteSpace: 'nowrap' }}>
                {trend.value}%
              </Text>
            </Group>
            <Text size="sm" c="dimmed" lineClamp={1} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {trend.label}
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  )
}
