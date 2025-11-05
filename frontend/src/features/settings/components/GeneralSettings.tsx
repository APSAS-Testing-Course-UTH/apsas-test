/**
 * GeneralSettings Component
 * Settings for theme, language, and timezone
 */

import { Select, Stack, Title, Button, Group } from '@mantine/core'
import { IconPalette, IconWorld, IconClock } from '@tabler/icons-react'
import { useState } from 'react'
import { notifications } from '@mantine/notifications'
import { useGeneralSettings } from '../hooks/useSettings'
import {
  SECTION_TITLES,
  FIELD_LABELS,
  THEME_LABELS,
  LANGUAGE_LABELS,
  TIMEZONE_LABELS,
  BUTTON_LABELS,
  NOTIFICATION_MESSAGES,
  type Theme,
  type Language,
  type Timezone,
} from '../types'

export function GeneralSettings() {
  const { general, updateGeneral, isLoading } = useGeneralSettings()
  
  // Local state cho form
  const [theme, setTheme] = useState<Theme>(general.theme)
  const [language, setLanguage] = useState<Language>(general.language)
  const [timezone, setTimezone] = useState<Timezone>(general.timezone)

  // Check if có thay đổi
  const hasChanges = 
    theme !== general.theme || 
    language !== general.language || 
    timezone !== general.timezone

  const handleSave = () => {
    try {
      updateGeneral({ theme, language, timezone })
      notifications.show({
        message: NOTIFICATION_MESSAGES.saveSuccess,
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        message: NOTIFICATION_MESSAGES.saveError,
        color: 'red',
      })
    }
  }

  const handleReset = () => {
    setTheme(general.theme)
    setLanguage(general.language)
    setTimezone(general.timezone)
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
        value={theme}
        onChange={(value) => setTheme(value as Theme)}
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
        value={language}
        onChange={(value) => setLanguage(value as Language)}
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
        value={timezone}
        onChange={(value) => setTimezone(value as Timezone)}
        leftSection={<IconClock size={16} />}
        disabled={isLoading}
      />

      <Group justify="flex-end" mt="md">
        <Button
          variant="default"
          onClick={handleReset}
          disabled={!hasChanges || isLoading}
        >
          {BUTTON_LABELS.reset}
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          loading={isLoading}
        >
          {BUTTON_LABELS.save}
        </Button>
      </Group>
    </Stack>
  )
}
