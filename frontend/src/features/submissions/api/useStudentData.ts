/**
 * Student Data Hook for Instructor Features
 *
 * Provides hooks to fetch student information from Identity Service
 * Used to enrich submission data with student names and emails
 *
 * @example
 * const { studentMap, isLoading } = useStudentsData(['student-id-1', 'student-id-2'])
 * const studentName = studentMap.get('student-id-1')?.firstName
 */

import { useQueries } from '@tanstack/react-query'
import { identityServiceGetUserById } from '@/api/sdk.gen'
import type { IdentityServiceUserResponse } from '@/api/types.gen'

/**
 * Fetch multiple students' data by their IDs
 *
 * Uses parallel queries with TanStack Query's useQueries
 * Deduplicates student IDs automatically
 * Caches student data for 5 minutes
 *
 * @param studentIds - Array of student UUIDs (can contain duplicates)
 * @returns Object with:
 *   - studentMap: Map<studentId, UserResponse> for O(1) lookup
 *   - isLoading: true if any query is loading
 *   - hasError: true if any query has error
 *
 * @example
 * ```tsx
 * const studentIds = submissions.map(s => s.studentId)
 * const { studentMap, isLoading } = useStudentsData(studentIds)
 *
 * // O(1) lookup
 * const student = studentMap.get(submission.studentId)
 * const name = student ? `${student.firstName} ${student.lastName}` : 'N/A'
 * ```
 */
export function useStudentsData(studentIds: string[]) {
  // Deduplicate and filter out empty IDs
  const uniqueIds = [...new Set(studentIds.filter(Boolean))]

  // Fetch all students in parallel
  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ['user', id],
      queryFn: async () => {
        const result = await identityServiceGetUserById({
          path: { userId: id },
        })

        if (result.error) throw result.error
        if (!result.data) throw new Error(`Failed to fetch user ${id}`)

        return result.data as IdentityServiceUserResponse
      },
      staleTime: 5 * 60 * 1000, // 5 minutes - student data doesn't change often
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
      retry: 2, // Retry failed requests twice
    })),
  })

  // Build O(1) lookup map: studentId -> UserResponse
  const studentMap = new Map<string, IdentityServiceUserResponse>()
  queries.forEach((query, index) => {
    if (query.data) {
      const studentId = uniqueIds[index]
      studentMap.set(studentId, query.data)
    }
  })

  // Aggregate loading and error states
  const isLoading = queries.some((q) => q.isLoading)
  const hasError = queries.some((q) => q.isError)

  return {
    studentMap,
    isLoading,
    hasError,
  }
}
