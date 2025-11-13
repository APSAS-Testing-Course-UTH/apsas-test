import { createFileRoute } from '@tanstack/react-router'
import { SkillManager } from '@/features/provider/components/SkillManager'

/**
 * Provider Skills List Route
 * Path: /provider/skills
 *
 * Hiển thị danh sách các kỹ năng được tạo bởi provider
 * Với pagination, filtering, sorting, và action menu
 */
const ProviderSkillsIndexPage = () => {
  return <SkillManager />
}

export const Route = createFileRoute('/_authenticated/provider/skills/')({
  component: ProviderSkillsIndexPage,
})
