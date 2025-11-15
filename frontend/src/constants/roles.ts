/**
 * Cấu hình roles và permissions cho hệ thống APSAS
 * Đồng bộ với backend API (IdentityService)
 */

import type { UserRole, UserPermissions, RoleRedirects, DashboardRoutes } from '@/types/auth.types';

// ============================================================================
// ROLE CONSTANTS
// ============================================================================

/** Các role chính trong hệ thống - match với backend */
export const USER_ROLES = {
  STUDENT: 'STUDENT' as const,
  INSTRUCTOR: 'INSTRUCTOR' as const,
  CONTENT_PROVIDER: 'CONTENT_PROVIDER' as const,
  ADMIN: 'ADMIN' as const,
} as const;

/** Label hiển thị cho UI */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.STUDENT]: 'Sinh viên',
  [USER_ROLES.INSTRUCTOR]: 'Giảng viên',
  [USER_ROLES.CONTENT_PROVIDER]: 'Nhà cung cấp nội dung',
  [USER_ROLES.ADMIN]: 'Quản trị viên',
} as const;

/** Mô tả chi tiết từng role */
export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [USER_ROLES.STUDENT]: 'Người học có thể xem và nộp bài tập',
  [USER_ROLES.INSTRUCTOR]: 'Giảng viên có thể tạo và chấm bài tập',
  [USER_ROLES.CONTENT_PROVIDER]: 'Nhà cung cấp nội dung có thể quản lý bài tập và tài liệu',
  [USER_ROLES.ADMIN]: 'Quản trị viên có toàn quyền quản lý hệ thống',
} as const;

// ============================================================================
// PERMISSION MAPPINGS
// ============================================================================

/**
 * Quyền hạn của từng role
 */
export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  [USER_ROLES.STUDENT]: {
    canViewAssignments: true,
    canCreateAssignments: false,
    canEditAssignments: false,
    canDeleteAssignments: false,
    canViewSubmissions: true, // only own submissions
    canGradeSubmissions: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canAccessAdminPanel: false,
  },
  [USER_ROLES.INSTRUCTOR]: {
    canViewAssignments: true,
    canCreateAssignments: true,
    canEditAssignments: true, // only own assignments
    canDeleteAssignments: false,
    canViewSubmissions: true, // for assigned assignments
    canGradeSubmissions: true, // for assigned assignments
    canManageUsers: false,
    canViewAnalytics: true, // limited analytics
    canAccessAdminPanel: false,
  },
  [USER_ROLES.CONTENT_PROVIDER]: {
    canViewAssignments: true,
    canCreateAssignments: true,
    canEditAssignments: true, // own assignments
    canDeleteAssignments: true, // own assignments
    canViewSubmissions: true, // for own assignments
    canGradeSubmissions: false,
    canManageUsers: false,
    canViewAnalytics: true, // content analytics
    canAccessAdminPanel: false,
  },
  [USER_ROLES.ADMIN]: {
    canViewAssignments: true,
    canCreateAssignments: true,
    canEditAssignments: true, // all assignments
    canDeleteAssignments: true, // all assignments
    canViewSubmissions: true, // all submissions
    canGradeSubmissions: true, // all submissions
    canManageUsers: true,
    canViewAnalytics: true, // full analytics
    canAccessAdminPanel: true,
  },
};

// ============================================================================
// ROUTE REDIRECT MAPPINGS
// ============================================================================

/**
 * Route mặc định sau khi login theo role
 * Note: ADMIN không có route vì admin portal là server-side (MVC)
 */
export const ROLE_REDIRECTS: RoleRedirects = {
  [USER_ROLES.STUDENT]: '/student/dashboard',
  [USER_ROLES.INSTRUCTOR]: '/instructor/dashboard',
  [USER_ROLES.CONTENT_PROVIDER]: '/provider/dashboard',
  [USER_ROLES.ADMIN]: '/login', // Admin portal is server-side, redirect to login
};

/**
 * Route dashboard của từng role
 * Note: ADMIN không có dashboard route vì portal là server-side
 */
export const DASHBOARD_ROUTES: DashboardRoutes = {
  [USER_ROLES.STUDENT]: '/student/dashboard',
  [USER_ROLES.INSTRUCTOR]: '/instructor/dashboard',
  [USER_ROLES.CONTENT_PROVIDER]: '/provider/dashboard',
  [USER_ROLES.ADMIN]: '/login', // Admin uses separate server-side portal
};

/**
 * Routes công khai không cần auth
 */
export const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/',
] as const;

/**
 * Routes auth sẽ redirect về dashboard nếu đã login
 */
export const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
] as const;

// ============================================================================
// ROLE HIERARCHY & UTILITIES
// ============================================================================

/**
 * Cấp độ hierarchy (số cao = quyền nhiều hơn)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [USER_ROLES.STUDENT]: 1,
  [USER_ROLES.INSTRUCTOR]: 2,
  [USER_ROLES.CONTENT_PROVIDER]: 3,
  [USER_ROLES.ADMIN]: 4,
};

/**
 * Kiểm tra role có đủ quyền (hierarchy cao hơn hoặc bằng)
 */
export const hasRoleLevel = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

/**
 * Kiểm tra user có quyền cụ thể
 */
export const hasPermission = (userRole: UserRole, permission: keyof UserPermissions): boolean => {
  return ROLE_PERMISSIONS[userRole][permission];
};

/**
 * Kiểm tra user có thể truy cập route theo required roles
 */
export const canAccessRoute = (userRole: UserRole, requiredRoles?: UserRole[]): boolean => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No role requirements
  }
  return requiredRoles.includes(userRole);
};

/**
 * Lấy permissions của role
 */
export const getUserPermissions = (role: UserRole): UserPermissions => {
  return ROLE_PERMISSIONS[role];
};

/**
 * Lấy label hiển thị của role
 */
export const getRoleLabel = (role: UserRole): string => {
  return USER_ROLE_LABELS[role];
};

/**
 * Lấy mô tả của role
 */
export const getRoleDescription = (role: UserRole): string => {
  return USER_ROLE_DESCRIPTIONS[role];
};

/**
 * Lấy route redirect mặc định của role
 */
export const getRoleRedirect = (role: UserRole): string => {
  return ROLE_REDIRECTS[role];
};

/**
 * Lấy route dashboard của role
 */
export const getDashboardRoute = (role: UserRole): string => {
  return DASHBOARD_ROUTES[role];
};

// ============================================================================
// ROLE-BASED UI CONFIGURATIONS
// ============================================================================

/**
 * Cấu hình menu navigation theo role
 */
export const ROLE_NAVIGATION = {
  [USER_ROLES.STUDENT]: [
    { label: 'Dashboard', path: '/student/dashboard', icon: 'home' },
    { label: 'Bài tập', path: '/student/assignments', icon: 'assignment' },
    { label: 'Bài nộp', path: '/student/submissions', icon: 'submit' },
    { label: 'Hỗ trợ', path: '/student/support', icon: 'help' },
  ],
  [USER_ROLES.INSTRUCTOR]: [
    { label: 'Dashboard', path: '/instructor/dashboard', icon: 'home' },
    { label: 'Bài tập', path: '/instructor/assignments', icon: 'assignment' },
    { label: 'Chấm bài', path: '/instructor/grading', icon: 'grade' },
    { label: 'Thống kê', path: '/instructor/analytics', icon: 'analytics' },
    { label: 'Hỗ trợ', path: '/instructor/support', icon: 'help' },
  ],
  [USER_ROLES.CONTENT_PROVIDER]: [
    { label: 'Dashboard', path: '/provider/dashboard', icon: 'home' },
    { label: 'Bài tập', path: '/provider/assignments', icon: 'assignment' },
    { label: 'Kỹ năng', path: '/provider/skills', icon: 'skill' },
    { label: 'Hướng dẫn', path: '/provider/tutorials', icon: 'tutorial' },
    { label: 'Thống kê', path: '/provider/analytics', icon: 'analytics' },
  ],
  // Admin navigation removed - admin portal is server-side (MVC)
  // Admin users should access separate admin portal URL
  [USER_ROLES.ADMIN]: [],
} as const;

/**
 * Màu theme theo role
 */
export const ROLE_COLORS = {
  [USER_ROLES.STUDENT]: {
    primary: '#3b82f6', // blue-500
    secondary: '#dbeafe', // blue-100
  },
  [USER_ROLES.INSTRUCTOR]: {
    primary: '#10b981', // emerald-500
    secondary: '#d1fae5', // emerald-100
  },
  [USER_ROLES.CONTENT_PROVIDER]: {
    primary: '#f59e0b', // amber-500
    secondary: '#fef3c7', // amber-100
  },
  [USER_ROLES.ADMIN]: {
    primary: '#ef4444', // red-500
    secondary: '#fee2e2', // red-100
  },
} as const;