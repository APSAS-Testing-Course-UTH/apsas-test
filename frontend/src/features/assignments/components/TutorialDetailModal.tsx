import {
  Modal,
  Stack,
  Text,
  Group,
  Badge,
  Button,
  Alert,
  Loader,
  Center,
} from '@mantine/core'
import { IconAlertCircle, IconX } from '@tabler/icons-react'
import Markdown from 'react-markdown'

import { useTutorialDetail } from '../api/useTutorialDetail'
import styles from './TutorialDetailModal.module.css'

interface TutorialDetailModalProps {
  /** Tutorial ID to display */
  tutorialId?: string
  /** Whether the modal is open */
  opened: boolean
  /** Callback when modal should close */
  onClose: () => void
}

const labels = {
  title: 'Chi tiết Tài liệu',
  creator: 'Tác giả',
  tags: 'Nhãn',
  createdAt: 'Ngày tạo',
  loadingTutorial: 'Đang tải tài liệu...',
  errorLoadingTutorial: 'Lỗi khi tải tài liệu',
  tutorialNotFound: 'Không tìm thấy tài liệu',
  close: 'Đóng',
}

/**
 * Format date in Vietnamese format
 */
function formatVietnameseDate(date: Date | string | undefined): string {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

export function TutorialDetailModal({
  tutorialId,
  opened,
  onClose,
}: TutorialDetailModalProps) {
  const { data: tutorial, isLoading, error } = useTutorialDetail(tutorialId || '')

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={labels.title}
      size="lg"
      scrollAreaComponent={Stack}
      closeButtonProps={{ 'aria-label': labels.close }}
    >
      <Stack gap="md">
        {/* Loading state */}
        {isLoading && (
          <Center py="xl">
            <Stack align="center" gap="sm">
              <Loader size="lg" color="blue" />
              <Text c="dimmed">{labels.loadingTutorial}</Text>
            </Stack>
          </Center>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <Alert
            icon={<IconAlertCircle />}
            title={labels.errorLoadingTutorial}
            color="red"
            role="alert"
          >
            {error instanceof Error ? error.message : labels.errorLoadingTutorial}
          </Alert>
        )}

        {/* Not found state */}
        {!isLoading && !error && !tutorial && (
          <Alert
            icon={<IconAlertCircle />}
            title={labels.tutorialNotFound}
            color="yellow"
            role="alert"
          >
            ID: {tutorialId || 'N/A'}
          </Alert>
        )}

        {/* Success state - Tutorial content */}
        {!isLoading && !error && tutorial && (
          <Stack gap="md">
            {/* Tutorial Title */}
            <Text fw={700} size="xl" className={styles.tutorialTitle}>
              {tutorial.title}
            </Text>

            {/* Metadata: Creator & Date */}
            <Group justify="space-between" wrap="wrap">
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  {labels.creator}:
                </Text>
                <Text size="sm" fw={500}>
                  {tutorial.creatorId}
                </Text>
              </Group>

              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  {labels.createdAt}:
                </Text>
                <Text size="sm" fw={500}>
                  {formatVietnameseDate(tutorial.createdAt)}
                </Text>
              </Group>
            </Group>

            {/* Tags */}
            {tutorial.tags && tutorial.tags.length > 0 && (
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  {labels.tags}:
                </Text>
                <Group gap={4}>
                  {tutorial.tags.map((tag) => (
                    <Badge key={tag} variant="light" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </Group>
              </Group>
            )}

            {/* Tutorial Content - Markdown Rendering */}
            <div className={styles.markdownContent}>
              <Markdown>{tutorial.content || ''}</Markdown>
            </div>

            {/* Close Button */}
            <Button
              onClick={onClose}
              fullWidth
              mt="lg"
              leftSection={<IconX size={16} />}
              variant="light"
            >
              {labels.close}
            </Button>
          </Stack>
        )}
      </Stack>
    </Modal>
  )
}
