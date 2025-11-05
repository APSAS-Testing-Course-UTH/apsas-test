import { useState } from 'react'
import { Card, Text, Badge, Stack, Group, ActionIcon } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import type { ContentServiceTutorialResponse } from '@/api/types.gen'
import { ResourceDetailModal } from './ResourceDetailModal'
import styles from './ResourceCard.module.css'

interface ResourceCardProps {
  resource: ContentServiceTutorialResponse
  onDownload?: (resource: ContentServiceTutorialResponse) => void
}

const flexColumnStyle = { flex: 1, display: 'flex', flexDirection: 'column' } as const
const autoFlexStyle = { flex: '0 0 auto' } as const

export function ResourceCard({ resource, onDownload }: ResourceCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const createdDate = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString('vi-VN')
    : 'N/A'

  const handleCardClick = () => {
    setIsDetailOpen(true)
  }

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDownload?.(resource)
  }

  return (
    <>
      <Card
        withBorder
        shadow="sm"
        p="md"
        radius="md"
        className={styles.card}
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        <Stack gap="sm" style={flexColumnStyle}>
          <Group justify="space-between" align="flex-start" style={autoFlexStyle}>
            <div>
              <Text fw={600} size="lg" lineClamp={2}>
                {resource.title || 'Không có tiêu đề'}
              </Text>
              <Text size="xs" c="dimmed" mt="xs">
                Tạo: {createdDate}
              </Text>
            </div>
            <Badge size="sm" variant="light">
              Hướng dẫn
            </Badge>
          </Group>

          <Text size="sm" c="dimmed" lineClamp={3} style={{ flex: 1 }}>
            {resource.content
              ? resource.content.substring(0, 150) + '...'
              : 'Không có mô tả'}
          </Text>

          {resource.tags && resource.tags.length > 0 && (
            <Group gap="xs" style={autoFlexStyle}>
              {resource.tags.map((tag, idx) => (
                <Badge key={idx} size="xs" variant="dot">
                  {tag}
                </Badge>
              ))}
            </Group>
          )}

          <Group gap="xs" justify="flex-end" style={autoFlexStyle}>
            <ActionIcon
              variant="light"
              size="lg"
              onClick={handleDownloadClick}
              title="Tải xuống"
            >
              <IconDownload size={16} />
            </ActionIcon>
          </Group>
        </Stack>
      </Card>

      <ResourceDetailModal
        resource={resource}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onDownload={onDownload}
      />
    </>
  )
}
