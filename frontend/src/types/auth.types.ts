/**
 * Custom authentication types cho APSAS Frontend
 * Mở rộng các generated types với additional interfaces cho auth system
 *
 * File này chứa:
 * - Extended User interface với computed properties
 * - Authentication state và actions
 * - Form data types cho các auth forms
 * - API response types
 * - Navigation và routing types
 * - Utility types và hook return types
 */

import type {
  IdentityServiceUserResponse,
  IdentityServiceAuthResponse,
} from '@/api/types.gen';
import type { LoginFormData } from '@/features/auth/schemas/loginSchema'
import type { RegisterFormData } from '@/features/auth/schemas/registerSchema'

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * Extended user response with additional computed properties
 */
export interface User extends IdentityServiceUserResponse {
  /** Full name computed from firstName + lastName */
  fullName: string;
  /** Display name for UI */
  displayName: string;
  /** User avatar URL (future enhancement) */
  avatar?: string;
}

/**
 * User role enum - matches backend
 */
export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'CONTENT_PROVIDER' | 'ADMIN';

/**
 * User status enum
 */
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION';

/**
 * User permissions based on role
 */
export interface UserPermissions {
  canViewAssignments: boolean;
  canCreateAssignments: boolean;
  canEditAssignments: boolean;
  canDeleteAssignments: boolean;
  canViewSubmissions: boolean;
  canGradeSubmissions: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canAccessAdminPanel: boolean;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * Authentication response with extended user data
 */
export interface AuthResponse extends IdentityServiceAuthResponse {
  user: User;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  /** Current authenticated user */
  user: User | null;
  /** JWT access token */
  token: string | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is being loaded */
  isLoading: boolean;
  /** Last authentication error */
  error: string | null;
}

/**
 * Authentication actions
 */
export interface AuthActions {
  /** Login user with credentials */
  login: (authResponse: AuthResponse) => void;
  /** Logout current user */
  logout: () => void;
  /** Update current user data */
  setUser: (user: User) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set authentication error */
  setError: (error: string | null) => void;
  /** Clear authentication error */
  clearError: () => void;
}

/**
 * Complete auth store interface
 */
export type AuthStore = AuthState & AuthActions;

// ============================================================================
// FORM DATA TYPES
// ============================================================================

/**
 * @deprecated Form data types moved to schema files
 * Import from:
 * - src/features/auth/schemas/loginSchema.ts (LoginFormData)
 * - src/features/auth/schemas/registerSchema.ts (RegisterFormData)
 * - src/features/auth/schemas/forgotPasswordSchema.ts (ForgotPasswordFormData)
 * - src/features/auth/schemas/resetPasswordSchema.ts (ResetPasswordFormData)
 * - src/features/auth/schemas/verifyEmailSchema.ts (VerifyEmailFormData)
 * 
 * ChangePasswordFormData and UpdateProfileFormData remain here (not schema-based)
 */

/**
 * Change password form data
 */
export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Update profile form data
 */
export interface UpdateProfileFormData {
  firstName: string;
  lastName: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================================================
// NAVIGATION & ROUTING TYPES
// ============================================================================

/**
 * Route protection configuration
 */
export interface RouteProtection {
  /** Required roles to access route */
  requiredRoles?: UserRole[];
  /** Fallback route for unauthorized access */
  fallbackRoute?: string;
  /** Whether route requires authentication */
  requiresAuth: boolean;
}

/**
 * Role-based redirect mapping
 */
export type RoleRedirects = Record<UserRole, string>;

/**
 * Dashboard route mapping
 */
export type DashboardRoutes = Record<UserRole, string>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Loading state enum
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Async operation result
 */
export interface AsyncResult<T, E = Error> {
  data?: T;
  error?: E;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Form field error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: FieldError[];
}

// ============================================================================
// HOOK TYPES
// ============================================================================

/**
 * Auth hook return type
 */
export interface UseAuthReturn extends AuthState, AuthActions {}

/**
 * Login hook return type
 */
export interface UseLoginReturn extends AsyncResult<AuthResponse> {
  login: (data: LoginFormData) => Promise<void>;
}

/**
 * Register hook return type
 */
export interface UseRegisterReturn extends AsyncResult<AuthResponse> {
  register: (data: RegisterFormData) => Promise<void>;
}

/**
 * Current user hook return type
 */
export interface UseCurrentUserReturn extends AsyncResult<User> {
  refetch: () => Promise<void>;
}

/**
 * Logout hook return type
 */
export interface UseLogoutReturn {
  logout: () => void;
  isLoading: boolean;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Protected route component props
 */
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Auth guard component props
 */
export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
}