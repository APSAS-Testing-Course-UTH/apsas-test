/**
 * useAdvancedFilter Hook
 * Custom hook for managing advanced filtering state and API integration
 * Supports filtering assignments and submissions with type-safe parameters
 */

import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

/**
 * Filter state for assignments
 */
export interface AssignmentFilterState {
  search?: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

/**
 * Filter state for submissions
 */
export interface SubmissionFilterState {
  search?: string
  status?: 'PENDING' | 'EVALUATED' | 'FAILED'
  assignmentId?: string
}

/**
 * Generic filter state type
 */
export type FilterState = AssignmentFilterState | SubmissionFilterState

/**
 * Check if filters are empty/default
 */
function areFiltersEmpty(filters: FilterState): boolean {
  return Object.values(filters).every((value) => value === undefined || value === '')
}

/**
 * Build query parameters from filters (removes undefined/empty values)
 */
export function buildFilterParams(filters: FilterState): Record<string, string> {
  const params: Record<string, string> = {}

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params[key] = String(value)
    }
  })

  return params
}

/**
 * useAssignmentFilter - Hook for managing assignment filters
 * @param initialFilters - Initial filter values (optional)
 * @returns Filter state and control functions
 */
export function useAssignmentFilter(
  initialFilters: Partial<AssignmentFilterState> = {}
) {
  const [filters, setFilters] = useState<AssignmentFilterState>({
    search: initialFilters.search,
    difficulty: initialFilters.difficulty,
    status: initialFilters.status,
  })

  const hasActiveFilters = useMemo(() => !areFiltersEmpty(filters), [filters])

  const updateFilter = useCallback(
    <K extends keyof AssignmentFilterState>(key: K, value: AssignmentFilterState[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    []
  )

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const filterParams = useMemo(() => buildFilterParams(filters), [filters])

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filterParams,
  }
}

/**
 * useSubmissionFilter - Hook for managing submission filters
 * @param initialFilters - Initial filter values (optional)
 * @returns Filter state and control functions
 */
export function useSubmissionFilter(
  initialFilters: Partial<SubmissionFilterState> = {}
) {
  const [filters, setFilters] = useState<SubmissionFilterState>({
    search: initialFilters.search,
    status: initialFilters.status,
    assignmentId: initialFilters.assignmentId,
  })

  const hasActiveFilters = useMemo(() => !areFiltersEmpty(filters), [filters])

  const updateFilter = useCallback(
    <K extends keyof SubmissionFilterState>(key: K, value: SubmissionFilterState[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    []
  )

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const filterParams = useMemo(() => buildFilterParams(filters), [filters])

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filterParams,
  }
}

/**
 * Generic advanced filter hook
 * @param initialFilters - Initial filter values
 * @returns Combined filter management interface
 */
export function useAdvancedFilter<T extends FilterState>(
  initialFilters?: Partial<T>
) {
  const [filters, setFilters] = useState<T>((initialFilters || {}) as T)

  const hasActiveFilters = useMemo(() => !areFiltersEmpty(filters), [filters])

  const updateFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    []
  )

  const clearFilters = useCallback(() => {
    setFilters({} as T)
  }, [])

  const filterParams = useMemo(() => buildFilterParams(filters), [filters])

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filterParams,
  }
}

/**
 * Apply filters to search term (client-side text search)
 * Useful for combined server and client-side filtering
 */
export function applyTextFilter(
  items: Array<{ title?: string; name?: string; description?: string }>,
  searchTerm?: string
): typeof items {
  if (!searchTerm || searchTerm.trim() === '') {
    return items
  }

  const lowerSearch = searchTerm.toLowerCase()

  return items.filter((item) => {
    const title = item.title?.toLowerCase() || ''
    const name = item.name?.toLowerCase() || ''
    const description = item.description?.toLowerCase() || ''

    return title.includes(lowerSearch) || name.includes(lowerSearch) || description.includes(lowerSearch)
  })
}

export default useAdvancedFilter
