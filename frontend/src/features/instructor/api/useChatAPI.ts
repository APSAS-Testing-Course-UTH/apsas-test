/**
 * Chat API Hooks
 * Vietnamese: Hooks cho API Chat
 * 
 * Hooks để tải dữ liệu chat, tin nhắn, và quản lý cuộc trò chuyện
 */

import { useQuery } from '@tanstack/react-query'
import { instructorKeys } from './queryKeys'
import type { ChatMessage, ChatSession } from '../components/InstructorChat'
import { MOCK_DATA_REGISTRY } from '@/mocks/factory/mockDataRegistry'

/**
 * Get all chat sessions for instructor
 */
export function useChatSessions() {
  return useQuery({
    queryKey: instructorKeys.chat.sessions(),
    queryFn: async (): Promise<ChatSession[]> => {
      // Get sessions from mock data registry
      const sessions = Array.isArray(MOCK_DATA_REGISTRY.supportSessions)
        ? MOCK_DATA_REGISTRY.supportSessions
        : Object.values(MOCK_DATA_REGISTRY.supportSessions || {})

      // Transform support sessions to chat sessions
      return sessions.map(session => {
        const lastMessage = session.messages?.[session.messages.length - 1]
        
        return {
          id: session.id,
          studentId: session.studentId,
          studentName: session.studentId === 'student-001' ? 'Nguyễn Văn A' : 
                       session.studentId === 'student-002' ? 'Trần Thị B' :
                       session.studentId === 'student-003' ? 'Lê Văn C' : 'Student',
          studentEmail: session.studentId === 'student-001' ? 'nva@student.edu.vn' :
                        session.studentId === 'student-002' ? 'ttb@student.edu.vn' :
                        session.studentId === 'student-003' ? 'lvc@student.edu.vn' : 'student@edu.vn',
          studentAvatar: session.studentId === 'student-001' ? 'NVA' : 
                        session.studentId === 'student-002' ? 'TTB' :
                        session.studentId === 'student-003' ? 'LVC' : 'ST',
          lastMessage: lastMessage?.content || 'Không có tin nhắn',
          lastMessageTime: lastMessage?.createdAt?.toISOString() || new Date().toISOString(),
          isOnline: session.studentId !== 'student-002', // student-002 is offline
          hasUnread: !lastMessage?.isRead && !lastMessage?.isInstructor,
          unreadCount: session.messages?.filter((m: any) => !m.isRead && !m.isInstructor).length || 0,
        }
      })
    },
    staleTime: 5 * 1000, // 5 seconds (for polling, in production use WebSocket)
  })
}

/**
 * Get messages for a specific chat session
 */
export function useChatMessages(sessionId: string) {
  return useQuery({
    queryKey: instructorKeys.chat.messages(sessionId),
    queryFn: async (): Promise<ChatMessage[]> => {
      // Get session from mock data registry
      const session = MOCK_DATA_REGISTRY.supportSessions[sessionId]

      if (!session) {
        return []
      }

      // Transform support messages to chat messages
      return (session.messages || []).map((msg: any) => ({
        id: msg.id || crypto.randomUUID(),
        senderId: msg.senderId || '',
        senderName: msg.isInstructor ? 'Giảng viên' : 'Sinh viên',
        senderAvatar: msg.isInstructor ? 'GV' : 'ST',
        text: msg.content || '',
        timestamp: msg.createdAt?.toISOString() || new Date().toISOString(),
        isOwn: msg.isInstructor || false,
      }))
    },
    enabled: !!sessionId,
    staleTime: 0, // Always refetch immediately when invalidated
  })
}

/**
 * Send a message to a chat session (stub for WebSocket connection)
 */
export function useSendMessage() {
  return async (sessionId: string, text: string) => {
    // In production, this would use WebSocket or API endpoint
    console.log('Sending message:', { sessionId, text })
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
  }
}
