/**
 * useCreateAssignmentMutation Hook
 * Creates a new assignment with error handling and notifications
 *
 * Usage:
 * const mutation = useCreateAssignmentMutation()
 * mutation.mutate({ title: '...', description: '...', ... })
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiErrorResponse } from '@/configs/api-error-handler'
import type {
  ContentServiceCreateAssignmentRequest,
  ContentServiceAssignmentResponse,
} from '@/api/types.gen'
import { contentServiceCreateAssignment } from '@/api/sdk.gen'
import { assignmentQueryKeys } from './useAssignmentsQuery'
import { 
  handleApiError,
  showErrorNotification, 
  showSuccessNotification 
} from '@/configs/api-error-handler'

export function useCreateAssignmentMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    ContentServiceAssignmentResponse,
    ApiErrorResponse,
    ContentServiceCreateAssignmentRequest
  >({
    mutationFn: async (data: ContentServiceCreateAssignmentRequest) => {
      const response = await contentServiceCreateAssignment({
        body: data,
      })
      return response as ContentServiceAssignmentResponse
    },
    onSuccess: (newAssignment) => {
      // Show success notification
      showSuccessNotification('Tạo bài tập', `Bài tập "${newAssignment.title}" đã được tạo thành công`)
      
      // Invalidate the assignments list to refetch
      queryClient.invalidateQueries({
        queryKey: assignmentQueryKeys.lists(),
      })
      // Add the new assignment to the cache
      queryClient.setQueryData(
        assignmentQueryKeys.detail(newAssignment.id!),
        newAssignment
      )
    },
    onError: (error: ApiErrorResponse) => {
      const errorMessage = handleApiError(error)
      showErrorNotification(errorMessage, 'Lỗi tạo bài tập')
    },
  })
}
