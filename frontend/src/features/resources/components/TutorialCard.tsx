import { Card, Stack, Text, Group, Badge, ActionIcon } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import type { ContentServiceTutorialResponse } from '@/api/types.gen'

interface TutorialCardProps {
  tutorial: ContentServiceTutorialResponse
  onViewDetails: (tutorial: ContentServiceTutorialResponse) => void
  onDownload?: (tutorial: ContentServiceTutorialResponse) => void
}

const CARD_STYLES = {
  withBorder: true,
  shadow: 'sm' as const,
  p: 'md' as const,
  radius: 'md' as const,
  style: {
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
  },
}

/**
 * TutorialCard Component
 * 
 * Displays a single tutorial in card format with:
 * - Tutorial title
 * - Description/content preview (truncated to 2 lines)
 * - Creation date
 * - Tags (if available)
 * - Click handler to open detail modal
 * - Download button
 * 
 * @param tutorial - Tutorial data to display
 * @param onViewDetails - Callback when card is clicked to view details
 * @param onDownload - Callback when download button is clicked
 */
export function TutorialCard({ 
  tutorial, 
  onViewDetails,
  onDownload,
}: TutorialCardProps) {
  const createdDate = tutorial.createdAt
    ? new Date(tutorial.createdAt).toLocaleDateString('vi-VN')
    : 'N/A'

  const handleCardClick = () => {
    onViewDetails(tutorial)
  }

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDownload?.(tutorial)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCardClick()
    }
  }

  return (
    <Card
      {...CARD_STYLES}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Xem chi tiết hướng dẫn: ${tutorial.title}`}
    >
      <Stack gap="md">
        <div>
          <Group justify="space-between" align="flex-start" mb="xs">
            <Text fw={600} size="lg" lineClamp={2} style={{ flex: 1 }}>
              {tutorial.title || 'Không có tiêu đề'}
            </Text>
            {onDownload && (
              <ActionIcon
                variant="light"
                color="blue"
                size="lg"
                onClick={handleDownloadClick}
                title="Tải xuống hướng dẫn"
              >
                <IconDownload size={16} />
              </ActionIcon>
            )}
          </Group>

          <Text size="sm" c="dimmed" lineClamp={2}>
            {tutorial.content || 'Không có mô tả'}
          </Text>
        </div>

        {/* Tags */}
        {tutorial.tags && tutorial.tags.length > 0 && (
          <Group gap="xs">
            {tutorial.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} size="xs" variant="dot" color="gray">
                {tag}
              </Badge>
            ))}
            {tutorial.tags.length > 3 && (
              <Badge size="xs" variant="dot" color="gray">
                +{tutorial.tags.length - 3}
              </Badge>
            )}
          </Group>
        )}

        <Text size="xs" c="gray.5">
          Tạo ngày: {createdDate}
        </Text>
      </Stack>
    </Card>
  )
}
