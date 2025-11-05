import { createFileRoute } from '@tanstack/react-router'
import { ResourcesPage } from '@/features/resources/components'

export const Route = createFileRoute('/_authenticated/student/resources')({
  component: ResourcesPage,
})
