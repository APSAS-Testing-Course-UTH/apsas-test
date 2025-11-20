import { http, HttpResponse } from 'msw'
import type {
  SupportServiceSupportSessionResponse,
  SupportServicePageResponseSupportSessionResponse,
  SupportServiceCreateSupportSessionRequest,
} from '@/api/types.gen'
import { withAuth } from '../middleware/withAuth'
import { UserRole } from '../middleware/withAuth'
import { SUPPORT_PATHS, supportUrl, MSW_BASE_URL } from '../config'
// Import from centralized mock data registry
import { MOCK_DATA_REGISTRY } from '../factory/mockDataRegistry'
import { MOCK_SUPPORT_USER_IDS } from '../data/supportSessions'

console.log('[Support Handlers] Module loaded and initializing handlers...')
console.log('[Support Handlers] Using base URL:', MSW_BASE_URL)
console.log('[Support Handlers] Sessions endpoint:', SUPPORT_PATHS.SESSIONS)

export const supportHandlers = [
  /**
   * GET /api/v1/support/sessions
   * List support sessions with filtering and pagination
   * - Students see only their own sessions
   * - Instructors see all sessions
   * - Supports filters: userId, email, firstName, lastName, role, isActive
   */
  http.get(SUPPORT_PATHS.SESSIONS,
    withAuth(({ request, user }: { request: Request; user: any }) => {
      const url = new URL(request.url)
      const page = Number(url.searchParams.get('page')) || 0
      const size = Number(url.searchParams.get('size')) || 10

      let sessions = Array.isArray(MOCK_DATA_REGISTRY.supportSessions)
        ? MOCK_DATA_REGISTRY.supportSessions
        : Object.values(MOCK_DATA_REGISTRY.supportSessions)

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
      } as unknown as SupportServicePageResponseSupportSessionResponse

      return HttpResponse.json(response, { status: 200 })
    })
  ),

  /**
   * POST /api/v1/support/sessions
   * Create a new support session (Students only)
   */
  http.post(SUPPORT_PATHS.SESSIONS,
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

      const newSession: SupportServiceSupportSessionResponse = {
        id: sessionId,
        studentId: user.id,
        instructorId: MOCK_SUPPORT_USER_IDS.instructor,
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

      MOCK_DATA_REGISTRY.supportSessions[sessionId] = newSession

      return HttpResponse.json(newSession, { status: 201 })
    })
  ),

  /**
   * GET /api/v1/support/sessions/{sessionId}
   * Get support session by ID
   * - Students can only view their own sessions
   * - Instructors can view all sessions
   */
  http.get(`${supportUrl('sessions')}/:sessionId`,
    withAuth(({ params, user }: { params: { sessionId: string }; user: any }) => {
      const session = MOCK_DATA_REGISTRY.supportSessions[params.sessionId]

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
   * POST /api/v1/support/sessions/{sessionId}/close
   * Close support session (student only)
   */
  http.post(`${supportUrl('sessions')}/:sessionId/close`,
    withAuth(({ params, user }: { params: { sessionId: string }; user: any }) => {
      const session = MOCK_DATA_REGISTRY.supportSessions[params.sessionId]

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

      const updatedSession: SupportServiceSupportSessionResponse = {
        ...session,
        isClosed: true,
        closedAt: new Date(),
      }

      MOCK_DATA_REGISTRY.supportSessions[params.sessionId] = updatedSession

      return HttpResponse.json(updatedSession, { status: 200 })
    })
  ),

  /**
   * POST /api/v1/support/sessions/{sessionId}/messages
   * Send a message in a support session
   */
  http.post(`${supportUrl('sessions')}/:sessionId/messages`,
    withAuth(async ({ request, params, user }: { request: Request; params: { sessionId: string }; user: any }) => {
      const session = MOCK_DATA_REGISTRY.supportSessions[params.sessionId]

      if (!session) {
        return HttpResponse.json(
          { error: 'Not Found', message: 'Support session not found' },
          { status: 404 }
        )
      }

      // Check if session is closed
      if (session.isClosed) {
        return HttpResponse.json(
          { error: 'Bad Request', message: 'Cannot send message to closed session' },
          { status: 400 }
        )
      }

      // Check permissions
      const isStudent = user.role === UserRole.STUDENT
      const isInstructor = user.role === UserRole.INSTRUCTOR || user.role === UserRole.ADMIN

      if (isStudent && session.studentId !== user.id) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Access denied' },
          { status: 403 }
        )
      }

      if (!isStudent && !isInstructor) {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Access denied' },
          { status: 403 }
        )
      }

      const body: any = await request.json()

      if (!body.content || body.content.trim().length === 0) {
        return HttpResponse.json(
          { error: 'Bad Request', message: 'Message content is required' },
          { status: 400 }
        )
      }

      const newMessage = {
        id: crypto.randomUUID(),
        senderId: user.id,
        content: body.content.trim(),
        isInstructor: !isStudent,
        isRead: false,
        createdAt: new Date(),
      }

      // Add message to session
      if (!session.messages) {
        session.messages = []
      }
      session.messages.push(newMessage)

      // Update session in registry
      MOCK_DATA_REGISTRY.supportSessions[params.sessionId] = session

      return HttpResponse.json(session, { status: 201 })
    })
  ),
]

console.log('[Support Handlers] ✅ Exported supportHandlers array with', supportHandlers.length, 'handlers')
