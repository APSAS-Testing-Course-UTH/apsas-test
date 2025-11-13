/**
 * useCreateAssignmentMutation Hook
 * Creates a new assignment with error handling and notifications
 *
 * Usage:
 * const mutation = useCreateAssignmentMutation()
 * mutation.mutate({ title: '...', description: '...', ... })
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type {
  ContentServiceCreateAssignmentRequest,
  ContentServiceAssignmentResponse,
} from '@/api/types.gen'
import { contentServiceCreateAssignment } from '@/api/sdk.gen'
import { assignmentQueryKeys } from './useAssignmentsQuery'
import { showErrorNotification, showSuccessNotification } from '../utils/errorHandler'

export function useCreateAssignmentMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    ContentServiceAssignmentResponse,
    AxiosError,
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
    onError: (error: AxiosError) => {
      showErrorNotification('Lỗi tạo bài tập', undefined, error)
    },
  })
}
