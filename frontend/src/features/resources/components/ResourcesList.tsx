import { SimpleGrid, Skeleton, Center, Text, Group, Pagination, Stack } from '@mantine/core'
import type { ContentServiceTutorialResponse } from '@/api/types.gen'
import { ResourceCard } from './ResourceCard'

interface ResourcesListProps {
  resources: ContentServiceTutorialResponse[] | undefined
  isLoading: boolean
  totalPages?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  onDownload?: (resource: ContentServiceTutorialResponse) => void
}

export function ResourcesList({
  resources,
  isLoading,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  onDownload,
}: ResourcesListProps) {
  if (isLoading) {
    return (
      <Stack gap="lg">
        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 3, lg: 3 }}
          spacing="md"
          verticalSpacing="md"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ minHeight: '320px' }}>
              <Skeleton height="100%" />
            </div>
          ))}
        </SimpleGrid>
      </Stack>
    )
  }

  if (!resources || resources.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">Không tìm thấy tài nguyên nào</Text>
      </Center>
    )
  }

  return (
    <Stack gap="lg">
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3, lg: 3 }}
        spacing="md"
        verticalSpacing="md"
      >
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onDownload={onDownload}
          />
        ))}
      </SimpleGrid>

      {totalPages > 1 && (
        <Group justify="center" mt="lg">
          <Pagination
            value={currentPage}
            onChange={onPageChange}
            total={totalPages}
          />
        </Group>
      )}
    </Stack>
  )
}
