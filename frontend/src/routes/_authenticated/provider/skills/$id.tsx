import { createFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { SkillDetail } from '@/features/provider/components/SkillDetail'

/**
 * Provider Skill Detail Route
 * Path: /provider/skills/$id
 *
 * Layout for skill detail view and edit child routes
 * When accessed with /edit suffix, child route renders via Outlet
 *
 * Param: $id = skillId (UUID)
 */
const ProviderSkillDetailPage = () => {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const matchRoute = useMatchRoute()
  
  // Check if we're on the edit child route
  const isEditRoute = matchRoute({ to: '/provider/skills/$id/edit', params: { id } })

  const handleEdit = (skillId: string) => {
    navigate({ to: `/provider/skills/${skillId}/edit` })
  }

  // If on edit route, show child route (SkillForm) via Outlet
  // Otherwise show detail view
  if (isEditRoute) {
    return <Outlet />
  }

  return <SkillDetail skillId={id} onEdit={handleEdit} />
}

export const Route = createFileRoute('/_authenticated/provider/skills/$id')(
  {
    component: ProviderSkillDetailPage,
    notFoundComponent: () => (
      <div>Kỹ năng không tìm thấy. Vui lòng kiểm tra ID.</div>
    ),
  }
)
