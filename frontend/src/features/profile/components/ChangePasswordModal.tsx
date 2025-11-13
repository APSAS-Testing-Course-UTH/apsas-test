import { Modal, PasswordInput, Button, Group, Stack } from '@mantine/core'
import type { AxiosError } from 'axios'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useChangePassword } from '../api/hooks'
import {
  MODAL_TITLES,
  BUTTON_LABELS,
  VALIDATION_MESSAGES,
  NOTIFICATION_MESSAGES,
  type PasswordFormValues,
} from '../types'
import {
  getErrorMessage,
  showErrorNotification,
  showSuccessNotification,
} from '@/features/student/utils'

interface ChangePasswordModalProps {
  opened: boolean
  onClose: () => void
}

/**
 * ChangePasswordModal - Modal for changing user password
 * 
 * Vietnamese labels:
 * - Title: "Đổi mật khẩu"
 * - Fields: "Mật khẩu hiện tại", "Mật khẩu mới", "Xác nhận mật khẩu"
 * - Buttons: "Xác nhận", "Hủy"
 * - Validation: All fields required, new password min 8 chars, passwords must match
 * - Success: "Đổi mật khẩu thành công"
 * - Error: "Lỗi khi đổi mật khẩu. Vui lòng thử lại."
 * 
 * Features:
 * - Form with currentPassword, newPassword, confirmPassword fields
 * - Validation for required fields, min length, and password match
 * - Success/error notifications
 * - Loading state during submission
 * - Form reset on close and success
 * - BUG FIX #3: Pass onClose directly to Modal.onClose and simplify button handlers
 * 
 * @param opened - Modal open state
 * @param onClose - Callback when modal is closed
 */
export function ChangePasswordModal({ opened, onClose }: ChangePasswordModalProps) {
  const changePassword = useChangePassword()

  const form = useForm<PasswordFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (value) => {
        if (!value || !value.trim()) {
          return VALIDATION_MESSAGES.currentPasswordRequired
        }
        return null
      },
      newPassword: (value) => {
        if (!value || !value.trim()) {
          return VALIDATION_MESSAGES.newPasswordRequired
        }
        if (value.length < 8) {
          return VALIDATION_MESSAGES.newPasswordMinLength
        }
        return null
      },
      confirmPassword: (value, values) => {
        if (!value || !value.trim()) {
          return VALIDATION_MESSAGES.confirmPasswordRequired
        }
        if (value !== values.newPassword) {
          return VALIDATION_MESSAGES.passwordsDoNotMatch
        }
        return null
      },
    },
  })

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      showSuccessNotification('Thành công', NOTIFICATION_MESSAGES.changePasswordSuccess)

      form.reset()
      onClose()
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      showErrorNotification('Lỗi đổi mật khẩu', errorMessage, error)
    }
  })

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={MODAL_TITLES.changePassword}
      centered
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <PasswordInput
            label="Mật khẩu hiện tại"
            placeholder="Nhập mật khẩu hiện tại"
            required
            disabled={changePassword.isPending}
            key={form.key('currentPassword')}
            {...form.getInputProps('currentPassword')}
          />

          <PasswordInput
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
            required
            disabled={changePassword.isPending}
            key={form.key('newPassword')}
            {...form.getInputProps('newPassword')}
          />

          <PasswordInput
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            required
            disabled={changePassword.isPending}
            key={form.key('confirmPassword')}
            {...form.getInputProps('confirmPassword')}
          />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => {
                form.reset()
                onClose()
              }}
              disabled={changePassword.isPending}
            >
              {BUTTON_LABELS.cancel}
            </Button>
            <Button
              type="submit"
              loading={changePassword.isPending}
              disabled={changePassword.isPending}
            >
              {BUTTON_LABELS.submit}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
