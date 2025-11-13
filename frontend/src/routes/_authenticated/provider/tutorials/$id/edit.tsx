import { useParams, createFileRoute, useNavigate } from '@tanstack/react-router'
import { TutorialForm } from '@/features/provider/components/TutorialForm'

/**
 * Provider Edit Tutorial Route
 * Path: /provider/tutorials/$id/edit
 *
 * Form để chỉnh sửa hướng dẫn
 * Navigates back to detail page after successful update
 */
const ProviderTutorialsEditPage = () => {
  const { id } = useParams({ from: '/_authenticated/provider/tutorials/$id/edit' })
  const navigate = useNavigate()

  const handleSuccess = () => {
    // Navigate back to detail page to see updated content
    navigate({ to: `/provider/tutorials/${id}` })
  }

  return <TutorialForm mode="edit" tutorialId={id} onSuccess={handleSuccess} />
}

export const Route = createFileRoute('/_authenticated/provider/tutorials/$id/edit')({
  component: ProviderTutorialsEditPage,
})
