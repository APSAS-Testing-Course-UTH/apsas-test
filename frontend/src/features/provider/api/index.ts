/**
 * Content Provider API Hooks
 * All data fetching and mutations for assignments, skills, and tutorials
 */

// Assignment Hooks
export { useAssignmentsQuery, assignmentQueryKeys } from './useAssignmentsQuery'
export { useAssignmentDetailQuery } from './useAssignmentDetailQuery'
export { useCreateAssignmentMutation } from './useCreateAssignmentMutation'
export { useUpdateAssignmentMutation } from './useUpdateAssignmentMutation'
export { useDeleteAssignmentMutation } from './useDeleteAssignmentMutation'
export { usePublishAssignmentMutation } from './usePublishAssignmentMutation'
export { useArchiveAssignmentMutation } from './useArchiveAssignmentMutation'
export { useScheduleAssignmentMutation } from './useScheduleAssignmentMutation'

// Skill Hooks
export { useSkillsQuery, skillQueryKeys } from './useSkillsQuery'
export {
  useSkillDetailQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} from './useSkillMutations'

// Tutorial Hooks
export { useTutorialsQuery, tutorialQueryKeys } from './useTutorialsQuery'
export {
  useTutorialDetailQuery,
  useCreateTutorialMutation,
  useUpdateTutorialMutation,
  useDeleteTutorialMutation,
} from './useTutorialMutations'
