/**
 * SessionsList Component
 * Displays list of support sessions in left sidebar
 * 
 * Features:
 * - Session list with status
 * - Active session highlighting
 * - Click to select session
 * - 100% Vietnamese UI
 */

import { useCallback } from 'react'
import { Stack, Group, Text, Badge } from '@mantine/core'
import type { SupportSession } from '../types'
import styles from './SupportPage.module.css'

interface SessionsListProps {
  sessions: SupportSession[]
  selectedSessionId: string | null
  onSelectSession: (session: SupportSession) => void
}

export function SessionsList({ sessions, selectedSessionId, onSelectSession }: SessionsListProps) {
  const handleSelectSession = useCallback(
    (session: SupportSession) => {
      onSelectSession(session)
    },
    [onSelectSession]
  )

  if (sessions.length === 0) {
    return (
      <Text c="dimmed" size="sm" ta="center" py="xl">
        Không có yêu cầu nào
      </Text>
    )
  }

  return (
    <Stack gap="xs">
      {sessions.map((session) => (
        <Group
          key={session.id}
          className={`${styles.sessionItem} ${selectedSessionId === session.id ? styles.active : ''}`}
          onClick={() => handleSelectSession(session)}
          justify="space-between"
          wrap="nowrap"
        >
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Group gap={6}>
              <Text fw={500} size="sm" truncate>
                Yêu cầu #{session.id?.slice(0, 8) || 'unknown'}
              </Text>
              {session.isClosed ? (
                <Badge size="xs" variant="light" color="gray">
                  Đã đóng
                </Badge>
              ) : (
                <Badge size="xs" variant="light" color="green">
                  Mở
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed" truncate>
              {session.messages && session.messages.length > 0 ? session.messages[session.messages.length - 1].content : 'Không có tin nhắn'}
            </Text>
            <Text size="xs" c="dimmed">
              {new Date(session.createdAt || '').toLocaleDateString('vi-VN')}
            </Text>
          </Stack>
        </Group>
      ))}
    </Stack>
  )
}
