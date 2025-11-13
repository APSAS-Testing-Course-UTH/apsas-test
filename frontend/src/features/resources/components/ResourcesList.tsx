import { SimpleGrid, Skeleton, Center, Text, Group, Pagination, Stack, Badge, Button } from '@mantine/core'
import type { AxiosError } from 'axios'
import type { ContentServiceTutorialResponse, ContentServiceSkillResponse } from '@/api/types.gen'
import { ResourceCard } from './ResourceCard'
import { 
  getErrorMessage,
  isNetworkError,
  isTimeoutError,
} from '@/features/student/utils'

interface ResourcesListProps {
  items?: ContentServiceTutorialResponse[] | ContentServiceSkillResponse[]
  isLoading: boolean
  error?: AxiosError | Error | null
  totalPages?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  onDownload?: (resource: any) => void
  onRetry?: () => void
  type?: 'tutorials' | 'skills'
}

export function ResourcesList({
  items,
  isLoading,
  error,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  onDownload,
  onRetry,
  type = 'tutorials',
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

  // Error state
  if (error) {
    const isNetwork = isNetworkError(error as AxiosError)
    const isTimeout = isTimeoutError(error as AxiosError)
    const errorMessage = getErrorMessage(error)

    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Badge color={isNetwork || isTimeout ? 'orange' : 'red'}>
            {isNetwork ? '🌐 Lỗi kết nối' : isTimeout ? '⏱️ Hết thời gian chờ' : 'Lỗi'}
          </Badge>
          <Text>{errorMessage}</Text>
          {onRetry && (
            <Button onClick={onRetry} variant="light">
              Thử lại
            </Button>
          )}
          {isNetwork && (
            <Text size="sm" c="dimmed">
              💡 Kiểm tra kết nối mạng của bạn
            </Text>
          )}
          {isTimeout && (
            <Text size="sm" c="dimmed">
              💡 Máy chủ đang chậm, hãy thử lại sau
            </Text>
          )}
        </Stack>
      </Center>
    )
  }

  if (!items || items.length === 0) {
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
        {items.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource as ContentServiceTutorialResponse}
            onDownload={onDownload}
            type={type}
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
