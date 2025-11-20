/**
 * ChatWindow Component
 * Displays chat messages and input for a support session
 * 
 * Features:
 * - Real-time message display via WebSocket
 * - Instructor vs Student message styling
 * - Auto-scroll to latest message
 * - Message input and sending via STOMP
 * - Close session button
 * - Connection status indicator
 * - 100% Vietnamese UI
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import { Stack, Group, Paper, Text, Button, ActionIcon, Tooltip, Badge, Center, Modal, Textarea, ScrollArea } from '@mantine/core'
import { IconSend, IconX, IconRefresh, IconAlertCircle } from '@tabler/icons-react'
import { useCloseSupportSession } from '../api'
import { useWebSocket } from '../hooks/useWebSocket'
import { useSupportSession } from '../hooks/useSupportSession'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { env } from '@/configs/env'
import type { SupportSession, SupportMessage } from '../types'
import styles from './SupportPage.module.css'

interface ChatWindowProps {
  session: SupportSession
  onRefresh: () => void
}

export function ChatWindow({ session, onRefresh }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [isConfirmingClose, setIsConfirmingClose] = useState(false)
  const [messageContent, setMessageContent] = useState('')

  // Get current user info for message styling
  const currentUser = useAuthStore((state) => state.user)
  const closeSessionMutation = useCloseSupportSession()

  // WebSocket connection with new hook
  const wsUrl = env.VITE_WEBSOCKET_URL || 'http://localhost:8080/ws/support'
  const { isConnected, subscribe, send, error: wsError } = useWebSocket({
    url: wsUrl,
    debug: true,
    onConnect: () => console.log('[ChatWindow] WebSocket connected'),
    onDisconnect: () => console.log('[ChatWindow] WebSocket disconnected'),
    onError: (error) => console.error('[ChatWindow] WebSocket error:', error),
  })

  // Session messaging with new hook
  const { messages: wsMessages, sendMessage, isSending, error: sessionError } = useSupportSession({
    sessionId: session.id,
    isConnected,
    subscribe,
    send,
  })

  // Combine WebSocket and REST errors
  const stompSession = {
    isConnected,
    isSending,
    messages: wsMessages,
    sendMessage,
    error: wsError || sessionError,
  }

  // Combine REST messages from session with WebSocket messages
  // REST messages are initial batch, WebSocket delivers new messages in real-time
  // Deduplicate by message ID to prevent duplicates when refresh refetches REST data
  const allMessages: SupportMessage[] = useMemo(() => {
    const messageMap = new Map<string, SupportMessage>()
    
    // Add REST messages first
    session.messages?.forEach((msg) => {
      if (msg.id) {
        messageMap.set(msg.id, msg)
      }
    })
    
    // Add WebSocket messages (will overwrite if same ID)
    stompSession.messages.forEach((msg) => {
      if (msg.id) {
        messageMap.set(msg.id, msg)
      }
    })
    
    // Convert to array and sort by timestamp
    return Array.from(messageMap.values()).sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return timeA - timeB
    })
  }, [session.messages, stompSession.messages])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages])

  // Format date
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } else {
      return d.toLocaleDateString('vi-VN')
    }
  }

  // Determine message background color based on sender
  // If sender is current user (same role): blue background
  // If sender is other person (different role): gray background
  const getMessageBackgroundColor = (message: SupportMessage): string => {
    if (!currentUser) return '#f5f5f5' // Default to gray if no current user
    
    const isSenderStudent = !message.isInstructor
    const isCurrentUserStudent = currentUser.role === 'STUDENT'
    
    // If sender role matches current user role, it's the current user's message (blue)
    // Otherwise, it's the other person's message (gray)
    const isCurrentUserMessage = isSenderStudent === isCurrentUserStudent
    
    return isCurrentUserMessage ? '#e3f2fd' : '#f5f5f5'
  }

  // Determine message alignment based on sender
  const getMessageAlignment = (message: SupportMessage): 'flex-start' | 'flex-end' => {
    if (!currentUser) return 'flex-start'
    
    const isSenderStudent = !message.isInstructor
    const isCurrentUserStudent = currentUser.role === 'STUDENT'
    
    const isCurrentUserMessage = isSenderStudent === isCurrentUserStudent
    
    // Current user's messages align to the right (flex-end)
    // Other person's messages align to the left (flex-start)
    return isCurrentUserMessage ? 'flex-end' : 'flex-start'
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      return
    }

    try {
      await sendMessage(messageContent)
      setMessageContent('')
    } catch (error) {
      console.error('[ChatWindow] Failed to send message:', error)
    }
  }

  // Handle close session
  const handleCloseSession = async () => {
    setIsClosing(true)
    try {
      await closeSessionMutation.mutateAsync(session.id || '')
      setIsConfirmingClose(false)
      onRefresh()
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <Paper withBorder p="md" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Group justify="space-between" mb="md" pb="md" style={{ borderBottom: '1px solid #e9ecef' }}>
        <Stack gap={4}>
          <Group gap={8}>
            <Text fw={500}>
              Yêu cầu #{session.id?.slice(0, 8)}
            </Text>
            {session.isClosed ? (
              <Badge color="gray">Đã đóng</Badge>
            ) : (
              <Badge color="green">Mở</Badge>
            )}
            {/* Connection Status - only show if session is not closed */}
            {!session.isClosed && stompSession.isConnected && (
              <Badge color="blue" variant="filled">
                🟢 Real-time (Trực tuyến)
              </Badge>
            )}
          </Group>
          <Group gap={8}>
            <Text size="sm" c="dimmed">
              Tạo lúc: {session.createdAt ? new Date(session.createdAt).toLocaleString('vi-VN') : 'N/A'}
            </Text>
            {stompSession.error && (
              <Tooltip label={stompSession.error.message}>
                <IconAlertCircle size={16} color="red" />
              </Tooltip>
            )}
          </Group>
        </Stack>

        <Group gap="xs">
          <ActionIcon variant="default" onClick={onRefresh} title="Làm mới">
            <IconRefresh size={18} />
          </ActionIcon>
          {/* Only show close button if session is open AND current user is the student who created it */}
          {!session.isClosed && currentUser?.id === session.studentId && (
            <Tooltip label="Đóng yêu cầu">
              <ActionIcon
                color="red"
                variant="light"
                onClick={() => setIsConfirmingClose(true)}
                disabled={isClosing}
              >
                <IconX size={18} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>

      {/* Messages Container */}
      <ScrollArea 
        flex={1} 
        mb="md" 
        style={{ maxHeight: '500px' }}
        type="auto"
        offsetScrollbars
      >
        <Stack gap="md" pr="md">
          {allMessages.length === 0 ? (
            <Center h={200}>
              <Text c="dimmed">Chưa có tin nhắn</Text>
            </Center>
          ) : (
            <>
              {allMessages.map((message) => (
                <Group
                  key={message.id}
                  gap={8}
                  justify={getMessageAlignment(message)}
                >
                  <Paper
                    className={styles.messageBubble}
                    p="sm"
                    style={{
                      maxWidth: '70%',
                      backgroundColor: getMessageBackgroundColor(message),
                      borderRadius: '8px',
                    }}
                  >
                    <Text size="sm">{message.content}</Text>
                    <Group gap={4} justify="space-between">
                      <Text size="xs" c="dimmed" className={styles.timestamp}>
                        {formatDate(message.createdAt)}
                      </Text>
                      {!message.isInstructor && (
                        <Text size="xs" c="dimmed" title={message.isRead ? 'Đã đọc' : 'Đã gửi'}>
                          {message.isRead ? '✓✓' : '✓'}
                        </Text>
                      )}
                    </Group>
                  </Paper>
                </Group>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </Stack>
      </ScrollArea>

      {/* Input Area */}
      {!session.isClosed ? (
        <Group gap="xs" pt="md" style={{ borderTop: '1px solid #e9ecef' }}>
          <Textarea
            flex={1}
            placeholder="Nhập tin nhắn... (Shift + Enter để xuống dòng)"
            value={messageContent}
            onChange={(e) => setMessageContent(e.currentTarget.value)}
            minRows={1}
            maxRows={4}
            disabled={session.isClosed || isSending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            autoFocus
            styles={{
              input: {
                borderRadius: '8px',
                fontSize: '14px',
                lineHeight: '1.5',
                padding: '10px 12px',
              },
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={session.isClosed || !messageContent.trim() || isSending}
            loading={isSending}
            title="Nhấn Enter hoặc click để gửi"
            size="md"
            h="auto"
            py="md"
          >
            <IconSend size={18} />
          </Button>
        </Group>
      ) : (
        <Group gap="xs" pt="md" style={{ borderTop: '1px solid #e9ecef' }}>
          <Text c="dimmed" size="sm" flex={1}>
            ✓ Yêu cầu này đã được đóng
          </Text>
        </Group>
      )}

      {/* Close Confirmation Modal */}
      <Modal
        opened={isConfirmingClose}
        onClose={() => setIsConfirmingClose(false)}
        title="Đóng yêu cầu hỗ trợ"
        centered
      >
        <Stack gap="md">
          <Text>Bạn có chắc chắn muốn đóng yêu cầu này không? Hành động này không thể hoàn tác.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setIsConfirmingClose(false)}>
              Hủy
            </Button>
            <Button color="red" onClick={handleCloseSession} loading={isClosing}>
              Đóng yêu cầu
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  )
}
