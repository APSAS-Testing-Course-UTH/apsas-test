import { createFileRoute } from '@tanstack/react-router'
import { AssignmentsList } from '@/features/provider/components/AssignmentsList'

/**
 * Provider Assignments List Route
 * Path: /provider/assignments
 * 
 * Hiển thị danh sách các bài tập được tạo bởi provider
 * Với pagination, filtering, sorting, và action menu
 */
const ProviderAssignmentsIndexPage = () => {
  return <AssignmentsList />
}

export const Route = createFileRoute('/_authenticated/provider/assignments/')({
  component: ProviderAssignmentsIndexPage,
})
