/**
 * SupportPage Component
 * Main support chat page with real-time messaging
 * 
 * Layout:
 * - Left panel: List of chat sessions (25%)
 * - Right panel: Chat window with messages (75%)
 * 
 * Features:
 * - View list of support sessions
 * - Create new support session
 * - Real-time message viewing
 * - Close session option
 * - 100% Vietnamese UI
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Container, Grid, Stack, Paper, Title, Group, Button, Loader, Center, Text, ActionIcon, Pagination } from '@mantine/core'
import { IconPlus, IconRefresh } from '@tabler/icons-react'
import { useSupportSessions, useSupportSession } from '../api'
import { SessionsList } from './SessionsList'
import { ChatWindow } from './ChatWindow'
import { CreateSessionModal } from './CreateSessionModal'
import type { SupportSession } from '../types'
import styles from './SupportPage.module.css'

export function SupportPage() {
  // State for selected session and modals
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [sessionsPage, setSessionsPage] = useState(0)

  // Fetch sessions list with pagination (reduced from 100 to 20 for better performance)
  const { data: sessionsData, isLoading: isLoadingSessions, refetch: refetchSessions } = useSupportSessions({ page: sessionsPage, size: 20 })

  // Fetch selected session details (with enabled: !!selectedSessionId to avoid unnecessary fetches)
  const { data: selectedSession, isLoading: isLoadingSession, error: sessionError, refetch: refetchSession } = useSupportSession(
    selectedSessionId || undefined
  )

  // Debug: Log selected session data
  useEffect(() => {
    if (selectedSessionId) {
      console.log('[SupportPage]', {
        selectedSessionId,
        selectedSession: selectedSession ? { id: selectedSession.id, messageCount: selectedSession.messages?.length } : null,
        isLoadingSession,
        sessionError,
      })
    }
  }, [selectedSessionId])

  // Auto-refresh mechanism for real-time feel
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (selectedSessionId) {
      // Initial load of session
      // We only want to load once when selectedSessionId changes
      // TanStack Query will handle caching and updates
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [selectedSessionId])

  // Handle session selection
  const handleSelectSession = useCallback((session: SupportSession) => {
    if (session.id) {
      setSelectedSessionId(session.id)
    }
  }, [])

  // Handle new session created
  const handleSessionCreated = useCallback((newSession: SupportSession) => {
    setIsCreateModalOpen(false)
    if (newSession.id) {
      setSelectedSessionId(newSession.id)
    }
    refetchSessions()
  }, [refetchSessions])

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    refetchSessions()
    if (selectedSessionId) {
      refetchSession()
    }
  }, [selectedSessionId, refetchSession, refetchSessions])

  // Get list of sessions for sidebar
  const sessions = sessionsData?.content || []
  const totalPages = sessionsData?.totalPages || 1

  return (
    <Container size="xl" py="lg" className={styles.supportPage}>
      <Stack gap="lg" h="100%">
        {/* Page Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>Yêu cầu hỗ trợ</Title>
            <Text c="dimmed" size="sm">
              Nhắn tin với giảng viên để nhận hỗ trợ về bài tập
            </Text>
          </div>
          <Group gap="xs" align="center">
            {/* WebSocket Status Indicator - shown in ChatWindow now */}
            <ActionIcon
              variant="default"
              size="lg"
              onClick={handleRefresh}
              title="Làm mới danh sách"
            >
              <IconRefresh size={18} />
            </ActionIcon>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Tạo yêu cầu
            </Button>
          </Group>
        </Group>

        {/* Main Content - 2 Column Layout */}
        <Grid grow gutter="lg" style={{ flex: 1 }}>
          {/* Left Panel: Sessions List */}
          <Grid.Col span={{ base: 12, md: 3 }} className={styles.leftPanel}>
            <Paper withBorder p="md" h="100%">
              <Stack gap="md" h="100%">
                <Title order={3}>Lịch sử yêu cầu</Title>

                {isLoadingSessions && !sessions.length ? (
                  <Center py="xl">
                    <Loader size="sm" />
                  </Center>
                ) : sessions.length === 0 ? (
                  <Text c="dimmed" size="sm" ta="center" py="xl">
                    Không có yêu cầu nào
                  </Text>
                ) : (
                  <>
                    <SessionsList
                      sessions={sessions}
                      selectedSessionId={selectedSessionId}
                      onSelectSession={handleSelectSession}
                    />
                    {totalPages > 1 && (
                      <Group justify="center" mt="md">
                        <Pagination
                          value={sessionsPage + 1}
                          onChange={(page) => setSessionsPage(page - 1)}
                          total={totalPages}
                          size="sm"
                        />
                      </Group>
                    )}
                  </>
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Right Panel: Chat Window */}
          <Grid.Col span={{ base: 12, md: 9 }} className={styles.rightPanel}>
            {selectedSession ? (
              <ChatWindow session={selectedSession} onRefresh={() => refetchSession()} />
            ) : (
              <Paper withBorder p="md" h="100%">
                <Center h="100%">
                  <Stack gap="md" align="center">
                    <Text size="lg" fw={500}>
                      Chọn một yêu cầu để bắt đầu
                    </Text>
                    <Text c="dimmed" size="sm" ta="center">
                      Hoặc tạo một yêu cầu hỗ trợ mới để liên hệ với giảng viên
                    </Text>
                  </Stack>
                </Center>
              </Paper>
            )}
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSessionCreated={handleSessionCreated}
      />
    </Container>
  )
}
