import { useParams, createFileRoute, useNavigate } from '@tanstack/react-router'
import { SkillForm } from '@/features/provider/components/SkillForm'

/**
 * Provider Edit Skill Route
 * Path: /provider/skills/$id/edit
 *
 * Form để chỉnh sửa kỹ năng
 * Navigates back to detail page after successful update
 */
const ProviderSkillsEditPage = () => {
  const { id } = useParams({ from: '/_authenticated/provider/skills/$id/edit' })
  const navigate = useNavigate()

  const handleSuccess = () => {
    // Navigate back to detail page to see updated content
    navigate({ to: `/provider/skills/${id}` })
  }

  return <SkillForm mode="edit" skillId={id} onSuccess={handleSuccess} />
}

export const Route = createFileRoute('/_authenticated/provider/skills/$id/edit')({
  component: ProviderSkillsEditPage,
})
