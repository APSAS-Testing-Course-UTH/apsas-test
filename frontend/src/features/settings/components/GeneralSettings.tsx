/**
 * GeneralSettings Component
 * Settings for theme, language, and timezone
 * Auto-saves on each change
 */

import { Select, Stack, Title } from '@mantine/core'
import { IconPalette, IconWorld, IconClock } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useGeneralSettings } from '../hooks/useSettings'
import {
  SECTION_TITLES,
  FIELD_LABELS,
  THEME_LABELS,
  LANGUAGE_LABELS,
  TIMEZONE_LABELS,
  NOTIFICATION_MESSAGES,
  type Theme,
  type Language,
  type Timezone,
} from '../types'

export function GeneralSettings() {
  const { general, updateGeneral, isLoading } = useGeneralSettings()

  // Auto-save khi user thay đổi setting
  const handleChange = (field: keyof typeof general, value: Theme | Language | Timezone) => {
    try {
      updateGeneral({
        ...general,
        [field]: value,
      })
      notifications.show({
        message: NOTIFICATION_MESSAGES.saveSuccess,
        color: 'green',
        autoClose: 2000,
      })
    } catch {
      notifications.show({
        message: NOTIFICATION_MESSAGES.saveError,
        color: 'red',
      })
    }
  }

  return (
    <Stack gap="md">
      <Title order={3}>{SECTION_TITLES.general}</Title>

      <Select
        label={FIELD_LABELS.theme}
        placeholder="Chọn giao diện"
        data={[
          { value: 'light', label: THEME_LABELS.light },
          { value: 'dark', label: THEME_LABELS.dark },
          { value: 'auto', label: THEME_LABELS.auto },
        ]}
        value={general.theme}
        onChange={(value) => handleChange('theme', value as Theme)}
        leftSection={<IconPalette size={16} />}
        disabled={isLoading}
      />

      <Select
        label={FIELD_LABELS.language}
        placeholder="Chọn ngôn ngữ"
        data={[
          { value: 'vi', label: LANGUAGE_LABELS.vi },
          { value: 'en', label: LANGUAGE_LABELS.en },
        ]}
        value={general.language}
        onChange={(value) => handleChange('language', value as Language)}
        leftSection={<IconWorld size={16} />}
        disabled={isLoading}
      />

      <Select
        label={FIELD_LABELS.timezone}
        placeholder="Chọn múi giờ"
        data={[
          { value: 'Asia/Ho_Chi_Minh', label: TIMEZONE_LABELS['Asia/Ho_Chi_Minh'] },
          { value: 'Asia/Bangkok', label: TIMEZONE_LABELS['Asia/Bangkok'] },
          { value: 'Asia/Singapore', label: TIMEZONE_LABELS['Asia/Singapore'] },
        ]}
        value={general.timezone}
        onChange={(value) => handleChange('timezone', value as Timezone)}
        leftSection={<IconClock size={16} />}
        disabled={isLoading}
      />
    </Stack>
  )
}
