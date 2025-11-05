import { Container, Title, Stack, TextInput, Button, Group } from '@mantine/core'
import { IconSearch, IconDownload } from '@tabler/icons-react'
import { useState } from 'react'
import type { ContentServiceTutorialResponse } from '@/api/types.gen'
import { useTutorials } from '../api/hooks'
import { ResourcesList } from './ResourcesList'

export function ResourcesPage() {
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading } = useTutorials({ page, size: 12 })

  const tutorials = (data as any)?.content || []
  const totalPages = (data as any)?.totalPages || 1

  const filteredTutorials = tutorials.filter(
    (tutorial: ContentServiceTutorialResponse) =>
      tutorial.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDownload = (resource: ContentServiceTutorialResponse) => {
    const element = document.createElement('a')
    const file = new Blob([resource.content || ''], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${resource.title || 'resource'}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs">
            Tài nguyên học tập
          </Title>
          <p style={{ color: 'var(--mantine-color-gray-6)', margin: 0 }}>
            Truy cập các hướng dẫn lập trình và tài liệu học tập do Content Provider cung cấp
          </p>
        </div>

        <Group gap="md">
          <TextInput
            placeholder="Tìm kiếm tài nguyên..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Button
            variant="default"
            leftSection={<IconDownload size={16} />}
          >
            Tải tất cả
          </Button>
        </Group>

        <ResourcesList
          resources={filteredTutorials}
          isLoading={isLoading}
          totalPages={totalPages}
          currentPage={page + 1}
          onPageChange={(newPage) => setPage(newPage - 1)}
          onDownload={handleDownload}
        />
      </Stack>
    </Container>
  )
}
