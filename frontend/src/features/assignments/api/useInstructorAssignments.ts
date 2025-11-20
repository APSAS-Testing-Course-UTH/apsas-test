/**
 * Instructor Assignment API Hooks
 * Provides type-safe React Query hooks for instructor assignment management
 * - Fetching assignments (read-only for instructors)
 * - Updating assignment schedules (start date, due date)
 * - Error handling with Vietnamese notifications
 * 
 * Uses generated SDK from @/api/sdk.gen for type-safe API calls
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiErrorResponse } from '@/configs/api-error-handler'
import {
  contentServiceGetAllAssignments,
  contentServiceGetAssignmentById,
  contentServiceUpdateAssignmentSchedule,
} from '@/api/sdk.gen'
import type {
  ContentServicePageResponseAssignmentResponse,
  ContentServiceAssignmentResponse,
  ContentServiceUpdateAssignmentScheduleRequest,
} from '@/api/types.gen'
import { handleApiError } from '@/configs/api-error-handler'
import { showNotification } from '@/utils/notifications'

/**
 * Query key factory for instructor assignments
 * Ensures consistent query key naming across the application
 */
export const instructorAssignmentKeys = {
  all: ['instructor-assignments'],
  lists: () => [...instructorAssignmentKeys.all, 'list'],
  list: (page: number, size: number) => [
    ...instructorAssignmentKeys.lists(),
    { page, size },
  ],
  details: () => [...instructorAssignmentKeys.all, 'detail'],
  detail: (id: string) => [...instructorAssignmentKeys.details(), id],
}

/**
 * Hook: Get all assignments for instructor
 * Returns paginated assignments that instructor can manage
 *
 * @param page - 0-indexed page number
 * @param size - Items per page (default: 10, max: 100)
 * @returns Assignment list with pagination info
 */
export function useInstructorAssignments(page: number = 0, size: number = 10) {
  return useQuery<ContentServicePageResponseAssignmentResponse, ApiErrorResponse>({
    queryKey: instructorAssignmentKeys.list(page, size),
    queryFn: async () => {
      const result = await contentServiceGetAllAssignments({
        query: {
          page: String(page),
          size: String(size),
        },
      })
      if (result.error) throw result.error
      if (!result.data) throw new Error('Không thể tải dữ liệu bài tập')
      return result.data
    },
  })
}

/**
 * Hook: Get single assignment detail
 * Used for assignment detail page with full information
 *
 * @param assignmentId - Assignment ID (UUID)
 * @returns Single assignment with all details
 */
export function useInstructorAssignmentDetail(assignmentId: string) {
  return useQuery<ContentServiceAssignmentResponse, ApiErrorResponse>({
    queryKey: instructorAssignmentKeys.detail(assignmentId),
    queryFn: async () => {
      const result = await contentServiceGetAssignmentById({
        path: {
          id: assignmentId,
        },
      })
      if (result.error) throw result.error
      if (!result.data) throw new Error('Không thể tải chi tiết bài tập')
      return result.data
    },
    enabled: !!assignmentId,
  })
}

/**
 * Hook: Update assignment schedule (start date, due date)
 * Instructor can modify when assignment is available and when it's due
 *
 * @returns Mutation for updating assignment schedule
 *
 * @example
 * const mutation = useUpdateAssignmentSchedule()
 * mutation.mutate({
 *   assignmentId: '123',
 *   startDate: new Date('2025-12-20'),
 *   dueDate: new Date('2025-12-27')
 * })
 */
export function useUpdateAssignmentSchedule() {
  const queryClient = useQueryClient()

  return useMutation<
    ContentServiceAssignmentResponse,
    ApiErrorResponse,
    {
      assignmentId: string
      startDate: Date
      dueDate: Date
    }
  >({
    mutationFn: async ({ assignmentId, startDate, dueDate }) => {
      const payload: ContentServiceUpdateAssignmentScheduleRequest = {
        startDate,
        dueDate,
      }

      const result = await contentServiceUpdateAssignmentSchedule({
        path: {
          id: assignmentId,
        },
        body: payload,
      })

      if (result.error) throw result.error
      if (!result.data) throw new Error('Không thể cập nhật lịch trình')
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate list to refresh data
      queryClient.invalidateQueries({
        queryKey: instructorAssignmentKeys.lists(),
      })

      // Update detail cache if available
      if (data.id) {
        queryClient.setQueryData(
          instructorAssignmentKeys.detail(data.id),
          data
        )
      }

      // Show success notification in Vietnamese
      showNotification(
        `Bài tập "${data.title}" đã được cập nhật thành công`,
        'success',
        'Cập nhật thành công'
      )
    },
    onError: (error) => {
      const errorObj = handleApiError(error)
      showNotification(errorObj.message, 'error', 'Lỗi: Không thể cập nhật lịch trình')
    },
  })
}

/**
 * Hook: Use assignment list with pagination
 * Convenience hook that combines loading, data, and error states
 *
 * @param page - 0-indexed page
 * @param size - Items per page
 * @returns { data, isLoading, error, isPreviousData }
 */
export function useInstructorAssignmentList(page: number = 0, size: number = 10) {
  return useInstructorAssignments(page, size)
}
