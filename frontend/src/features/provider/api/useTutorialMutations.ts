/**
 * Tutorial API Hooks - Create, Update, Delete
 * Includes error handling and toast notifications
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
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
import { showErrorNotification, showSuccessNotification } from '../utils/errorHandler'

/**
 * Fetch tutorial by ID
 */
export function useTutorialDetailQuery(id: string | null) {
  return useQuery<ContentServiceTutorialResponse, AxiosError>({
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
    AxiosError,
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
    onError: (error: AxiosError) => {
      showErrorNotification('Lỗi tạo hướng dẫn', undefined, error)
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
    AxiosError,
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
    onError: (error: AxiosError) => {
      showErrorNotification('Lỗi cập nhật hướng dẫn', undefined, error)
    },
  })
}

/**
 * Delete a tutorial
 */
export function useDeleteTutorialMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { id: string; title: string }>({
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
    onError: (error: AxiosError) => {
      showErrorNotification('Lỗi xóa hướng dẫn', undefined, error)
    },
  })
}
