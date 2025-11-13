/**
 * useAssignmentDetailQuery Hook
 * Fetches single assignment by ID
 *
 * Usage:
 * const { data, isLoading } = useAssignmentDetailQuery({ id: 'assignment-123' })
 */

import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'
import { contentServiceGetAssignmentById } from '@/api/sdk.gen'
import { assignmentQueryKeys } from './useAssignmentsQuery'

export function useAssignmentDetailQuery(id: string) {
  return useQuery<
    ContentServiceAssignmentResponse,
    AxiosError,
    ContentServiceAssignmentResponse,
    readonly ['assignments', 'detail', string]
  >({
    queryKey: assignmentQueryKeys.detail(id),
    queryFn: async () => {
      const response = await contentServiceGetAssignmentById({
        path: { id },
      })
      return response.data || (response as any)
    },
    staleTime: 1000 * 60 * 5,
    retry: 3,
    enabled: !!id,
  })
}
