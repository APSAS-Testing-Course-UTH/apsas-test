import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { TutorialDetail } from '@/features/provider/components/TutorialDetail'

/**
 * Provider Tutorial Detail Route
 * Path: /provider/tutorials/$id
 *
 * Layout for tutorial detail view and edit child routes
 * When accessed with /edit suffix, child route renders instead
 *
 * Param: $id = tutorialId (UUID)
 */
const ProviderTutorialDetailPage = () => {
  const navigate = useNavigate()
  const { id } = Route.useParams()

  const handleEdit = (tutorialId: string) => {
    navigate({ to: `/provider/tutorials/${tutorialId}/edit` })
  }

  return (
    <>
      <TutorialDetail tutorialId={id} onEdit={handleEdit} />
      <Outlet />
    </>
  )
}

export const Route = createFileRoute('/_authenticated/provider/tutorials/$id')({
  component: ProviderTutorialDetailPage,
})
