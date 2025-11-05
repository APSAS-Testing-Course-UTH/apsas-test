/**
 * Mock Support Sessions & Messages Data
 *
 * Centralized source of truth for all support session mock data
 * Used by supportHandlers.ts via factory
 *
 * Data Structure:
 * - SupportSession: Contains session metadata and array of messages
 * - SupportMessage: Individual chat messages with metadata
 */

import type { SupportServiceSupportSessionDto, SupportServiceSupportMessageDto } from '@/api/types.gen'

// Mock UUIDs for sessions
const SESSION_ID_001 = '550e8400-e29b-41d4-a716-446655440001'
const SESSION_ID_002 = '550e8400-e29b-41d4-a716-446655440002'

// Mock user IDs (must match users.ts)
const USER_ID_STUDENT = 'student-001'
const USER_ID_INSTRUCTOR = 'instructor-001'

/**
 * Mock Support Sessions with embedded messages
 */
export const mockSupportSessions: Record<string, SupportServiceSupportSessionDto> = {
  [SESSION_ID_001]: {
    id: SESSION_ID_001,
    studentId: USER_ID_STUDENT,
    instructorId: USER_ID_INSTRUCTOR,
    isClosed: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    closedAt: new Date(Date.now() - 30 * 60 * 1000), // closed 30 mins ago
    messages: [
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        senderId: USER_ID_STUDENT,
        content: 'I need help with the JavaScript assignment. I\'m stuck on the array methods.',
        isInstructor: false,
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        senderId: USER_ID_INSTRUCTOR,
        content: 'Sure, I can help you with that. Which specific array method are you having trouble with?',
        isInstructor: true,
        isRead: true,
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        senderId: USER_ID_STUDENT,
        content: 'I\'m confused about map() and filter(). Can you explain the difference?',
        isInstructor: false,
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
  },
  [SESSION_ID_002]: {
    id: SESSION_ID_002,
    studentId: USER_ID_STUDENT,
    instructorId: USER_ID_INSTRUCTOR,
    isClosed: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    closedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // closed 20 hours ago
    messages: [
      {
        id: '550e8400-e29b-41d4-a716-446655440014',
        senderId: USER_ID_STUDENT,
        content: 'Hello, I have a question about Python list comprehensions.',
        isInstructor: false,
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        senderId: USER_ID_INSTRUCTOR,
        content: 'Hi! List comprehensions are a concise way to create lists. What specifically would you like to know?',
        isInstructor: true,
        isRead: true,
        createdAt: new Date(Date.now() - 23.5 * 60 * 60 * 1000),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440016',
        senderId: USER_ID_STUDENT,
        content: 'Thanks for the explanation! I think I understand now.',
        isInstructor: false,
        isRead: true,
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      },
    ],
  },
}

/**
 * Helper: Get all support sessions
 */
export function getAllSupportSessions(): SupportServiceSupportSessionDto[] {
  return Object.values(mockSupportSessions)
}

/**
 * Helper: Get support session by ID
 */
export function getSupportSessionById(
  id: string
): SupportServiceSupportSessionDto | undefined {
  return mockSupportSessions[id]
}

/**
 * Helper: Get open support sessions (not closed)
 */
export function getOpenSupportSessions(): SupportServiceSupportSessionDto[] {
  return getAllSupportSessions().filter(session => !session.isClosed)
}

/**
 * Helper: Get support sessions for a specific student
 */
export function getStudentSupportSessions(
  studentId: string
): SupportServiceSupportSessionDto[] {
  return getAllSupportSessions().filter(session => session.studentId === studentId)
}

/**
 * Session ID exports for reference
 */
export const MOCK_SESSION_IDS = {
  session_001: SESSION_ID_001,
  session_002: SESSION_ID_002,
} as const

/**
 * User ID exports for reference
 */
export const MOCK_SUPPORT_USER_IDS = {
  student: USER_ID_STUDENT,
  instructor: USER_ID_INSTRUCTOR,
} as const
