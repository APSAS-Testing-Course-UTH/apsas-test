import { createFileRoute, redirect } from '@tanstack/react-router';
import { Stack, Container } from '@mantine/core';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { USER_ROLES, ROLE_REDIRECTS } from '@/constants/roles';
import { checkRoleAccess, logRoleAccessAttempt } from '@/features/auth/utils/roleGuards';
import { useCurrentUser } from '@/features/profile/api/hooks';
import { ProfileView, ChangePasswordModal, ProfileEditModal } from '@/features/profile/components';

/**
 * ProfilePage Component
 * 
 * Path: /instructor/profile
 * Vietnamese: "Hồ sơ cá nhân"
 * 
 * Displays instructor profile information with modals for:
 * - Editing profile (first name, last name only)
 * - Changing password
 * 
 * Backend API:
 * - Identity Service: GET /api/v1/users/me (getCurrentUser)
 * - Identity Service: PATCH /api/v1/users/me (updateCurrentUserProfile)
 * - Identity Service: POST /api/v1/users/me/change-password
 * 
 * Features:
 * - View profile information (email, name, role)
 * - Edit profile (first name, last name)
 * - Change password
 * - 100% Vietnamese UI
 * 
 * Role: INSTRUCTOR only
 */
function ProfilePage() {
  const [changePasswordOpened, setChangePasswordOpened] = useState(false);
  const [editProfileOpened, setEditProfileOpened] = useState(false);
  const { data: user } = useCurrentUser();

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
        user={user}
      />
    </Container>
  );
}

// Protected route - only INSTRUCTOR role can access
// Parent route (_authenticated.tsx) already checks authentication
export const Route = createFileRoute('/_authenticated/instructor/profile')({
  beforeLoad: () => {
    // Get user from auth store (parent route already verified authentication)
    const { user } = useAuthStore.getState();

    // Check role access (INSTRUCTOR only)
    const hasAccess = checkRoleAccess(USER_ROLES.INSTRUCTOR);
    logRoleAccessAttempt(USER_ROLES.INSTRUCTOR, user?.role, hasAccess);

    // If wrong role, redirect to appropriate dashboard
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
