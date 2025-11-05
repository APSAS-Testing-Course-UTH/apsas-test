/**
 * Settings Hooks
 * Custom hooks for managing user settings with localStorage
 */

import { useState, useCallback } from 'react'
import type { UserSettings, GeneralSettings, NotificationPreferences } from '../types'
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '../types'

/**
 * Hook để load settings từ localStorage
 */
function loadSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge với default settings để đảm bảo có đầy đủ fields
      return {
        general: { ...DEFAULT_SETTINGS.general, ...parsed.general },
        notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
      }
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
  return DEFAULT_SETTINGS
}

/**
 * Hook để save settings vào localStorage
 */
function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings:', error)
    throw new Error('Không thể lưu cài đặt')
  }
}

/**
 * Hook chính để quản lý settings
 */
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(loadSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Save settings khi thay đổi
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setIsLoading(true)
    setError(null)

    try {
      const updated: UserSettings = {
        general: { ...settings.general, ...(newSettings.general || {}) },
        notifications: { ...settings.notifications, ...(newSettings.notifications || {}) },
      }
      
      saveSettings(updated)
      setSettings(updated)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [settings])

  // Update general settings
  const updateGeneralSettings = useCallback((general: Partial<GeneralSettings>) => {
    return updateSettings({ general: general as GeneralSettings })
  }, [updateSettings])

  // Update notification preferences
  const updateNotificationSettings = useCallback((notifications: Partial<NotificationPreferences>) => {
    return updateSettings({ notifications: notifications as NotificationPreferences })
  }, [updateSettings])

  // Reset về default settings
  const resetSettings = useCallback(() => {
    setIsLoading(true)
    setError(null)

    try {
      saveSettings(DEFAULT_SETTINGS)
      setSettings(DEFAULT_SETTINGS)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    updateGeneralSettings,
    updateNotificationSettings,
    resetSettings,
  }
}

/**
 * Hook để chỉ get general settings
 */
export function useGeneralSettings() {
  const { settings, updateGeneralSettings, isLoading, error } = useSettings()
  return {
    general: settings.general,
    updateGeneral: updateGeneralSettings,
    isLoading,
    error,
  }
}

/**
 * Hook để chỉ get notification settings
 */
export function useNotificationSettings() {
  const { settings, updateNotificationSettings, isLoading, error } = useSettings()
  return {
    notifications: settings.notifications,
    updateNotifications: updateNotificationSettings,
    isLoading,
    error,
  }
}
