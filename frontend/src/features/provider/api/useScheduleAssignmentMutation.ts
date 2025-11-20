/**
 * useScheduleAssignmentMutation Hook
 * Updates assignment dates (startDate and dueDate)
 *
 * Usage:
 * const mutation = useScheduleAssignmentMutation()
 * mutation.mutate({ 
 *   id: 'assignment-123', 
 *   startDate: new Date(), 
 *   dueDate: new Date() 
 * })
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiErrorResponse } from '@/configs/api-error-handler'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'
import { contentServiceUpdateAssignmentSchedule } from '@/api/sdk.gen'
import { assignmentQueryKeys } from './useAssignmentsQuery'

interface ScheduleAssignmentParams {
  id: string
  startDate: Date
  dueDate: Date
}

export function useScheduleAssignmentMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    ContentServiceAssignmentResponse,
    ApiErrorResponse,
    ScheduleAssignmentParams
  >({
    mutationFn: async ({ id, startDate, dueDate }: ScheduleAssignmentParams) => {
      const response = await contentServiceUpdateAssignmentSchedule({
        path: { id },
        body: {
          startDate: startDate.toISOString() as any,
          dueDate: dueDate.toISOString() as any,
        },
      })
      return response as ContentServiceAssignmentResponse
    },
    onSuccess: (updatedAssignment) => {
      // Update the assignment in the cache
      queryClient.setQueryData(
        assignmentQueryKeys.detail(updatedAssignment.id!),
        updatedAssignment
      )
      // Invalidate the list to refetch
      queryClient.invalidateQueries({
        queryKey: assignmentQueryKeys.lists(),
      })
    },
  })
}
