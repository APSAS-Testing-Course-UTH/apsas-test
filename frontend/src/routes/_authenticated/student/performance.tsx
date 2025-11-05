import { createFileRoute } from '@tanstack/react-router'
import { PerformancePage } from '@/features/performance'

export const Route = createFileRoute('/_authenticated/student/performance')({
  component: PerformancePage,
})
