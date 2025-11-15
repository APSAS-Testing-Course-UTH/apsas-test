/**
 * Upcoming Deadlines Section (1 month)
 * Vietnamese: Lịch trình gần đây (1 tháng)
 * 
 * Displays upcoming assignment deadlines in next 30 days
 * Reuses pattern from student dashboard for consistency
 */

import {
  Card,
  Stack,
  Text,
  Button,
  Badge,
  Group,
  Skeleton,
  Title,
  Alert,
} from '@mantine/core'
import { IconClock, IconArrowRight, IconAlertTriangle } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import type { UpcomingDeadline } from '../types/instructor.types'

export interface UpcomingDeadlinesProps {
  deadlines: UpcomingDeadline[] | undefined
  isLoading: boolean
}

export function UpcomingDeadlines({ deadlines, isLoading }: UpcomingDeadlinesProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <Card withBorder shadow="sm" p="lg" radius="md" h="100%" style={{ minHeight: '500px' }}>
        <Stack gap="md" h="100%">
          <Title order={3}>Lịch trình gần đây (1 tháng)</Title>
          <Skeleton height="100%" radius="md" />
        </Stack>
      </Card>
    )
  }

  if (!deadlines || deadlines.length === 0) {
    return (
      <Card withBorder shadow="sm" p="lg" radius="md" h="100%" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
        <Stack gap="md" h="100%">
          <Title order={3}>Lịch trình gần đây (1 tháng)</Title>
          <Stack flex={1} justify="center" align="center">
            <Text c="dimmed" size="sm" ta="center">
              Không có deadline trong 30 ngày tới
            </Text>
          </Stack>
        </Stack>
      </Card>
    )
  }

  // Sort by due date and limit to next 30 days
  const now = new Date()
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const filteredDeadlines = deadlines
    .filter((d) => {
      const dueDate = new Date(d.dueDate)
      return dueDate >= now && dueDate <= thirtyDaysLater
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  return (
    <Card withBorder shadow="sm" p="lg" radius="md" h="100%" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
      <Stack gap="md" h="100%">
        <Group justify="space-between">
          <Title order={3}>Lịch trình gần đây (1 tháng)</Title>
          <Button
            variant="subtle"
            size="xs"
            rightSection={<IconArrowRight size={14} />}
            onClick={() => navigate({ to: '/instructor/schedule' })}
          >
            Xem tất cả
          </Button>
        </Group>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <Stack gap="sm">
          {filteredDeadlines.map((deadline) => {
            const dueDate = new Date(deadline.dueDate)
            const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
            const isUrgent = daysRemaining <= 3
            const submissionPercent = deadline.totalStudents > 0
              ? Math.round((deadline.submissionCount / deadline.totalStudents) * 100)
              : 0

            return (
              <div
                key={deadline.assignmentId}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: isUrgent ? 'var(--mantine-color-orange-0)' : 'var(--mantine-color-gray-0)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onClick={() =>
                  navigate({
                    to: '/instructor/assignments/$id',
                    params: { id: deadline.assignmentId },
                  })
                }
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.backgroundColor = isUrgent
                    ? 'var(--mantine-color-orange-1)'
                    : 'var(--mantine-color-gray-1)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.backgroundColor = isUrgent
                    ? 'var(--mantine-color-orange-0)'
                    : 'var(--mantine-color-gray-0)'
                }}
              >
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Group gap="xs" align="center">
                      {isUrgent && <IconAlertTriangle size={18} color="var(--mantine-color-orange-6)" />}
                      <Text fw={500} size="sm" style={{ flex: 1 }}>
                        {deadline.assignmentTitle}
                      </Text>
                    </Group>
                    <Group gap="xs" justify="space-between">
                      <Group gap={4}>
                        <IconClock size={14} />
                        <Text size="xs" c="dimmed">
                          {dueDate.toLocaleDateString('vi-VN')}
                        </Text>
                      </Group>
                      <Badge size="sm" variant="light" color={submissionPercent === 100 ? 'green' : 'blue'}>
                        {submissionPercent}% ({deadline.submissionCount}/{deadline.totalStudents})
                      </Badge>
                    </Group>
                  </Stack>
                  <Badge
                    color={
                      daysRemaining > 7
                        ? 'green'
                        : daysRemaining > 3
                          ? 'orange'
                          : 'red'
                    }
                    variant="light"
                    size="sm"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {daysRemaining} ngày
                  </Badge>
                </Group>
              </div>
            )
          })}
        </Stack>
        </div>

        {filteredDeadlines.length < deadlines.length && (
          <Alert icon="ℹ️" color="blue" title="Gợi ý">
            <Text size="xs">
              Có thêm {deadlines.length - filteredDeadlines.length} deadline ngoài 30 ngày. Nhấp "Xem tất cả" để quản lý.
            </Text>
          </Alert>
        )}
      </Stack>
    </Card>
  )
}
