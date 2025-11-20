import { Stack, Paper, Group, Text, Button, Avatar, Badge, Loader, Alert } from '@mantine/core'
import type { ApiErrorResponse } from '@/configs/api-error-handler'
import { IconUser, IconEdit, IconLock, IconAlertCircle } from '@tabler/icons-react'
import { useCurrentUser } from '../api/hooks'
import {
  PAGE_TITLE,
  PROFILE_FIELD_LABELS,
  ROLE_LABELS,
  BUTTON_LABELS,
} from '../types'
import { 
  getErrorMessage,
  isNetworkError,
  isTimeoutError,
} from '@/features/student/utils'

interface ProfileViewProps {
  onEditProfile?: () => void
  onChangePassword?: () => void
}

/**
 * ProfileView - Display user profile information
 * 
 * Vietnamese labels:
 * - Title: "Hồ sơ cá nhân"
 * - Fields: "Họ", "Tên", "Email", "Vai trò", "Ngày tạo", "Ngày cập nhật"
 * - Buttons: "Chỉnh sửa thông tin", "Đổi mật khẩu"
 * - Error: "Lỗi khi tải thông tin người dùng"
 * 
 * Features:
 * - Displays user information with avatar
 * - Shows role as badge
 * - Formats dates in Vietnamese locale
 * - Edit profile button
 * - Change password button
 * - Loading state
 * - Error state
 * 
 * @param onEditProfile - Callback when edit profile button is clicked
 * @param onChangePassword - Callback when change password button is clicked
 */
export function ProfileView({ onEditProfile, onChangePassword }: ProfileViewProps) {
  const { data: user, isLoading, error } = useCurrentUser()

  // Loading state
  if (isLoading) {
    return (
      <Paper p="xl" shadow="sm" radius="md" withBorder>
        <Stack align="center" gap="lg">
          <Loader size="lg" />
          <Text c="dimmed">Đang tải thông tin...</Text>
        </Stack>
      </Paper>
    )
  }

  // Error state
  if (error) {
    const isNetwork = isNetworkError(error as ApiErrorResponse)
    const isTimeout = isTimeoutError(error as ApiErrorResponse)
    const errorMessage = getErrorMessage(error)

    return (
      <Paper p="xl" shadow="sm" radius="md" withBorder>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={isNetwork ? '🌐 Lỗi kết nối' : isTimeout ? '⏱️ Hết thời gian chờ' : 'Lỗi'}
          color={isNetwork || isTimeout ? 'orange' : 'red'}
          variant="light"
        >
          {errorMessage}
          {isNetwork && (
            <Text size="sm" mt="sm">
              💡 Kiểm tra kết nối mạng của bạn
            </Text>
          )}
          {isTimeout && (
            <Text size="sm" mt="sm">
              💡 Máy chủ đang chậm, hãy thử lại sau
            </Text>
          )}
        </Alert>
      </Paper>
    )
  }

  // Empty state (should not happen if authenticated)
  if (!user) {
    return (
      <Paper p="xl" shadow="sm" radius="md" withBorder>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Không có dữ liệu"
          color="gray"
          variant="light"
        >
          Không tìm thấy thông tin người dùng
        </Alert>
      </Paper>
    )
  }

  // Format dates in Vietnamese locale
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get role label in Vietnamese
  const getRoleLabel = (role: string | undefined) => {
    if (!role) return 'N/A'
    return ROLE_LABELS[role] || role
  }

  return (
    <Stack gap="lg">
      {/* Header with title and action buttons */}
      <Group justify="space-between" align="center">
        <Text size="xl" fw={700}>
          {PAGE_TITLE}
        </Text>
        <Group gap="sm">
          <Button
            leftSection={<IconEdit size={16} />}
            onClick={onEditProfile}
            variant="light"
          >
            {BUTTON_LABELS.edit}
          </Button>
          <Button
            leftSection={<IconLock size={16} />}
            onClick={onChangePassword}
            variant="light"
            color="orange"
          >
            {BUTTON_LABELS.changePassword}
          </Button>
        </Group>
      </Group>

      {/* Profile information card */}
      <Paper p="xl" shadow="sm" radius="md" withBorder>
        <Stack gap="xl">
          {/* Avatar and basic info */}
          <Group align="flex-start">
            <Avatar size={80} radius="md" color="blue">
              <IconUser size={40} />
            </Avatar>
            <Stack gap="xs" style={{ flex: 1 }}>
              <Group gap="sm" align="center">
                <Text size="lg" fw={600}>
                  {user.firstName} {user.lastName}
                </Text>
                <Badge color="blue" variant="light">
                  {getRoleLabel(user.role)}
                </Badge>
                {user.isEmailVerified && (
                  <Badge color="green" variant="dot" size="sm">
                    Email đã xác thực
                  </Badge>
                )}
              </Group>
              <Text size="sm" c="dimmed">
                {user.email}
              </Text>
            </Stack>
          </Group>

          {/* Detailed information */}
          <Stack gap="md">
            <Group>
              <Text fw={500} style={{ minWidth: 140 }}>
                {PROFILE_FIELD_LABELS.firstName}:
              </Text>
              <Text>{user.firstName || 'N/A'}</Text>
            </Group>

            <Group>
              <Text fw={500} style={{ minWidth: 140 }}>
                {PROFILE_FIELD_LABELS.lastName}:
              </Text>
              <Text>{user.lastName || 'N/A'}</Text>
            </Group>

            <Group>
              <Text fw={500} style={{ minWidth: 140 }}>
                {PROFILE_FIELD_LABELS.email}:
              </Text>
              <Text>{user.email || 'N/A'}</Text>
            </Group>

            <Group>
              <Text fw={500} style={{ minWidth: 140 }}>
                {PROFILE_FIELD_LABELS.role}:
              </Text>
              <Text>{getRoleLabel(user.role)}</Text>
            </Group>

            <Group>
              <Text fw={500} style={{ minWidth: 140 }}>
                {PROFILE_FIELD_LABELS.createdAt}:
              </Text>
              <Text c="dimmed" size="sm">
                {formatDate(user.createdAt)}
              </Text>
            </Group>

            <Group>
              <Text fw={500} style={{ minWidth: 140 }}>
                {PROFILE_FIELD_LABELS.updatedAt}:
              </Text>
              <Text c="dimmed" size="sm">
                {formatDate(user.updatedAt)}
              </Text>
            </Group>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  )
}
