/**
 * useTutorialsQuery Hook
 * Fetches paginated list of tutorials
 *
 * Usage:
 * const { data, isLoading } = useTutorialsQuery({ page: 0, size: 10 })
 */

import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { ContentServicePageResponseTutorialResponse } from '@/api/types.gen'
import { contentServiceGetAllTutorials } from '@/api/sdk.gen'

export const tutorialQueryKeys = {
  all: ['tutorials'] as const,
  lists: () => [...tutorialQueryKeys.all, 'list'] as const,
  list: (filters: { page: number; size: number; sort: string }) =>
    [...tutorialQueryKeys.lists(), filters] as const,
  details: () => [...tutorialQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...tutorialQueryKeys.details(), id] as const,
}

export function useTutorialsQuery({
  page = 0,
  size = 10,
  sort = 'createdAt:DESC',
}: { page?: number; size?: number; sort?: string } = {}) {
  return useQuery<
    ContentServicePageResponseTutorialResponse,
    AxiosError,
    ContentServicePageResponseTutorialResponse,
    readonly ['tutorials', 'list', { page: number; size: number; sort: string }]
  >({
    queryKey: ['tutorials', 'list', { page, size, sort }] as const,
    queryFn: async () => {
      const response = await contentServiceGetAllTutorials({
        query: { page: String(page), size: String(size) },
      })
      return response.data || (response as any)
    },
    staleTime: 1000 * 60 * 5,
    retry: 3,
  })
}
