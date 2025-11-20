/**
 * useUpdateAssignmentMutation Hook
 * Updates an existing assignment with error handling and notifications
 *
 * Usage:
 * const mutation = useUpdateAssignmentMutation()
 * mutation.mutate({ id: '123', data: { title: '...', ... } })
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiErrorResponse } from '@/configs/api-error-handler'
import type {
  ContentServiceUpdateAssignmentRequest,
  ContentServiceAssignmentResponse,
} from '@/api/types.gen'
import { contentServiceUpdateAssignment } from '@/api/sdk.gen'
import { assignmentQueryKeys } from './useAssignmentsQuery'
import { 
  handleApiError,
  showErrorNotification, 
  showSuccessNotification 
} from '@/configs/api-error-handler'

interface UpdateAssignmentParams {
  id: string
  data: ContentServiceUpdateAssignmentRequest
}

export function useUpdateAssignmentMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    ContentServiceAssignmentResponse,
    ApiErrorResponse,
    UpdateAssignmentParams
  >({
    mutationFn: async ({ id, data }: UpdateAssignmentParams) => {
      const response = await contentServiceUpdateAssignment({
        path: { id },
        body: data,
      })
      return response as ContentServiceAssignmentResponse
    },
    onSuccess: (updatedAssignment) => {
      // Show success notification
      showSuccessNotification('Cập nhật bài tập', `Bài tập "${updatedAssignment.title}" đã được cập nhật`)
      
      // Update the assignment in the cache
      queryClient.setQueryData(
        assignmentQueryKeys.detail(updatedAssignment.id!),
        updatedAssignment
      )
      // Invalidate the list to refetch (optional, for consistency)
      queryClient.invalidateQueries({
        queryKey: assignmentQueryKeys.lists(),
      })
    },
    onError: (error: ApiErrorResponse) => {
      const errorMessage = handleApiError(error)
      showErrorNotification(errorMessage, 'Lỗi cập nhật bài tập')
    },
  })
}
