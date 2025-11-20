/**
 * useAssignmentsQuery Hook
 * Fetches paginated list of assignments
 *
 * Usage:
 * const { data, isLoading } = useAssignmentsQuery({ page: 0, size: 10 })
 */

import { useQuery } from '@tanstack/react-query'
import type { ApiErrorResponse } from '@/configs/api-error-handler'
import type { ContentServicePageResponseAssignmentResponse } from '@/api/types.gen'
import { contentServiceGetAllAssignments } from '@/api/sdk.gen'

export const assignmentQueryKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentQueryKeys.all, 'list'] as const,
  list: (filters: { page: number; size: number }) =>
    [...assignmentQueryKeys.lists(), filters] as const,
  details: () => [...assignmentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...assignmentQueryKeys.details(), id] as const,
}

export function useAssignmentsQuery({
  page = 0,
  size = 10,
}: { page?: number; size?: number } = {}) {
  return useQuery<
    ContentServicePageResponseAssignmentResponse,
    ApiErrorResponse,
    ContentServicePageResponseAssignmentResponse,
    readonly ['assignments', 'list', { page: number; size: number }]
  >({
    queryKey: ['assignments', 'list', { page, size }] as const,
    queryFn: async () => {
      const response = await contentServiceGetAllAssignments({
        query: { page: String(page), size: String(size) },
      })
      return response.data || (response as any)
    },
    staleTime: 1000 * 60 * 5,
    retry: 3,
  })
}
