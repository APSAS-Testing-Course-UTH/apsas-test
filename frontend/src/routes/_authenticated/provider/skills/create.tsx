import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SkillForm } from '@/features/provider/components/SkillForm'

/**
 * Provider Create Skill Route
 * Path: /provider/skills/create
 *
 * Form để tạo kỹ năng mới
 * Navigates to skills list after successful creation
 */
const ProviderSkillsCreatePage = () => {
  const navigate = useNavigate()

  const handleSuccess = () => {
    // Navigate to list page to see newly created skill
    navigate({ to: '/provider/skills' })
  }

  return <SkillForm mode="create" onSuccess={handleSuccess} />
}

export const Route = createFileRoute('/_authenticated/provider/skills/create')({
  component: ProviderSkillsCreatePage,
})
