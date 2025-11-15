/**
 * InstructorPortalLayout Component
 * Professional navigation structure for APSAS Instructor Portal
 * 
 * Features:
 * - Mantine AppShell with Header + Navbar + Main
 * - Responsive design (mobile collapse with burger menu)
 * - Vietnamese navigation labels (100%)
 * - User profile display with avatar
 * - Logout functionality
 * - Active route highlighting
 * - Controlled Menu state for reliable dropdown rendering
 * 
 * Created: Week 1, Day 1 - Copied from StudentPortalLayout with instructor-specific nav items
 */

import { AppShell, Burger, Group, Text, Avatar, NavLink, Stack, Menu } from '@mantine/core';
import { IconUser, IconSettings, IconLogout } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { INSTRUCTOR_NAV_ITEMS, BRAND_CONFIG } from '@/constants/navigation';
import classes from './InstructorPortalLayout.module.css';

export function InstructorPortalLayout() {
  const [opened, { toggle }] = useDisclosure();
  const [menuOpened, setMenuOpened] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { logout } = useLogout();

  /**
   * Handle logout
   * Vietnamese: "Đăng xuất"
   * 
   * BUG FIX #1: Close menu before logout to ensure proper state cleanup
   */
  const handleLogout = async () => {
    try {
      setMenuOpened(false);
      await logout();
      // Navigation happens automatically in useLogout hook
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Check if nav item is active
   * Highlights current route in navigation
   */
  const isActive = (href: string) => {
    if (href === '/instructor') {
      return location.pathname === '/instructor';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 230,
        breakpoint: 'md',
        collapsed: { mobile: !opened, desktop: false },
      }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="md"
              size="sm"
              aria-label="Toggle navigation"
            />
            <Text fw={700} size="lg" className={classes.brand}>
              Instructor Portal
            </Text>
          </Group>

          <Group gap="sm">
            {user && (
              <Menu 
                shadow="md" 
                width={200} 
                position="bottom-end"
                opened={menuOpened}
                onChange={setMenuOpened}
              >
                <Menu.Target>
                  <Group gap="xs" style={{ cursor: 'pointer' }}>
                    <Avatar
                      name={user.firstName + ' ' + user.lastName}
                      color="initials"
                      size="sm"
                    />
                    <Text size="sm" className={classes.username}>
                      {user.firstName} {user.lastName}
                    </Text>
                  </Group>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconUser size={14} />}
                    onClick={() => {
                      navigate({ to: '/student/profile' });
                      setMenuOpened(false);
                    }}
                  >
                    Hồ sơ
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconSettings size={14} />}
                    onClick={() => {
                      navigate({ to: '/student/settings' });
                      setMenuOpened(false);
                    }}
                  >
                    Cài đặt tài khoản
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconLogout size={14} />}
                    onClick={handleLogout}
                    color="red"
                  >
                    Đăng xuất
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar p="md">
        <Stack gap="md">
          {INSTRUCTOR_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                label={item.label}
                leftSection={<Icon size={25} stroke={1.5} />}
                active={isActive(item.href)}
                onClick={() => {
                  navigate({ to: item.href as any });
                  if (opened) toggle(); // Close mobile menu after navigation
                }}
                className={classes.navLink}
              />
            );
          })}
        </Stack>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
