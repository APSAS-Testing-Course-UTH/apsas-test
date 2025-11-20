/**
 * TutorialDetail Component - View Tutorial Details
 *
 * Displays detailed information of a tutorial with:
 * - Tutorial title and content preview
 * - Tags and metadata
 * - Created and updated dates
 * - Edit and back buttons
 * - Loading and error states
 * - Vietnamese UI 100%
 *
 * @see useTutorialDetailQuery for data fetching
 * @see ContentServiceTutorialResponse for type definition
 */

import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Container,
  Paper,
  Stack,
  Group,
  Button,
  Text,
  Loader,
  Center,
  Badge,
  Title,
  Alert,
} from '@mantine/core'
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react'
import { useTutorialDetailQuery } from '../api'
import { formatDateTime } from '@/utils/dateUtils'
import { MarkdownContent } from '@/components/MarkdownContent'
import styles from './TutorialDetail.module.css'

interface TutorialDetailProps {
  tutorialId: string
  onEdit?: (tutorialId: string) => void
}

export function TutorialDetail({ tutorialId, onEdit }: TutorialDetailProps) {
  const navigate = useNavigate()

  // Fetch tutorial data
  const { data: tutorial, isLoading, error } = useTutorialDetailQuery(tutorialId)

  // Handle edit
  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(tutorialId)
    } else {
      navigate({ to: `/provider/tutorials/${tutorialId}/edit` })
    }
  }, [tutorialId, onEdit, navigate])

  // Handle back
  const handleBack = useCallback(() => {
    navigate({ to: '/provider/tutorials' })
  }, [navigate])

  // Loading state
  if (isLoading) {
    return (
      <Container size="lg" className={styles.container}>
        <Center style={{ minHeight: '400px' }}>
          <Stack align="center" gap="md">
            <Loader />
            <Text>Đang tải thông tin hướng dẫn...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  // Error state
  if (error) {
    return (
      <Container size="lg" className={styles.container}>
        <Alert icon={<IconAlertCircle size={16} />} title="Lỗi" color="red">
          Không thể tải thông tin hướng dẫn. Vui lòng thử lại.
        </Alert>
        <Group justify="center" mt="md">
          <Button variant="light" onClick={handleBack}>
            Quay lại danh sách
          </Button>
        </Group>
      </Container>
    )
  }

  // Not found state
  if (!tutorial) {
    return (
      <Container size="lg" className={styles.container}>
        <Alert icon={<IconAlertCircle size={16} />} title="Không tìm thấy">
          Hướng dẫn này không tồn tại. Vui lòng kiểm tra ID.
        </Alert>
        <Group justify="center" mt="md">
          <Button variant="light" onClick={handleBack}>
            Quay lại danh sách
          </Button>
        </Group>
      </Container>
    )
  }

  return (
    <Container size="lg" className={styles.container}>
      <Paper radius="md" p="md" withBorder>
        {/* Header with back button */}
        <Group justify="space-between" mb="md">
          <Group>
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={18} />}
              onClick={handleBack}
              size="sm"
            >
              Quay lại
            </Button>
            <Title order={2}>Chi tiết hướng dẫn</Title>
          </Group>
        </Group>

        {/* Tutorial information */}
        <Stack gap="lg">
          {/* Title */}
          <div className={styles.section}>
            <Text size="sm" c="dimmed" fw={500}>
              Tiêu đề
            </Text>
            <Title order={3} mt="xs">
              {tutorial.title}
            </Title>
          </div>

          {/* Tags */}
          {tutorial.tags && tutorial.tags.length > 0 && (
            <div className={styles.section}>
              <Text size="sm" c="dimmed" fw={500}>
                Thẻ
              </Text>
              <Group mt="xs">
                {tutorial.tags.map((tag) => (
                  <Badge key={tag} variant="light">
                    {tag.toUpperCase()}
                  </Badge>
                ))}
              </Group>
            </div>
          )}

          {/* Content preview */}
          <div className={styles.section}>
            <Text size="sm" c="dimmed" fw={500}>
              Nội dung
            </Text>
            <div
              className={styles.contentPreview}
            >
              {tutorial.content ? (
                <MarkdownContent 
                  content={
                    tutorial.content.substring(0, 500) +
                    (tutorial.content.length > 500 ? '...' : '')
                  } 
                />
              ) : (
                <Text c="dimmed" fs="italic">
                  Không có nội dung
                </Text>
              )}
            </div>
          </div>

          {/* Metadata */}
          <Group grow>
            <div className={styles.section}>
              <Text size="sm" c="dimmed" fw={500}>
                Ngày tạo
              </Text>
              <Text mt="xs">
                {tutorial.createdAt
                  ? formatDateTime(new Date(tutorial.createdAt))
                  : 'N/A'}
              </Text>
            </div>

            <div className={styles.section}>
              <Text size="sm" c="dimmed" fw={500}>
                Cập nhật lần cuối
              </Text>
              <Text mt="xs">
                {tutorial.updatedAt
                  ? formatDateTime(new Date(tutorial.updatedAt))
                  : 'N/A'}
              </Text>
            </div>
          </Group>

          {/* ID for reference */}
          <div className={styles.section}>
            <Text size="sm" c="dimmed" fw={500}>
              ID
            </Text>
            <Badge variant="light" mt="xs">
              {tutorial.id}
            </Badge>
          </div>
        </Stack>

        {/* Action buttons */}
        <Group justify="flex-end" mt="xl">
          <Button variant="light" onClick={handleBack}>
            Quay lại danh sách
          </Button>
          <Button onClick={handleEdit}>
            Chỉnh sửa hướng dẫn
          </Button>
        </Group>
      </Paper>
    </Container>
  )
}
