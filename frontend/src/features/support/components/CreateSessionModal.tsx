/**
 * CreateSessionModal Component
 * Modal for creating a new support session
 * 
 * Features:
 * - Text input for initial message
 * - Form validation
 * - Loading state
 * - 100% Vietnamese UI
 */

import { useState } from 'react'
import { Modal, Stack, Textarea, Button, Group, Text } from '@mantine/core'
import { useCreateSupportSession } from '../api'
import type { SupportSession } from '../types'

interface CreateSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSessionCreated: (session: SupportSession) => void
}

export function CreateSessionModal({ isOpen, onClose, onSessionCreated }: CreateSessionModalProps) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const createSessionMutation = useCreateSupportSession()

  const handleSubmit = async () => {
    // Validation
    if (!message.trim()) {
      setError('Vui lòng nhập tin nhắn')
      return
    }

    if (message.trim().length < 10) {
      setError('Tin nhắn phải có ít nhất 10 ký tự')
      return
    }

    setError(null)

    try {
      const newSession = await createSessionMutation.mutateAsync({
        initialMessage: message.trim(),
      })
      setMessage('')
      onSessionCreated(newSession as SupportSession)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    }
  }

  const handleClose = () => {
    setMessage('')
    setError(null)
    onClose()
  }

  return (
    <Modal opened={isOpen} onClose={handleClose} title="Tạo yêu cầu hỗ trợ mới" centered>
      <Stack gap="md">
        <div>
          <Text size="sm" fw={500} mb={8}>
            Mô tả vấn đề của bạn
          </Text>
          <Textarea
            placeholder="Mô tả chi tiết vấn đề của bạn để giảng viên có thể hỗ trợ tốt hơn..."
            minRows={4}
            value={message}
            onChange={(e) => {
              setMessage(e.currentTarget.value)
              setError(null)
            }}
            disabled={createSessionMutation.isPending}
            error={error}
          />
          <Text size="xs" c="dimmed" mt={8}>
            Tối thiểu 10 ký tự
          </Text>
        </div>

        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose} disabled={createSessionMutation.isPending}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} loading={createSessionMutation.isPending}>
            Tạo yêu cầu
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
