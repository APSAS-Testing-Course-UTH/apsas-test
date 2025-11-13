/**
 * usePublishAssignmentMutation Hook
 * Publishes a draft assignment (changes status from DRAFT to PUBLISHED)
 *
 * Usage:
 * const mutation = usePublishAssignmentMutation()
 * mutation.mutate('assignment-123')
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'
import { contentServicePublishAssignment } from '@/api/sdk.gen'
import { assignmentQueryKeys } from './useAssignmentsQuery'

export function usePublishAssignmentMutation() {
  const queryClient = useQueryClient()

  return useMutation<ContentServiceAssignmentResponse, AxiosError, string>({
    mutationFn: async (id: string) => {
      const response = await contentServicePublishAssignment({
        path: { id },
      })
      return response as ContentServiceAssignmentResponse
    },
    onSuccess: (publishedAssignment) => {
      // Update the assignment in the cache
      queryClient.setQueryData(
        assignmentQueryKeys.detail(publishedAssignment.id!),
        publishedAssignment
      )
      // Invalidate the list to refetch
      queryClient.invalidateQueries({
        queryKey: assignmentQueryKeys.lists(),
      })
    },
  })
}
