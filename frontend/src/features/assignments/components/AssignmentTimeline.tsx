/**
 * AssignmentTimeline Component
 * Displays assignment scheduling information including:
 * - Start date, due date, timeline summary
 * - Urgency level with color-coded badge
 * - Deadline status text (countdown or overdue)
 * - Vietnamese localization throughout
 */

import { Stack, Text, Group, Badge, Card, ThemeIcon } from '@mantine/core'
import { IconCalendar, IconClock, IconAlertTriangle } from '@tabler/icons-react'
import {
  formatDateWithDay,
  getUrgencyLevel,
  getUrgencyLabel,
  getDeadlineStatusText,
  formatAssignmentTimeline,
} from '@/utils/dateUtils'
import { mapUrgencyToBadgeColor } from '@/components/utils/badgeColorUtils'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'

interface AssignmentTimelineProps {
  assignment: ContentServiceAssignmentResponse
}

/**
 * AssignmentTimeline Component
 * Shows comprehensive scheduling information for an assignment
 *
 * @example
 * ```tsx
 * <AssignmentTimeline assignment={assignment} />
 * ```
 */
export function AssignmentTimeline({ assignment }: AssignmentTimelineProps) {
  // Extract dates - handle both Date objects and ISO strings
  const startDate = assignment.startDate ? new Date(assignment.startDate) : undefined
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : undefined

  // Calculate urgency level
  const urgencyLevel = getUrgencyLevel(startDate, dueDate, assignment.status)
  const urgencyLabel = getUrgencyLabel(urgencyLevel)
  const badgeColor = mapUrgencyToBadgeColor(urgencyLevel)

  // Format timeline summary
  const timelineSummary = formatAssignmentTimeline(startDate, dueDate)

  // Get deadline status text
  const deadlineStatus = getDeadlineStatusText(startDate, dueDate)

  return (
    <Card withBorder padding="lg" bg="var(--mantine-color-gray-0)">
      <Stack gap="md">
        {/* Title */}
        <Group justify="space-between" wrap="wrap">
          <Text fw={600} size="lg">
            Lịch trình bài tập
          </Text>
          {dueDate && (
            <Badge color={badgeColor} size="lg">
              {urgencyLabel}
            </Badge>
          )}
        </Group>

        {/* Timeline Summary */}
        <Text c="dimmed" size="sm" style={{ fontStyle: 'italic' }}>
          {timelineSummary}
        </Text>

        {/* Dates Grid */}
        <Group grow>
          {/* Start Date */}
          {startDate && (
            <div>
              <Group gap="xs" mb="xs">
                <ThemeIcon variant="light" size="lg" radius="md">
                  <IconCalendar size={18} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed" fw={600}>
                    Ngày bắt đầu
                  </Text>
                  <Text size="sm" fw={500}>
                    {formatDateWithDay(startDate)}
                  </Text>
                </div>
              </Group>
            </div>
          )}

          {/* Due Date */}
          {dueDate && (
            <div>
              <Group gap="xs" mb="xs">
                <ThemeIcon variant="light" size="lg" radius="md" color="red">
                  <IconClock size={18} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed" fw={600}>
                    Hạn chót
                  </Text>
                  <Text size="sm" fw={500}>
                    {formatDateWithDay(dueDate)}
                  </Text>
                </div>
              </Group>
            </div>
          )}
        </Group>

        {/* Deadline Status */}
        {dueDate && deadlineStatus && (
          <Group
            p="md"
            bg={urgencyLevel === 'overdue' ? 'var(--mantine-color-red-0)' : 'var(--mantine-color-yellow-0)'}
            style={{
              borderRadius: 'var(--mantine-radius-md)',
              border: '1px solid',
              borderColor:
                urgencyLevel === 'overdue'
                  ? 'var(--mantine-color-red-2)'
                  : 'var(--mantine-color-yellow-2)',
            }}
          >
            <ThemeIcon
              variant="light"
              size="lg"
              radius="md"
              color={urgencyLevel === 'overdue' ? 'red' : 'yellow'}
            >
              <IconAlertTriangle size={18} />
            </ThemeIcon>
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                {deadlineStatus}
              </Text>
            </div>
          </Group>
        )}

        {/* No Due Date Message */}
        {!dueDate && (
          <Text c="dimmed" size="sm" fs="italic">
            Bài tập này không có hạn chót cụ thể
          </Text>
        )}
      </Stack>
    </Card>
  )
}
