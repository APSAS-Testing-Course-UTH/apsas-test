/**
 * Notification Service API Hooks
 * 
 * TanStack Query hooks for notification preferences and FCM device management.
 * Uses generated SDK from notification-service OpenAPI spec.
 * 
 * Features:
 * - Get/Update notification preferences (email, push)
 * - Register FCM devices for push notifications
 * - List and remove registered devices
 * 
 * @module features/notifications/api/hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  notificationServiceGetPreferences,
  notificationServiceUpdatePreferences,
  notificationServiceRegisterDevice,
  notificationServiceGetUserDevices,
  notificationServiceRemoveDevice,
} from '@/api/sdk.gen'
import type {
  NotificationServiceNotificationPreferencesResponse,
  NotificationServiceNotificationPreferencesRequest,
  NotificationServiceRegisterDeviceRequest,
  NotificationServiceDeviceTokenResponse,
} from '@/api/types.gen'

// Query keys factory
export const notificationKeys = {
  all: ['notifications'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
  devices: () => [...notificationKeys.all, 'devices'] as const,
}

/**
 * Hook to fetch user's notification preferences
 * 
 * @returns TanStack Query result with notification preferences
 * 
 * @example
 * const { data: preferences, isLoading } = useNotificationPreferences()
 * if (preferences) {
 *   console.log('Email enabled:', preferences.emailEnabled)
 *   console.log('Push enabled:', preferences.pushEnabled)
 * }
 */
export function useNotificationPreferences() {
  return useQuery<NotificationServiceNotificationPreferencesResponse>({
    queryKey: notificationKeys.preferences(),
    queryFn: async () => {
      const result = await notificationServiceGetPreferences()
      if (result.error) throw result.error
      if (!result.data) throw new Error('Không nhận được dữ liệu từ API')
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to update user's notification preferences
 * 
 * @returns TanStack Query mutation for updating preferences
 * 
 * @example
 * const { mutate: updatePreferences } = useUpdateNotificationPreferences()
 * 
 * updatePreferences({
 *   emailEnabled: true,
 *   pushEnabled: true,
 *   emailAssignmentPublished: true,
 *   emailSubmissionEvaluated: false,
 *   pushAssignmentPublished: true,
 *   pushSubmissionEvaluated: true,
 * })
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: NotificationServiceNotificationPreferencesRequest) => {
      const result = await notificationServiceUpdatePreferences({
        body: input,
      })
      if (result.error) throw result.error
      if (!result.data) throw new Error('Không nhận được dữ liệu từ API')
      return result.data
    },
    onSuccess: (data) => {
      // Update cache with new preferences
      queryClient.setQueryData(notificationKeys.preferences(), data)
    },
  })
}

/**
 * Hook to fetch user's registered FCM devices
 * 
 * @returns TanStack Query result with list of registered devices
 * 
 * @example
 * const { data: devices } = useUserDevices()
 * devices?.forEach(device => {
 *   console.log('Device:', device.deviceType, device.token)
 * })
 */
export function useUserDevices() {
  return useQuery<NotificationServiceDeviceTokenResponse[]>({
    queryKey: notificationKeys.devices(),
    queryFn: async () => {
      const result = await notificationServiceGetUserDevices()
      if (result.error) throw result.error
      if (!result.data) throw new Error('Không nhận được dữ liệu từ API')
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook to register a new FCM device token
 * 
 * @returns TanStack Query mutation for registering device
 * 
 * @example
 * const { mutate: registerDevice } = useRegisterDevice()
 * 
 * // After getting FCM token from Firebase
 * registerDevice({
 *   token: 'fcm-token-from-firebase',
 *   deviceType: 'web',
 *   userAgent: navigator.userAgent,
 * })
 */
export function useRegisterDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: NotificationServiceRegisterDeviceRequest) => {
      const result = await notificationServiceRegisterDevice({
        body: input,
      })
      if (result.error) throw result.error
      if (!result.data) throw new Error('Không nhận được dữ liệu từ API')
      return result.data
    },
    onSuccess: () => {
      // Invalidate devices list to refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.devices() })
    },
  })
}

/**
 * Hook to remove a registered FCM device
 * 
 * @returns TanStack Query mutation for removing device
 * 
 * @example
 * const { mutate: removeDevice } = useRemoveDevice()
 * 
 * // Remove device by token
 * removeDevice('fcm-token-to-remove')
 */
export function useRemoveDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (token: string) => {
      const result = await notificationServiceRemoveDevice({
        path: { token },
      })
      if (result.error) throw result.error
      return result.data
    },
    onSuccess: () => {
      // Invalidate devices list to refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.devices() })
    },
  })
}
