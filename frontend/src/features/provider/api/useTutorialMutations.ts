/**
 * Tutorial API Hooks - Create, Update, Delete
 * Includes error handling and toast notifications
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiErrorResponse } from '@/configs/api-error-handler'
import type {
  ContentServiceCreateTutorialRequest,
  ContentServiceUpdateTutorialRequest,
  ContentServiceTutorialResponse,
} from '@/api/types.gen'
import {
  contentServiceCreateTutorial,
  contentServiceUpdateTutorial,
  contentServiceDeleteTutorial,
  contentServiceGetTutorialById,
} from '@/api/sdk.gen'
import { tutorialQueryKeys } from './useTutorialsQuery'
import { 
  handleApiError,
  showErrorNotification, 
  showSuccessNotification 
} from '@/configs/api-error-handler'

/**
 * Fetch tutorial by ID
 */
export function useTutorialDetailQuery(id: string | null) {
  return useQuery<ContentServiceTutorialResponse, ApiErrorResponse>({
    queryKey: tutorialQueryKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Tutorial ID required')
      const response = await contentServiceGetTutorialById({ path: { id } })
      return response.data as ContentServiceTutorialResponse
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Create a new tutorial
 */
export function useCreateTutorialMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    ContentServiceTutorialResponse,
    ApiErrorResponse,
    ContentServiceCreateTutorialRequest
  >({
    mutationFn: async (data: ContentServiceCreateTutorialRequest) => {
      const response = await contentServiceCreateTutorial({ body: data })
      return response.data as ContentServiceTutorialResponse
    },
    onSuccess: (newTutorial) => {
      // Show success notification
      showSuccessNotification('Tạo hướng dẫn', `Hướng dẫn "${newTutorial.title}" đã được tạo thành công`)
      
      // Invalidate the tutorials list to refetch
      queryClient.invalidateQueries({
        queryKey: tutorialQueryKeys.lists(),
      })
      // Add the new tutorial to the cache
      queryClient.setQueryData(tutorialQueryKeys.detail(newTutorial.id!), newTutorial)
    },
    onError: (error: ApiErrorResponse) => {
      const errorMessage = handleApiError(error)
      showErrorNotification(errorMessage, 'Lỗi tạo hướng dẫn')
    },
  })
}

/**
 * Update an existing tutorial
 */
export function useUpdateTutorialMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    ContentServiceTutorialResponse,
    ApiErrorResponse,
    { id: string; data: ContentServiceUpdateTutorialRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await contentServiceUpdateTutorial({
        path: { id },
        body: data,
      })
      return response.data as ContentServiceTutorialResponse
    },
    onSuccess: (updatedTutorial, { id }) => {
      // Show success notification
      showSuccessNotification('Cập nhật hướng dẫn', `Hướng dẫn "${updatedTutorial.title}" đã được cập nhật`)
      
      // Update cache with new data
      queryClient.setQueryData(tutorialQueryKeys.detail(id), updatedTutorial)
      // Invalidate the list to show updated data
      queryClient.invalidateQueries({
        queryKey: tutorialQueryKeys.lists(),
      })
    },
    onError: (error: ApiErrorResponse) => {
      const errorMessage = handleApiError(error)
      showErrorNotification(errorMessage, 'Lỗi cập nhật hướng dẫn')
    },
  })
}

/**
 * Delete a tutorial
 */
export function useDeleteTutorialMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiErrorResponse, { id: string; title: string }>({
    mutationFn: async ({ id }) => {
      await contentServiceDeleteTutorial({ path: { id } })
    },
    onSuccess: (_, { id, title }) => {
      // Show success notification
      showSuccessNotification('Xóa hướng dẫn', `Hướng dẫn "${title}" đã được xóa`)
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: tutorialQueryKeys.detail(id) })
      // Invalidate the list
      queryClient.invalidateQueries({
        queryKey: tutorialQueryKeys.lists(),
      })
    },
    onError: (error: ApiErrorResponse) => {
      const errorMessage = handleApiError(error)
      showErrorNotification(errorMessage, 'Lỗi xóa hướng dẫn')
    },
  })
}
