import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, Stack, Text, Badge, Group, Skeleton, Title, Grid, Box } from '@mantine/core'
import { IconCalendar, IconAlertCircle, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'
import classes from './CalendarWidget.module.css'

interface CalendarWidgetProps {
  assignments?: ContentServiceAssignmentResponse[]
  isLoading?: boolean
}

/**
 * CalendarWidget - Lịch hiển thị hạn chót bài tập
 *
 * Hiển thị:
 * - Calendar view cho tháng hiện tại
 * - Ngày có deadline được highlight
 * - Danh sách bài tập cho ngày được chọn
 *
 * Vietnamese UI: 100% ✓
 * Data source: Assignments từ props
 */
export function CalendarWidget({
  assignments = [],
  isLoading = false,
}: CalendarWidgetProps) {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

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
  const todayAssignments = useMemo(() => {
    if (!selectedDate) return []
    const dateStr = selectedDate.toISOString().split('T')[0]
    return deadlinesByDate.get(dateStr) || []
  }, [selectedDate, deadlinesByDate])

  // Helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  const hasDeadline = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateStr = date.toISOString().split('T')[0]
    return deadlinesByDate.has(dateStr)
  }

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    )
  }

  const handleSelectDate = (day: number) => {
    setSelectedDate(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    )
  }

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    )
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    )
    setSelectedDate(null)
  }

  // Computed values
  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  })
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  if (isLoading) {
    return (
      <Card
        withBorder
        shadow="sm"
        padding="lg"
        radius="md"
        className={classes.card}
      >
        <Card.Section inheritPadding py="md">
          <Skeleton height={300} />
        </Card.Section>
      </Card>
    )
  }

  return (
    <Card
      withBorder
      shadow="sm"
      padding="lg"
      radius="md"
      className={classes.card}
    >
      <Card.Section inheritPadding py="md" withBorder>
        <Group justify="space-between">
          <Group gap="xs">
            <IconCalendar size={20} />
            <Title order={3}>Lịch hạn chót</Title>
          </Group>
          <Badge variant="light" color="orange">
            {deadlinesByDate.size} ngày
          </Badge>
        </Group>
      </Card.Section>

      <Card.Section inheritPadding py="md">
        <Stack gap="lg">
          {/* Calendar */}
          <Box>
            {/* Month header */}
            <Group justify="space-between" mb="md">
              <button
                onClick={handlePrevMonth}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                title="Tháng trước"
              >
                <IconChevronLeft size={20} />
              </button>
              <Text fw={600} size="md">
                {monthName}
              </Text>
              <button
                onClick={handleNextMonth}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                title="Tháng sau"
              >
                <IconChevronRight size={20} />
              </button>
            </Group>

            {/* Day names */}
            <Grid gutter="xs" mb="xs">
              {dayNames.map((day) => (
                <Grid.Col key={day} span={12 / 7}>
                  <Text ta="center" size="xs" fw={600} c="dimmed">
                    {day}
                  </Text>
                </Grid.Col>
              ))}
            </Grid>

            {/* Calendar days */}
            <Grid gutter="xs">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <Grid.Col key={`empty-${i}`} span={12 / 7}>
                  <div style={{ height: '40px' }} />
                </Grid.Col>
              ))}

              {/* Calendar day buttons */}
              {days.map((day) => {
                const isSelected = isDateSelected(day)
                const hasDeadlineDay = hasDeadline(day)

                return (
                  <Grid.Col key={day} span={12 / 7}>
                    <button
                      onClick={() => handleSelectDate(day)}
                      className={classes.dayButton}
                      data-selected={isSelected}
                      data-deadline={hasDeadlineDay}
                      title={`${day} ${monthName}`}
                    >
                      {day}
                    </button>
                  </Grid.Col>
                )
              })}
            </Grid>
          </Box>

          {/* Selected date info */}
          {selectedDate && (
            <Box>
              <Text size="sm" c="dimmed" fw={500} mb="xs">
                Ngày đã chọn
              </Text>
              <Text size="md" fw={600}>
                {formatDate(selectedDate)}
              </Text>
            </Box>
          )}

          {/* Assignments for selected date */}
          {selectedDate && todayAssignments.length > 0 ? (
            <Stack gap="xs">
              <Text size="sm" c="dimmed" fw={500}>
                Bài tập hạn chót ({todayAssignments.length})
              </Text>
              {todayAssignments.map((assignment) => (
                <Box
                  key={assignment.id}
                  p="xs"
                  onClick={() => assignment.id && navigate({ to: '/student/assignments/$id', params: { id: assignment.id } })}
                  style={{
                    backgroundColor: 'var(--mantine-color-gray-0)',
                    borderRadius: 'var(--mantine-radius-md)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)'
                  }}
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
            <Box
              p="xs"
              style={{
                backgroundColor: 'var(--mantine-color-green-0)',
                borderRadius: 'var(--mantine-radius-md)',
              }}
            >
              <Group gap="xs">
                <IconAlertCircle size={16} color="green" />
                <Text size="sm" c="green">
                  Không có bài tập hạn chót
                </Text>
              </Group>
            </Box>
          ) : (
            <Text size="sm" c="dimmed">
              Chọn ngày để xem bài tập hạn chót
            </Text>
          )}

          {/* Total deadlines info */}
          {deadlinesByDate.size > 0 && (
            <Text size="xs" c="dimmed" ta="center">
              Có {deadlinesByDate.size} ngày có bài tập hạn chót
            </Text>
          )}
        </Stack>
      </Card.Section>
    </Card>
  )
}

export default CalendarWidget
