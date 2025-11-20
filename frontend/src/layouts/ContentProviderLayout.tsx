/**
 * ContentProviderLayout Component
 * Professional navigation structure for APSAS Content Provider Portal
 *
 * Features:
 * - Mantine AppShell with Header + Navbar + Main
 * - Responsive design (mobile collapse with burger menu)
 * - Vietnamese navigation labels (100%)
 * - User profile display with avatar
 * - Logout functionality
 * - Active route highlighting
 * - Role-based access control (CONTENT_PROVIDER only)
 * - Consistent with StudentPortalLayout pattern
 *
 */

import { AppShell, Burger, Group, Text, Avatar, NavLink, Stack, Menu } from '@mantine/core'
import { IconUser, IconSettings, IconLogout } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { USER_ROLES } from '@/constants/roles'
import classes from './ContentProviderLayout.module.css'

/**
 * Provider Navigation Items Configuration
 * All labels in Vietnamese (ENFORCED)
 * Vietnamese: Dashboard, Assignments, Skills, Tutorials, Analytics, Support
 */
const PROVIDER_NAV_ITEMS = [
  {
    label: 'Bảng điều khiển', // Dashboard
    href: '/provider',
    icon: 'IconDashboard',
  },
  {
    label: 'Bài tập', // Assignments
    href: '/provider/assignments',
    icon: 'IconBook',
  },
  {
    label: 'Kỹ năng', // Skills
    href: '/provider/skills',
    icon: 'IconStack',
  },
  {
    label: 'Hướng dẫn', // Tutorials
    href: '/provider/tutorials',
    icon: 'IconSchool',
  },
  {
    label: 'Phân tích', // Analytics
    href: '/provider/analytics',
    icon: 'IconChartBar',
  },
] as const

/**
 * Brand Configuration for Content Provider Portal
 */
const PROVIDER_BRAND_CONFIG = {
  name: 'Content Provider Portal',
  shortName: 'CP Portal',
}

export function ContentProviderLayout() {
  const [opened, { toggle }] = useDisclosure()
  const [menuOpened, setMenuOpened] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { logout } = useLogout()

  /**
   * Verify user has CONTENT_PROVIDER role
   * If not, redirect to their dashboard
   */
  if (user?.role !== USER_ROLES.CONTENT_PROVIDER) {
    // This will be caught by the route guard, but this is a safety check
    return null
  }

  /**
   * Handle logout
   * Vietnamese: "Đăng xuất"
   * Close menu before logout to ensure proper state cleanup
   */
  const handleLogout = async () => {
    try {
      setMenuOpened(false)
      await logout()
      // Navigation happens automatically in useLogout hook
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  /**
   * Check if nav item is active
   * Highlights current route in navigation
   */
  const isActive = (href: string) => {
    if (href === '/provider') {
      return location.pathname === '/provider'
    }
    return location.pathname.startsWith(href)
  }

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
              {PROVIDER_BRAND_CONFIG.name}
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
                      navigate({ to: '/provider/profile' })
                      setMenuOpened(false)
                    }}
                  >
                    Hồ sơ
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconSettings size={14} />}
                    onClick={() => {
                      navigate({ to: '/provider/settings' })
                      setMenuOpened(false)
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
          {PROVIDER_NAV_ITEMS.map((item) => {
            return (
              <NavLink
                key={item.href}
                label={item.label}
                active={isActive(item.href)}
                onClick={() => {
                  // Type-safe navigation: href is validated by navigation constants
                  navigate({ to: item.href as typeof item.href })
                  if (opened) toggle() // Close mobile menu after navigation
                }}
                className={classes.navLink}
              />
            )
          })}
        </Stack>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
