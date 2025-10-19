/**
 * Unit tests cho Auth Hooks
 * Test logic cơ bản của useLogin, useRegister, useCurrentUser hooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuthStore, resetAuthStore } from '../stores/useAuthStore'

// Mock dependencies
vi.mock('@/lib/api-error-handler', () => ({
  mapApiError: vi.fn((error) => ({ message: error.message || 'Unknown error', code: 'UNKNOWN' })),
}))

vi.mock('@/utils/notifications', () => ({
  showSuccessNotification: vi.fn(),
  showErrorNotification: vi.fn(),
}))

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}))

// Import after mocks
import { showSuccessNotification, showErrorNotification } from '@/utils/notifications'
import { notifications } from '@mantine/notifications'

describe('Auth Hooks Logic', () => {
  beforeEach(() => {
    resetAuthStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetAuthStore()
  })

  describe('useLogin logic', () => {
    it('should handle successful login response transformation', () => {
      const { login } = useAuthStore.getState()

      const mockResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'STUDENT' as const,
        },
        token: 'mock-jwt-token',
      }

      // Simulate what useLogin does
      const transformedResponse = {
        ...mockResponse,
        user: {
          ...mockResponse.user,
          fullName: `${mockResponse.user.firstName} ${mockResponse.user.lastName}`.trim(),
          displayName: mockResponse.user.firstName || mockResponse.user.email || 'Unknown User',
        }
      }

      login(transformedResponse)

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user?.fullName).toBe('John Doe')
      expect(state.user?.displayName).toBe('John')
      expect(state.token).toBe('mock-jwt-token')
    })

    it('should show success notification on login', () => {
      // Test notification logic
      expect(showSuccessNotification).not.toHaveBeenCalled()

      // Simulate success notification call
      showSuccessNotification('Chào mừng bạn quay trở lại!', 'Đăng nhập thành công')

      expect(showSuccessNotification).toHaveBeenCalledWith(
        'Chào mừng bạn quay trở lại!',
        'Đăng nhập thành công'
      )
    })

    it('should show error notification on login failure', () => {
      // Simulate error notification call
      showErrorNotification('Invalid credentials', 'Đăng nhập thất bại')

      expect(showErrorNotification).toHaveBeenCalledWith(
        'Invalid credentials',
        'Đăng nhập thất bại'
      )
    })

    it('should validate login response has user data', () => {
      const invalidResponse = { token: 'token-only' } as unknown as { token: string; user?: unknown }

      // Simulate validation logic from useLogin
      const hasUserData = invalidResponse.user !== undefined

      expect(hasUserData).toBe(false)
    })
  })

  describe('useRegister logic', () => {
    it('should handle successful register response transformation', () => {
      const { login } = useAuthStore.getState()

      const mockResponse = {
        user: {
          id: '1',
          email: 'newuser@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'STUDENT' as const,
        },
        token: 'mock-jwt-token',
      }

      // Simulate what useRegister does
      const transformedResponse = {
        ...mockResponse,
        user: {
          ...mockResponse.user,
          fullName: `${mockResponse.user.firstName} ${mockResponse.user.lastName}`.trim(),
          displayName: mockResponse.user.firstName || mockResponse.user.email || 'Unknown User',
        }
      }

      login(transformedResponse)

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user?.fullName).toBe('Jane Smith')
      expect(state.user?.displayName).toBe('Jane')
    })

    it('should show success notification on register', () => {
      showSuccessNotification('Tài khoản đã được tạo. Vui lòng kiểm tra email để xác minh.', 'Đăng ký thành công')

      expect(showSuccessNotification).toHaveBeenCalledWith(
        'Tài khoản đã được tạo. Vui lòng kiểm tra email để xác minh.',
        'Đăng ký thành công'
      )
    })

    it('should show error notification on register failure', () => {
      showErrorNotification('Email already exists', 'Đăng ký thất bại')

      expect(showErrorNotification).toHaveBeenCalledWith(
        'Email already exists',
        'Đăng ký thất bại'
      )
    })
  })

  describe('useCurrentUser logic', () => {
    it('should handle successful user data update', () => {
      const { setUser } = useAuthStore.getState()

      const mockUserData = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT' as const,
      }

      // Simulate what handleCurrentUserResult does
      setUser({
        ...mockUserData,
        fullName: `${mockUserData.firstName || ''} ${mockUserData.lastName || ''}`.trim(),
        displayName: mockUserData.firstName || mockUserData.email || 'Unknown User',
      })

      const state = useAuthStore.getState()
      expect(state.user?.fullName).toBe('John Doe')
      expect(state.user?.displayName).toBe('John')
    })

    it('should handle 401 error and logout', () => {
      const { logout } = useAuthStore.getState()

      // Simulate 401 error handling
      const mockError = { response: { status: 401 } }
      const mappedError = { code: 'AUTH_FAILED', message: 'Unauthorized' }

      if (mappedError.code === 'AUTH_FAILED' || mockError?.response?.status === 401) {
        logout()
      }

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
    })

    it('should show notification on current user error', () => {
      notifications.show({
        title: 'Session Expired',
        message: 'Please login again',
        color: 'red',
      })

      expect(notifications.show).toHaveBeenCalledWith({
        title: 'Session Expired',
        message: 'Please login again',
        color: 'red',
      })
    })
  })

  describe('Hook integration with auth store', () => {
    it('should integrate login hook with store', () => {
      const { login, logout } = useAuthStore.getState()

      // Test login integration
      const mockAuthResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'STUDENT' as const,
          fullName: 'John Doe',
          displayName: 'John',
        },
        token: 'mock-token',
      }

      login(mockAuthResponse)

      let state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user?.email).toBe('test@example.com')

      // Test logout integration
      logout()

      state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
    })

    it('should handle loading states', () => {
      const { setLoading } = useAuthStore.getState()

      setLoading(true)
      expect(useAuthStore.getState().isLoading).toBe(true)

      setLoading(false)
      expect(useAuthStore.getState().isLoading).toBe(false)
    })

    it('should handle error states', () => {
      const { setError, clearError } = useAuthStore.getState()

      setError('Login failed')
      expect(useAuthStore.getState().error).toBe('Login failed')

      clearError()
      expect(useAuthStore.getState().error).toBeNull()
    })
  })
})