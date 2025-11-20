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
import type { ContentServicePageResponseAssignmentResponse } from '@/api/types.gen'

export interface AssignmentFilters {
  difficultyLevel?: 'EASY' | 'MEDIUM' | 'HARD' | null
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | null
  dueDateFrom?: Date | null
  dueDateTo?: Date | null
  search?: string | null
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
  // Key for the "fetch all" query used for client-side filtering
  allData: () => [...assignmentKeys.lists(), 'all-data'],
}

/**
 * Hook to fetch and filter assignments
 * Implements "Solution A": Fetch All & Client-side Pagination
 */
export function useAssignmentsFiltered({
  page,
  size,
  filters,
}: UseAssignmentsFilteredOptions) {
  // 1. Fetch ALL data (up to 1000 items) to ensure filtering works correctly across all pages
  const { data: allDataResponse, isLoading, error } = useQuery({
    queryKey: assignmentKeys.allData(),
    queryFn: async () => {
      const response = await contentServiceGetAllAssignments({
        query: {
          page: '0',
          size: '1000', // Fetch a large number to simulate "all"
        },
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes
  })

  // 2. Client-side Filtering & Pagination
  const result = useMemo(() => {
    if (!allDataResponse?.content) {
      return {
        content: [],
        totalElements: 0n,
        totalPages: 0,
        pageNumber: page,
        pageSize: size,
        first: true,
        last: true,
        numberOfElements: 0,
        empty: true
      } as unknown as ContentServicePageResponseAssignmentResponse
    }

    let filtered = [...allDataResponse.content]

    // Filter by search term (title or description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (assignment) =>
          (assignment.title?.toLowerCase().includes(searchLower)) ||
          (assignment.description?.toLowerCase().includes(searchLower))
      )
    }

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

    // Calculate pagination
    const totalElements = filtered.length
    const totalPages = Math.ceil(totalElements / size)
    const startIndex = page * size
    const endIndex = startIndex + size
    const paginatedContent = filtered.slice(startIndex, endIndex)

    // Construct response matching the API type
    return {
      content: paginatedContent,
      totalElements: BigInt(totalElements),
      totalPages: totalPages,
      pageNumber: page,
      pageSize: size,
      first: page === 0,
      last: page >= totalPages - 1,
      numberOfElements: paginatedContent.length,
      empty: paginatedContent.length === 0
    } as unknown as ContentServicePageResponseAssignmentResponse

  }, [allDataResponse, filters, page, size])

  return {
    data: result,
    isLoading,
    error
  }
}
