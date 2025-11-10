import { useQuery } from '@tanstack/react-query'
import { contentServiceGetTutorialById } from '@/api/sdk.gen'
import type { ContentServiceTutorialResponse } from '@/api/types.gen'

/**
 * Query key factory for tutorial queries
 */
export const tutorialKeys = {
  all: ['tutorials'],
  details: () => [...tutorialKeys.all, 'detail'],
  detail: (id: string) => [...tutorialKeys.details(), id],
}

/**
 * Hook to fetch tutorial by ID
 * @param tutorialId - The tutorial ID to fetch
 * @returns Query result with tutorial data
 */
export function useTutorialDetail(tutorialId: string) {
  return useQuery({
    queryKey: tutorialKeys.detail(tutorialId),
    queryFn: async () => {
      const response = await contentServiceGetTutorialById({
        path: { id: tutorialId },
      })
      return response.data
    },
    enabled: !!tutorialId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Hook to fetch all tutorials
 * @returns Query result with tutorials array
 */
export function useAllTutorials() {
  return useQuery({
    queryKey: tutorialKeys.all,
    queryFn: async () => {
      // This would need a list endpoint if available
      // For now, returning empty array as placeholder
      const tutorials: ContentServiceTutorialResponse[] = []
      return tutorials
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}
