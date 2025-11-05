/**
 * CONSOLIDATED MOCK ASSIGNMENT DATA
 * Phase 10: Refactored with nested submissions and performance metrics
 * 
 * Structure:
 * - Each assignment includes nested submissions[] that belong to it
 * - Each assignment includes performanceMetrics calculated from submissions
 * - Each assignment includes studentDeadlines for deadline tracking
 */

import type { ContentServiceAssignmentResponse } from '@/api/types.gen'
import { mockSubmissions } from './submissions'

// Current date for relative calculations
const now = new Date()
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

/**
 * Extended Assignment type with nested submissions and metrics
 */
export interface ConsolidatedAssignment extends ContentServiceAssignmentResponse {
  submissions?: Array<{
    id: string
    studentId: string
    submittedAt: Date
    status: 'EVALUATED' | 'PENDING' | 'FAILED'
    result?: 'PASSED' | 'FAILED' | 'PARTIAL'
    score?: number
    language: string
  }>
  performanceMetrics?: {
    totalSubmissions: number
    passedSubmissions: number
    averageScore: number
    passRate: number
    lastSubmittedAt?: Date
  }
  studentDeadlines?: {
    [studentId: string]: {
      deadline: Date
      extension?: {
        grantedUntil: Date
        reason: string
      }
    }
  }
}

/**
 * Helper function to calculate performance metrics from submissions
 */
function calculatePerformanceMetrics(submissions: typeof mockSubmissions) {
  const evaluated = submissions.filter(s => s.status === 'EVALUATED' && s.result)
  const passed = evaluated.filter(s => s.result === 'PASSED')
  const scores = evaluated.filter(s => s.score !== undefined).map(s => s.score || 0)
  
  return {
    totalSubmissions: submissions.length,
    passedSubmissions: passed.length,
    averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    passRate: submissions.length > 0 ? Math.round((passed.length / evaluated.length) * 100) : 0,
    lastSubmittedAt: submissions.length > 0 
      ? submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0].submittedAt
      : undefined
  }
}

/**
 * Consolidated mock assignments with nested submissions
 */
export const consolidatedMockAssignments: Record<string, ConsolidatedAssignment> = {
  // ===== OVERDUE ASSIGNMENTS =====
  '550e8400-e29b-41d4-a716-446655440100': {
    id: '550e8400-e29b-41d4-a716-446655440100',
    title: 'Tính tổng mảng số nguyên',
    description: 'Viết chương trình tính tổng các phần tử trong mảng số nguyên. Input: mảng các số, Output: tổng',
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    dueDate: yesterday,
    maxScore: 50,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'javascript'],
    testCases: [
      {
        order: 1,
        description: 'Test với mảng đơn giản',
        hidden: false,
        weight: 1.0,
        input: '[1, 2, 3, 4, 5]',
        output: '15',
        timeout: 1000,
        memoryLimit: 128,
      },
    ],
    skills: [],
    tutorials: [],
    // NESTED: Submissions for this assignment
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440100'),
    // NESTED: Performance metrics
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440100')
    ),
    // NESTED: Student-specific deadlines
    studentDeadlines: {
      'student-001': {
        deadline: yesterday,
        extension: undefined
      }
    }
  },

  // ===== DUE TODAY =====
  '550e8400-e29b-41d4-a716-446655440101': {
    id: '550e8400-e29b-41d4-a716-446655440101',
    title: 'Sắp xếp mảng',
    description: 'Implement thuật toán sắp xếp nhanh (quicksort) để sắp xếp mảng số nguyên tăng dần.',
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    dueDate: now,
    maxScore: 100,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'cpp'],
    testCases: [
      {
        order: 1,
        description: 'Test mảng ngẫu nhiên',
        hidden: false,
        weight: 1.0,
        input: '[5, 2, 8, 1, 9]',
        output: '[1, 2, 5, 8, 9]',
        timeout: 2000,
        memoryLimit: 256,
      },
      {
        order: 2,
        description: 'Test mảng đã sắp xếp',
        hidden: true,
        weight: 1.5,
        input: '[1, 2, 3, 4, 5]',
        output: '[1, 2, 3, 4, 5]',
        timeout: 2000,
        memoryLimit: 256,
      },
    ],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440101'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440101')
    ),
    studentDeadlines: {
      'student-001': { deadline: now }
    }
  },

  // ===== DUE TOMORROW =====
  '550e8400-e29b-41d4-a716-446655440102': {
    id: '550e8400-e29b-41d4-a716-446655440102',
    title: 'Tìm kiếm nhị phân',
    description: 'Implement thuật toán tìm kiếm nhị phân trong mảng đã được sắp xếp. Trả về index của phần tử nếu tìm thấy, -1 nếu không.',
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: lastWeek,
    updatedAt: lastWeek,
    startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    dueDate: tomorrow,
    maxScore: 80,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'javascript', 'cpp'],
    testCases: [
      {
        order: 1,
        description: 'Tìm phần tử có trong mảng',
        hidden: false,
        weight: 1.0,
        input: 'arr=[1,3,5,7,9], target=5',
        output: '2',
        timeout: 1000,
        memoryLimit: 128,
      },
      {
        order: 2,
        description: 'Tìm phần tử không có trong mảng',
        hidden: false,
        weight: 1.0,
        input: 'arr=[1,3,5,7,9], target=4',
        output: '-1',
        timeout: 1000,
        memoryLimit: 128,
      },
    ],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440102'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440102')
    ),
    studentDeadlines: {
      'student-001': { deadline: tomorrow }
    }
  },

  // ===== NEXT WEEK =====
  '550e8400-e29b-41d4-a716-446655440103': {
    id: '550e8400-e29b-41d4-a716-446655440103',
    title: 'Cây nhị phân tìm kiếm (BST)',
    description: 'Implement cấu trúc dữ liệu cây nhị phân tìm kiếm với các thao tác: insert, search, delete, inorder traversal.',
    difficultyLevel: 'HARD',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    startDate: yesterday,
    dueDate: nextWeek,
    maxScore: 150,
    status: 'PUBLISHED',
    languages: ['java', 'cpp', 'python'],
    testCases: [
      {
        order: 1,
        description: 'Test insert và search',
        hidden: false,
        weight: 2.0,
        input: 'insert [5,3,7,1,9], search 7',
        output: 'found',
        timeout: 3000,
        memoryLimit: 512,
      },
      {
        order: 2,
        description: 'Test delete node',
        hidden: true,
        weight: 2.0,
        input: 'insert [5,3,7,1,9], delete 3',
        output: 'deleted',
        timeout: 3000,
        memoryLimit: 512,
      },
    ],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440103'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440103')
    ),
    studentDeadlines: {
      'student-001': { deadline: nextWeek }
    }
  },

  // ===== DUE IN 2 WEEKS =====
  '550e8400-e29b-41d4-a716-446655440104': {
    id: '550e8400-e29b-41d4-a716-446655440104',
    title: 'Thuật toán đồ thị - Dijkstra',
    description: 'Implement thuật toán Dijkstra để tìm đường đi ngắn nhất từ một đỉnh đến tất cả các đỉnh khác trong đồ thị có trọng số.',
    difficultyLevel: 'HARD',
    creatorId: 'instructor-001',
    createdAt: now,
    updatedAt: now,
    startDate: tomorrow,
    dueDate: inTwoWeeks,
    maxScore: 200,
    status: 'PUBLISHED',
    languages: ['cpp', 'java', 'python'],
    testCases: [
      {
        order: 1,
        description: 'Đồ thị đơn giản 5 đỉnh',
        hidden: false,
        weight: 3.0,
        input: 'graph with 5 vertices',
        output: 'shortest paths',
        timeout: 5000,
        memoryLimit: 1024,
      },
    ],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440104'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440104')
    ),
    studentDeadlines: {
      'student-001': { deadline: inTwoWeeks }
    }
  },

  // ===== EASY ASSIGNMENTS FOR BEGINNERS =====
  '550e8400-e29b-41d4-a716-446655440105': {
    id: '550e8400-e29b-41d4-a716-446655440105',
    title: 'Hello World nâng cao',
    description: 'Viết chương trình in ra "Hello, [Tên]!" với tên được nhập từ input.',
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    maxScore: 30,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'javascript', 'cpp'],
    testCases: [
      {
        order: 1,
        description: 'Test với tên đơn giản',
        hidden: false,
        weight: 1.0,
        input: 'Alice',
        output: 'Hello, Alice!',
        timeout: 500,
        memoryLimit: 64,
      },
    ],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440105'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440105')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440106': {
    id: '550e8400-e29b-41d4-a716-446655440106',
    title: 'Tính giai thừa',
    description: 'Viết hàm tính giai thừa của một số nguyên dương n. Factorial(n) = n! = 1 * 2 * ... * n',
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
    maxScore: 60,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'javascript'],
    testCases: [
      {
        order: 1,
        description: 'Factorial of 5',
        hidden: false,
        weight: 1.0,
        input: '5',
        output: '120',
        timeout: 1000,
        memoryLimit: 128,
      },
      {
        order: 2,
        description: 'Factorial of 0',
        hidden: false,
        weight: 1.0,
        input: '0',
        output: '1',
        timeout: 1000,
        memoryLimit: 128,
      },
    ],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440106'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440106')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000) }
    }
  },

  // ===== ADDITIONAL ASSIGNMENTS (continued for pagination) =====
  '550e8400-e29b-41d4-a716-446655440107': {
    id: '550e8400-e29b-41d4-a716-446655440107',
    title: 'Regex Pattern Matching',
    description: 'Viết chương trình sử dụng regular expressions để tìm kiếm và validate các pattern.',
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
    maxScore: 90,
    status: 'PUBLISHED',
    languages: ['python', 'javascript', 'java'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440107'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440107')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440108': {
    id: '550e8400-e29b-41d4-a716-446655440108',
    title: 'Hash Table Implementation',
    description: 'Implement một hash table cơ bản với collision resolution sử dụng chaining.',
    difficultyLevel: 'HARD',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
    maxScore: 180,
    status: 'PUBLISHED',
    languages: ['java', 'cpp', 'python'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440108'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440108')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440109': {
    id: '550e8400-e29b-41d4-a716-446655440109',
    title: 'Simple Linked List',
    description: 'Implement singly linked list với các thao tác: insert, delete, search, reverse.',
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    maxScore: 120,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'javascript'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440109'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440109')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440110': {
    id: '550e8400-e29b-41d4-a716-446655440110',
    title: 'Palindrome Checker',
    description: 'Viết hàm kiểm tra xem một chuỗi có phải là palindrome hay không.',
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
    maxScore: 40,
    status: 'PUBLISHED',
    languages: ['python', 'javascript', 'java'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440110'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440110')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440111': {
    id: '550e8400-e29b-41d4-a716-446655440111',
    title: 'Merge Two Sorted Arrays',
    description: 'Ghép hai mảng đã được sắp xếp thành một mảng đã sắp xếp.',
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
    maxScore: 50,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'cpp'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440111'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440111')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440112': {
    id: '550e8400-e29b-41d4-a716-446655440112',
    title: 'Two Sum Problem',
    description: 'Cho một mảng các số và một target, tìm hai số có tổng bằng target.',
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    maxScore: 100,
    status: 'PUBLISHED',
    languages: ['python', 'javascript', 'java'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440112'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440112')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440113': {
    id: '550e8400-e29b-41d4-a716-446655440113',
    title: 'Queue Implementation',
    description: 'Implement một queue data structure với enqueue, dequeue, peek operations.',
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    maxScore: 110,
    status: 'PUBLISHED',
    languages: ['java', 'python', 'cpp'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440113'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440113')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440114': {
    id: '550e8400-e29b-41d4-a716-446655440114',
    title: 'Stack Implementation',
    description: 'Implement một stack data structure với push, pop, peek operations.',
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
    maxScore: 105,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'javascript'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440114'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440114')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440115': {
    id: '550e8400-e29b-41d4-a716-446655440115',
    title: 'Bubble Sort Implementation',
    description: 'Implement thuật toán bubble sort để sắp xếp một mảng.',
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
    maxScore: 55,
    status: 'PUBLISHED',
    languages: ['python', 'javascript', 'java'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440115'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440115')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440116': {
    id: '550e8400-e29b-41d4-a716-446655440116',
    title: 'Merge Sort Implementation',
    description: 'Implement merge sort algorithm với time complexity O(n log n).',
    difficultyLevel: 'HARD',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
    maxScore: 160,
    status: 'PUBLISHED',
    languages: ['cpp', 'java', 'python'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440116'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440116')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440117': {
    id: '550e8400-e29b-41d4-a716-446655440117',
    title: 'Fibonacci Sequence',
    description: 'Tính số Fibonacci thứ n với cả cách iterative và recursive.',
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
    maxScore: 70,
    status: 'PUBLISHED',
    languages: ['python', 'javascript', 'java'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440117'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440117')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440019': {
    id: '550e8400-e29b-41d4-a716-446655440019',
    title: 'Longest Common Subsequence',
    description: 'Tìm longest common subsequence (LCS) của hai chuỗi sử dụng dynamic programming.',
    difficultyLevel: 'HARD',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
    maxScore: 170,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'cpp'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440019'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440019')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440020': {
    id: '550e8400-e29b-41d4-a716-446655440020',
    title: 'Prime Number Checker',
    description: 'Viết hàm kiểm tra xem một số có phải là số nguyên tố hay không.',
    difficultyLevel: 'EASY',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 17 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
    maxScore: 45,
    status: 'PUBLISHED',
    languages: ['python', 'javascript', 'java'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440020'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440020')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440021': {
    id: '550e8400-e29b-41d4-a716-446655440021',
    title: 'Graph DFS & BFS',
    description: 'Implement Depth-First Search (DFS) và Breadth-First Search (BFS) trên đồ thị.',
    difficultyLevel: 'HARD',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000),
    maxScore: 190,
    status: 'PUBLISHED',
    languages: ['java', 'python', 'cpp'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440021'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440021')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000) }
    }
  },

  '550e8400-e29b-41d4-a716-446655440022': {
    id: '550e8400-e29b-41d4-a716-446655440022',
    title: 'Max Subarray Problem',
    description: 'Tìm subarray có tổng lớn nhất (Maximum Subarray Problem - Kadane algorithm).',
    difficultyLevel: 'MEDIUM',
    creatorId: 'instructor-001',
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    startDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    maxScore: 130,
    status: 'PUBLISHED',
    languages: ['python', 'java', 'cpp'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440022'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440022')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
    }
  },

  // ===== DRAFT ASSIGNMENT (NOT YET PUBLISHED) =====
  '550e8400-e29b-41d4-a716-446655440007': {
    id: '550e8400-e29b-41d4-a716-446655440007',
    title: 'Machine Learning Basics',
    description: 'Implement a simple linear regression model from scratch (DRAFT - chưa công bố)',
    difficultyLevel: 'HARD',
    creatorId: 'instructor-001',
    createdAt: now,
    updatedAt: now,
    startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    maxScore: 200,
    status: 'DRAFT',
    languages: ['python'],
    testCases: [],
    skills: [],
    tutorials: [],
    submissions: mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440007'),
    performanceMetrics: calculatePerformanceMetrics(
      mockSubmissions.filter(s => s.assignmentId === '550e8400-e29b-41d4-a716-446655440007')
    ),
    studentDeadlines: {
      'student-001': { deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) }
    }
  },
}

/**
 * Helper: Get all published assignments (visible to students)
 */
export const getPublishedAssignments = (): ConsolidatedAssignment[] => {
  return Object.values(consolidatedMockAssignments).filter(
    assignment => assignment.status === 'PUBLISHED'
  )
}

/**
 * Helper: Get assignments by difficulty
 */
export const getAssignmentsByDifficulty = (
  level: 'EASY' | 'MEDIUM' | 'HARD'
): ConsolidatedAssignment[] => {
  return Object.values(consolidatedMockAssignments).filter(
    assignment => assignment.difficultyLevel === level && assignment.status === 'PUBLISHED'
  )
}

/**
 * Helper: Get overdue assignments
 */
export const getOverdueAssignments = (): ConsolidatedAssignment[] => {
  const now = new Date()
  return Object.values(consolidatedMockAssignments).filter(
    assignment => assignment.status === 'PUBLISHED' && assignment.dueDate && new Date(assignment.dueDate) < now
  )
}

/**
 * Helper: Get upcoming assignments (due in next 7 days)
 */
export const getUpcomingAssignments = (): ConsolidatedAssignment[] => {
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return Object.values(consolidatedMockAssignments).filter(
    assignment =>
      assignment.status === 'PUBLISHED' &&
      assignment.dueDate &&
      new Date(assignment.dueDate) >= now &&
      new Date(assignment.dueDate) <= nextWeek
  )
}

/**
 * Helper: Get assignment with submissions
 */
export const getAssignmentWithSubmissions = (assignmentId: string) => {
  return consolidatedMockAssignments[assignmentId]
}

/**
 * Helper: Get student's submissions for an assignment
 */
export const getStudentAssignmentSubmissions = (assignmentId: string, studentId: string) => {
  const assignment = consolidatedMockAssignments[assignmentId]
  if (!assignment?.submissions) return []
  return assignment.submissions.filter(s => s.studentId === studentId)
}

/**
 * Helper: Verify data consistency
 */
export const verifyConsolidatedDataConsistency = () => {
  const errors: string[] = []
  
  Object.entries(consolidatedMockAssignments).forEach(([assignmentId, assignment]) => {
    // Check submissions have valid assignmentId
    assignment.submissions?.forEach(submission => {
      if (submission.assignmentId !== assignmentId) {
        errors.push(`❌ Submission ${submission.id} has wrong assignmentId`)
      }
    })

    // Check performance metrics match submissions
    if (assignment.performanceMetrics && assignment.submissions) {
      const evaluated = assignment.submissions.filter(s => s.status === 'EVALUATED' && s.result)
      const passed = evaluated.filter(s => s.result === 'PASSED')
      
      if (assignment.performanceMetrics.totalSubmissions !== assignment.submissions.length) {
        errors.push(`❌ Assignment ${assignmentId}: totalSubmissions mismatch`)
      }
      
      if (assignment.performanceMetrics.passedSubmissions !== passed.length) {
        errors.push(`❌ Assignment ${assignmentId}: passedSubmissions mismatch`)
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    summary: {
      totalAssignments: Object.keys(consolidatedMockAssignments).length,
      totalErrors: errors.length,
      timestamp: new Date().toISOString()
    }
  }
}
