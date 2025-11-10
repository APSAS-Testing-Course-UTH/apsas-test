import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { Loader, Center } from '@mantine/core'
import { useAuthStore, initializeAuth } from '../stores/useAuthStore'
import type { IdentityServiceUserResponse } from '@/api/types.gen'
import type { AuthResponse } from '@/types/auth.types'

/**
 * Auth Context Type
 * Provides authentication state to router and app
 */
export interface AuthContextType {
  isAuthenticated: boolean
  user: IdentityServiceUserResponse | null
  isLoading: boolean
  login: (authResponse: AuthResponse) => void
  logout: () => void
}

/**
 * Create Auth Context
 * Used to provide auth state to Router and components
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * AuthProvider Component
 * 
 * Manages authentication state initialization and hydration from localStorage
 * Must wrap the entire app before RouterProvider
 * 
 * Usage:
 * ```tsx
 * <AuthProvider>
 *   <RouterProvider router={router} context={{ auth, queryClient }} />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Get store state
  const {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
  } = useAuthStore()

  /**
   * Initialize auth state from localStorage on mount
   * This ensures state is hydrated before Router evaluates beforeLoad hooks
   */
  useEffect(() => {
    try {
      // DEFENSIVE: Check if already initialized by main.tsx
      const { user: existingUser, token: existingToken } = useAuthStore.getState()
      
      if (existingUser || existingToken) {
        // Auth already initialized in main.tsx, just mark as hydrated
        setIsHydrated(true)
        return
      }
      
      // Otherwise initialize now (fallback for edge cases)
      // Initialize auth from localStorage
      // initializeAuth is synchronous and doesn't need await
      initializeAuth()
    } catch (error) {
      console.error('[AuthProvider] Failed to initialize auth:', error)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  /**
   * Loading state while auth is being initialized
   * This prevents beforeLoad hooks from running before state is ready
   */
  if (!isHydrated) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" />
      </Center>
    )
  }

  /**
   * Provide auth context to all children
   * This context is passed to Router via createRootRouteWithContext
   */
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth Hook
 * Access auth context from anywhere in the app
 * 
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Get Auth Context Snapshot
 * For use in beforeLoad hooks where hooks cannot be called
 * 
 * @returns Current auth context value or null if not hydrated
 */
export function getAuthContextValue(): AuthContextType | null {
  // Get store state directly for beforeLoad (cannot use hooks there)
  const { isAuthenticated, user, isLoading, login, logout } = useAuthStore.getState()
  
  if (isAuthenticated === undefined) return null
  
  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
  }
}
