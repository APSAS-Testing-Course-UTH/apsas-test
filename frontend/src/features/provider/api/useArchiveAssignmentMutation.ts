/**
 * useArchiveAssignmentMutation Hook
 * Archives an assignment (changes status to ARCHIVED)
 *
 * Usage:
 * const mutation = useArchiveAssignmentMutation()
 * mutation.mutate('assignment-123')
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'
import { contentServiceArchiveAssignment } from '@/api/sdk.gen'
import { assignmentQueryKeys } from './useAssignmentsQuery'

export function useArchiveAssignmentMutation() {
  const queryClient = useQueryClient()

  return useMutation<ContentServiceAssignmentResponse, AxiosError, string>({
    mutationFn: async (id: string) => {
      const response = await contentServiceArchiveAssignment({
        path: { id },
      })
      return response as ContentServiceAssignmentResponse
    },
    onSuccess: (archivedAssignment) => {
      // Update the assignment in the cache
      queryClient.setQueryData(
        assignmentQueryKeys.detail(archivedAssignment.id!),
        archivedAssignment
      )
      // Invalidate the list to refetch
      queryClient.invalidateQueries({
        queryKey: assignmentQueryKeys.lists(),
      })
    },
  })
}
