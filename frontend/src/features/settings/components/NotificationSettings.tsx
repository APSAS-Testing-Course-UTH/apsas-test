/**
 * NotificationSettings Component
 * Settings for email and push notification preferences
 */

import { Switch, Stack, Title, Button, Group } from '@mantine/core'
import { useState } from 'react'
import { notifications } from '@mantine/notifications'
import { useNotificationSettings } from '../hooks/useSettings'
import {
  SECTION_TITLES,
  FIELD_LABELS,
  BUTTON_LABELS,
  NOTIFICATION_MESSAGES,
} from '../types'

export function NotificationSettings() {
  const { notifications: prefs, updateNotifications, isLoading } = useNotificationSettings()
  
  // Local state cho form
  const [emailNotifications, setEmailNotifications] = useState(prefs.emailNotifications)
  const [pushNotifications, setPushNotifications] = useState(prefs.pushNotifications)
  const [assignmentUpdates, setAssignmentUpdates] = useState(prefs.assignmentUpdates)
  const [feedbackNotifications, setFeedbackNotifications] = useState(prefs.feedbackNotifications)
  const [deadlineReminders, setDeadlineReminders] = useState(prefs.deadlineReminders)

  // Check if có thay đổi
  const hasChanges = 
    emailNotifications !== prefs.emailNotifications ||
    pushNotifications !== prefs.pushNotifications ||
    assignmentUpdates !== prefs.assignmentUpdates ||
    feedbackNotifications !== prefs.feedbackNotifications ||
    deadlineReminders !== prefs.deadlineReminders

  const handleSave = () => {
    try {
      updateNotifications({
        emailNotifications,
        pushNotifications,
        assignmentUpdates,
        feedbackNotifications,
        deadlineReminders,
      })
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
    setEmailNotifications(prefs.emailNotifications)
    setPushNotifications(prefs.pushNotifications)
    setAssignmentUpdates(prefs.assignmentUpdates)
    setFeedbackNotifications(prefs.feedbackNotifications)
    setDeadlineReminders(prefs.deadlineReminders)
  }

  return (
    <Stack gap="md">
      <Title order={3}>{SECTION_TITLES.notifications}</Title>

      <Switch
        label={FIELD_LABELS.emailNotifications}
        description="Nhận thông báo qua email"
        checked={emailNotifications}
        onChange={(event) => setEmailNotifications(event.currentTarget.checked)}
        disabled={isLoading}
      />

      <Switch
        label={FIELD_LABELS.pushNotifications}
        description="Nhận thông báo đẩy trên trình duyệt"
        checked={pushNotifications}
        onChange={(event) => setPushNotifications(event.currentTarget.checked)}
        disabled={isLoading}
      />

      <Switch
        label={FIELD_LABELS.assignmentUpdates}
        description="Thông báo khi có bài tập mới"
        checked={assignmentUpdates}
        onChange={(event) => setAssignmentUpdates(event.currentTarget.checked)}
        disabled={isLoading}
      />

      <Switch
        label={FIELD_LABELS.feedbackNotifications}
        description="Thông báo khi có phản hồi mới"
        checked={feedbackNotifications}
        onChange={(event) => setFeedbackNotifications(event.currentTarget.checked)}
        disabled={isLoading}
      />

      <Switch
        label={FIELD_LABELS.deadlineReminders}
        description="Nhắc nhở về hạn nộp bài"
        checked={deadlineReminders}
        onChange={(event) => setDeadlineReminders(event.currentTarget.checked)}
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
