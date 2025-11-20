/**
 * Assignment Detail API Hook
 * Provides type-safe React Query hook for fetching single assignment details
 * Uses generated API types, SDK, and Zod validation
 */

import { useQuery } from '@tanstack/react-query'
import { contentServiceGetAssignmentById } from '@/api/sdk.gen'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'
import type { ApiErrorResponse } from '@/configs/api-error-handler'

/**
 * Query key factory for assignment detail
 */
export const assignmentDetailKeys = {
  all: ['assignmentDetail'],
  detail: (id: string) => [...assignmentDetailKeys.all, id],
}

/**
 * Hook: Get single assignment by ID
 *
 * Uses generated SDK function `contentServiceGetAssignmentById` which:
 * - Validates request with Zod schema
 * - Provides type-safe response
 * - Handles date transformation
 *
 * @param id - Assignment ID (UUID)
 *
 * @returns {
 *   data: ContentServiceAssignmentResponse | undefined,
 *   isLoading: boolean,
 *   error: ApiErrorResponse | null,
 *   refetch: () => Promise<...>
 * }
 *
 * @example
 * const { data: assignment, isLoading } = useAssignmentDetailQuery('550e8400-e29b-41d4-a716-446655440000')
 * if (isLoading) return <LoadingSpinner />
 * return <div>{assignment?.title}</div>
 */
export function useAssignmentDetailQuery(id: string) {
  return useQuery<ContentServiceAssignmentResponse, ApiErrorResponse>({
    queryKey: assignmentDetailKeys.detail(id),
    queryFn: async () => {
      const response = await contentServiceGetAssignmentById({
        path: { id },
      })
      // SDK response.data should never be undefined for successful requests
      // If it is, throw error so React Query treats it as failure
      if (!response || !response.data) {
        throw new Error('Invalid response from API')
      }
      return response.data as ContentServiceAssignmentResponse
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404
      if (error?.response?.status === 404) return false
      // Retry up to 2 times on other errors
      return failureCount < 2
    },
  })
}
