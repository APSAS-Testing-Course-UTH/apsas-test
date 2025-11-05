/**
 * useAssignmentsFiltered Hook
 * Handles filtering, pagination, and sorting for assignments
 * - Integrates with TanStack Query for server state
 * - Client-side filtering for difficulty, status, and date range
 * - Optimized caching strategy
 */

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { contentServiceGetAllAssignments } from '@/api/sdk.gen'

export interface AssignmentFilters {
  difficultyLevel?: 'EASY' | 'MEDIUM' | 'HARD' | null
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | null
  dueDateFrom?: Date | null
  dueDateTo?: Date | null
}

export interface UseAssignmentsFilteredOptions {
  page: number
  size: number
  sort?: string
  filters: AssignmentFilters
}

/**
 * Generate cache key for query
 */
const assignmentKeys = {
  all: ['assignments'],
  lists: () => [...assignmentKeys.all, 'list'],
  list: (page: number, size: number, sort: string) => [
    ...assignmentKeys.lists(),
    { page, size, sort },
  ],
  filtered: (page: number, size: number, sort: string, filters: AssignmentFilters) => [
    ...assignmentKeys.lists(),
    { page, size, sort, filters },
  ],
}

/**
 * Hook to fetch and filter assignments
 */
export function useAssignmentsFiltered({
  page,
  size,
  sort = 'dueDate,desc',
  filters,
}: UseAssignmentsFilteredOptions) {
  // Fetch data from server with pagination
  const queryResult = useQuery({
    queryKey: assignmentKeys.list(page, size, sort),
    queryFn: async () => {
      const response = await contentServiceGetAllAssignments({
        query: {
          page: String(page),
          size: String(size),
          sort,
        },
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })

  // Apply client-side filtering only on current page data
  // Important: Do NOT filter across pages - filters are UI-only
  const filteredData = useMemo(() => {
    if (!queryResult.data?.content) {
      return queryResult.data
    }

    let filtered = [...queryResult.data.content]

    // Filter by difficulty
    if (filters.difficultyLevel) {
      filtered = filtered.filter(
        (assignment) => assignment.difficultyLevel === filters.difficultyLevel
      )
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((assignment) => assignment.status === filters.status)
    }

    // Filter by due date range
    if (filters.dueDateFrom || filters.dueDateTo) {
      filtered = filtered.filter((assignment) => {
        if (!assignment.dueDate) return false

        const dueDate = new Date(assignment.dueDate)

        if (filters.dueDateFrom && dueDate < filters.dueDateFrom) {
          return false
        }

        if (filters.dueDateTo && dueDate > filters.dueDateTo) {
          return false
        }

        return true
      })
    }

    // Return filtered data for current page only
    return {
      ...queryResult.data,
      content: filtered,
      // IMPORTANT: Keep original totalElements and totalPages
      // Do NOT override - pagination is based on server total, not filtered count
    }
  }, [queryResult.data, filters])

  return {
    ...queryResult,
    data: filteredData,
  }
}
