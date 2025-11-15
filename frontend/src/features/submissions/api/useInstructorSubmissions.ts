/**
 * Instructor Submissions API Hooks
 *
 * Provides type-safe hooks for:
 * - Fetching instructor's submissions list
 * - Fetching submission details
 * - Providing feedback on submissions
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  submissionServiceGetAllSubmissions,
  submissionServiceGetSubmissionById,
  submissionServiceProvideFeedback,
} from '@/api/sdk.gen'
import type {
  SubmissionServicePageResponseSubmissionResponse,
  SubmissionServiceSubmissionResponse,
} from '@/api/types.gen'
import { handleApiError } from '@/configs/api-error-handler'
import { showNotification } from '@/utils/notifications'

/**
 * Query key factory for submissions
 * Enables intelligent cache management
 */
export const instructorSubmissionKeys = {
  all: ['instructor-submissions'],
  lists: () => [...instructorSubmissionKeys.all, 'list'],
  list: (assignmentId?: string, page?: number, size?: number) => [
    ...instructorSubmissionKeys.lists(),
    { assignmentId, page, size },
  ],
  details: () => [...instructorSubmissionKeys.all, 'detail'],
  detail: (id: string) => [...instructorSubmissionKeys.details(), id],
}

/**
 * Fetch instructor's submissions with pagination
 *
 * @param assignmentId - Filter by assignment (optional)
 * @param page - Page number (0-based, default: 0)
 * @param size - Page size (default: 10)
 *
 * @example
 * const { data, isLoading } = useInstructorSubmissions('assign-123', 0, 10)
 */
export function useInstructorSubmissions(
  assignmentId?: string,
  page: number = 0,
  size: number = 10
) {
  return useQuery({
    queryKey: instructorSubmissionKeys.list(assignmentId, page, size),
    queryFn: async () => {
      const result = await submissionServiceGetAllSubmissions({
        query: {
          assignmentId: assignmentId || undefined,
          page: String(page),
          size: String(size),
        },
      })

      if (result.error) throw result.error
      if (!result.data) throw new Error('Failed to fetch submissions')

      return result.data as SubmissionServicePageResponseSubmissionResponse
    },
  })
}

/**
 * Fetch submission details by ID
 *
 * @param submissionId - Submission ID to fetch
 *
 * @example
 * const { data } = useInstructorSubmissionDetail('sub-123')
 */
export function useInstructorSubmissionDetail(submissionId?: string) {
  return useQuery({
    queryKey: instructorSubmissionKeys.detail(submissionId || ''),
    queryFn: async () => {
      if (!submissionId) throw new Error('Submission ID is required')

      const result = await submissionServiceGetSubmissionById({
        path: { id: submissionId },
      })

      if (result.error) throw result.error
      if (!result.data) throw new Error('Failed to fetch submission details')

      return result.data as SubmissionServiceSubmissionResponse
    },
    enabled: !!submissionId,
  })
}

/**
 * Provide feedback on a submission
 *
 * @example
 * const mutation = useProvideFeedback()
 * mutation.mutate({
 *   submissionId: 'sub-123',
 *   feedback: 'Great work!'
 * })
 */
export function useProvideFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { submissionId: string; feedback: string }) => {
      const result = await submissionServiceProvideFeedback({
        path: { id: input.submissionId },
        body: { feedback: input.feedback },
      })

      if (result.error) throw result.error
      if (!result.data) throw new Error('Failed to provide feedback')

      return result.data as SubmissionServiceSubmissionResponse
    },

    onSuccess: (data) => {
      // Invalidate the submissions list to refresh data
      queryClient.invalidateQueries({
        queryKey: instructorSubmissionKeys.lists(),
      })

      // Invalidate all submission detail queries (generated TanStack Query keys)
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return (
            typeof key === 'object' &&
            key !== null &&
            '_id' in key &&
            key._id === 'submissionServiceGetSubmissionById'
          )
        },
      })

      // Also update the instructor-specific detail cache
      queryClient.setQueryData(
        instructorSubmissionKeys.detail(data.id || ''),
        data
      )

      showNotification(
        'Phản hồi đã được gửi thành công',
        'success',
        'Thành công'
      )
    },

    onError: (error) => {
      const errorObj = handleApiError(error)
      showNotification(errorObj.message, 'error', 'Lỗi')
    },
  })
}

/**
 * Fetch all submissions for an assignment
 *
 * @param assignmentId - Assignment ID to fetch submissions for
 *
 * @example
 * const { data } = useAssignmentSubmissions('assign-123')
 */
export function useAssignmentSubmissions(assignmentId: string) {
  return useInstructorSubmissions(assignmentId, 0, 100)
}
