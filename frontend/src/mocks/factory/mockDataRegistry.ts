import type { ContentServiceAssignmentResponse } from '@/api/types.gen'
import { mockUsers, mockTokens } from '../data/users'
import { consolidatedMockAssignments, verifyConsolidatedDataConsistency, type ConsolidatedAssignment } from '../data/assignments-consolidated'
import { mockSubmissions } from '../data/submissions'
import { mockTutorials } from '../data/tutorials'
import { mockSkills } from '../data/skills'
import { mockSupportSessions } from '../data/supportSessions'

/**
 * CENTRALIZED MOCK DATA REGISTRY
 * 
 * This file ensures all MSW handlers use the SAME mock data.
 * 
 * ✅ DO use: MOCK_DATA_REGISTRY.assignments, MOCK_DATA_REGISTRY.users, etc.
 * ❌ DON'T use: Direct imports of individual data files in handlers
 * 
 * Benefits:
 * - Single source of truth - data inconsistency issues resolved
 * - Consistency verification - catches broken references on startup
 * - Easier debugging - all data accessed through consistent interface
 * - No phantom data - handlers can't add extra items
 */

// ============================================================================
// SECTION 1: CENTRALIZED IDs - DO NOT HARDCODE IDs IN CODE
// ============================================================================

export const MOCK_IDS = {
  // User IDs - SINGLE SOURCE OF TRUTH
  users: {
    admin: 'admin-001',
    instructor: 'instructor-001',
    lecturer: 'instructor-001', // Alias for instructor
    student: 'student-001',
    provider: 'provider-001',
  },

  // Assignment IDs - SINGLE SOURCE OF TRUTH
  // These match the actual assignment IDs used in enhanced mock data
  assignments: {
    '550e8400-e29b-41d4-a716-446655440100': 'Tính tổng mảng số nguyên (OVERDUE)',
    '550e8400-e29b-41d4-a716-446655440101': 'Sắp xếp mảng (DUE TODAY)',
    '550e8400-e29b-41d4-a716-446655440102': 'Tìm kiếm nhị phân (DUE TOMORROW)',
    '550e8400-e29b-41d4-a716-446655440103': 'Cây nhị phân tìm kiếm (DUE NEXT WEEK)',
    '550e8400-e29b-41d4-a716-446655440104': 'Thuật toán đồ thị - Dijkstra',
    '550e8400-e29b-41d4-a716-446655440105': 'Hello World nâng cao',
    '550e8400-e29b-41d4-a716-446655440106': 'Tính giai thừa',
    '550e8400-e29b-41d4-a716-446655440107': 'Regex Pattern Matching',
    '550e8400-e29b-41d4-a716-446655440108': 'Hash Table Implementation',
    '550e8400-e29b-41d4-a716-446655440109': 'Simple Linked List',
    '550e8400-e29b-41d4-a716-446655440110': 'Palindrome Checker',
    '550e8400-e29b-41d4-a716-446655440111': 'Merge Two Sorted Arrays',
    '550e8400-e29b-41d4-a716-446655440112': 'Two Sum Problem',
    '550e8400-e29b-41d4-a716-446655440113': 'Queue Implementation',
    '550e8400-e29b-41d4-a716-446655440114': 'Stack Implementation',
    '550e8400-e29b-41d4-a716-446655440115': 'Bubble Sort Implementation',
    '550e8400-e29b-41d4-a716-446655440116': 'Merge Sort Implementation',
    '550e8400-e29b-41d4-a716-446655440117': 'Fibonacci Sequence',
    '550e8400-e29b-41d4-a716-446655440019': 'Longest Common Subsequence',
    '550e8400-e29b-41d4-a716-446655440020': 'Prime Number Checker',
    '550e8400-e29b-41d4-a716-446655440021': 'Graph DFS & BFS',
    '550e8400-e29b-41d4-a716-446655440022': 'Max Subarray Problem',
    '550e8400-e29b-41d4-a716-446655440007': 'Machine Learning Basics (DRAFT)',
  } as const,

  // Submission IDs
  submissions: [
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440009',
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440014',
    '550e8400-e29b-41d4-a716-446655440015',
    '550e8400-e29b-41d4-a716-446655440016',
    '550e8400-e29b-41d4-a716-446655440017',
    '550e8400-e29b-41d4-a716-446655440018',
    '550e8400-e29b-41d4-a716-446655440019',
    '550e8400-e29b-41d4-a716-446655440020',
  ] as const,
} as const

// ============================================================================
// SECTION 2: CENTRALIZED MOCK DATA REGISTRY
// ============================================================================

/**
 * UNIFIED MOCK DATA STORE
 * This is the SINGLE SOURCE OF TRUTH for all mock data
 * All services reference this, not their own separate data stores
 */
export const MOCK_DATA_REGISTRY = {
  // Users - immutable, from src/mocks/data/users.ts
  users: mockUsers,
  tokens: mockTokens,

  // Assignments - immutable, from src/mocks/data/assignments-consolidated.ts
  // Using consolidatedMockAssignments with full markdown descriptions
  assignments: consolidatedMockAssignments,

  // Submissions - immutable, from src/mocks/data/submissions.ts
  submissions: mockSubmissions,

  // Tutorials - immutable, from src/mocks/data/tutorials.ts
  tutorials: mockTutorials,

  // Skills - immutable, from src/mocks/data/skills.ts
  skills: mockSkills,

  // Support Sessions - immutable, from src/mocks/data/supportSessions.ts
  supportSessions: mockSupportSessions,
} as const

// ============================================================================
// SECTION 3: HELPER FUNCTIONS FOR CONSISTENT DATA ACCESS
// ============================================================================

/**
 * Get all assignments (published only by default)
 */
export function getAllAssignments(includeUnpublished = false) {
  const assignments = Object.values(MOCK_DATA_REGISTRY.assignments)
  return includeUnpublished
    ? assignments
    : assignments.filter((a) => a.status === 'PUBLISHED')
}

/**
 * Get assignment by ID with fallback error handling
 */
export function getAssignmentById(
  id: string,
): ContentServiceAssignmentResponse | undefined {
  const assignment =
    MOCK_DATA_REGISTRY.assignments[
      id as keyof typeof MOCK_DATA_REGISTRY.assignments
    ]
  if (!assignment) {
    console.warn(
      `[Mock Data Registry] Assignment not found: ${id}. Available: ${Object.keys(MOCK_DATA_REGISTRY.assignments).length}`,
    )
  }
  return assignment
}

/**
 * Get all submissions for a student
 */
export function getSubmissionsByStudent(studentId: string) {
  return MOCK_DATA_REGISTRY.submissions.filter((s) => s.studentId === studentId)
}

/**
 * Get submission by ID
 */
export function getSubmissionById(id: string) {
  return MOCK_DATA_REGISTRY.submissions.find((s) => s.id === id)
}

/**
 * Get all submissions for an assignment
 */
export function getSubmissionsByAssignment(assignmentId: string) {
  return MOCK_DATA_REGISTRY.submissions.filter(
    (s) => s.assignmentId === assignmentId,
  )
}

/**
 * Get user by ID
 */
export function getUserById(id: string) {
  return Object.values(MOCK_DATA_REGISTRY.users).find((u) => u.id === id)
}

/**
 * Get all tutorials
 */
export function getAllTutorials() {
  return Object.values(MOCK_DATA_REGISTRY.tutorials)
}

/**
 * Get all skills
 */
export function getAllSkills() {
  return Object.values(MOCK_DATA_REGISTRY.skills)
}

/**
 * Get all support sessions
 */
export function getAllSupportSessions() {
  return Object.values(MOCK_DATA_REGISTRY.supportSessions)
}

// ============================================================================
// SECTION 4: DATA CONSISTENCY VERIFICATION
// ============================================================================

export interface DataConsistencyReport {
  valid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    users: number
    assignments: number
    submissions: number
    tutorials: number
    skills: number
    supportSessions: number
  }
}

/**
 * Verify all data relationships are consistent
 * Run this on app startup to catch data issues early
 */
export function verifyDataConsistency(): DataConsistencyReport {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. Verify submissions reference valid assignments
  MOCK_DATA_REGISTRY.submissions.forEach((submission, index) => {
    if (submission.assignmentId && !getAssignmentById(submission.assignmentId)) {
      errors.push(
        `[Submission ${index}/${submission.id}] References invalid assignment: ${submission.assignmentId}`,
      )
    }
  })

  // 2. Verify submissions reference valid users
  MOCK_DATA_REGISTRY.submissions.forEach((submission, index) => {
    if (submission.studentId && !getUserById(submission.studentId)) {
      errors.push(
        `[Submission ${index}/${submission.id}] References invalid student: ${submission.studentId}`,
      )
    }
  })

  // 3. Verify assignments reference valid creators
  Object.entries(MOCK_DATA_REGISTRY.assignments).forEach(
    ([assignId, assignment]) => {
      if (assignment.creatorId && !getUserById(assignment.creatorId)) {
        warnings.push(
          `[Assignment ${assignId}] References user: ${assignment.creatorId} (may exist in real DB)`,
        )
      }
    },
  )

  // 4. Check for orphaned submissions
  const assignmentIds = new Set(Object.keys(MOCK_DATA_REGISTRY.assignments))
  MOCK_DATA_REGISTRY.submissions.forEach((submission) => {
    if (submission.assignmentId && !assignmentIds.has(submission.assignmentId)) {
      warnings.push(
        `[Submission ${submission.id}] Assignment ${submission.assignmentId} not in mock data (may be pagination issue)`,
      )
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      users: Object.keys(MOCK_DATA_REGISTRY.users).length,
      assignments: Object.keys(MOCK_DATA_REGISTRY.assignments).length,
      submissions: MOCK_DATA_REGISTRY.submissions.length,
      tutorials: Object.keys(MOCK_DATA_REGISTRY.tutorials).length,
      skills: Object.keys(MOCK_DATA_REGISTRY.skills).length,
      supportSessions: Object.keys(MOCK_DATA_REGISTRY.supportSessions).length,
    },
  }
}

/**
 * Log consistency check results for debugging
 */
export function logDataConsistency(): void {
  const report = verifyDataConsistency()

  console.group('[Mock Data Registry] Consistency Check')
  console.log('📊 Stats:')
  console.table(report.stats)

  if (report.valid) {
    console.log('✅ All data relationships are valid')
  } else {
    console.error('❌ CRITICAL ERRORS:')
    report.errors.forEach((e) => console.error(`  - ${e}`))
  }

  if (report.warnings.length > 0) {
    console.warn('⚠️  Warnings:')
    report.warnings.forEach((w) => console.warn(`  - ${w}`))
  }

  console.groupEnd()
}

// ============================================================================
// SECTION 5: DEFAULT EXPORTS
// ============================================================================

export const DEFAULT_USERS = {
  admin: MOCK_DATA_REGISTRY.users.admin1,
  instructor: MOCK_DATA_REGISTRY.users.instructor1,
  student: MOCK_DATA_REGISTRY.users.student1,
  provider: MOCK_DATA_REGISTRY.users.provider1,
} as const

export const DEFAULT_TOKENS = MOCK_DATA_REGISTRY.tokens

// ============================================================================
// SECTION 6: TYPE EXPORTS
// ============================================================================

export type MockIDs = typeof MOCK_IDS
export type MockDataRegistry = typeof MOCK_DATA_REGISTRY

// ============================================================================
// SECTION 7: CONSOLIDATED DATA HELPERS (Phase 10)
// ============================================================================

/**
 * Get consolidated assignment with nested submissions and metrics
 * Phase 10: New consolidated data structure
 */
export function getConsolidatedAssignment(assignmentId: string): ConsolidatedAssignment | undefined {
  return consolidatedMockAssignments[assignmentId as keyof typeof consolidatedMockAssignments]
}

/**
 * Get all consolidated assignments (published only)
 */
export function getAllConsolidatedAssignments(includeUnpublished = false): ConsolidatedAssignment[] {
  const assignments = Object.values(consolidatedMockAssignments)
  return includeUnpublished
    ? assignments
    : assignments.filter((a) => a.status === 'PUBLISHED')
}

/**
 * Get student's submissions within an assignment
 * Returns submissions from consolidated data
 */
export function getStudentSubmissionsForAssignment(
  assignmentId: string,
  studentId: string
): ConsolidatedAssignment['submissions'] {
  const assignment = getConsolidatedAssignment(assignmentId)
  if (!assignment?.submissions) return []
  return assignment.submissions.filter((s) => s.studentId === studentId)
}

/**
 * Get student performance metrics for an assignment
 */
export function getStudentPerformanceForAssignment(assignmentId: string, studentId: string) {
  const assignment = getConsolidatedAssignment(assignmentId)
  if (!assignment) return null

  const submissions = assignment.submissions?.filter((s) => s.studentId === studentId) || []
  const evaluated = submissions.filter((s) => s.status === 'EVALUATED' && s.result)
  const passed = evaluated.filter((s) => s.result === 'PASSED')
  const scores = evaluated.filter((s) => s.score !== undefined).map((s) => s.score || 0)

  return {
    assignmentId,
    studentId,
    totalSubmissions: submissions.length,
    passedSubmissions: passed.length,
    averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    passRate: submissions.length > 0 ? Math.round((passed.length / evaluated.length) * 100) : 0,
    lastSubmittedAt: submissions.length > 0
      ? submissions.sort((a, b) => 
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        )[0].submittedAt
      : undefined,
  }
}

/**
 * Get all student submissions across all assignments (from consolidated data)
 */
export function getAllStudentSubmissions(studentId: string) {
  const allSubmissions: Array<{ assignmentId: string; submission: any }> = []

  Object.entries(consolidatedMockAssignments).forEach(([assignmentId, assignment]) => {
    assignment.submissions?.forEach((submission) => {
      if (submission.studentId === studentId) {
        allSubmissions.push({ assignmentId, submission })
      }
    })
  })

  return allSubmissions
}

/**
 * Get student's overall performance (all assignments)
 */
export function getStudentOverallPerformance(studentId: string) {
  const allSubmissions = getAllStudentSubmissions(studentId)
  const evaluated = allSubmissions.filter((s) => s.submission.status === 'EVALUATED' && s.submission.result)
  const passed = evaluated.filter((s) => s.submission.result === 'PASSED')
  const scores = evaluated
    .filter((s) => s.submission.score !== undefined)
    .map((s) => s.submission.score || 0)

  return {
    studentId,
    totalAssignments: Object.keys(consolidatedMockAssignments).filter(
      (id) => consolidatedMockAssignments[id as keyof typeof consolidatedMockAssignments].status === 'PUBLISHED'
    ).length,
    totalSubmissions: allSubmissions.length,
    passedSubmissions: passed.length,
    averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    passRate: allSubmissions.length > 0 ? Math.round((passed.length / evaluated.length) * 100) : 0,
  }
}

/**
 * Get student's upcoming assignments (due in next 7 days)
 */
export function getStudentUpcomingAssignments(studentId: string) {
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  return Object.entries(consolidatedMockAssignments)
    .filter(([, assignment]) => {
      const hasSubmission = assignment.submissions?.some((s) => s.studentId === studentId)
      const isPublished = assignment.status === 'PUBLISHED'
      const isDueInRange =
        assignment.dueDate &&
        new Date(assignment.dueDate) >= now &&
        new Date(assignment.dueDate) <= nextWeek

      return isPublished && isDueInRange && !hasSubmission
    })
    .map(([assignmentId, assignment]) => ({
      ...assignment,
      id: assignmentId,
    }))
}

/**
 * Verify consolidated data consistency (Phase 10)
 */
export function verifyConsolidatedConsistency() {
  return verifyConsolidatedDataConsistency()
}
