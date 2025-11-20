import { useState } from 'react'
import { createFileRoute, redirect, useParams } from '@tanstack/react-router'
import { Container, Stack, Title, Text, Breadcrumbs, Anchor } from '@mantine/core'
// Icons removed - not currently used in this page
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'
import { SubmissionDetail, ProvideFeedbackModal } from '@/features/submissions/components'

/**
 * Instructor Submission Detail Page
 * Vietnamese: Chi tiết Bài nộp
 * 
 * Features:
 * - View student's submitted code
 * - View test results
 * - Provide feedback
 * - Save feedback as draft
 * - View feedback history
 * - Real-time updates via WebSocket
 * 
 * Created: Week 1, Day 3-4; Enhanced: Week 2, Day 3
 */
const InstructorSubmissionDetailPage = () => {
  const { id } = useParams({ from: '/_authenticated/instructor/submissions/$id' })
  // const navigate = useNavigate() // Not currently used
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs>
          <Anchor href="/instructor/submissions">Bài nộp</Anchor>
          <Text>{`Bài nộp ${id}`}</Text>
        </Breadcrumbs>

        <div>
          <Title order={1}>Chi tiết Bài nộp</Title>
          <Text c="dimmed" mt="xs">
            Xem code, kết quả kiểm tra, và cung cấp phản hồi cho sinh viên
          </Text>
        </div>

        {/* Main Content: Submission Detail Component */}
        <SubmissionDetail 
          submissionId={id}
          onProvideFeedback={() => setFeedbackModalOpen(true)}
        />
        
        {/* Feedback Modal */}
        <ProvideFeedbackModal
          isOpen={feedbackModalOpen}
          submissionId={id}
          onClose={() => setFeedbackModalOpen(false)}
        />
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute('/_authenticated/instructor/submissions/$id')({
  beforeLoad: () => {
    const { user } = useAuthStore.getState()

    const hasAccess = checkRoleAccess(USER_ROLES.INSTRUCTOR)
    logRoleAccessAttempt(USER_ROLES.INSTRUCTOR, user?.role, hasAccess)

    if (!hasAccess) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: InstructorSubmissionDetailPage,
})
