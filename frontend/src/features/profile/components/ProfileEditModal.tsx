import { Modal, TextInput, Button, Group, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useEffect } from 'react'
import { useUpdateProfile } from '../api/hooks'
import {
  MODAL_TITLES,
  BUTTON_LABELS,
  PROFILE_FIELD_LABELS,
  VALIDATION_MESSAGES,
  NOTIFICATION_MESSAGES,
  type ProfileFormValues,
  type User,
} from '../types'

interface ProfileEditModalProps {
  opened: boolean
  onClose: () => void
  user: User | undefined
}

/**
 * ProfileEditModal - Modal for editing user profile
 * 
 * Vietnamese labels:
 * - Title: "Cập nhật thông tin"
 * - Fields: "Họ", "Tên", "Email" (disabled)
 * - Buttons: "Lưu", "Hủy"
 * - Validation: "Họ là bắt buộc", "Tên là bắt buộc", max 100 chars
 * - Success: "Cập nhật thông tin thành công"
 * - Error: "Lỗi khi cập nhật thông tin. Vui lòng thử lại."
 * 
 * Features:
 * - Form with firstName, lastName fields
 * - Email field displayed but disabled
 * - Validation for required fields and max length
 * - Success/error notifications
 * - Loading state during submission
 * - Form reset on close
 * - BUG FIX #2: Pass onClose directly to Modal.onClose to avoid event handler issues
 * 
 * @param opened - Modal open state
 * @param onClose - Callback when modal is closed
 * @param user - User data to pre-fill the form
 */
export function ProfileEditModal({ opened, onClose, user }: ProfileEditModalProps) {
  const updateProfile = useUpdateProfile()

  const form = useForm<ProfileFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      firstName: '',
      lastName: '',
    },
    validate: {
      firstName: (value) => {
        if (!value || !value.trim()) {
          return VALIDATION_MESSAGES.firstNameRequired
        }
        if (value.length > 100) {
          return VALIDATION_MESSAGES.firstNameMaxLength
        }
        return null
      },
      lastName: (value) => {
        if (!value || !value.trim()) {
          return VALIDATION_MESSAGES.lastNameRequired
        }
        if (value.length > 100) {
          return VALIDATION_MESSAGES.lastNameMaxLength
        }
        return null
      },
    },
  })

  // Update form when user data changes
  useEffect(() => {
    if (user && opened) {
      form.setValues({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      })
      form.resetDirty()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, opened])

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
      })

      notifications.show({
        title: 'Thành công',
        message: NOTIFICATION_MESSAGES.updateProfileSuccess,
        color: 'green',
      })

      form.reset()
      onClose()
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: NOTIFICATION_MESSAGES.updateProfileError,
        color: 'red',
      })
    }
  })

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={MODAL_TITLES.editProfile}
      centered
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label={PROFILE_FIELD_LABELS.firstName}
            placeholder="Nhập họ của bạn"
            required
            disabled={updateProfile.isPending}
            key={form.key('firstName')}
            {...form.getInputProps('firstName')}
          />

          <TextInput
            label={PROFILE_FIELD_LABELS.lastName}
            placeholder="Nhập tên của bạn"
            required
            disabled={updateProfile.isPending}
            key={form.key('lastName')}
            {...form.getInputProps('lastName')}
          />

          <TextInput
            label={PROFILE_FIELD_LABELS.email}
            value={user?.email || ''}
            disabled
            description="Email không thể thay đổi"
          />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => {
                form.reset()
                onClose()
              }}
              disabled={updateProfile.isPending}
            >
              {BUTTON_LABELS.cancel}
            </Button>
            <Button
              type="submit"
              loading={updateProfile.isPending}
              disabled={updateProfile.isPending}
            >
              {BUTTON_LABELS.save}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
