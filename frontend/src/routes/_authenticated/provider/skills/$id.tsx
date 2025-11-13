import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { SkillDetail } from '@/features/provider/components/SkillDetail'

/**
 * Provider Skill Detail Route
 * Path: /provider/skills/$id
 *
 * Layout for skill detail view and edit child routes
 * When accessed with /edit suffix, child route renders instead
 *
 * Param: $id = skillId (UUID)
 */
const ProviderSkillDetailPage = () => {
  const navigate = useNavigate()
  const { id } = Route.useParams()

  const handleEdit = (skillId: string) => {
    navigate({ to: `/provider/skills/${skillId}/edit` })
  }

  return (
    <>
      <SkillDetail skillId={id} onEdit={handleEdit} />
      <Outlet />
    </>
  )
}

export const Route = createFileRoute('/_authenticated/provider/skills/$id')(
  {
    component: ProviderSkillDetailPage,
    notFoundComponent: () => (
      <div>Kỹ năng không tìm thấy. Vui lòng kiểm tra ID.</div>
    ),
  }
)
