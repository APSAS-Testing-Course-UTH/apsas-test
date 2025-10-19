/**
 * Unit tests cho Zustand Auth Store
 * Test các chức năng: login, logout, persistence, selectors
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useAuthStore, authSelectors, resetAuthStore, getAuthState } from './useAuthStore'
import type { AuthResponse, User } from '@/types/auth.types'

// Mock data
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'STUDENT',
  fullName: 'John Doe',
  displayName: 'John',
}

const mockAuthResponse: AuthResponse = {
  user: mockUser,
  token: 'mock-jwt-token',
}

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store trước mỗi test
    resetAuthStore()
  })

  afterEach(() => {
    // Cleanup sau mỗi test
    resetAuthStore()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState()

      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('Login Action', () => {
    it('should login user successfully', () => {
      const { login } = useAuthStore.getState()

      login(mockAuthResponse)

      const state = useAuthStore.getState()
      expect(state.user).toEqual({
        ...mockUser,
        fullName: 'John Doe',
        displayName: 'John',
      })
      expect(state.token).toBe('mock-jwt-token')
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle login with empty token', () => {
      const { login } = useAuthStore.getState()
      const authResponseWithoutToken: AuthResponse = {
        user: mockUser,
        token: undefined,
      }

      login(authResponseWithoutToken)

      const state = useAuthStore.getState()
      expect(state.token).toBeUndefined()
    })
  })

  describe('Logout Action', () => {
    it('should logout user successfully', () => {
      const { login, logout } = useAuthStore.getState()

      // Login first
      login(mockAuthResponse)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      // Then logout
      logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('Set User Action', () => {
    it('should update user data', () => {
      const { setUser } = useAuthStore.getState()
      const updatedUser: User = {
        ...mockUser,
        firstName: 'Jane',
        lastName: 'Smith',
      }

      setUser(updatedUser)

      const state = useAuthStore.getState()
      expect(state.user).toEqual({
        ...updatedUser,
        fullName: 'Jane Smith',
        displayName: 'Jane',
      })
    })
  })

  describe('Loading State', () => {
    it('should set loading state', () => {
      const { setLoading } = useAuthStore.getState()

      setLoading(true)
      expect(useAuthStore.getState().isLoading).toBe(true)

      setLoading(false)
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should set and clear error', () => {
      const { setError, clearError } = useAuthStore.getState()

      setError('Login failed')
      expect(useAuthStore.getState().error).toBe('Login failed')

      clearError()
      expect(useAuthStore.getState().error).toBeNull()
    })

    it('should set loading to false when setting error', () => {
      const { setLoading, setError } = useAuthStore.getState()

      setLoading(true)
      setError('Some error')

      const state = useAuthStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Some error')
    })
  })
})

describe('Auth Selectors', () => {
  beforeEach(() => {
    resetAuthStore()
  })

  afterEach(() => {
    resetAuthStore()
  })

  describe('Basic Selectors', () => {
    it('should return correct values when not authenticated', () => {
      expect(authSelectors.user).toBeNull()
      expect(authSelectors.token).toBeNull()
      expect(authSelectors.isAuthenticated).toBe(false)
      expect(authSelectors.isLoading).toBe(false)
      expect(authSelectors.error).toBeNull()
      expect(authSelectors.userRole).toBeNull()
    })

    it('should return correct values when authenticated', () => {
      const { login } = useAuthStore.getState()
      login(mockAuthResponse)

      expect(authSelectors.user).toEqual({
        ...mockUser,
        fullName: 'John Doe',
        displayName: 'John',
      })
      expect(authSelectors.token).toBe('mock-jwt-token')
      expect(authSelectors.isAuthenticated).toBe(true)
      expect(authSelectors.userRole).toBe('STUDENT')
    })
  })

  describe('Permission Selectors', () => {
    it('should return null permissions when no user', () => {
      expect(authSelectors.userPermissions).toBeNull()
    })

    it('should return permissions for authenticated user', () => {
      const { login } = useAuthStore.getState()
      login(mockAuthResponse)

      const permissions = authSelectors.userPermissions
      expect(permissions).toBeDefined()
      expect(typeof permissions).toBe('object')
    })

    it('should check permissions correctly', () => {
      const { login } = useAuthStore.getState()
      login(mockAuthResponse)

      // Test permission checking with existing permission
      const hasViewPermission = authSelectors.hasPermission('canViewAssignments')
      expect(hasViewPermission).toBe(true)

      // Test permission checking with non-existing permission
      const hasInvalidPermission = authSelectors.hasPermission('invalid-permission')
      expect(hasInvalidPermission).toBeUndefined()
    })

    it('should check role level correctly', () => {
      const { login } = useAuthStore.getState()
      login(mockAuthResponse)

      expect(authSelectors.hasRoleLevel('STUDENT')).toBe(true)
      expect(authSelectors.hasRoleLevel('ADMIN')).toBe(false)
    })
  })
})

describe('Utility Functions', () => {
  beforeEach(() => {
    resetAuthStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetAuthStore()
  })

  describe('resetAuthStore', () => {
    it('should reset store to initial state', () => {
      const { login } = useAuthStore.getState()
      login(mockAuthResponse)

      resetAuthStore()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('getAuthState', () => {
    it('should return current auth state', () => {
      const state = getAuthState()
      expect(state).toHaveProperty('user')
      expect(state).toHaveProperty('token')
      expect(state).toHaveProperty('isAuthenticated')
    })
  })
})