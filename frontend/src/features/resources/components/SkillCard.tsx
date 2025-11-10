import { Card, Text, Stack, Group, ActionIcon } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import type { ContentServiceSkillResponse } from '@/api/types.gen'

interface SkillCardProps {
  skill: ContentServiceSkillResponse
  onViewDetails: (skill: ContentServiceSkillResponse) => void
  onDownload?: (skill: ContentServiceSkillResponse) => void
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
 * SkillCard Component
 * 
 * Displays a single skill in card format with:
 * - Skill name
 * - Description/content preview (truncated to 2 lines)
 * - Creation date
 * - Click handler to open detail modal
 * - Download button
 * 
 * @param skill - Skill data to display
 * @param onViewDetails - Callback when card is clicked to view details
 * @param onDownload - Callback when download button is clicked
 */
export function SkillCard({ 
  skill, 
  onViewDetails,
  onDownload,
}: SkillCardProps) {
  const createdDate = skill.createdAt
    ? new Date(skill.createdAt).toLocaleDateString('vi-VN')
    : 'N/A'

  const handleCardClick = () => {
    onViewDetails(skill)
  }

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDownload?.(skill)
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
      aria-label={`Xem chi tiết kỹ năng: ${skill.name}`}
    >
      <Stack gap="md">
        <div>
          <Group justify="space-between" align="flex-start" mb="xs">
            <Text fw={600} size="lg" lineClamp={2} style={{ flex: 1 }}>
              {skill.name || 'Không có tiêu đề'}
            </Text>
            {onDownload && (
              <ActionIcon
                variant="light"
                color="blue"
                size="lg"
                onClick={handleDownloadClick}
                title="Tải xuống kỹ năng"
              >
                <IconDownload size={16} />
              </ActionIcon>
            )}
          </Group>

          <Text size="sm" c="dimmed" lineClamp={2}>
            {skill.description || 'Không có mô tả'}
          </Text>
        </div>

        <Text size="xs" c="gray.5">
          Tạo ngày: {createdDate}
        </Text>
      </Stack>
    </Card>
  )
}
