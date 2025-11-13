/**
 * useUpdateAssignmentMutation Hook
 * Updates an existing assignment with error handling and notifications
 *
 * Usage:
 * const mutation = useUpdateAssignmentMutation()
 * mutation.mutate({ id: '123', data: { title: '...', ... } })
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type {
  ContentServiceUpdateAssignmentRequest,
  ContentServiceAssignmentResponse,
} from '@/api/types.gen'
import { contentServiceUpdateAssignment } from '@/api/sdk.gen'
import { assignmentQueryKeys } from './useAssignmentsQuery'
import { showErrorNotification, showSuccessNotification } from '../utils/errorHandler'

interface UpdateAssignmentParams {
  id: string
  data: ContentServiceUpdateAssignmentRequest
}

export function useUpdateAssignmentMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    ContentServiceAssignmentResponse,
    AxiosError,
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
    onError: (error: AxiosError) => {
      showErrorNotification('Lỗi cập nhật bài tập', undefined, error)
    },
  })
}
