import { createFileRoute } from '@tanstack/react-router'
import { AssignmentsList } from '@/features/assignments/components/AssignmentsList'

// Index route - trang danh sách bài tập tại /student/assignments
const AssignmentsIndexPage = () => {
  return <AssignmentsList />
}

export const Route = createFileRoute('/_authenticated/student/assignments/')({
  component: AssignmentsIndexPage,
})

