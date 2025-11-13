import { createFileRoute } from '@tanstack/react-router'
import { AssignmentForm } from '@/features/provider/components/AssignmentForm'
import { useNavigate } from '@tanstack/react-router'

/**
 * Provider Create Assignment Route
 * Path: /provider/assignments/create
 * 
 * Form để tạo bài tập mới
 * Chế độ: 'create' (tất cả field bắt buộc)
 */
const ProviderCreateAssignmentPage = () => {
  const navigate = useNavigate()

  const handleSuccess = () => {
    // Sau khi tạo thành công, navigate về list
    navigate({ to: '/provider/assignments' })
  }

  const handleCancel = () => {
    navigate({ to: '/provider/assignments' })
  }

  return (
    <AssignmentForm
      mode="create"
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  )
}

export const Route = createFileRoute(
  '/_authenticated/provider/assignments/create'
)({
  component: ProviderCreateAssignmentPage,
})
