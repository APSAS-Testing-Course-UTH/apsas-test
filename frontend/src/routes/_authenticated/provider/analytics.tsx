import { createFileRoute } from '@tanstack/react-router'
import { AnalyticsDashboard } from '@/features/provider/components'

function AnalyticsPage() {
  return <AnalyticsDashboard />
}

export const Route = createFileRoute('/_authenticated/provider/analytics')({
  component: AnalyticsPage,
})
