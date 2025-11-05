import { useQuery } from '@tanstack/react-query'
import { contentServiceGetAllTutorials } from '@/api/sdk.gen'
import type { ContentServicePageResponseTutorialResponse } from '@/api/types.gen'

interface UseTutorialsOptions {
  page?: number
  size?: number
}

export function useTutorials({ page = 0, size = 10 }: UseTutorialsOptions = {}) {
  return useQuery<ContentServicePageResponseTutorialResponse | undefined>({
    queryKey: ['tutorials', page, size],
    queryFn: async () => {
      const response = await contentServiceGetAllTutorials({
        query: { page: String(page), size: String(size) },
      })
      return response.data as ContentServicePageResponseTutorialResponse | undefined
    },
  })
}
