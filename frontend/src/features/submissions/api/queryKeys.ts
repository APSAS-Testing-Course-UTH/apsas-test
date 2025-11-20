/**
 * Submission Query Keys
 * 
 * Centralized query key factory for submissions.
 * Follows TanStack Query best practices for hierarchical key structure.
 * 
 * @example
 * ```typescript
 * // Fetch all submissions
 * useQuery({ queryKey: submissionKeys.lists(), ... })
 * 
 * // Fetch paginated submissions with filters
 * useQuery({ queryKey: submissionKeys.list({ page: 0, size: 10, assignmentId }), ... })
 * 
 * // Fetch single submission
 * useQuery({ queryKey: submissionKeys.detail(id), ... })
 * 
 * // Fetch runtimes
 * useQuery({ queryKey: submissionKeys.runtimes(), ... })
 * 
 * // Invalidate all submission lists
 * queryClient.invalidateQueries({ queryKey: submissionKeys.lists() })
 * 
 * // Invalidate everything
 * queryClient.invalidateQueries({ queryKey: submissionKeys.all })
 * ```
 */

interface SubmissionListParams {
  page?: number
  size?: number
  assignmentId?: string
  studentId?: string
  status?: string
}

export const submissionKeys = {
  all: ['submissions'] as const,
  lists: () => [...submissionKeys.all, 'list'] as const,
  list: (params: SubmissionListParams) => [...submissionKeys.lists(), params] as const,
  details: () => [...submissionKeys.all, 'detail'] as const,
  detail: (id: string) => [...submissionKeys.details(), id] as const,
  runtimes: () => [...submissionKeys.all, 'runtimes'] as const,
}
