import { createFileRoute } from '@tanstack/react-router'
import { TutorialManager } from '@/features/provider/components/TutorialManager'

/**
 * Provider Tutorials List Route
 * Path: /provider/tutorials
 *
 * Hiển thị danh sách các hướng dẫn được tạo bởi provider
 * Với pagination, filtering, sorting, và action menu
 */
const ProviderTutorialsIndexPage = () => {
  return <TutorialManager />
}

export const Route = createFileRoute('/_authenticated/provider/tutorials/')({
  component: ProviderTutorialsIndexPage,
})
