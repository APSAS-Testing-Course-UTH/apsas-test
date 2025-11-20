/**
 * InstructorSupportPage Component
 * Support chat page for instructors to respond to student requests
 * 
 * Key differences from StudentSupportPage:
 * - Views ALL support sessions from all students (not just own)
 * - NO "Create Session" button (only students create sessions)
 * - Different messaging: helping students, not asking for help
 * - Auto-assigned to sessions when first responding
 * 
 * Layout:
 * - Left panel: List of all student chat sessions (25%)
 * - Right panel: Chat window with messages (75%)
 * 
 * Features:
 * - View ALL student support sessions
 * - Real-time message viewing
 * - Respond to student queries
 * - See session status (open/closed)
 * - 100% Vietnamese UI
 */

import { useState, useCallback } from 'react'
import type { ApiErrorResponse } from '@/configs/api-error-handler'
import { Container, Grid, Stack, Paper, Title, Group, Button, Loader, Center, Text, ActionIcon, Pagination, Alert } from '@mantine/core'
import { IconRefresh, IconAlertCircle } from '@tabler/icons-react'
import { useSupportSessions, useSupportSession } from '../api'
import { SessionsList } from './SessionsList'
import { ChatWindow } from './ChatWindow'
import type { SupportSession } from '../types'
import {
  getErrorMessage,
  isNetworkError,
  isTimeoutError,
} from '@/features/student/utils'
import styles from './SupportPage.module.css'

export function InstructorSupportPage() {
  // State for selected session
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [sessionsPage, setSessionsPage] = useState(0)

  // Fetch ALL sessions (instructors can view all student sessions)
  const { data: sessionsData, isLoading: isLoadingSessions, refetch: refetchSessions } = useSupportSessions({ page: sessionsPage, size: 20 })

  // Fetch selected session details
  const { data: selectedSession, error: sessionError, refetch: refetchSession } = useSupportSession(
    selectedSessionId || undefined
  )

  // Handle session selection
  const handleSelectSession = useCallback((session: SupportSession) => {
    if (session.id) {
      setSelectedSessionId(session.id)
    }
  }, [])

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
            <Title order={1}>Hỗ trợ Sinh viên</Title>
            <Text c="dimmed" size="sm">
              Xem và trả lời yêu cầu hỗ trợ từ sinh viên
            </Text>
          </div>
          <Group gap="xs" align="center">
            <ActionIcon
              variant="default"
              size="lg"
              onClick={handleRefresh}
              title="Làm mới danh sách"
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Main Content - 2 Column Layout */}
        <Grid grow gutter="lg" style={{ flex: 1 }}>
          {/* Left Panel: Sessions List */}
          <Grid.Col span={{ base: 12, md: 3 }} className={styles.leftPanel}>
            <Paper withBorder p="md" h="100%">
              <Stack gap="md" h="100%">
                <Title order={3}>Yêu cầu hỗ trợ</Title>

                {isLoadingSessions && !sessions.length ? (
                  <Center py="xl">
                    <Loader size="sm" />
                  </Center>
                ) : sessionError ? (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Lỗi tải danh sách"
                    color={
                      isNetworkError(sessionError as ApiErrorResponse) ||
                      isTimeoutError(sessionError as ApiErrorResponse)
                        ? 'orange'
                        : 'red'
                    }
                    variant="light"
                  >
                    {getErrorMessage(sessionError)}
                    <Button
                      size="xs"
                      mt="sm"
                      onClick={handleRefresh}
                      variant="light"
                    >
                      Thử lại
                    </Button>
                  </Alert>
                ) : sessions.length === 0 ? (
                  <Text c="dimmed" size="sm" ta="center" py="xl">
                    Chưa có yêu cầu hỗ trợ nào
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
              <ChatWindow 
                session={selectedSession} 
                onRefresh={() => refetchSession()} 
              />
            ) : sessionError ? (
              <Paper withBorder p="md" h="100%">
                <Center h="100%">
                  <Stack gap="md" align="center">
                    <Alert
                      icon={<IconAlertCircle size={16} />}
                      title="Lỗi tải yêu cầu"
                      color={
                        isNetworkError(sessionError as ApiErrorResponse) ||
                        isTimeoutError(sessionError as ApiErrorResponse)
                          ? 'orange'
                          : 'red'
                      }
                      variant="light"
                      style={{ width: '100%' }}
                    >
                      {getErrorMessage(sessionError)}
                    </Alert>
                    <Button onClick={() => refetchSession()} variant="light">
                      Thử lại
                    </Button>
                  </Stack>
                </Center>
              </Paper>
            ) : (
              <Paper withBorder p="md" h="100%">
                <Center h="100%">
                  <Stack gap="md" align="center">
                    <Text size="lg" fw={500}>
                      Chọn một yêu cầu để xem chi tiết
                    </Text>
                    <Text c="dimmed" size="sm" ta="center">
                      Danh sách bên trái hiển thị tất cả yêu cầu hỗ trợ từ sinh viên
                    </Text>
                  </Stack>
                </Center>
              </Paper>
            )}
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}
