/**
 * Assignments Feature - Public API
 * Exports all components, hooks, and types
 */

// Components
export { AssignmentsList } from './components/AssignmentsList'
export { AssignmentsFilterBar } from './components/AssignmentsFilterBar'
export { AssignmentDetail } from './components/AssignmentDetail'
export { AssignmentMetadata } from './components/AssignmentMetadata'
export { TestCaseList } from './components/TestCaseList'
export { SkillBadges } from './components/SkillBadges'
export { TutorialLinks } from './components/TutorialLinks'
export { TutorialDetailModal } from './components/TutorialDetailModal'

// Hooks
export {
  useAssignmentsQuery,
  useAssignmentQuery,
  useAssignmentsQueriesByIds,
  useAssignmentSearchQuery,
  assignmentKeys,
} from './api/useAssignmentsQuery'
export { useAssignmentDetailQuery, assignmentDetailKeys } from './api/useAssignmentDetailQuery'
export { useTutorialDetail, tutorialKeys } from './api/useTutorialDetail'
export { useAssignmentsFiltered } from './hooks/useAssignmentsFiltered'
export type { AssignmentFilters, UseAssignmentsFilteredOptions } from './hooks/useAssignmentsFiltered'

// Types
export type {
  Assignment,
  AssignmentFilter,
  AssignmentListResponse,
  TestCase,
  Skill,
  Tutorial,
  Runtime,
  Submission,
} from './types/assignment.types'

export {
  VIETNAMESE_STATUS_LABELS,
  VIETNAMESE_DIFFICULTY_LABELS,
} from './types/assignment.types'

