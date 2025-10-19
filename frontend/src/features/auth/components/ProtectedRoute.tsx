import type { ReactNode } from 'react'
import { Navigate } from '@tanstack/react-router'
import { Loader, Center } from '@mantine/core'

import { useAuthStore } from '../stores/useAuthStore'
import { USER_ROLES, ROLE_REDIRECTS } from '@/constants/roles'

// Props cho ProtectedRoute component
interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: (keyof typeof USER_ROLES)[]
  fallbackPath?: string
}

// Component bảo vệ route với role-based access control
export const ProtectedRoute = ({
  children,
  requiredRoles = [],
  fallbackPath = '/login'
}: ProtectedRouteProps) => {
  // Lấy auth state từ store
  const { user, isAuthenticated, isLoading } = useAuthStore()

  // Hiển thị loading khi đang check auth
  if (isLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" />
      </Center>
    )
  }

  // Redirect nếu chưa đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} replace />
  }

  // Check role permissions nếu có requiredRoles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role as keyof typeof USER_ROLES)

    if (!hasRequiredRole) {
      // Redirect đến unauthorized page hoặc dashboard phù hợp
      const userRoleRedirect = ROLE_REDIRECTS[user.role as keyof typeof ROLE_REDIRECTS] || '/login'
      return <Navigate to={userRoleRedirect} replace />
    }
  }

  // Render children nếu pass tất cả checks
  return <>{children}</>
}