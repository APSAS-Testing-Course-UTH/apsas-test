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

import type { SupportServiceSupportSessionDto } from '@/api/types.gen'

// Mock UUIDs for sessions
const SESSION_ID_001 = '550e8400-e29b-41d4-a716-446655440001'
const SESSION_ID_002 = '550e8400-e29b-41d4-a716-446655440002'
const SESSION_ID_003 = '46630bc6-04e7-4c59-b485-77d8e3b6c7a1' // Open session - active chat
const SESSION_ID_004 = '7a4f9e2b-8c3d-4f1e-a5b6-9d8c7e6f5a4b' // Open session - instructor not yet assigned
const SESSION_ID_005 = 'c5d4e3f2-1a0b-9c8d-7e6f-5a4b3c2d1e0f' // Open session - waiting for instructor response

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
  [SESSION_ID_003]: {
    id: SESSION_ID_003,
    studentId: USER_ID_STUDENT,
    instructorId: USER_ID_INSTRUCTOR,
    isClosed: false, // OPEN - Active conversation
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    closedAt: undefined,
    messages: [
      {
        id: '46630bc6-e29b-41d4-a716-446655440021',
        senderId: USER_ID_STUDENT,
        content: 'Hi! I need help with my Python assignment. The sorting algorithm isn\'t working correctly.',
        isInstructor: false,
        isRead: true,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: '46630bc6-e29b-41d4-a716-446655440022',
        senderId: USER_ID_INSTRUCTOR,
        content: 'Hello! I\'d be happy to help. Can you describe what the issue is? What output are you getting?',
        isInstructor: true,
        isRead: true,
        createdAt: new Date(Date.now() - 25 * 60 * 1000),
      },
      {
        id: '46630bc6-e29b-41d4-a716-446655440023',
        senderId: USER_ID_STUDENT,
        content: 'The array seems to sort partially but not completely. For example, [5, 2, 8, 1, 9] becomes [2, 5, 1, 8, 9].',
        isInstructor: false,
        isRead: true,
        createdAt: new Date(Date.now() - 20 * 60 * 1000),
      },
      {
        id: '46630bc6-e29b-41d4-a716-446655440024',
        senderId: USER_ID_INSTRUCTOR,
        content: 'I see the issue. It looks like your comparison logic might be inverted. Are you using < or > in your comparison?',
        isInstructor: true,
        isRead: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        id: '46630bc6-e29b-41d4-a716-446655440025',
        senderId: USER_ID_STUDENT,
        content: 'I\'m using > for ascending order. Should I use < instead?',
        isInstructor: false,
        isRead: false,
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
      },
      {
        id: '46630bc6-e29b-41d4-a716-446655440026',
        senderId: USER_ID_INSTRUCTOR,
        content: 'Yes, exactly! For ascending order, you need to use < so that smaller values move to the left. Try changing it and let me know if that fixes it.',
        isInstructor: true,
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
      },
    ],
  },
  [SESSION_ID_004]: {
    id: SESSION_ID_004,
    studentId: USER_ID_STUDENT,
    instructorId: undefined, // NO instructor assigned yet
    isClosed: false, // OPEN - Waiting for instructor
    createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
    closedAt: undefined,
    messages: [
      {
        id: '7a4f9e2b-e29b-41d4-a716-446655440031',
        senderId: USER_ID_STUDENT,
        content: 'I\'m having trouble understanding recursion in JavaScript. Can someone help explain how the call stack works?',
        isInstructor: false,
        isRead: false,
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
      },
    ],
  },
  [SESSION_ID_005]: {
    id: SESSION_ID_005,
    studentId: USER_ID_STUDENT,
    instructorId: USER_ID_INSTRUCTOR,
    isClosed: false, // OPEN - Recent message from student
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
    closedAt: undefined,
    messages: [
      {
        id: 'c5d4e3f2-e29b-41d4-a716-446655440041',
        senderId: USER_ID_STUDENT,
        content: 'Can you explain the difference between let, const, and var in JavaScript?',
        isInstructor: false,
        isRead: true,
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
      },
      {
        id: 'c5d4e3f2-e29b-41d4-a716-446655440042',
        senderId: USER_ID_INSTRUCTOR,
        content: 'Sure! var is function-scoped and can be re-declared. let is block-scoped and can be reassigned. const is block-scoped but cannot be reassigned.',
        isInstructor: true,
        isRead: true,
        createdAt: new Date(Date.now() - 40 * 60 * 1000),
      },
      {
        id: 'c5d4e3f2-e29b-41d4-a716-446655440043',
        senderId: USER_ID_STUDENT,
        content: 'That makes sense! But what happens if I try to reassign a const object\'s property?',
        isInstructor: false,
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // Recent - 2 mins ago
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
  session_001: SESSION_ID_001, // Closed session - completed conversation
  session_002: SESSION_ID_002, // Closed session - resolved issue
  session_003: SESSION_ID_003, // Open session - active chat with instructor
  session_004: SESSION_ID_004, // Open session - no instructor assigned yet
  session_005: SESSION_ID_005, // Open session - waiting for instructor response
} as const

/**
 * User ID exports for reference
 */
export const MOCK_SUPPORT_USER_IDS = {
  student: USER_ID_STUDENT,
  instructor: USER_ID_INSTRUCTOR,
} as const
