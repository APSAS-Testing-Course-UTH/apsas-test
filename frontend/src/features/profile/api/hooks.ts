import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  identityServiceGetCurrentUser,
  identityServiceUpdateCurrentUserProfile,
  identityServiceChangePassword,
} from '@/api/sdk.gen'
import type {
  User,
  UpdateProfileInput,
  ChangePasswordInput,
} from '../types'

// Query keys factory
export const profileKeys = {
  all: ['profile'] as const,
  current: () => [...profileKeys.all, 'current'] as const,
}

/**
 * Hook to fetch current user profile
 * 
 * Returns user data with loading and error states
 */
export function useCurrentUser() {
  return useQuery<User>({
    queryKey: profileKeys.current(),
    queryFn: async () => {
      const result = await identityServiceGetCurrentUser()
      if (result.error) throw result.error
      if (!result.data) throw new Error('No data returned from API')
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - profile data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  })
}

/**
 * Hook to update current user profile
 * 
 * Automatically invalidates and refetches profile after successful update
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const result = await identityServiceUpdateCurrentUserProfile({
        body: input,
      })
      if (result.error) throw result.error
      if (!result.data) throw new Error('No data returned from API')
      return result.data
    },
    onSuccess: (data) => {
      // Update the cache with new data
      queryClient.setQueryData(profileKeys.current(), data)
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: profileKeys.current() })
    },
  })
}

/**
 * Hook to change user password
 * 
 * Does not invalidate profile cache since password is not part of profile data
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: ChangePasswordInput) => {
      const result = await identityServiceChangePassword({
        body: input,
      })
      if (result.error) throw result.error
      // Password change returns void/empty response
      return result.data
    },
  })
}
