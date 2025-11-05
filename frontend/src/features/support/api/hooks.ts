import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  supportServiceListSessions,
  supportServiceCreateSession,
  supportServiceGetSessionById,
  supportServiceCloseSession,
} from '@/api/sdk.gen'
import type {
  SupportSession,
  SupportSessionsPage,
  CreateSupportSessionInput,
} from '../types'

// Query keys factory
export const supportKeys = {
  all: ['support'] as const,
  lists: () => [...supportKeys.all, 'list'] as const,
  list: (filters: { page?: number; size?: number }) =>
    [...supportKeys.lists(), filters] as const,
  details: () => [...supportKeys.all, 'detail'] as const,
  detail: (id: string) => [...supportKeys.details(), id] as const,
}

/**
 * Hook to fetch support sessions list with pagination
 */
export function useSupportSessions(params?: {
  page?: number
  size?: number
}) {
  const page = params?.page ?? 0
  const size = params?.size ?? 10

  return useQuery<SupportSessionsPage>({
    queryKey: supportKeys.list({ page, size }),
    queryFn: async () => {
      const result = await supportServiceListSessions({
        query: {
          page: String(page),
          size: String(size),
        },
      })
      if (result.error) throw result.error
      if (!result.data) throw new Error('No data returned from API')
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to fetch a single support session by ID
 */
export function useSupportSession(id?: string) {
  return useQuery<SupportSession>({
    queryKey: supportKeys.detail(id!),
    queryFn: async () => {
      const result = await supportServiceGetSessionById({
        path: { id: id! },
      })
      if (result.error) throw result.error
      if (!result.data) throw new Error('No data returned from API')
      return result.data
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to create a new support session (ticket)
 */
export function useCreateSupportSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateSupportSessionInput) => {
      const result = await supportServiceCreateSession({
        body: input,
      })
      if (result.error) throw result.error
      if (!result.data) throw new Error('No data returned from API')
      return result.data
    },
    onSuccess: () => {
      // Invalidate all support lists to refetch
      queryClient.invalidateQueries({ queryKey: supportKeys.lists() })
    },
  })
}

/**
 * Hook to close a support session
 */
export function useCloseSupportSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const result = await supportServiceCloseSession({
        path: { id: sessionId },
      })
      if (result.error) throw result.error
      if (!result.data) throw new Error('No data returned from API')
      return result.data
    },
    onSuccess: (_, sessionId) => {
      // Invalidate lists and the specific session detail
      queryClient.invalidateQueries({ queryKey: supportKeys.lists() })
      queryClient.invalidateQueries({ queryKey: supportKeys.detail(sessionId) })
    },
  })
}

// Export alias for backward compatibility with SupportPage component
export { useSupportSession as useSupportSessionDetail }
