import { createFileRoute } from '@tanstack/react-router'
import { InstructorSupportPage } from '@/features/support/components/InstructorSupportPage'
import { USER_ROLES } from '@/constants/roles'

export const Route = createFileRoute('/_authenticated/instructor/support')({
  beforeLoad: ({ context }) => {
    // Ensure only instructors can access this route
    if (!context.auth?.user || context.auth.user.role !== USER_ROLES.INSTRUCTOR) {
      throw new Error('Unauthorized access')
    }
  },
  component: SupportPageWrapper,
})

function SupportPageWrapper() {
  return <InstructorSupportPage />
}
