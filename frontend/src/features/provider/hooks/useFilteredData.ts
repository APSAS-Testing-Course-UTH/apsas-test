/**
 * useFilteredData Hook - Client-side data filtering
 *
 * Provides efficient client-side filtering for list data without backend API calls.
 * Supports multiple filter types: search, status, difficulty, tags, etc.
 *
 * Features:
 * - String search across multiple fields
 * - Exact match filtering (status, difficulty)
 * - Array-based filtering (tags, skill IDs)
 * - Date range filtering
 * - Debounced search for performance
 * - TypeScript support
 *
 * Usage:
 * ```tsx
 * const filtered = useFilteredData(
 *   data,
 *   { searchTerm: 'recursion', status: 'PUBLISHED' },
 *   {
 *     searchFields: ['title', 'description'],
 *     filterFunctions: {
 *       status: (item, value) => item.status === value,
 *       difficulty: (item, value) => item.difficulty === value,
 *     }
 *   }
 * )
 * ```
 */

import { useMemo } from 'react'

export interface FilterConfig<T> {
  /**
   * Fields to search by string (case-insensitive)
   */
  searchFields?: (keyof T)[]

  /**
   * Custom filter functions for each filter key
   * Return true to include item, false to exclude
   */
  filterFunctions?: Record<string, (item: T, value: any) => boolean>
}

/**
 * Filter data based on filters and config
 *
 * @template T - Data item type
 * @param data - Array of items to filter
 * @param filters - Filter criteria (key -> value)
 * @param config - Filter configuration
 * @returns Filtered array
 *
 * @example
 * ```tsx
 * const filtered = useFilteredData(skills, {
 *   searchTerm: 'recursion',
 *   status: 'PUBLISHED'
 * }, {
 *   searchFields: ['name', 'description'],
 *   filterFunctions: {
 *     status: (item, value) => item.status === value
 *   }
 * })
 * ```
 */
export function useFilteredData<T extends Record<string, any>>(
  data: T[] | undefined,
  filters: Record<string, any>,
  config: FilterConfig<T> = {}
): T[] {
  return useMemo(() => {
    if (!data || data.length === 0) return []

    const { searchFields = [], filterFunctions = {} } = config

    return data.filter((item) => {
      // 1. Apply search filter across specified fields
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const searchLower = filters.searchTerm.toLowerCase().trim()
        const matchesSearch = searchFields.some((field) => {
          const value = item[field]
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchLower)
          }
          return false
        })
        if (!matchesSearch) return false
      }

      // 2. Apply custom filter functions
      for (const [filterKey, filterValue] of Object.entries(filters)) {
        // Skip empty filters and searchTerm (already handled)
        if (!filterValue || filterKey === 'searchTerm') continue

        const filterFn = filterFunctions[filterKey]
        if (filterFn) {
          if (!filterFn(item, filterValue)) {
            return false
          }
        }
      }

      return true
    })
  }, [data, filters, config])
}

/**
 * Create filter functions for assignments
 *
 * @returns Filter functions for assignment-specific filters
 */
export function createAssignmentFilterFunctions() {
  return {
    status: (item: any, value: string) => {
      if (!value) return true
      return item.status === value
    },
    difficulty: (item: any, value: string) => {
      if (!value) return true
      // Handle both 'difficulty' and 'difficultyLevel' field names
      const difficulty = item.difficulty || item.difficultyLevel
      return difficulty === value
    },
    skillIds: (item: any, values: string[]) => {
      if (!values || values.length === 0) return true
      // Check if item has any of the specified skills
      const itemSkills = item.skills || item.skillIds || []
      return values.some((skillId) =>
        itemSkills.some((skill: any) => {
          // Handle both ID strings and skill objects
          const id = typeof skill === 'object' ? skill.id : skill
          return id === skillId
        })
      )
    },
    createdAtRange: (item: any, range: [string | null, string | null]) => {
      if (!range || (!range[0] && !range[1])) return true

      const itemDate = item.createdAt ? new Date(item.createdAt) : null
      if (!itemDate) return false

      const startDate = range[0] ? new Date(range[0]) : null
      const endDate = range[1] ? new Date(range[1]) : null

      if (startDate && itemDate < startDate) return false
      if (endDate) {
        // Include items on the end date (up to 23:59:59)
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)
        if (itemDate > endOfDay) return false
      }

      return true
    },
    updatedAtRange: (item: any, range: [string | null, string | null]) => {
      if (!range || (!range[0] && !range[1])) return true

      const itemDate = item.updatedAt ? new Date(item.updatedAt) : null
      if (!itemDate) return false

      const startDate = range[0] ? new Date(range[0]) : null
      const endDate = range[1] ? new Date(range[1]) : null

      if (startDate && itemDate < startDate) return false
      if (endDate) {
        // Include items on the end date (up to 23:59:59)
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)
        if (itemDate > endOfDay) return false
      }

      return true
    },
  }
}

/**
 * Create filter functions for tutorials
 *
 * @returns Filter functions for tutorial-specific filters
 */
export function createTutorialFilterFunctions() {
  return {
    tags: (item: any, values: string[]) => {
      if (!values || values.length === 0) return true
      const itemTags = item.tags || []
      // Include item if it has ANY of the selected tags
      return values.some((tag) =>
        itemTags.some((itemTag: any) => {
          const tagValue = typeof itemTag === 'object' ? itemTag.name : itemTag
          return tagValue === tag
        })
      )
    },
    createdAtRange: (item: any, range: [Date | string | null, Date | string | null]) => {
      if (!range || (!range[0] && !range[1])) return true
      
      const itemDate = item.createdAt ? new Date(item.createdAt) : null
      if (!itemDate) return false
      
      const startDate = range[0] ? new Date(range[0]) : null
      const endDate = range[1] ? new Date(range[1]) : null
      
      if (startDate && itemDate < startDate) return false
      if (endDate) {
        // Include items on the end date (up to 23:59:59)
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)
        if (itemDate > endOfDay) return false
      }
      
      return true
    },
    updatedAtRange: (item: any, range: [Date | string | null, Date | string | null]) => {
      if (!range || (!range[0] && !range[1])) return true
      
      const itemDate = item.updatedAt ? new Date(item.updatedAt) : null
      if (!itemDate) return false
      
      const startDate = range[0] ? new Date(range[0]) : null
      const endDate = range[1] ? new Date(range[1]) : null
      
      if (startDate && itemDate < startDate) return false
      if (endDate) {
        // Include items on the end date (up to 23:59:59)
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)
        if (itemDate > endOfDay) return false
      }
      
      return true
    },
  }
}

/**
 * Create filter functions for skills
 *
 * @returns Filter functions for skill-specific filters
 */
export function createSkillFilterFunctions() {
  return {
    level: (item: any, value: string) => {
      if (!value) return true
      return item.level === value
    },
    category: (item: any, value: string) => {
      if (!value) return true
      return item.category === value
    },
    createdAtRange: (item: any, range: [Date | string | null, Date | string | null]) => {
      if (!range || (!range[0] && !range[1])) return true
      
      const itemDate = item.createdAt ? new Date(item.createdAt) : null
      if (!itemDate) return false
      
      const startDate = range[0] ? new Date(range[0]) : null
      const endDate = range[1] ? new Date(range[1]) : null
      
      if (startDate && itemDate < startDate) return false
      if (endDate) {
        // Include items on the end date (up to 23:59:59)
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)
        if (itemDate > endOfDay) return false
      }
      
      return true
    },
    updatedAtRange: (item: any, range: [Date | string | null, Date | string | null]) => {
      if (!range || (!range[0] && !range[1])) return true
      
      const itemDate = item.updatedAt ? new Date(item.updatedAt) : null
      if (!itemDate) return false
      
      const startDate = range[0] ? new Date(range[0]) : null
      const endDate = range[1] ? new Date(range[1]) : null
      
      if (startDate && itemDate < startDate) return false
      if (endDate) {
        // Include items on the end date (up to 23:59:59)
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)
        if (itemDate > endOfDay) return false
      }
      
      return true
    },
  }
}

/**
 * Debounce filter updates to prevent excessive re-renders
 *
 * @param value - Filter value to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced value
 *
 * @example
 * ```tsx
 * const debouncedSearch = useDebounceFilterValue(searchTerm, 300)
 * const filtered = useFilteredData(data, { searchTerm: debouncedSearch }, config)
 * ```
 */
export function useDebounceFilterValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// Import React for useDebounceFilterValue if not already imported
import * as React from 'react'
