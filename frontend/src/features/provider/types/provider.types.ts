/**
 * Content Provider Feature Types
 * All TypeScript types and interfaces for provider feature
 */

import type {
  ContentServiceAssignmentResponse,
  ContentServiceCreateAssignmentRequest,

} from '@/api/types.gen'

/**
 * Assignment status type
 * Vietnamese: DRAFT (Bản nháp), PUBLISHED (Đã xuất bản), ARCHIVED (Đã lưu trữ)
 */
export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

/**
 * Difficulty level type
 * Vietnamese: EASY (Dễ), MEDIUM (Trung bình), HARD (Khó)
 */
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD'

/**
 * Assignment with UI-specific fields
 */
export interface Assignment extends ContentServiceAssignmentResponse {
  // Add any provider-specific fields here if needed
  // Vietnamese labels will be added at the component level
}

/**
 * Assignment form submission data
 */
export interface AssignmentFormData extends ContentServiceCreateAssignmentRequest {
  // All fields from the base request
}

/**
 * Assignment filter options
 */
export interface AssignmentFilters {
  status?: AssignmentStatus
  difficultyLevel?: DifficultyLevel
  searchTerm?: string
  skillIds?: string[]
  startDate?: Date
  endDate?: Date
}

/**
 * Assignment list state
 */
export interface AssignmentsListState {
  page: number
  pageSize: number
  sort: string
  filters: AssignmentFilters
}

/**
 * Provider dashboard stats
 */
export interface ProviderDashboardStats {
  totalAssignments: number
  draftAssignments: number
  publishedAssignments: number
  archivedAssignments: number
  totalStudentsSubmitted: number
  averageSubmissionScore: number
}

/**
 * Assignment with submission count
 */
export interface AssignmentWithStats extends Assignment {
  submissionCount: number
  averageScore: number
  passRate: number
}

/**
 * Confirmation dialog data
 */
export interface ConfirmationDialogData {
  isOpen: boolean
  title: string
  message: string
  actionLabel: string
  isDangerous: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}
