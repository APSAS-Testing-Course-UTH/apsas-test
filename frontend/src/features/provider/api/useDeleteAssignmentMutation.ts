/**
 * useDeleteAssignmentMutation Hook
 * Deletes an assignment with error handling and notifications
 *
 * Usage:
 * const mutation = useDeleteAssignmentMutation()
 * mutation.mutate({ id: 'assignment-123', title: 'Assignment Title' })
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { contentServiceDeleteAssignment } from '@/api/sdk.gen'
import { assignmentQueryKeys } from './useAssignmentsQuery'
import { showErrorNotification, showSuccessNotification } from '../utils/errorHandler'

export function useDeleteAssignmentMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { id: string; title: string }>({
    mutationFn: async ({ id }) => {
      await contentServiceDeleteAssignment({
        path: { id },
      })
    },
    onSuccess: (_, { id, title }) => {
      // Show success notification
      showSuccessNotification('Xóa bài tập', `Bài tập "${title}" đã được xóa`)
      
      // Remove from cache
      queryClient.removeQueries({
        queryKey: assignmentQueryKeys.detail(id),
      })
      // Invalidate the list to refetch
      queryClient.invalidateQueries({
        queryKey: assignmentQueryKeys.lists(),
      })
    },
    onError: (error: AxiosError) => {
      showErrorNotification('Lỗi xóa bài tập', undefined, error)
    },
  })
}
