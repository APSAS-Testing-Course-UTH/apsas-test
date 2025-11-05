/**
 * Settings Feature Types
 * Vietnamese labels and type definitions for user settings
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Theme options
 */
export type Theme = 'light' | 'dark' | 'auto'

/**
 * Language options
 */
export type Language = 'vi' | 'en'

/**
 * Timezone options (common Vietnam timezones)
 */
export type Timezone = 'Asia/Ho_Chi_Minh' | 'Asia/Bangkok' | 'Asia/Singapore'

/**
 * General settings
 */
export interface GeneralSettings {
  theme: Theme
  language: Language
  timezone: Timezone
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  assignmentUpdates: boolean
  feedbackNotifications: boolean
  deadlineReminders: boolean
}

/**
 * All user settings
 */
export interface UserSettings {
  general: GeneralSettings
  notifications: NotificationPreferences
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Vietnamese labels for page and sections
 */
export const PAGE_TITLE = 'Cài đặt' as const

export const SECTION_TITLES = {
  general: 'Cài đặt chung',
  notifications: 'Thông báo',
} as const

/**
 * Vietnamese labels for settings fields
 */
export const FIELD_LABELS = {
  theme: 'Giao diện',
  language: 'Ngôn ngữ',
  timezone: 'Múi giờ',
  emailNotifications: 'Thông báo qua email',
  pushNotifications: 'Thông báo đẩy',
  assignmentUpdates: 'Cập nhật bài tập',
  feedbackNotifications: 'Thông báo phản hồi',
  deadlineReminders: 'Nhắc nhở hạn nộp',
} as const

/**
 * Vietnamese labels for theme options
 */
export const THEME_LABELS: Record<Theme, string> = {
  light: 'Sáng',
  dark: 'Tối',
  auto: 'Tự động',
} as const

/**
 * Vietnamese labels for language options
 */
export const LANGUAGE_LABELS: Record<Language, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
} as const

/**
 * Vietnamese labels for timezone options
 */
export const TIMEZONE_LABELS: Record<Timezone, string> = {
  'Asia/Ho_Chi_Minh': 'Hồ Chí Minh (UTC+7)',
  'Asia/Bangkok': 'Bangkok (UTC+7)',
  'Asia/Singapore': 'Singapore (UTC+8)',
} as const

/**
 * Vietnamese labels for buttons
 */
export const BUTTON_LABELS = {
  save: 'Lưu thay đổi',
  reset: 'Đặt lại',
  cancel: 'Hủy',
} as const

/**
 * Vietnamese success/error messages
 */
export const NOTIFICATION_MESSAGES = {
  saveSuccess: 'Đã lưu cài đặt thành công',
  saveError: 'Lỗi khi lưu cài đặt. Vui lòng thử lại.',
  resetSuccess: 'Đã đặt lại cài đặt về mặc định',
} as const

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: UserSettings = {
  general: {
    theme: 'light',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    assignmentUpdates: true,
    feedbackNotifications: true,
    deadlineReminders: true,
  },
} as const

/**
 * LocalStorage key for settings
 */
export const SETTINGS_STORAGE_KEY = 'apsas_user_settings' as const
