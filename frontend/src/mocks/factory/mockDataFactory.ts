/**
 * Centralized Mock Data Factory for MSW
 * 
 * All mock data is managed from this single source of truth.
 * No inline mock data should exist in handlers or components.
 * 
 * This factory ensures:
 * ✅ Consistency across all services
 * ✅ Easy debugging and maintenance
 * ✅ No orphaned data (all relationships verified)
 * ✅ Single point of change for test data
 */

import type { ContentServiceAssignmentResponse } from '@/api/types.gen'
import { mockUsers, mockTokens } from '../data/users'
import { enhancedMockAssignments } from '../data/assignments'
import { mockSubmissions } from '../data/submissions'
import { mockTutorials } from '../data/tutorials'
import { mockSkills } from '../data/skills'
import { mockSupportSessions } from '../data/supportSessions'

/**
 * Constants for all mock IDs
 * Use these instead of hardcoding IDs throughout the codebase
 */
export const MOCK_IDS = {
  users: {
    admin: 'admin-001',
    instructor: 'instructor-001',
    student: 'student-001',
    provider: 'provider-001',
  },
  
  // Assignment IDs after Nov 4, 2025 fix
  // Mapped from original range to match submission references
  assignments: [
    '550e8400-e29b-41d4-a716-446655440100', // Tính tổng mảng số nguyên
    '550e8400-e29b-41d4-a716-446655440101', // Sắp xếp mảng
    '550e8400-e29b-41d4-a716-446655440102', // Tìm kiếm nhị phân
    '550e8400-e29b-41d4-a716-446655440103', // Cây nhị phân tìm kiếm (BST)
    '550e8400-e29b-41d4-a716-446655440104', // Thuật toán đồ thị - Dijkstra
    '550e8400-e29b-41d4-a716-446655440105', // Hello World nâng cao
    '550e8400-e29b-41d4-a716-446655440106', // Tính giai thừa
    '550e8400-e29b-41d4-a716-446655440107', // Regex Pattern Matching
    '550e8400-e29b-41d4-a716-446655440108', // Hash Table Implementation
    '550e8400-e29b-41d4-a716-446655440109', // Simple Linked List
    '550e8400-e29b-41d4-a716-446655440110', // Palindrome Checker
    '550e8400-e29b-41d4-a716-446655440111', // Merge Two Sorted Arrays
    '550e8400-e29b-41d4-a716-446655440112', // Two Sum Problem
    '550e8400-e29b-41d4-a716-446655440113', // Queue Implementation
    '550e8400-e29b-41d4-a716-446655440114', // Stack Implementation
    '550e8400-e29b-41d4-a716-446655440115', // Bubble Sort Implementation
    '550e8400-e29b-41d4-a716-446655440116', // Merge Sort Implementation
    '550e8400-e29b-41d4-a716-446655440117', // Fibonacci Sequence
  ] as const,
  
  submissions: [
    'sub-001',
    'sub-002',
    'sub-003',
    'sub-004',
    'sub-005',
    'sub-006',
    'sub-007',
    'sub-008',
    'sub-009',
    'sub-010',
    'sub-011',
    'sub-012',
    'sub-013',
    'sub-014',
    'sub-015',
    'sub-016',
    'sub-017',
    'sub-018',
    'sub-019',
    'sub-020',
  ] as const,
} as const

/**
 * Centralized Mock Data Object
 * Single source of truth for all mock data across services
 */
export const MOCK_DATA = {
  users: mockUsers,
  tokens: mockTokens,
  assignments: enhancedMockAssignments,
  submissions: mockSubmissions,
  tutorials: mockTutorials,
  skills: mockSkills,
  supportSessions: mockSupportSessions,
} as const

/**
 * Helper: Get all assignments
 */
export function getAllAssignments(): ContentServiceAssignmentResponse[] {
  return Object.values(MOCK_DATA.assignments)
}

/**
 * Helper: Get assignment by ID
 */
export function getAssignmentById(
  id: string
): ContentServiceAssignmentResponse | undefined {
  return MOCK_DATA.assignments[
    id as keyof typeof MOCK_DATA.assignments
  ]
}

/**
 * Helper: Get published assignments only
 */
export function getPublishedAssignments(): ContentServiceAssignmentResponse[] {
  return getAllAssignments().filter(a => a.status === 'PUBLISHED')
}

/**
 * Helper: Get assignments by difficulty
 */
export function getAssignmentsByDifficulty(
  level: 'EASY' | 'MEDIUM' | 'HARD'
): ContentServiceAssignmentResponse[] {
  return getPublishedAssignments().filter(a => a.difficultyLevel === level)
}

/**
 * Helper: Get all tutorials
 */
export function getAllTutorials() {
  return Object.values(MOCK_DATA.tutorials)
}

/**
 * Helper: Get tutorial by ID
 */
export function getTutorialById(id: string) {
  return MOCK_DATA.tutorials[id as keyof typeof MOCK_DATA.tutorials]
}

/**
 * Helper: Get all skills
 */
export function getAllSkills() {
  return Object.values(MOCK_DATA.skills)
}

/**
 * Helper: Get skill by ID
 */
export function getSkillById(id: string) {
  return MOCK_DATA.skills[id as keyof typeof MOCK_DATA.skills]
}

/**
 * Helper: Get all support sessions
 */
export function getAllSupportSessions() {
  return Object.values(MOCK_DATA.supportSessions)
}

/**
 * Helper: Get support session by ID
 */
export function getSupportSessionById(id: string) {
  return MOCK_DATA.supportSessions[id as keyof typeof MOCK_DATA.supportSessions]
}

/**
 * Helper: Get open support sessions (not closed)
 */
export function getOpenSupportSessions() {
  return getAllSupportSessions().filter(session => !session.isClosed)
}

/**
 * Helper: Get support sessions for a specific student
 */
export function getStudentSupportSessions(studentId: string) {
  return getAllSupportSessions().filter(session => session.studentId === studentId)
}

/**
 * Helper: Verify data consistency
 * Run this to check for orphaned data and broken relationships
 */
export function verifyDataConsistency(): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // 1. Check submissions reference valid assignments
  MOCK_DATA.submissions.forEach((submission, index) => {
    if (submission.assignmentId) {
      const assignment = getAssignmentById(submission.assignmentId)
      if (!assignment) {
        errors.push(
          `[Submission ${index}] References invalid assignment: ${submission.assignmentId}`
        )
      }
    }
  })

  // 2. Check submissions reference valid users
  MOCK_DATA.submissions.forEach((submission, index) => {
    if (submission.studentId) {
      // Find user by id field (not by key in the Record)
      const user = Object.values(MOCK_DATA.users).find(u => u.id === submission.studentId)
      if (!user) {
        errors.push(
          `[Submission ${index}] References invalid student: ${submission.studentId}`
        )
      }
    }
  })

  // 3. Check assignments reference valid creators
  Object.entries(MOCK_DATA.assignments).forEach(([assignId, assignment]) => {
    const creator = Object.values(MOCK_DATA.users).find(
      u => u.id === assignment.creatorId
    )
    if (!creator) {
      errors.push(
        `[Assignment ${assignId}] References invalid creator: ${assignment.creatorId}`
      )
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Helper: Log data consistency check results
 * Call this in development to verify mock data is correct
 */
export function logDataConsistency(): void {
  const result = verifyDataConsistency()
  
  console.log('[Mock Data Factory] Consistency Check:')
  console.log(
    `  Users: ${Object.keys(MOCK_DATA.users).length}`,
    `Assignments: ${Object.keys(MOCK_DATA.assignments).length}`,
    `Submissions: ${Object.keys(MOCK_DATA.submissions).length}`
  )
  
  if (result.valid) {
    console.log('  ✅ All data relationships are valid')
  } else {
    console.error('  ❌ Data consistency errors found:')
    result.errors.forEach(error => console.error(`    - ${error}`))
  }
}

/**
 * Type Exports
 * Use these types when working with mock data
 */
export type MockIDs = typeof MOCK_IDS
export type MockData = typeof MOCK_DATA
export type MockUser = typeof MOCK_DATA.users[keyof typeof MOCK_DATA.users]
export type MockAssignment = typeof MOCK_DATA.assignments[keyof typeof MOCK_DATA.assignments]
export type MockSubmission = typeof MOCK_DATA.submissions[keyof typeof MOCK_DATA.submissions]

/**
 * Default Exports
 * For common use cases
 */
export const DEFAULT_USERS = {
  admin: MOCK_DATA.users.admin1,
  instructor: MOCK_DATA.users.instructor1,
  student: MOCK_DATA.users.student1,
  provider: MOCK_DATA.users.provider1,
} as const

export const DEFAULT_TOKENS = MOCK_DATA.tokens
