/**
 * NotificationSettings Component
 * Settings for email and push notification preferences
 * Auto-saves on each change
 */

import { Switch, Stack, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useNotificationSettings } from '../hooks/useSettings'
import {
  SECTION_TITLES,
  FIELD_LABELS,
  NOTIFICATION_MESSAGES,
} from '../types'

export function NotificationSettings() {
  const { notifications: prefs, updateNotifications, isLoading } = useNotificationSettings()

  // Auto-save khi user thay đổi setting
  const handleToggle = (field: keyof typeof prefs, value: boolean) => {
    try {
      updateNotifications({
        ...prefs,
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
      <Title order={3}>{SECTION_TITLES.notifications}</Title>

      <Switch
        label={FIELD_LABELS.emailNotifications}
        description="Nhận thông báo qua email"
        checked={prefs.emailNotifications}
        onChange={(event) => handleToggle('emailNotifications', event.currentTarget.checked)}
        disabled={isLoading}
      />

      <Switch
        label={FIELD_LABELS.pushNotifications}
        description="Nhận thông báo đẩy trên trình duyệt"
        checked={prefs.pushNotifications}
        onChange={(event) => handleToggle('pushNotifications', event.currentTarget.checked)}
        disabled={isLoading}
      />

      <Switch
        label={FIELD_LABELS.assignmentUpdates}
        description="Thông báo khi có bài tập mới"
        checked={prefs.assignmentUpdates}
        onChange={(event) => handleToggle('assignmentUpdates', event.currentTarget.checked)}
        disabled={isLoading}
      />

      <Switch
        label={FIELD_LABELS.feedbackNotifications}
        description="Thông báo khi có phản hồi mới"
        checked={prefs.feedbackNotifications}
        onChange={(event) => handleToggle('feedbackNotifications', event.currentTarget.checked)}
        disabled={isLoading}
      />

      <Switch
        label={FIELD_LABELS.deadlineReminders}
        description="Nhắc nhở về hạn nộp bài"
        checked={prefs.deadlineReminders}
        onChange={(event) => handleToggle('deadlineReminders', event.currentTarget.checked)}
        disabled={isLoading}
      />
    </Stack>
  )
}
