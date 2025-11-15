import { createFileRoute, redirect, useParams, useNavigate } from '@tanstack/react-router'
import { Container, Stack, Title, Text, Breadcrumbs, Anchor, Button, Group, Card, Tabs, Alert, Loader, Center } from '@mantine/core'
import { IconArrowLeft, IconEdit } from '@tabler/icons-react'
import { useState } from 'react'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'
import { useAssignmentDetailQuery } from '@/features/assignments/api/useAssignmentDetailQuery'
import { AssignmentMetadata } from '@/features/assignments/components/AssignmentMetadata'
import { AssignmentTimeline } from '@/features/assignments/components/AssignmentTimeline'
import { TestCaseList } from '@/features/assignments/components/TestCaseList'
import { SkillBadges } from '@/features/assignments/components/SkillBadges'
import { TutorialLinks } from '@/features/assignments/components/TutorialLinks'
import { EditScheduleModal } from '@/features/assignments/components/EditScheduleModal'
import { InstructorSubmissionsList } from '@/features/submissions/components'

/**
 * Instructor Assignment Detail Page
 * Vietnamese: Chi tiết Bài tập
 * 
 * Features:
 * - View assignment details (title, description, metadata)
 * - View test cases
 * - Edit schedule (startDate, dueDate)
 * - View all submissions for this assignment
 * - Filter and manage submissions
 * 
 * Route: /instructor/assignments/:id (as a child route of /instructor/assignments)
 * File structure: Properly nested in assignments/ folder
 * 
 * Created: Week 1, Day 2-3; Enhanced: Week 2, Day 4
 * Fixed routing: Now using proper child route structure with Outlet in parent
 */
const InstructorAssignmentDetailPage = () => {
  const { id } = useParams({ from: '/_authenticated/instructor/assignments/$id' })
  const navigate = useNavigate()
  const { data: assignment, isLoading, error } = useAssignmentDetailQuery(id)
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false)

  // Loading state
  if (isLoading) {
    return (
      <Center style={{ minHeight: '60vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Đang tải bài tập...</Text>
        </Stack>
      </Center>
    )
  }

  // Error state
  if (error) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="md">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate({ to: '/instructor/assignments' })}
          >
            Quay lại danh sách
          </Button>

          <Alert color="red" title="Lỗi">
            Không thể tải thông tin bài tập. Vui lòng thử lại sau.
          </Alert>
        </Stack>
      </Container>
    )
  }

  if (!assignment) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="md">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate({ to: '/instructor/assignments' })}
          >
            Quay lại danh sách
          </Button>

          <Alert color="yellow" title="Thông báo">
            Không tìm thấy bài tập.
          </Alert>
        </Stack>
      </Container>
    )
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Breadcrumb */}
        <Breadcrumbs>
          <Anchor href="/instructor/assignments">Quản lý Bài tập</Anchor>
          <Text>{assignment.title || `Bài tập ${id}`}</Text>
        </Breadcrumbs>

        {/* Header with Actions */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>{assignment.title}</Title>
            <Text c="dimmed" mt="xs">
              Xem thông tin, chỉnh sửa lịch trình, quản lý bài nộp
            </Text>
          </div>
          <Button
            leftSection={<IconEdit size={16} />}
            onClick={() => setIsEditScheduleOpen(true)}
          >
            Chỉnh sửa lịch trình
          </Button>
        </Group>

        {/* Edit Schedule Modal */}
        <EditScheduleModal
          assignment={assignment}
          isOpen={isEditScheduleOpen}
          onClose={() => setIsEditScheduleOpen(false)}
        />

        {/* Main Content: Tabs */}
        <Tabs defaultValue="details" variant="outline">
          <Tabs.List>
            <Tabs.Tab value="details">Thông tin chi tiết</Tabs.Tab>
            <Tabs.Tab value="submissions">Bài nộp</Tabs.Tab>
          </Tabs.List>

          {/* Details Tab */}
          <Tabs.Panel value="details" pt="xl">
            <Stack gap="xl">
              {/* Description */}
              <Card withBorder>
                <Card.Section withBorder inheritPadding py="md">
                  <Title order={3}>Mô tả bài toán</Title>
                </Card.Section>
                <Card.Section inheritPadding py="md">
                  <Text>{assignment.description || 'Không có mô tả'}</Text>
                </Card.Section>
              </Card>

              {/* Metadata */}
              <AssignmentMetadata assignment={assignment} />

              {/* Timeline */}
              <AssignmentTimeline assignment={assignment} />

              {/* Test Cases */}
              {assignment.testCases && assignment.testCases.length > 0 && (
                <Card withBorder>
                  <Card.Section withBorder inheritPadding py="md">
                    <Title order={3}>Các trường hợp kiểm tra</Title>
                  </Card.Section>
                  <Card.Section inheritPadding py="md">
                    <TestCaseList testCases={assignment.testCases} />
                  </Card.Section>
                </Card>
              )}

              {/* Tutorial Links */}
              {assignment.tutorials && assignment.tutorials.length > 0 && (
                <Card withBorder>
                  <Card.Section withBorder inheritPadding py="md">
                    <Title order={3}>Tài nguyên học tập</Title>
                  </Card.Section>
                  <Card.Section inheritPadding py="md">
                    <TutorialLinks tutorials={assignment.tutorials} />
                  </Card.Section>
                </Card>
              )}

              {/* Skills */}
              {assignment.skills && assignment.skills.length > 0 && (
                <Card withBorder>
                  <Card.Section withBorder inheritPadding py="md">
                    <Title order={3}>Kỹ năng</Title>
                  </Card.Section>
                  <Card.Section inheritPadding py="md">
                    <SkillBadges skills={assignment.skills} />
                  </Card.Section>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>

          {/* Submissions Tab */}
          <Tabs.Panel value="submissions" pt="xl">
            <Stack gap="xl">
              <InstructorSubmissionsList
                assignmentId={id}
                onSelectSubmission={(submissionId: string) => {
                  navigate({ to: `/instructor/submissions/${submissionId}` })
                }}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Back Button */}
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate({ to: '/instructor/assignments' })}
        >
          Quay lại danh sách
        </Button>
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute('/_authenticated/instructor/assignments/$id')({
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
  component: InstructorAssignmentDetailPage,
})
