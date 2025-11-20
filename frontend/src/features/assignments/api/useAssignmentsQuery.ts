/**
 * Assignment API Hooks
 * Provides type-safe React Query hooks for assignment data fetching
 * Uses generated SDK functions from @/api/sdk.gen for type-safe API calls
 */

import { useQuery, useQueries } from '@tanstack/react-query'
import type { ApiErrorResponse } from '@/configs/api-error-handler'
import {
  contentServiceGetAllAssignments,
  contentServiceGetAssignmentById,
} from '@/api/sdk.gen'
import type {
  ContentServicePageResponseAssignmentResponse,
  ContentServiceAssignmentResponse,
} from '@/api/types.gen'

/**
 * Query key factory for assignments
 * Ensures consistent query key naming across the application
 */
export const assignmentKeys = {
  all: ['assignments'],
  lists: () => [...assignmentKeys.all, 'list'],
  list: (page: number, size: number, sort?: string) => [
    ...assignmentKeys.lists(),
    { page, size, sort },
  ],
  details: () => [...assignmentKeys.all, 'detail'],
  detail: (id: string) => [...assignmentKeys.details(), id],
}

/**
 * Hook: Get all assignments with pagination
 *
 * @param page - 0-indexed page number
 * @param size - Items per page (default: 10, max: 100)
 * @param sort - Sort order, e.g., "dueDate,desc" or "title,asc"
 *
 * @returns {
 *   data: ContentServicePageResponseAssignmentResponse | undefined,
 *   isLoading: boolean,
 *   error: ApiErrorResponse | null,
 *   isPreviousData: boolean
 * }
 *
 * @example
 * const { data, isLoading } = useAssignmentsQuery(0, 10, 'dueDate,desc')
 * // Shows assignments page 0 with 10 items, sorted by due date descending
 */
export function useAssignmentsQuery(
  page: number = 0,
  size: number = 10,
) {
  return useQuery<ContentServicePageResponseAssignmentResponse, ApiErrorResponse>({
    queryKey: assignmentKeys.list(page, size),
    queryFn: async () => {
      const result = await contentServiceGetAllAssignments({
        query: {
          page: String(page),
          size: String(size),
        },
      })
      if (result.error) throw result.error
      if (!result.data) throw new Error('No data returned from API')
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })
}

/**
 * Hook: Get single assignment by ID
 *
 * @param id - Assignment ID (UUID)
 *
 * @returns {
 *   data: ContentServiceAssignmentResponse | undefined,
 *   isLoading: boolean,
 *   error: ApiErrorResponse | null
 * }
 *
 * @example
 * const { data: assignment } = useAssignmentQuery(assignmentId)
 * // Fetches full assignment details with test cases and constraints
 */
export function useAssignmentQuery(id: string) {
  return useQuery<ContentServiceAssignmentResponse, ApiErrorResponse>({
    queryKey: assignmentKeys.detail(id),
    queryFn: async () => {
      const result = await contentServiceGetAssignmentById({
        path: { id },
      })
      if (result.error) throw result.error
      if (!result.data) throw new Error('No data returned from API')
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook: Get multiple assignments by IDs
 *
 * @param ids - Array of assignment IDs
 *
 * @returns Array of assignment queries with same structure as useAssignmentQuery
 *
 * @example
 * const assignments = useAssignmentsQueriesByIds(['id1', 'id2', 'id3'])
 * // Fetches multiple assignments in parallel
 */
export function useAssignmentsQueriesByIds(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: assignmentKeys.detail(id),
      queryFn: async () => {
        const result = await contentServiceGetAssignmentById({
          path: { id },
        })
        if (result.error) throw result.error
        if (!result.data) throw new Error('No data returned from API')
        return result.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })),
  })
}

/**
 * Hook: Search assignments
 *
 * @param query - Search term
 * @param page - 0-indexed page number
 * @param size - Items per page
 *
 * @returns Assignments matching the search query
 *
 * @example
 * const { data } = useAssignmentSearchQuery('fibonacci', 0, 10)
 * // Searches for assignments with 'fibonacci' in title/description
 */
export function useAssignmentSearchQuery(query: string, page: number = 0, size: number = 10) {
  return useQuery<ContentServicePageResponseAssignmentResponse, ApiErrorResponse>({
    queryKey: [...assignmentKeys.lists(), 'search', { query, page, size }],
    queryFn: async () => {
      // If no query, return empty results
      if (!query.trim()) {
        return {
          content: [],
          pageNumber: page,
          pageSize: size,
          totalElements: BigInt(0),
          totalPages: 0,
          first: true,
          last: true,
        }
      }

      const result = await contentServiceGetAllAssignments({
        query: {
          page: String(page),
          size: String(size),
        },
      })

      if (result.error) throw result.error
      if (!result.data) throw new Error('No data returned from API')

      const data = result.data

      // Filter client-side based on query
      const filtered = (data.content || []).filter(
        (assignment) =>
          assignment.title?.toLowerCase().includes(query.toLowerCase()) ||
          assignment.description?.toLowerCase().includes(query.toLowerCase())
      )

      return {
        ...data,
        content: filtered,
        totalElements: BigInt(filtered.length),
        totalPages: Math.ceil(filtered.length / size),
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for search
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: query.trim().length > 0, // Only run if query is not empty
  })
}
