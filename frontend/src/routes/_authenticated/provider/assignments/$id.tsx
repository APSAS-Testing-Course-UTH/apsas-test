import { createFileRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { AssignmentForm } from '@/features/provider/components/AssignmentForm'

/**
 * Provider Edit Assignment Route
 * Path: /provider/assignments/$id
 * 
 * Form để chỉnh sửa bài tập hiện có
 * Chế độ: 'edit' (tất cả field optional)
 * 
 * Param: $id = assignmentId (UUID)
 */
const ProviderEditAssignmentPage = () => {
  const navigate = useNavigate()
  const { id } = Route.useParams()

  const handleSuccess = () => {
    // Sau khi chỉnh sửa thành công, navigate về list
    navigate({ to: '/provider/assignments' })
  }

  const handleCancel = () => {
    navigate({ to: '/provider/assignments' })
  }

  return (
    <AssignmentForm
      mode="edit"
      assignmentId={id}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  )
}

export const Route = createFileRoute(
  '/_authenticated/provider/assignments/$id'
)({
  component: ProviderEditAssignmentPage,
  notFoundComponent: () => (
    <div>Bài tập không tìm thấy. Vui lòng kiểm tra ID.</div>
  ),
})
