import { createFileRoute, redirect } from '@tanstack/react-router';
import { Stack, Container, Title } from '@mantine/core';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { USER_ROLES, ROLE_REDIRECTS } from '@/constants/roles';
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards';
import { ChangePasswordModal } from '@/features/profile/components';
import { AccountSettingsSection } from '@/features/settings/components';
import { Paper } from '@mantine/core';

/**
 * SettingsPage Component
 * 
 * Path: /student/settings
 * Vietnamese: "Cài đặt tài khoản"
 * 
 * Displays account settings with options for:
 * - Changing password
 * 
 * Scope: Only features backed by Identity Service API
 * - NO theme/language/timezone (not in backend API)
 * - NO notification settings (not in backend API)
 * - Only: Change Password (POST /api/v1/users/me/change-password)
 */
function SettingsPage() {
  const [changePasswordOpened, setChangePasswordOpened] = useState(false);

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

        <Paper p="lg" radius="md" withBorder>
          <AccountSettingsSection onChangePassword={() => setChangePasswordOpened(true)} />
        </Paper>
      </Stack>

      {/* Change Password Modal */}
      <ChangePasswordModal
        opened={changePasswordOpened}
        onClose={() => setChangePasswordOpened(false)}
      />
    </Container>
  );
}

// Protected route - only STUDENT role can access
export const Route = createFileRoute('/_authenticated/student/settings')({
  beforeLoad: ({ location }) => {
    const { isAuthenticated, isLoading, user } = useAuthStore.getState();

    // If loading, don't redirect
    if (isLoading) {
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }

    // Check role access
    const hasAccess = checkRoleAccess(USER_ROLES.STUDENT);
    logRoleAccessAttempt(USER_ROLES.STUDENT, user?.role, hasAccess);

    // If no access, redirect to appropriate dashboard
    if (!hasAccess) {
      const redirectUrl = user?.role
        ? ROLE_REDIRECTS[user.role as keyof typeof ROLE_REDIRECTS]
        : '/login';

      throw redirect({
        to: redirectUrl || '/login',
      });
    }
  },
  component: SettingsPage,
});
