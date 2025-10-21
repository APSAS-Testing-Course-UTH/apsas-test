import { http, HttpResponse } from 'msw'
import type {
  SupportServiceSupportSessionDto,
  SupportServicePageResponseSupportSessionDto,
  SupportServiceCreateSupportSessionRequest,
} from '@/api/types.gen'
import { withAuth } from '../middleware/withAuth'
import { UserRole } from '../middleware/withAuth'

const BASE_URL = 'http://localhost:3000'

// Mock data for support service
const mockSessions: Record<string, SupportServiceSupportSessionDto> = {
  'sess-001': {
    id: 'sess-001',
    studentId: '00000000-0000-0000-0000-000000000003', // student user
    instructorId: '00000000-0000-0000-0000-000000000002', // instructor user
    isClosed: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    closedAt: undefined,
    messages: [
      {
        id: 'msg-001',
        senderId: '00000000-0000-0000-0000-000000000003',
        content: 'I need help with the JavaScript assignment. I\'m stuck on the array methods.',
        isInstructor: false,
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'msg-002',
        senderId: '00000000-0000-0000-0000-000000000002',
        content: 'Sure, I can help you with that. Which specific array method are you having trouble with?',
        isInstructor: true,
        isRead: true,
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      },
      {
        id: 'msg-003',
        senderId: '00000000-0000-0000-0000-000000000003',
        content: 'I\'m confused about map() and filter(). Can you explain the difference?',
        isInstructor: false,
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
  },
  'sess-002': {
    id: 'sess-002',
    studentId: '00000000-0000-0000-0000-000000000004', // another student
    instructorId: '00000000-0000-0000-0000-000000000002', // same instructor
    isClosed: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    closedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // closed 20 hours ago
    messages: [
      {
        id: 'msg-004',
        senderId: '00000000-0000-0000-0000-000000000004',
        content: 'Hello, I have a question about Python list comprehensions.',
        isInstructor: false,
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: 'msg-005',
        senderId: '00000000-0000-0000-0000-000000000002',
        content: 'Hi! List comprehensions are a concise way to create lists. What specifically would you like to know?',
        isInstructor: true,
        isRead: true,
        createdAt: new Date(Date.now() - 23.5 * 60 * 60 * 1000),
      },
      {
        id: 'msg-006',
        senderId: '00000000-0000-0000-0000-000000000004',
        content: 'Thanks for the explanation! I think I understand now.',
        isInstructor: false,
        isRead: true,
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      },
    ],
  },
}

export const supportHandlers = [
  /**
   * GET /api/v1/support/sessions
   * List support sessions with filtering and pagination
   * - Students see only their own sessions
   * - Instructors see all sessions
   * - Supports filters: userId, email, firstName, lastName, role, isActive
   */
  http.get(
    `${BASE_URL}/api/v1/support/sessions`,
    withAuth(({ request, user }: { request: Request; user: any }) => {
      const url = new URL(request.url)
      const page = Number(url.searchParams.get('page')) || 0
      const size = Number(url.searchParams.get('size')) || 10

      let sessions = Object.values(mockSessions)

      // Filter based on user role
      if (user.role === UserRole.STUDENT) {
        // Students only see their own sessions
        sessions = sessions.filter(session => session.studentId === user.id)
      }
      // Instructors see all sessions (no filtering needed)

      const totalElements = sessions.length
      const totalPages = Math.ceil(totalElements / size)
      const startIndex = page * size
      const endIndex = startIndex + size

      const response = {
        content: sessions.slice(startIndex, endIndex),
        pageNumber: page,
        pageSize: size,
        totalElements: totalElements,
        totalPages,
        first: page === 0,
        last: page >= totalPages - 1,
        hasNext: page < totalPages - 1,
        hasPrevious: page > 0,
      } as unknown as SupportServicePageResponseSupportSessionDto

      return HttpResponse.json(response, { status: 200 })
    })
  ),

  /**
   * POST /api/v1/support/sessions
   * Create a new support session (Students only)
   */
  http.post(
    `${BASE_URL}/api/v1/support/sessions`,
    withAuth(async ({ request, user }: { request: Request; user: any }) => {
      // Only students can create support sessions
      if (user.role !== UserRole.STUDENT) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Only students can create support sessions' },
          { status: 403 }
        )
      }

      const body: SupportServiceCreateSupportSessionRequest = await request.json()

      // Validate required fields
      if (!body.initialMessage || body.initialMessage.trim().length === 0) {
        return HttpResponse.json(
          { error: 'Bad Request', message: 'Initial message is required' },
          { status: 400 }
        )
      }

      const sessionId = crypto.randomUUID()

      const newSession: SupportServiceSupportSessionDto = {
        id: sessionId,
        studentId: user.id,
        instructorId: 'instructor-001', // Assign to first available instructor
        isClosed: false,
        createdAt: new Date(),
        closedAt: undefined,
        messages: [
          {
            id: crypto.randomUUID(),
            senderId: user.id,
            content: body.initialMessage.trim(),
            isInstructor: false,
            isRead: true,
            createdAt: new Date(),
          },
        ],
      }

      mockSessions[sessionId] = newSession

      return HttpResponse.json(newSession, { status: 201 })
    })
  ),

  /**
   * GET /api/v1/support/sessions/{id}
   * Get support session by ID
   * - Students can only view their own sessions
   * - Instructors can view all sessions
   */
  http.get(
    `${BASE_URL}/api/v1/support/sessions/:id`,
    withAuth(({ params, user }: { params: { id: string }; user: any }) => {
      const session = mockSessions[params.id]

      if (!session) {
        return HttpResponse.json(
          { error: 'Not Found', message: 'Support session not found' },
          { status: 404 }
        )
      }

      // Students can only access their own sessions
      if (user.role === UserRole.STUDENT && session.studentId !== user.id) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Access denied' },
          { status: 403 }
        )
      }

      return HttpResponse.json(session, { status: 200 })
    })
  ),

  /**
   * POST /api/v1/support/sessions/{id}/close
   * Close a support session (Student who created it only)
   */
  http.post(
    `${BASE_URL}/api/v1/support/sessions/:id/close`,
    withAuth(({ params, user }: { params: { id: string }; user: any }) => {
      const session = mockSessions[params.id]

      if (!session) {
        return HttpResponse.json(
          { error: 'Not Found', message: 'Support session not found' },
          { status: 404 }
        )
      }

      // Check if session is already closed
      if (session.isClosed) {
        return HttpResponse.json(
          { error: 'Bad Request', message: 'Session is already closed' },
          { status: 400 }
        )
      }

      // Check permissions - only the student who created the session can close it
      if (user.role !== UserRole.STUDENT || session.studentId !== user.id) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Only the student who created this session can close it' },
          { status: 403 }
        )
      }

      const updatedSession: SupportServiceSupportSessionDto = {
        ...session,
        isClosed: true,
        closedAt: new Date(),
      }

      mockSessions[params.id] = updatedSession

      return HttpResponse.json(updatedSession, { status: 200 })
    })
  ),
]