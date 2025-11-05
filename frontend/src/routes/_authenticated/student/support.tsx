import { createFileRoute } from '@tanstack/react-router'
import { SupportPage } from '@/features/support/components/SupportPage'

// Prevent code-splitting by wrapping in a non-splittable component
function SupportPageWrapper() {
  return <SupportPage />
}

export const Route = createFileRoute('/_authenticated/student/support')({
  component: SupportPageWrapper,
})
