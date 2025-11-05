/**
 * Assignment Domain Types
 * Uses generated types from backend API
 * Feature-specific types defined separately
 */

// ✅ Re-export generated types for convenience
export type { 
  ContentServiceTestCase as TestCase,
  ContentServiceAssignmentResponse as Assignment,
  ContentServicePageResponseAssignmentResponse as AssignmentListResponse,
  ContentServiceSkillResponse as Skill,
  ContentServiceTutorialResponse as Tutorial,
  SubmissionServiceSubmissionResponse as Submission,
  EvaluationServiceRuntimeResponse as Runtime,
} from '@/api/types.gen'

// ✅ Feature-specific types (not in generated API)
export interface AssignmentFilter {
  status?: 'Chưa làm' | 'Đã nộp' | 'Đạt' | 'Không đạt' | 'Quá hạn'
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  sortBy?: 'dueDate' | 'title' | 'difficulty'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Vietnamese Status Labels for Assignment Status
 */
export const VIETNAMESE_STATUS_LABELS = {
  'PENDING': 'Chưa làm',
  'IN_PROGRESS': 'Đang làm',
  'SUBMITTED': 'Đã nộp',
  'EVALUATED': 'Đã chấm',
  'PASSED': 'Đạt',
  'FAILED': 'Không đạt',
  'OVERDUE': 'Quá hạn',
  'DRAFT': 'Bản nháp',
  'ARCHIVED': 'Đã lưu trữ',
} as const

/**
 * Vietnamese Difficulty Labels
 */
export const VIETNAMESE_DIFFICULTY_LABELS = {
  'EASY': 'Dễ',
  'MEDIUM': 'Trung bình',
  'HARD': 'Khó',
} as const
