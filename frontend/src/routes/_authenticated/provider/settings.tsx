import { createFileRoute, redirect } from '@tanstack/react-router'
import { Stack, Container, Title, Paper } from '@mantine/core'
import { useState } from 'react'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES, ROLE_REDIRECTS } from '@/constants/roles'
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards'
import { ChangePasswordModal } from '@/features/profile/components'
import { AccountSettingsSection } from '@/features/settings/components'
import { NotificationSettings } from '@/features/notifications'

/**
 * SettingsPage Component
 *
 * Path: /provider/settings
 * Vietnamese: "Cài đặt tài khoản"
 *
 * Displays account settings with options for:
 * - Changing password (Identity Service)
 * - Notification preferences (Notification Service)
 *
 * Backend APIs:
 * - Identity Service: Change Password
 * - Notification Service: Get/Update Preferences, Manage Devices
 *
 * Features:
 * - Email notifications (assignment published, submission evaluated)
 * - Push notifications via FCM (Firebase Cloud Messaging)
 * - Device management for push notifications
 * - 100% Vietnamese UI
 *
 * Role: CONTENT_PROVIDER only
 */
function SettingsPage() {
  const [changePasswordOpened, setChangePasswordOpened] = useState(false)

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xl">
            Cài đặt tài khoản
          </Title>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Quản lý cài đặt tài khoản của bạn
          </p>
        </div>

        {/* Account Settings Section */}
        <Paper p="lg" radius="md" withBorder>
          <AccountSettingsSection onChangePassword={() => setChangePasswordOpened(true)} />
        </Paper>

        {/* Notification Settings */}
        <div>
          <Title order={2} mb="md">
            Cài đặt thông báo
          </Title>
          <NotificationSettings />
        </div>
      </Stack>

      {/* Change Password Modal */}
      <ChangePasswordModal
        opened={changePasswordOpened}
        onClose={() => setChangePasswordOpened(false)}
      />
    </Container>
  )
}

// Protected route - only CONTENT_PROVIDER role can access
export const Route = createFileRoute('/_authenticated/provider/settings')({
  beforeLoad: ({ location }) => {
    const { isAuthenticated, isLoading, user } = useAuthStore.getState()

    // If loading, don't redirect
    if (isLoading) {
      return
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }

    // Check role access (CONTENT_PROVIDER only)
    const hasAccess = checkRoleAccess(USER_ROLES.CONTENT_PROVIDER)
    logRoleAccessAttempt(USER_ROLES.CONTENT_PROVIDER, user?.role, hasAccess)

    // If no access, redirect to appropriate dashboard
    if (!hasAccess) {
      const redirectUrl = user?.role
        ? ROLE_REDIRECTS[user.role as keyof typeof ROLE_REDIRECTS]
        : '/login'

      throw redirect({
        to: redirectUrl || '/login',
      })
    }
  },
  component: SettingsPage,
})
