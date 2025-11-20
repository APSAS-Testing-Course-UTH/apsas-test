import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, Stack, Text, Group, Skeleton, Title, Box } from '@mantine/core'
import { IconCalendar, IconAlertCircle } from '@tabler/icons-react'
import { Calendar } from '@mantine/dates'
import clsx from 'clsx'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'
import type { CSSProperties } from 'react'
import classes from './CalendarWidget.module.css'

interface CalendarWidgetProps {
  assignments?: ContentServiceAssignmentResponse[]
  isLoading?: boolean
  style?: CSSProperties
  className?: string
}

/**
 * CalendarWidget - Lịch hiển thị hạn chót bài tập
 *
 * Redesigned UI với:
 * - Mantine Calendar component với Vietnamese locale (via DatesProvider)
 * - Dots indicators cho ngày có deadlines (thay vì background colors)
 * - Clean, minimal modern design
 * - Compatible với existing backend data structure
 *
 * Vietnamese UI: 100% ✓
 * Localization: DatesProvider trong app.tsx với locale='vi'
 * Data source: Assignments từ props
 * Design: Theo ảnh reference từ user
 */
export function CalendarWidget({
  assignments = [],
  isLoading = false,
  style,
  className,
}: CalendarWidgetProps) {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  // Tạo map của deadlines theo ngày (YYYY-MM-DD format)
  const deadlinesByDate = useMemo(() => {
    const map = new Map<string, ContentServiceAssignmentResponse[]>()

    assignments.forEach((assignment) => {
      if (assignment.dueDate) {
        const dueDate = new Date(assignment.dueDate)
        const dateStr = dueDate.toISOString().split('T')[0]
        if (!map.has(dateStr)) {
          map.set(dateStr, [])
        }
        map.get(dateStr)!.push(assignment)
      }
    })

    return map
  }, [assignments])

  // Lấy danh sách bài tập cho ngày được chọn
  const selectedDateAssignments = useMemo(() => {
    if (!selectedDate) return []
    return deadlinesByDate.get(selectedDate) || []
  }, [selectedDate, deadlinesByDate])

  // Helper: Get number of deadlines for a date
  const getDeadlineCount = (date: Date | string): number => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const dateStr = dateObj.toISOString().split('T')[0]
    return deadlinesByDate.get(dateStr)?.length || 0
  }

  // Auto-select today when it has upcoming deadlines
  useEffect(() => {
    if (selectedDate) return
    if (deadlinesByDate.has(todayStr)) {
      setSelectedDate(todayStr)
    }
  }, [deadlinesByDate, selectedDate, todayStr])

  // Render day with dots indicators
  const renderDay = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const day = dateObj.getDate()
    const dateStr = dateObj.toISOString().split('T')[0]
    const count = getDeadlineCount(dateObj)
    const isSelected = selectedDate === dateStr
    const isToday = dateStr === todayStr
    const cellClassName = clsx(classes.dayCell, {
      [classes.dayCellSelected]: isSelected,
      [classes.dayCellToday]: isToday,
      [classes.dayCellBusy]: count > 0,
    })

    // No deadline - render plain day
    if (count === 0) {
      return (
        <div className={cellClassName}>
          {day}
        </div>
      )
    }

    // Has deadline - render with dots (max 3 visible)
    const dotsCount = Math.min(count, 3)
    const colors = ['red', 'orange', 'blue'] // Different colors for visual variety

    return (
      <div className={cellClassName}>
        <div className={classes.dayNumber}>{day}</div>
        <Group gap={2} justify="center" className={classes.dotsContainer}>
          {Array.from({ length: dotsCount }).map((_, i) => (
            <div
              key={i}
              className={classes.dot}
              style={{
                backgroundColor: `var(--mantine-color-${colors[i % colors.length]}-6)`,
              }}
            />
          ))}
        </Group>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card
        withBorder
        shadow="sm"
        padding="md"
        radius="md"
        className={className || classes.card}
        style={style}
      >
        <Card.Section inheritPadding py="sm">
          <Skeleton height={340} />
        </Card.Section>
      </Card>
    )
  }

  return (
    <Card
      withBorder
      shadow="sm"
      padding="md"
      radius="md"
      className={className || classes.card}
      style={style}
    >
      {/* Header */}
      <Card.Section inheritPadding py="sm" withBorder>
        <Group justify="space-between">
          <Group gap="xs">
            <IconCalendar size={18} />
            <Title order={4} size="h4">Lịch theo tháng</Title>
          </Group>
        </Group>
      </Card.Section>

      <Card.Section inheritPadding py="sm">
        <Stack gap="md">
          {/* Mantine Calendar với Vietnamese locale từ DatesProvider */}
          <Calendar
            date={currentDate.toISOString().split('T')[0]}
            onDateChange={(dateStr) => setCurrentDate(new Date(dateStr))}
            renderDay={renderDay}
            size="sm"
            className={classes.calendar}
            getDayProps={(date) => {
              const dateObj = typeof date === 'string' ? new Date(date) : date
              const dateStr = dateObj.toISOString().split('T')[0]
              const isSelected = selectedDate === dateStr
              
              return {
                selected: isSelected,
                onClick: () => setSelectedDate(dateStr),
              }
            }}
          />

          {/* Selected date assignments list */}
          {selectedDate && selectedDateAssignments.length > 0 ? (
            <Stack gap="xs">
              <Text size="sm" c="dimmed" fw={500}>
                Bài tập hạn chót ({selectedDateAssignments.length})
              </Text>
              {selectedDateAssignments.map((assignment) => (
                <Box
                  key={assignment.id}
                  p="xs"
                  onClick={() => assignment.id && navigate({ to: '/student/assignments/$id', params: { id: assignment.id } })}
                  className={classes.assignmentItem}
                >
                  <Group gap="xs">
                    <IconAlertCircle size={16} color="orange" />
                    <Stack gap={0} style={{ flex: 1 }}>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {assignment.title || 'Bài tập không tên'}
                      </Text>
                      {assignment.dueDate && (
                        <Text size="xs" c="dimmed">
                          {new Date(assignment.dueDate).toLocaleTimeString(
                            'vi-VN',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </Text>
                      )}
                    </Stack>
                  </Group>
                </Box>
              ))}
            </Stack>
          ) : selectedDate ? (
            <Box className={classes.noAssignments}>
              <Group gap="xs">
                <IconAlertCircle size={16} color="green" />
                <Text size="sm" c="green">
                  Không có bài tập hạn chót
                </Text>
              </Group>
            </Box>
          ) : (
            <Text size="sm" c="dimmed" ta="center">
              Chọn ngày để xem bài tập hạn chót
            </Text>
          )}
        </Stack>
      </Card.Section>
    </Card>
  )
}
