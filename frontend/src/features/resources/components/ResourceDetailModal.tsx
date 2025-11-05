import { Modal, Stack, Badge, Group, Button, Text, ScrollArea } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import ReactMarkdown from 'react-markdown'
import type { ContentServiceTutorialResponse } from '@/api/types.gen'
import styles from './ResourceDetailModal.module.css'

interface ResourceDetailModalProps {
  resource: ContentServiceTutorialResponse | null
  isOpen: boolean
  onClose: () => void
  onDownload?: (resource: ContentServiceTutorialResponse) => void
}

/**
 * Modal to display full resource content with markdown rendering
 * Allows users to view complete tutorial/resource text with formatting
 */
export function ResourceDetailModal({
  resource,
  isOpen,
  onClose,
  onDownload,
}: ResourceDetailModalProps) {
  if (!resource) return null

  const createdDate = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString('vi-VN')
    : 'N/A'

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={resource.title || 'Chi tiết tài nguyên'}
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
            <Badge size="sm" variant="light">
              Hướng dẫn
            </Badge>
            <Text size="xs" c="dimmed">
              Tạo: {createdDate}
            </Text>
          </Group>
        </Group>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <Group gap="xs">
            {resource.tags.map((tag, idx) => (
              <Badge key={idx} size="xs" variant="dot">
                {tag}
              </Badge>
            ))}
          </Group>
        )}

        {/* Content with markdown rendering */}
        <div className={styles.contentWrapper}>
          {resource.content ? (
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
              {resource.content}
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
          {onDownload && (
            <Button
              leftSection={<IconDownload size={16} />}
              onClick={() => {
                onDownload(resource)
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
