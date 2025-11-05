import { useQuery } from '@tanstack/react-query'
import { contentServiceGetAssignmentByIdOptions } from '@/api/@tanstack/react-query.gen'

/**
 * Query key factory for assignment detail queries
 */
export const assignmentDetailKeys = {
  all: ['assignmentDetail'],
  detail: (id: string) => [...assignmentDetailKeys.all, id],
}

/**
 * Fetch single assignment by ID using generated query options
 *
 * @param id - Assignment ID
 * @returns Query result with assignment data (includes testCases, skills, tutorials)
 *
 * @example
 * ```tsx
 * const { data: assignment, isLoading, error } = useAssignmentQuery(assignmentId)
 * ```
 */
export function useAssignmentQuery(id: string) {
  return useQuery({
    ...contentServiceGetAssignmentByIdOptions({
      path: { id },
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
