import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuthStore, resetAuthStore } from '../stores/useAuthStore'
import { USER_ROLES, ROLE_REDIRECTS } from '@/constants/roles'
import type { User } from '@/types/auth.types'

// Mock useAuthStore
vi.mock('../stores/useAuthStore', () => ({
  useAuthStore: vi.fn(),
  resetAuthStore: vi.fn(),
}))

// Mock TanStack Router Navigate
vi.mock('@tanstack/react-router', () => ({
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) => (
    <div data-testid="navigate" data-to={to} data-replace={replace}>
      Redirecting to {to}
    </div>
  ),
}))

// Mock Mantine Loader
vi.mock('@mantine/core', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
  Center: ({ children, style }: { children: React.ReactNode; style?: Record<string, string> }) => (
    <div data-testid="center" style={style}>
      {children}
    </div>
  ),
}))

// Test component wrapper (simplified - just render without router wrapper)
const TestComponent = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
)

// Mock user factories
const createMockUser = (overrides?: Partial<User>): User => ({
  id: '1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  displayName: 'John Doe',
  role: USER_ROLES.STUDENT,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe('ProtectedRoute - Route Guard Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetAuthStore()
  })

  // ============================================================================
  // 1. LOADING STATE TESTS (3 tests)
  // ============================================================================

  describe('Loading State', () => {
    it('should display loader when isLoading is true', () => {
      const mockUseAuthStore = useAuthStore as any
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      })

      render(
        <TestComponent>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      expect(screen.getByTestId('loader')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('should display loader with center styling', () => {
      const mockUseAuthStore = useAuthStore as any
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      })

      render(
        <TestComponent>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      const centerDiv = screen.getByTestId('center')
      expect(centerDiv).toHaveStyle({ height: '100vh' })
    })

    it('should not show content or redirect while loading', () => {
      const mockUseAuthStore = useAuthStore as any
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      })

      render(
        <TestComponent>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // 2. UNAUTHENTICATED ACCESS (4 tests)
  // ============================================================================

  describe('Unauthenticated Access', () => {
    it('should redirect to /login when not authenticated', () => {
      const mockUseAuthStore = useAuthStore as any
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      const navigate = screen.getByTestId('navigate')
      expect(navigate).toHaveAttribute('data-to', '/login')
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('should redirect to /login when isAuthenticated is false but user exists', () => {
      const mockUseAuthStore = useAuthStore as any
      const mockUser = createMockUser({ role: USER_ROLES.STUDENT })
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: false,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      const navigate = screen.getByTestId('navigate')
      expect(navigate).toHaveAttribute('data-to', '/login')
    })

    it('should redirect with replace flag set to true', () => {
      const mockUseAuthStore = useAuthStore as any
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      const navigate = screen.getByTestId('navigate')
      expect(navigate).toHaveAttribute('data-replace', 'true')
    })

    it('should redirect to custom fallbackPath when provided', () => {
      const mockUseAuthStore = useAuthStore as any
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute fallbackPath="/unauthorized">
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      const navigate = screen.getByTestId('navigate')
      expect(navigate).toHaveAttribute('data-to', '/unauthorized')
    })
  })

  // ============================================================================
  // 3. AUTHENTICATED ACCESS WITHOUT ROLE RESTRICTIONS (3 tests)
  // ============================================================================

  describe('Authenticated Access Without Role Restrictions', () => {
    it('should render children when authenticated and no role requirements', () => {
      const mockUseAuthStore = useAuthStore as any
      const mockUser = createMockUser({ role: USER_ROLES.STUDENT })
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
    })

    it('should render children when authenticated with empty requiredRoles array', () => {
      const mockUseAuthStore = useAuthStore as any
      const mockUser = createMockUser({ role: USER_ROLES.INSTRUCTOR })
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute requiredRoles={[]}>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should render children for any authenticated user with empty requiredRoles', () => {
      const mockUseAuthStore = useAuthStore as any
      const roles = [
        USER_ROLES.STUDENT,
        USER_ROLES.INSTRUCTOR,
        USER_ROLES.CONTENT_PROVIDER,
        USER_ROLES.ADMIN,
      ]

      roles.forEach((role) => {
        vi.clearAllMocks()

        const mockUser = createMockUser({ role })
        mockUseAuthStore.mockReturnValue({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
        })

        const { unmount } = render(
          <TestComponent>
            <ProtectedRoute requiredRoles={[]}>
              <div>Protected Content</div>
            </ProtectedRoute>
          </TestComponent>
        )

        expect(screen.getByText('Protected Content')).toBeInTheDocument()
        unmount()
      })
    })
  })

  // ============================================================================
  // 4. ROLE-BASED ACCESS CONTROL (6 tests)
  // ============================================================================

  describe('Role-Based Access Control', () => {
    it('should render children when user has required role', () => {
      const mockUseAuthStore = useAuthStore as any
      const mockUser = createMockUser({ role: USER_ROLES.INSTRUCTOR })
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute requiredRoles={[USER_ROLES.INSTRUCTOR]}>
            <div>Instructor Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      expect(screen.getByText('Instructor Content')).toBeInTheDocument()
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
    })

    it('should render children when user has one of multiple required roles', () => {
      const mockUseAuthStore = useAuthStore as any
      const mockUser = createMockUser({ role: USER_ROLES.ADMIN })
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute requiredRoles={[USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN]}>
            <div>Admin or Instructor Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      expect(screen.getByText('Admin or Instructor Content')).toBeInTheDocument()
    })

    it('should redirect when user does not have required role', () => {
      const mockUseAuthStore = useAuthStore as any
      const mockUser = createMockUser({ role: USER_ROLES.STUDENT })
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]}>
            <div>Admin Only Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      const navigate = screen.getByTestId('navigate')
      expect(navigate).toHaveAttribute('data-to', ROLE_REDIRECTS[USER_ROLES.STUDENT])
      expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument()
    })

    it('should redirect to role-specific dashboard when access denied', () => {
      const mockUseAuthStore = useAuthStore as any
      const mockUser = createMockUser({ role: USER_ROLES.INSTRUCTOR })
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]}>
            <div>Admin Only Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      const navigate = screen.getByTestId('navigate')
      expect(navigate).toHaveAttribute('data-to', '/lecturer/dashboard')
    })

    it('should handle multiple role requirements correctly', () => {
      const mockUseAuthStore = useAuthStore as any

      // Test with CONTENT_PROVIDER (should not have access to ADMIN-only route)
      const mockUser = createMockUser({ role: USER_ROLES.CONTENT_PROVIDER })
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR]}>
            <div>Restricted Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      const navigate = screen.getByTestId('navigate')
      expect(navigate).toHaveAttribute('data-to', ROLE_REDIRECTS[USER_ROLES.CONTENT_PROVIDER])
    })

    it('should check all role requirements and redirect if none match', () => {
      const mockUseAuthStore = useAuthStore as any
      const mockUser = createMockUser({ role: USER_ROLES.STUDENT })
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute requiredRoles={[
            USER_ROLES.ADMIN,
            USER_ROLES.INSTRUCTOR,
            USER_ROLES.CONTENT_PROVIDER,
          ]}>
            <div>Restricted Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      const navigate = screen.getByTestId('navigate')
      expect(navigate).toHaveAttribute('data-to', '/student/dashboard')
    })
  })

  // ============================================================================
  // 5. CHILDREN RENDERING (4 tests)
  // ============================================================================

  describe('Children Rendering', () => {
    it('should render single child element', () => {
      const mockUseAuthStore = useAuthStore as any
      const mockUser = createMockUser({ role: USER_ROLES.STUDENT })
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute>
            <div>Single Child</div>
          </ProtectedRoute>
        </TestComponent>
      )

      expect(screen.getByText('Single Child')).toBeInTheDocument()
    })

    it('should render multiple child elements', () => {
      const mockUseAuthStore = useAuthStore as any
      const mockUser = createMockUser({ role: USER_ROLES.INSTRUCTOR })
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute>
            <div>Child 1</div>
            <div>Child 2</div>
            <div>Child 3</div>
          </ProtectedRoute>
        </TestComponent>
      )

      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      expect(screen.getByText('Child 3')).toBeInTheDocument()
    })

    it('should render complex nested children', () => {
      const mockUseAuthStore = useAuthStore as any
      const mockUser = createMockUser({ role: USER_ROLES.ADMIN })
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute>
            <div>
              <section>
                <article>Nested Content</article>
              </section>
            </div>
          </ProtectedRoute>
        </TestComponent>
      )

      expect(screen.getByText('Nested Content')).toBeInTheDocument()
    })

    it('should not render children when redirect is triggered', () => {
      const mockUseAuthStore = useAuthStore as any
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute>
            <div>Should Not Render</div>
          </ProtectedRoute>
        </TestComponent>
      )

      expect(screen.queryByText('Should Not Render')).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // 6. EDGE CASES & SPECIAL SCENARIOS (5 tests)
  // ============================================================================

  describe('Edge Cases & Special Scenarios', () => {
    it('should handle null user with isAuthenticated=true', () => {
      const mockUseAuthStore = useAuthStore as any
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      const navigate = screen.getByTestId('navigate')
      expect(navigate).toHaveAttribute('data-to', '/login')
    })

    it('should handle user with undefined role gracefully', () => {
      const mockUseAuthStore = useAuthStore as any
      const mockUser = createMockUser()
      delete mockUser.role
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]}>
            <div>Admin Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      const navigate = screen.getByTestId('navigate')
      expect(navigate).toBeInTheDocument()
    })

    it('should handle empty string fallbackPath', () => {
      const mockUseAuthStore = useAuthStore as any
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      render(
        <TestComponent>
          <ProtectedRoute fallbackPath="">
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      const navigate = screen.getByTestId('navigate')
      expect(navigate).toHaveAttribute('data-to', '')
    })

    it('should render without explicitly passing children prop', () => {
      const mockUseAuthStore = useAuthStore as any
      const mockUser = createMockUser({ role: USER_ROLES.STUDENT })
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })

      const { container } = render(
        <TestComponent>
          <ProtectedRoute>
            <></>
          </ProtectedRoute>
        </TestComponent>
      )

      expect(container).toBeInTheDocument()
    })

    it('should switch from loading to authenticated state', () => {
      const mockUseAuthStore = useAuthStore as any

      // First render: loading
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      })

      const { rerender } = render(
        <TestComponent>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      expect(screen.getByTestId('loader')).toBeInTheDocument()

      // Second render: authenticated
      mockUseAuthStore.mockReturnValue({
        user: createMockUser({ role: USER_ROLES.STUDENT }),
        isAuthenticated: true,
        isLoading: false,
      })

      rerender(
        <TestComponent>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestComponent>
      )

      expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })
})
