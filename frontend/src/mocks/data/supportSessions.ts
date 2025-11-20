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

import type { SupportServiceSupportSessionResponse } from '@/api/types.gen'

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
export const mockSupportSessions: Record<string, SupportServiceSupportSessionResponse> = {
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
        content: 'Em cần giúp đỡ về bài tập JavaScript. Em đang bị kẹt ở phần các phương thức mảng.',
        isInstructor: false,
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        senderId: USER_ID_INSTRUCTOR,
        content: 'Được rồi, thầy có thể giúp em. Em đang gặp khó khăn với phương thức mảng cụ thể nào?',
        isInstructor: true,
        isRead: true,
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        senderId: USER_ID_STUDENT,
        content: 'Em đang bị nhầm lẫn giữa map() và filter(). Thầy có thể giải thích sự khác biệt được không ạ?',
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
        content: 'Chào thầy, em có câu hỏi về list comprehensions trong Python ạ.',
        isInstructor: false,
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        senderId: USER_ID_INSTRUCTOR,
        content: 'Chào em! List comprehensions là cách ngắn gọn để tạo danh sách. Em muốn biết cụ thể về điều gì?',
        isInstructor: true,
        isRead: true,
        createdAt: new Date(Date.now() - 23.5 * 60 * 60 * 1000),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440016',
        senderId: USER_ID_STUDENT,
        content: 'Cảm ơn thầy đã giải thích! Em nghĩ em hiểu rồi ạ.',
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
        content: 'Chào thầy! Em cần giúp đỡ về bài tập Python. Thuật toán sắp xếp của em chạy không đúng.',
        isInstructor: false,
        isRead: true,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: '46630bc6-e29b-41d4-a716-446655440022',
        senderId: USER_ID_INSTRUCTOR,
        content: 'Chào em! Thầy rất sẵn lòng giúp. Em có thể mô tả vấn đề là gì không? Kết quả đầu ra em nhận được là gì?',
        isInstructor: true,
        isRead: true,
        createdAt: new Date(Date.now() - 25 * 60 * 1000),
      },
      {
        id: '46630bc6-e29b-41d4-a716-446655440023',
        senderId: USER_ID_STUDENT,
        content: 'Mảng có vẻ chỉ được sắp xếp một phần chứ không hoàn toàn. Ví dụ, [5, 2, 8, 1, 9] lại thành [2, 5, 1, 8, 9].',
        isInstructor: false,
        isRead: true,
        createdAt: new Date(Date.now() - 20 * 60 * 1000),
      },
      {
        id: '46630bc6-e29b-41d4-a716-446655440024',
        senderId: USER_ID_INSTRUCTOR,
        content: 'Thầy thấy vấn đề rồi. Có vẻ như logic so sánh của em bị ngược. Em đang dùng < hay > trong phép so sánh vậy?',
        isInstructor: true,
        isRead: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        id: '46630bc6-e29b-41d4-a716-446655440025',
        senderId: USER_ID_STUDENT,
        content: 'Em đang dùng > cho thứ tự tăng dần. Em có nên dùng < thay thế không ạ?',
        isInstructor: false,
        isRead: false,
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
      },
      {
        id: '46630bc6-e29b-41d4-a716-446655440026',
        senderId: USER_ID_INSTRUCTOR,
        content: 'Đúng rồi! Để sắp xếp tăng dần, em cần dùng < để các giá trị nhỏ hơn chuyển về bên trái. Hãy thử thay đổi và cho thầy biết nếu nó sửa được lỗi nhé.',
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
        content: 'Em đang gặp khó khăn trong việc hiểu đệ quy trong JavaScript. Có ai có thể giải thích giúp em cách call stack hoạt động không ạ?',
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
        content: 'Thầy có thể giải thích sự khác biệt giữa let, const và var trong JavaScript được không ạ?',
        isInstructor: false,
        isRead: true,
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
      },
      {
        id: 'c5d4e3f2-e29b-41d4-a716-446655440042',
        senderId: USER_ID_INSTRUCTOR,
        content: 'Được chứ! var có phạm vi function và có thể khai báo lại. let có phạm vi block và có thể gán lại. const có phạm vi block nhưng không thể gán lại.',
        isInstructor: true,
        isRead: true,
        createdAt: new Date(Date.now() - 40 * 60 * 1000),
      },
      {
        id: 'c5d4e3f2-e29b-41d4-a716-446655440043',
        senderId: USER_ID_STUDENT,
        content: 'Điều đó hợp lý ạ! Nhưng chuyện gì sẽ xảy ra nếu em cố gắng gán lại thuộc tính của một object được khai báo bằng const?',
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
export function getAllSupportSessions(): SupportServiceSupportSessionResponse[] {
  return Object.values(mockSupportSessions)
}

/**
 * Helper: Get support session by ID
 */
export function getSupportSessionById(
  id: string
): SupportServiceSupportSessionResponse | undefined {
  return mockSupportSessions[id]
}

/**
 * Helper: Get open support sessions (not closed)
 */
export function getOpenSupportSessions(): SupportServiceSupportSessionResponse[] {
  return getAllSupportSessions().filter(session => !session.isClosed)
}

/**
 * Helper: Get support sessions for a specific student
 */
export function getStudentSupportSessions(
  studentId: string
): SupportServiceSupportSessionResponse[] {
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
