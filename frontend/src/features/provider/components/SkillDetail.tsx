/**
 * SkillDetail Component - View Skill Details
 *
 * Displays detailed information of a skill with:
 * - Skill name and description
 * - Created and updated dates
 * - Edit and back buttons
 * - Loading and error states
 * - Vietnamese UI 100%
 *
 * @see useSkillDetailQuery for data fetching
 * @see ContentServiceSkillResponse for type definition
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
import { useSkillDetailQuery } from '../api'
import { formatDateTime } from '@/utils/dateUtils'
import styles from './SkillDetail.module.css'

interface SkillDetailProps {
  skillId: string
  onEdit?: (skillId: string) => void
}

export function SkillDetail({ skillId, onEdit }: SkillDetailProps) {
  const navigate = useNavigate()

  // Fetch skill data
  const { data: skill, isLoading, error } = useSkillDetailQuery(skillId)

  // Handle edit
  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(skillId)
    } else {
      navigate({ to: `/provider/skills/${skillId}/edit` })
    }
  }, [skillId, onEdit, navigate])

  // Handle back
  const handleBack = useCallback(() => {
    navigate({ to: '/provider/skills' })
  }, [navigate])

  // Loading state
  if (isLoading) {
    return (
      <Container size="lg" className={styles.container}>
        <Center style={{ minHeight: '400px' }}>
          <Stack align="center" gap="md">
            <Loader />
            <Text>Đang tải thông tin kỹ năng...</Text>
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
          Không thể tải thông tin kỹ năng. Vui lòng thử lại.
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
  if (!skill) {
    return (
      <Container size="lg" className={styles.container}>
        <Alert icon={<IconAlertCircle size={16} />} title="Không tìm thấy">
          Kỹ năng này không tồn tại. Vui lòng kiểm tra ID.
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
            <Title order={2}>Chi tiết kỹ năng</Title>
          </Group>
        </Group>

        {/* Skill information */}
        <Stack gap="lg">
          {/* Name */}
          <div className={styles.section}>
            <Text size="sm" c="dimmed" fw={500}>
              Tên kỹ năng
            </Text>
            <Title order={3} mt="xs">
              {skill.name}
            </Title>
          </div>

          {/* Content preview */}
          <div className={styles.section}>
            <Text size="sm" c="dimmed" fw={500}>
              Mô tả
            </Text>
            <Text
              mt="xs"
              style={{ whiteSpace: 'pre-wrap' }}
              className={styles.contentPreview}
            >
              {skill.description
                ? skill.description.substring(0, 500) +
                  (skill.description.length > 500 ? '...' : '')
                : 'Không có mô tả'}
            </Text>
          </div>

          {/* Metadata */}
          <Group grow>
            <div className={styles.section}>
              <Text size="sm" c="dimmed" fw={500}>
                Ngày tạo
              </Text>
              <Text mt="xs">
                {skill.createdAt
                  ? formatDateTime(new Date(skill.createdAt))
                  : 'N/A'}
              </Text>
            </div>

            <div className={styles.section}>
              <Text size="sm" c="dimmed" fw={500}>
                Cập nhật lần cuối
              </Text>
              <Text mt="xs">
                {skill.updatedAt
                  ? formatDateTime(new Date(skill.updatedAt))
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
              {skill.id}
            </Badge>
          </div>
        </Stack>

        {/* Action buttons */}
        <Group justify="flex-end" mt="xl">
          <Button variant="light" onClick={handleBack}>
            Quay lại danh sách
          </Button>
          <Button onClick={handleEdit}>
            Chỉnh sửa kỹ năng
          </Button>
        </Group>
      </Paper>
    </Container>
  )
}
