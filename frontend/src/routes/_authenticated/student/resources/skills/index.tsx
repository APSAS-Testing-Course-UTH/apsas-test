import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Container, Title, Stack, TextInput, Button, Group } from '@mantine/core'
import { IconSearch, IconRefresh } from '@tabler/icons-react'
import { useState } from 'react'
import type { ContentServiceSkillResponse } from '@/api/types.gen'
import { useSkillsQuery } from '@/features/resources/api/hooks'
import { SkillsList } from '@/features/resources/components'
import { USER_ROLES } from '@/constants/roles'

function SkillsPageContent() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading, error, refetch } = useSkillsQuery({ page, size: 12 })

  const skills = (data as any)?.content || []
  const totalPages = (data as any)?.totalPages || 1

  const filteredSkills = skills.filter((skill: ContentServiceSkillResponse) =>
    skill.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRefresh = () => {
    refetch()
  }

  const handleSelectSkill = (skill: ContentServiceSkillResponse) => {
    if (skill.id) {
      navigate({ to: `/student/resources/skills/${skill.id}` })
    }
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs">
            Kỹ năng lập trình
          </Title>
          <p style={{ color: 'var(--mantine-color-gray-6)', margin: 0 }}>
            Khám phá các kỹ năng lập trình cần có và theo dõi tiến độ của bạn
          </p>
        </div>

        <Group gap="md">
          <TextInput
            placeholder="Tìm kiếm kỹ năng..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            Làm mới
          </Button>
        </Group>

        <SkillsList
          skills={filteredSkills}
          isLoading={isLoading}
          error={error}
          totalPages={totalPages}
          currentPage={page + 1}
          onPageChange={(newPage) => setPage(newPage - 1)}
          onRefresh={handleRefresh}
          onSelectSkill={handleSelectSkill}
        />
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute('/_authenticated/student/resources/skills/')({
  beforeLoad: ({ context }) => {
    // Check if user is student
    const { user } = context.auth || {}
    if (user?.role !== USER_ROLES.STUDENT) {
      throw new Error('Bạn không có quyền truy cập trang này')
    }
  },
  component: SkillsPageContent,
})
