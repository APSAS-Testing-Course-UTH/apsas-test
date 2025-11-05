import { SimpleGrid, Button } from '@mantine/core'
import { IconBook, IconFileUpload, IconChartBar, IconHelp } from '@tabler/icons-react'

/**
 * QuickActions - Các hành động nhanh cho sinh viên
 * 
 * @example
 * ```tsx
 * <QuickActions />
 * ```
 */
export function QuickActions() {
  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
      <Button
        component="a"
        href="/student/assignments"
        variant="light"
        leftSection={<IconBook size={18} />}
        fullWidth
      >
        Xem tất cả bài tập
      </Button>

      <Button
        component="a"
        href="/student/assignments"
        variant="light"
        leftSection={<IconFileUpload size={18} />}
        fullWidth
      >
        Nộp bài mới
      </Button>

      <Button
        component="a"
        href="/student/performance"
        variant="light"
        leftSection={<IconChartBar size={18} />}
        fullWidth
      >
        Xem hiệu suất
      </Button>

      <Button
        component="a"
        href="/student/support"
        variant="light"
        leftSection={<IconHelp size={18} />}
        fullWidth
      >
        Trợ giúp
      </Button>
    </SimpleGrid>
  )
}
