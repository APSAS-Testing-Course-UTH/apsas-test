import { Stack, Text, Group, Badge } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { IconClock, IconAlertTriangle } from '@tabler/icons-react'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'
import classes from './UpcomingDeadlines.module.css'

interface UpcomingDeadlinesProps {
  /** Danh sách bài tập */
  data: ContentServiceAssignmentResponse[]
  /** Số lượng hiển thị tối đa (default: 5) */
  limit?: number
}

/**
 * UpcomingDeadlines - Widget hiển thị các hạn chót sắp tới
 * 
 * @example
 * ```tsx
 * <UpcomingDeadlines data={assignments} limit={5} />
 * ```
 */
export function UpcomingDeadlines({ data, limit = 5 }: UpcomingDeadlinesProps) {
  const navigate = useNavigate()
  // Filter: chỉ lấy bài có dueDate trong tương lai
  const now = new Date()
  const futureAssignments = data.filter((assignment) => {
    if (!assignment.dueDate) return false
    return new Date(assignment.dueDate) > now
  })

  // Sort: sắp xếp theo dueDate tăng dần (gần nhất trước)
  const sortedAssignments = futureAssignments.sort((a, b) => {
    if (!a.dueDate || !b.dueDate) return 0
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const displayData = sortedAssignments.slice(0, limit)

  if (displayData.length === 0) {
    return (
      <Stack align="center" py="xl">
        <Text c="dimmed" size="sm">
          Không có hạn chót sắp tới
        </Text>
      </Stack>
    )
  }

  return (
    <Stack gap="md">
      {displayData.map((assignment) => {
        const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
        const isUrgent = dueDate && dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000 // < 24 hours

        return (
          <div 
            key={assignment.id} 
            className={`${classes.deadlineItem} ${isUrgent ? classes.urgent : ''}`}
            onClick={() => assignment.id && navigate({ to: '/student/assignments/$id', params: { id: assignment.id } })}
            style={{ cursor: 'pointer', transition: 'background-color 0.2s ease' }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.backgroundColor = 'var(--mantine-color-gray-1)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.backgroundColor = 'var(--mantine-color-gray-0)'
            }}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Group gap="xs">
                  {isUrgent && <IconAlertTriangle size={18} className={classes.urgentIcon} />}
                  <Text fw={500} className={classes.title}>
                    {assignment.title || 'Bài tập'}
                  </Text>
                </Group>
                <Group gap="xs">
                  <IconClock size={14} />
                  <Text size="sm" c="dimmed">
                    {dueDate
                      ? dueDate.toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Không có hạn'}
                  </Text>
                </Group>
              </Stack>

              <Group gap="xs">
                {assignment.difficultyLevel && (
                  <Badge
                    color={
                      assignment.difficultyLevel === 'EASY'
                        ? 'green'
                        : assignment.difficultyLevel === 'MEDIUM'
                        ? 'yellow'
                        : 'red'
                    }
                    variant="light"
                  >
                    {assignment.difficultyLevel === 'EASY'
                      ? 'Dễ'
                      : assignment.difficultyLevel === 'MEDIUM'
                      ? 'Trung bình'
                      : 'Khó'}
                  </Badge>
                )}
                {isUrgent && (
                  <Badge color="red" variant="filled">
                    Khẩn cấp
                  </Badge>
                )}
              </Group>
            </Group>
          </div>
        )
      })}
    </Stack>
  )
}
