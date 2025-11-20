/**
 * Schedule Calendar View Component
 * Vietnamese: Xem lịch trình bài tập
 * 
 * Displays assignment deadlines in calendar format with:
 * - Monthly calendar view with month/year selectors
 * - Assignment count per day
 * - Click to see details
 * - Color coding for urgency
 */

import { useState, useMemo } from 'react'
import { 
  Card, Stack, Title, Text, Badge, Group, Button, Modal, Table, Skeleton, Alert, Grid, Select 
} from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import type { UpcomingDeadline } from '../types/instructor.types'

const VIETNAMESE_MONTHS = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
]

// Generate year options: current year ± 5 years
const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => {
  const year = currentYear - 5 + i
  return { value: String(year), label: `Năm ${year}` }
})

interface ScheduleCalendarViewProps {
  deadlines: UpcomingDeadline[] | undefined
  isLoading: boolean
}

export function ScheduleCalendarView({ deadlines, isLoading }: ScheduleCalendarViewProps) {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days: Date[] = []
    const currentDay = new Date(startDate)
    
    while (currentDay <= lastDay || currentDay.getDay() !== 0) {
      days.push(new Date(currentDay))
      currentDay.setDate(currentDay.getDate() + 1)
    }
    
    return days
  }, [currentDate])

  // Map deadlines to dates
  const deadlinesByDate = useMemo(() => {
    const map = new Map<string, UpcomingDeadline[]>()
    
    deadlines?.forEach((deadline) => {
      const dateStr = new Date(deadline.dueDate).toDateString()
      if (!map.has(dateStr)) {
        map.set(dateStr, [])
      }
      map.get(dateStr)?.push(deadline)
    })
    
    return map
  }, [deadlines])

  // Get deadlines for selected date
  const selectedDateDeadlines = useMemo(() => {
    if (!selectedDate) return []
    return deadlinesByDate.get(selectedDate.toDateString()) || []
  }, [selectedDate, deadlinesByDate])

  // Loading state
  if (isLoading) {
    return (
      <Card withBorder shadow="sm" p="lg" radius="md">
        <Stack gap="md">
          <Title order={3}>Lịch trình bài tập</Title>
          <Skeleton height={400} radius="md" />
        </Stack>
      </Card>
    )
  }

  // Empty state
  if (!deadlines || deadlines.length === 0) {
    return (
      <Card withBorder shadow="sm" p="lg" radius="md">
        <Stack gap="md">
          <Title order={3}>Lịch trình bài tập</Title>
          <Alert icon="ℹ️" color="blue">
            <Text size="sm">Không có deadline trong tương lai</Text>
          </Alert>
        </Stack>
      </Card>
    )
  }

  const monthName = currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
  // monthName is available for debugging if needed
  console.debug('[ScheduleCalendar] Current month:', monthName)
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()

  return (
    <Stack gap="lg">
      {/* Calendar Card */}
      <Card withBorder shadow="sm" p="lg" radius="md">
        <Stack gap="md">
          {/* Header with month/year selectors */}
          <Stack gap="xs">
            <Title order={3}>Lịch trình bài tập</Title>
            
            <Group gap="xs" justify="space-between">
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setCurrentDate(new Date(year, month - 1))}
                px="xs"
              >
                <IconChevronLeft size={16} />
              </Button>

              <Group gap="xs" style={{ flex: 1, justifyContent: 'center' }}>
                <Select
                  value={String(month)}
                  onChange={(value) => {
                    if (value) {
                      const newDate = new Date(year, parseInt(value), 1)
                      setCurrentDate(newDate)
                    }
                  }}
                  data={VIETNAMESE_MONTHS.map((label, index) => ({
                    value: String(index),
                    label,
                  }))}
                  size="xs"
                  w={110}
                  allowDeselect={false}
                  aria-label="Chọn tháng"
                />

                <Select
                  value={String(year)}
                  onChange={(value) => {
                    if (value) {
                      const newDate = new Date(parseInt(value), month, 1)
                      setCurrentDate(newDate)
                    }
                  }}
                  data={YEAR_OPTIONS}
                  size="xs"
                  w={110}
                  allowDeselect={false}
                  aria-label="Chọn năm"
                />
              </Group>

              <Button
                variant="subtle"
                size="sm"
                onClick={() => setCurrentDate(new Date(year, month + 1))}
                px="xs"
              >
                <IconChevronRight size={16} />
              </Button>
            </Group>

            <Button
              variant="light"
              size="xs"
              onClick={() => setCurrentDate(new Date())}
              fullWidth
            >
              Hôm nay
            </Button>
          </Stack>

          {/* Week day headers */}
          <Grid gutter={4}>
            {weekDays.map((day) => (
              <Grid.Col key={day} span={{ base: 12 / 7 }}>
                <Text ta="center" fw={600} size="sm">
                  {day}
                </Text>
              </Grid.Col>
            ))}
          </Grid>

          {/* Calendar grid */}
          <Grid gutter={4}>
            {calendarDays.map((day) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              const dateStr = day.toDateString()
              const dayDeadlines = deadlinesByDate.get(dateStr) || []
              const isSelected = selectedDate?.toDateString() === dateStr
              const isToday = new Date().toDateString() === dateStr

              return (
                <Grid.Col key={dateStr} span={{ base: 12 / 7 }}>
                  <div
                    onClick={() => {
                      setSelectedDate(day)
                      if (dayDeadlines.length > 0) {
                        setIsDetailModalOpen(true)
                      }
                    }}
                    style={{
                      padding: '8px',
                      minHeight: '60px',
                      borderRadius: '4px',
                      backgroundColor: isSelected ? 'var(--mantine-color-blue-1)' : isToday ? 'var(--mantine-color-yellow-0)' : isCurrentMonth ? 'white' : 'var(--mantine-color-gray-0)',
                      border: isSelected ? '2px solid var(--mantine-color-blue-6)' : isToday ? '2px solid var(--mantine-color-yellow-6)' : '1px solid var(--mantine-color-gray-3)',
                      cursor: dayDeadlines.length > 0 ? 'pointer' : 'default',
                      transition: 'all 0.2s ease',
                      opacity: isCurrentMonth ? 1 : 0.5,
                    }}
                    onMouseEnter={(e) => {
                      if (dayDeadlines.length > 0) {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--mantine-color-gray-1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = isSelected ? 'var(--mantine-color-blue-1)' : isToday ? 'var(--mantine-color-yellow-0)' : isCurrentMonth ? 'white' : 'var(--mantine-color-gray-0)'
                    }}
                  >
                    <Stack gap={4}>
                      <Text size="sm" fw={isToday ? 700 : 500}>
                        {day.getDate()}
                      </Text>
                      {dayDeadlines.length > 0 && (
                        <Badge size="xs" variant="light" color="orange">
                          {dayDeadlines.length}
                        </Badge>
                      )}
                    </Stack>
                  </div>
                </Grid.Col>
              )
            })}
          </Grid>
        </Stack>
      </Card>

      {/* Detail Modal */}
      <Modal
        opened={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedDate ? `Deadline: ${selectedDate.toLocaleDateString('vi-VN')}` : 'Chi tiết'}
        size="lg"
      >
        <Stack gap="md">
          {selectedDateDeadlines.length === 0 ? (
            <Text c="dimmed" ta="center">
              Không có deadline trong ngày này
            </Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Bài tập</Table.Th>
                  <Table.Th>Bài nộp</Table.Th>
                  <Table.Th>Hành động</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {selectedDateDeadlines.map((deadline) => (
                  <Table.Tr key={deadline.assignmentId}>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {deadline.assignmentTitle}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light">
                        {deadline.submissionCount}/{deadline.totalStudents}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        onClick={() => {
                          navigate({
                            to: '/instructor/assignments/$id',
                            params: { id: deadline.assignmentId },
                          })
                          setIsDetailModalOpen(false)
                        }}
                      >
                        Xem
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Modal>
    </Stack>
  )
}
