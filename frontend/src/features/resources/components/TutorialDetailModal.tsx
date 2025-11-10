import { Modal, Stack, Badge, Group, Button, Text, ScrollArea, Loader, Alert } from '@mantine/core'
import { IconDownload, IconAlertCircle } from '@tabler/icons-react'
import ReactMarkdown from 'react-markdown'
import type { ContentServiceTutorialResponse } from '@/api/types.gen'
import { useTutorialDetailQuery } from '../api/hooks'
import styles from './ResourceDetailModal.module.css'

interface TutorialDetailModalProps {
  tutorialId: string | null
  isOpen: boolean
  onClose: () => void
  onDownload?: (resource: ContentServiceTutorialResponse) => void
}

/**
 * Modal to display tutorial details with markdown content rendering
 * Fetches tutorial data dynamically and displays full content
 * Supports:
 * - Loading state with spinner
 * - Error handling with retry option
 * - Markdown rendering with custom styling
 * - Vietnamese UI throughout
 */
export function TutorialDetailModal({
  tutorialId,
  isOpen,
  onClose,
  onDownload,
}: TutorialDetailModalProps) {
  // Fetch tutorial details
  const { data: tutorial, isLoading, error, refetch } = useTutorialDetailQuery(
    isOpen && tutorialId ? tutorialId : undefined
  )

  if (!isOpen || !tutorialId) {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <Modal opened={isOpen} onClose={onClose} title="Đang tải..." size="lg">
        <Stack align="center" gap="lg" py="xl">
          <Loader />
          <Text c="dimmed">Đang tải chi tiết hướng dẫn...</Text>
        </Stack>
      </Modal>
    )
  }

  // Error state
  if (error || !tutorial) {
    return (
      <Modal opened={isOpen} onClose={onClose} title="Lỗi" size="lg">
        <Stack gap="md">
          <Alert
            icon={<IconAlertCircle size={20} />}
            title="Không thể tải hướng dẫn"
            color="red"
            variant="light"
          >
            {error?.message || 'Không thể tải chi tiết hướng dẫn. Vui lòng thử lại.'}
          </Alert>
          <Group justify="flex-end">
            <Button variant="light" onClick={onClose}>
              Đóng
            </Button>
            <Button onClick={() => refetch()}>
              Thử lại
            </Button>
          </Group>
        </Stack>
      </Modal>
    )
  }

  // Render tutorial details
  const createdDate = tutorial.createdAt
    ? new Date(tutorial.createdAt).toLocaleDateString('vi-VN')
    : 'N/A'

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={tutorial.title || 'Chi tiết hướng dẫn'}
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
      classNames={{
        content: styles.modalContent,
      }}
    >
      <Stack gap="md">
        {/* Header with metadata */}
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <Badge size="sm" variant="light" color="blue">
              Hướng dẫn lập trình
            </Badge>
            <Text size="xs" c="dimmed">
              Tạo: {createdDate}
            </Text>
          </Group>
        </Group>

        {/* Tags */}
        {tutorial.tags && tutorial.tags.length > 0 && (
          <Group gap="xs">
            {tutorial.tags.map((tag, idx) => (
              <Badge key={idx} size="xs" variant="dot" color="gray">
                {tag}
              </Badge>
            ))}
          </Group>
        )}

        {/* Content with markdown rendering */}
        <div className={styles.contentWrapper}>
          {tutorial.content ? (
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className={styles.heading1} {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className={styles.heading2} {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className={styles.heading3} {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className={styles.paragraph} {...props} />
                ),
                code: ({ inline, ...props }: any) => (
                  <code
                    className={inline ? styles.inlineCode : styles.codeBlock}
                    {...props}
                  />
                ),
                pre: ({ node, ...props }) => (
                  <pre className={styles.preBlock} {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className={styles.unorderedList} {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className={styles.orderedList} {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className={styles.listItem} {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className={styles.blockquote} {...props} />
                ),
                table: ({ node, ...props }) => (
                  <table className={styles.table} {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a className={styles.link} target="_blank" rel="noopener noreferrer" {...props} />
                ),
              }}
            >
              {tutorial.content}
            </ReactMarkdown>
          ) : (
            <Text c="dimmed">Không có nội dung</Text>
          )}
        </div>

        {/* Action buttons */}
        <Group justify="flex-end" gap="xs">
          <Button variant="light" onClick={onClose}>
            Đóng
          </Button>
          {onDownload && tutorial && (
            <Button
              leftSection={<IconDownload size={16} />}
              onClick={() => {
                onDownload(tutorial)
                onClose()
              }}
            >
              Tải xuống
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  )
}
