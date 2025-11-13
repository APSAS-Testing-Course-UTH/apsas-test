import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TutorialForm } from '@/features/provider/components/TutorialForm'

/**
 * Provider Create Tutorial Route
 * Path: /provider/tutorials/create
 *
 * Form để tạo hướng dẫn mới
 * Navigates to tutorials list after successful creation
 */
const ProviderTutorialsCreatePage = () => {
  const navigate = useNavigate()

  const handleSuccess = () => {
    // Navigate to list page to see newly created tutorial
    navigate({ to: '/provider/tutorials' })
  }

  return <TutorialForm mode="create" onSuccess={handleSuccess} />
}

export const Route = createFileRoute('/_authenticated/provider/tutorials/create')({
  component: ProviderTutorialsCreatePage,
})
