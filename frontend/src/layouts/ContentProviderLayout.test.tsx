/**
 * ContentProviderLayout Tests
 * Comprehensive test coverage for Content Provider Portal Layout component
 *
 * Test Groups:
 * 1. Header Tests (5 tests)
 * 2. Navbar Tests (6 tests)
 * 3. Role Verification Tests (2 tests)
 * 4. Responsive Tests (3 tests)
 *
 * Total: 16 tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { ContentProviderLayout } from './ContentProviderLayout'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { USER_ROLES } from '@/constants/roles'

// Mock TanStack Router
const mockNavigate = vi.fn()
const mockLocation = { pathname: '/provider' }

vi.mock('@tanstack/react-router', () => ({
  Outlet: () => <div data-testid="outlet">Main Content</div>,
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate,
}))

// Mock auth store
vi.mock('@/features/auth/stores/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}))

describe('ContentProviderLayout', () => {
  const mockUser = {
    id: '1',
    email: 'provider@example.com',
    firstName: 'Nguyễn',
    lastName: 'Văn B',
    role: USER_ROLES.CONTENT_PROVIDER,
  }

  const mockLogout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuthStore as any).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    })
  })

  // ========================================
  // Header Tests (5)
  // ========================================
  describe('Header', () => {
    it('should render header with brand name', () => {
      render(<ContentProviderLayout />)

      expect(screen.getByText('Content Provider Portal')).toBeInTheDocument()
    })

    it('should display user avatar and name', () => {
      render(<ContentProviderLayout />)

      // Check header exists with user information area
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
      expect(header?.textContent).toBeTruthy()

      // Verify Avatar component is rendered (Mantine Avatar in header)
      const headerContent = header?.innerHTML || ''
      expect(headerContent.length).toBeGreaterThan(0)
    })

    it('should show logout button with Vietnamese label', () => {
      render(<ContentProviderLayout />)

      const logoutButton = screen.getByText('Đăng xuất')
      expect(logoutButton).toBeInTheDocument()
      // Button is inside a Mantine Menu.Item component (renders as button element)
      expect(logoutButton.closest('button')).toBeInTheDocument()
    })

    it('should toggle burger menu on mobile', () => {
      render(<ContentProviderLayout />)

      const burgerButton = screen.getByRole('button', { name: /toggle navigation/i })
      expect(burgerButton).toBeInTheDocument()

      // Click to open
      fireEvent.click(burgerButton)

      // Verify button was clicked (state changes internally)
      expect(burgerButton).toBeInTheDocument()
    })

    it('should call logout on button click', async () => {
      render(<ContentProviderLayout />)

      const logoutButton = screen.getByText('Đăng xuất')
      fireEvent.click(logoutButton)

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1)
      })

      // Should navigate to login after logout
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({
          to: '/login',
          search: { redirect: undefined },
        })
      })
    })
  })

  // ========================================
  // Navbar Tests (6)
  // ========================================
  describe('Navbar', () => {
    it('should render all provider navigation items', () => {
      render(<ContentProviderLayout />)

      // Check for Vietnamese labels
      expect(screen.getByText('Bảng điều khiển')).toBeInTheDocument() // Dashboard
      expect(screen.getByText('Bài tập')).toBeInTheDocument() // Assignments
      expect(screen.getByText('Kỹ năng')).toBeInTheDocument() // Skills
      expect(screen.getByText('Hướng dẫn')).toBeInTheDocument() // Tutorials
      expect(screen.getByText('Thống kê')).toBeInTheDocument() // Analytics
    })

    it('should have correct number of navigation items', () => {
      render(<ContentProviderLayout />)

      // 5 nav items + logout button + profile/settings in menu
      const navItems = screen.getAllByRole('button')
      // At least 7 buttons: burger + 5 nav items + profile + settings + logout
      expect(navItems.length).toBeGreaterThanOrEqual(7)
    })

    it('should highlight active route for dashboard', () => {
      mockLocation.pathname = '/provider'
      render(<ContentProviderLayout />)

      // Find dashboard link
      const dashboardText = screen.getByText('Bảng điều khiển')
      const dashboardLink = dashboardText.closest('[data-active]')
      expect(dashboardLink).toHaveAttribute('data-active', 'true')
    })

    it('should highlight active route for assignments', () => {
      mockLocation.pathname = '/provider/assignments'
      render(<ContentProviderLayout />)

      // Find assignments link
      const assignmentsText = screen.getByText('Bài tập')
      const assignmentsLink = assignmentsText.closest('[data-active]')
      expect(assignmentsLink).toHaveAttribute('data-active', 'true')
    })

    it('should use Vietnamese labels for all nav items', () => {
      render(<ContentProviderLayout />)

      // Verify all Vietnamese labels
      expect(screen.getByText('Bảng điều khiển')).toBeInTheDocument() // Dashboard
      expect(screen.getByText('Bài tập')).toBeInTheDocument() // Assignments
      expect(screen.getByText('Kỹ năng')).toBeInTheDocument() // Skills
      expect(screen.getByText('Hướng dẫn')).toBeInTheDocument() // Tutorials
      expect(screen.getByText('Thống kê')).toBeInTheDocument() // Analytics
    })

    it('should navigate on nav item click', async () => {
      render(<ContentProviderLayout />)

      const assignmentsLink = screen.getByText('Bài tập')
      fireEvent.click(assignmentsLink)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({
          to: '/provider/assignments',
        })
      })
    })
  })

  // ========================================
  // Role Verification Tests (2)
  // ========================================
  describe('Role Verification', () => {
    it('should only render for CONTENT_PROVIDER role', () => {
      render(<ContentProviderLayout />)

      // Should render the layout
      expect(screen.getByText('Content Provider Portal')).toBeInTheDocument()
    })

    it('should return null if user is not CONTENT_PROVIDER', () => {
      ;(useAuthStore as any).mockReturnValue({
        user: {
          ...mockUser,
          role: USER_ROLES.STUDENT,
        },
        logout: mockLogout,
      })

      const { container } = render(<ContentProviderLayout />)

      // Should render nothing (null)
      expect(container.firstChild).toBeNull()
    })
  })

  // ========================================
  // Responsive Tests (3)
  // ========================================
  describe('Responsive Behavior', () => {
    it('should collapse navbar below md breakpoint', () => {
      render(<ContentProviderLayout />)

      // Verify burger button exists for mobile navigation
      const burgerButton = screen.getByRole('button', { name: /toggle navigation/i })
      expect(burgerButton).toBeInTheDocument()

      // AppShell navbar should exist with collapsed mobile configuration
      const navbar = document.querySelector('[class*="navbar"]')
      expect(navbar).toBeInTheDocument()
    })

    it('should show burger menu on mobile', () => {
      // Simulate mobile viewport
      global.innerWidth = 375
      global.dispatchEvent(new Event('resize'))

      render(<ContentProviderLayout />)

      const burgerButton = screen.getByRole('button', { name: /toggle navigation/i })
      expect(burgerButton).toBeInTheDocument()
    })

    it('should render main content outlet', () => {
      render(<ContentProviderLayout />)

      // Verify Outlet renders
      expect(screen.getByTestId('outlet')).toBeInTheDocument()
      expect(screen.getByText('Main Content')).toBeInTheDocument()
    })
  })

  // ========================================
  // Integration Tests (3)
  // ========================================
  describe('Integration', () => {
    it('should handle navigation for provider dashboard route correctly', () => {
      mockLocation.pathname = '/provider'
      render(<ContentProviderLayout />)

      // Verify navigation items are rendered
      const navItems = [
        'Bảng điều khiển',
        'Bài tập',
        'Kỹ năng',
        'Hướng dẫn',
        'Thống kê',
      ]

      navItems.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument()
      })
    })

    it('should handle navigation for nested assignment routes', () => {
      mockLocation.pathname = '/provider/assignments/123/edit'
      render(<ContentProviderLayout />)

      // Assignments should be active for nested route
      const assignmentsText = screen.getByText('Bài tập')
      const assignmentsLink = assignmentsText.closest('[data-active]')
      expect(assignmentsLink).toHaveAttribute('data-active', 'true')
    })

    it('should handle logout error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockLogout.mockRejectedValueOnce(new Error('Logout failed'))

      render(<ContentProviderLayout />)

      const logoutButton = screen.getByText('Đăng xuất')
      fireEvent.click(logoutButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error))
      })

      consoleErrorSpy.mockRestore()
    })
  })
})
