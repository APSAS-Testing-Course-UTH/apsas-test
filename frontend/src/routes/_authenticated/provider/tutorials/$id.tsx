import { createFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { TutorialDetail } from '@/features/provider/components/TutorialDetail'

/**
 * Provider Tutorial Detail Route
 * Path: /provider/tutorials/$id
 *
 * Layout for tutorial detail view and edit child routes
 * When accessed with /edit suffix, child route renders via Outlet
 *
 * Param: $id = tutorialId (UUID)
 */
const ProviderTutorialDetailPage = () => {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const matchRoute = useMatchRoute()
  
  // Check if we're on the edit child route
  const isEditRoute = matchRoute({ to: '/provider/tutorials/$id/edit', params: { id } })

  const handleEdit = (tutorialId: string) => {
    navigate({ to: `/provider/tutorials/${tutorialId}/edit` })
  }

  // If on edit route, show child route (TutorialForm) via Outlet
  // Otherwise show detail view
  if (isEditRoute) {
    return <Outlet />
  }

  return <TutorialDetail tutorialId={id} onEdit={handleEdit} />
}

export const Route = createFileRoute('/_authenticated/provider/tutorials/$id')({
  component: ProviderTutorialDetailPage,
})
