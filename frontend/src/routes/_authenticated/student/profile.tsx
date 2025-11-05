import { createFileRoute, redirect } from '@tanstack/react-router';
import { Stack, Container } from '@mantine/core';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { USER_ROLES, ROLE_REDIRECTS } from '@/constants/roles';
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards';
import { ProfileView, ChangePasswordModal, ProfileEditModal } from '@/features/profile/components';

/**
 * ProfilePage Component
 * 
 * Displays user profile information with modals for:
 * - Editing profile (first name, last name only)
 * - Changing password
 * 
 * All data fetched from Identity Service API
 * Vietnamese: "Hồ sơ cá nhân"
 */
function ProfilePage() {
  const [changePasswordOpened, setChangePasswordOpened] = useState(false);
  const [editProfileOpened, setEditProfileOpened] = useState(false);

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <ProfileView
          onEditProfile={() => setEditProfileOpened(true)}
          onChangePassword={() => setChangePasswordOpened(true)}
        />
      </Stack>

      {/* Modals */}
      <ChangePasswordModal
        opened={changePasswordOpened}
        onClose={() => setChangePasswordOpened(false)}
      />
      <ProfileEditModal
        opened={editProfileOpened}
        onClose={() => setEditProfileOpened(false)}
      />
    </Container>
  );
}

// Protected route - only STUDENT role can access
export const Route = createFileRoute('/_authenticated/student/profile')({
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
  component: ProfilePage,
});
