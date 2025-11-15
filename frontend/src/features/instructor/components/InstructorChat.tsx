/**
 * Real-time Chat Component for Instructor-Student Support
 * Vietnamese: Chat Hỗ trợ Thời gian thực
 * 
 * Features:
 * - List of student conversations
 * - Real-time message exchange
 * - Message history
 * - Typing indicators
 * - Online/offline status
 */

import { useState, useEffect, useRef } from 'react'
import {
  Card, Stack, Text, Input, Button, ScrollArea, Group, Badge, Avatar, Loader, Center, Textarea
} from '@mantine/core'
import { IconSend, IconSearch, IconDots } from '@tabler/icons-react'

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  text: string
  timestamp: string
  isOwn: boolean
}

export interface ChatSession {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  studentAvatar?: string
  lastMessage?: string
  lastMessageTime?: string
  isOnline: boolean
  hasUnread: boolean
  unreadCount: number
}

interface InstructorChatProps {
  sessions?: ChatSession[]
  messages?: ChatMessage[]
  selectedSessionId?: string
  onSelectSession?: (sessionId: string) => void
  onSendMessage?: (sessionId: string, text: string) => Promise<void>
  isLoadingSessions?: boolean
  isLoadingMessages?: boolean
}

export function InstructorChat({
  sessions = [],
  messages = [],
  selectedSessionId,
  onSelectSession,
  onSendMessage,
  isLoadingSessions = false,
  isLoadingMessages = false,
}: InstructorChatProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Filter sessions by search
  const filteredSessions = sessions.filter((session) =>
    session.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedSessionId || !onSendMessage) return

    try {
      setIsSending(true)
      await onSendMessage(selectedSessionId, messageText)
      setMessageText('')
    } finally {
      setIsSending(false)
    }
  }

  const selectedSession = sessions.find(s => s.id === selectedSessionId)

  return (
    <Group gap="lg" align="flex-start" style={{ height: '600px' }}>
      {/* Sessions List */}
      <Card withBorder shadow="sm" p="0" radius="md" style={{ flex: '0 0 300px', height: '100%' }}>
        <Stack gap="0" style={{ height: '100%' }}>
          {/* Search Bar */}
          <div style={{ padding: '12px', borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
            <Input
              placeholder="Tìm kiếm sinh viên..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              size="sm"
            />
          </div>

          {/* Sessions Scroll Area */}
          <ScrollArea style={{ flex: 1 }}>
            {isLoadingSessions ? (
              <Center py="xl">
                <Loader size="sm" />
              </Center>
            ) : filteredSessions.length === 0 ? (
              <div style={{ padding: '16px' }}>
                <Text size="sm" c="dimmed" ta="center">
                  {searchQuery ? 'Không tìm thấy sinh viên' : 'Chưa có cuộc trò chuyện'}
                </Text>
              </div>
            ) : (
              <Stack gap="0">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onSelectSession?.(session.id)}
                    style={{
                      padding: '12px',
                      borderBottom: '1px solid var(--mantine-color-gray-2)',
                      backgroundColor:
                        selectedSessionId === session.id
                          ? 'var(--mantine-color-blue-0)'
                          : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSessionId !== session.id) {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor =
                          'var(--mantine-color-gray-1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSessionId !== session.id) {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Group gap="xs" align="flex-start" wrap="nowrap">
                        <div style={{ position: 'relative' }}>
                          <Avatar name={session.studentName} size="sm" />
                          {session.isOnline && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--mantine-color-green-6)',
                                border: '2px solid white',
                              }}
                            />
                          )}
                        </div>
                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                          <Text size="sm" fw={500} truncate>
                            {session.studentName}
                          </Text>
                          <Text size="xs" c="dimmed" truncate>
                            {session.lastMessage || 'Không có tin nhắn'}
                          </Text>
                        </Stack>
                      </Group>
                      {session.hasUnread && (
                        <Badge size="xs" color="red" circle>
                          {session.unreadCount}
                        </Badge>
                      )}
                    </Group>
                  </div>
                ))}
              </Stack>
            )}
          </ScrollArea>
        </Stack>
      </Card>

      {/* Chat Area */}
      <Card withBorder shadow="sm" p="0" radius="md" style={{ flex: 1, height: '100%' }}>
        {!selectedSessionId ? (
          <Center style={{ height: '100%' }}>
            <Stack align="center" gap="md">
              <Text c="dimmed">Chọn sinh viên để bắt đầu chat</Text>
            </Stack>
          </Center>
        ) : (
          <Stack gap="0" style={{ height: '100%' }}>
            {/* Chat Header */}
            <div
              style={{
                padding: '12px',
                borderBottom: '1px solid var(--mantine-color-gray-3)',
                backgroundColor: 'var(--mantine-color-gray-0)',
              }}
            >
              <Group justify="space-between">
                <Group gap="xs">
                  <Avatar name={selectedSession?.studentName} size="sm" />
                  <Stack gap={0}>
                    <Text size="sm" fw={500}>
                      {selectedSession?.studentName}
                    </Text>
                    <Group gap={4}>
                      <Badge size="xs" color={selectedSession?.isOnline ? 'green' : 'gray'}>
                        {selectedSession?.isOnline ? 'Online' : 'Offline'}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {selectedSession?.studentEmail}
                      </Text>
                    </Group>
                  </Stack>
                </Group>
                <Button variant="subtle" size="xs" p="xs">
                  <IconDots size={16} />
                </Button>
              </Group>
            </div>

            {/* Messages Area */}
            <ScrollArea style={{ flex: 1, padding: '12px' }} viewportRef={scrollRef}>
              {isLoadingMessages ? (
                <Center py="xl">
                  <Loader size="sm" />
                </Center>
              ) : messages.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="lg">
                  Chưa có tin nhắn. Bắt đầu cuộc trò chuyện!
                </Text>
              ) : (
                <Stack gap="xs">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: msg.isOwn ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Card
                        withBorder
                        shadow="sm"
                        p="xs"
                        radius="md"
                        style={{
                          maxWidth: '70%',
                          backgroundColor: msg.isOwn
                            ? 'var(--mantine-color-blue-6)'
                            : 'var(--mantine-color-gray-2)',
                        }}
                      >
                        <Stack gap={2}>
                          <Text
                            size="sm"
                            c={msg.isOwn ? 'white' : 'black'}
                            style={{ wordBreak: 'break-word' }}
                          >
                            {msg.text}
                          </Text>
                          <Text
                            size="xs"
                            c={msg.isOwn ? 'rgba(255, 255, 255, 0.7)' : 'dimmed'}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </Stack>
                      </Card>
                    </div>
                  ))}
                </Stack>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div
              style={{
                padding: '12px',
                borderTop: '1px solid var(--mantine-color-gray-3)',
                backgroundColor: 'var(--mantine-color-gray-0)',
              }}
            >
              <Group gap="xs">
                <Textarea
                  placeholder="Nhập tin nhắn..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleSendMessage()
                    }
                  }}
                  minRows={1}
                  maxRows={3}
                  autoFocus
                  disabled={isSending}
                  style={{ flex: 1 }}
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSending}
                  loading={isSending}
                >
                  <IconSend size={16} />
                </Button>
              </Group>
            </div>
          </Stack>
        )}
      </Card>
    </Group>
  )
}
