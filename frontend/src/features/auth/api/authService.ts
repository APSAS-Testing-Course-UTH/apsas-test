import {
  identityServiceLoginMutation,
  identityServiceRegisterMutation,
  identityServiceRequestPasswordResetMutation,
  identityServiceResetPasswordMutation,
  identityServiceVerifyEmailMutation,
  identityServiceGetCurrentUserOptions,
  identityServiceChangePasswordMutation,
  identityServiceResendVerificationEmailMutation,
} from '@/api/@tanstack/react-query.gen'

// Note: Type imports removed - generated API functions handle types internally
// import type {
//   IdentityServiceLoginRequest,
//   IdentityServiceRegisterRequest,
//   IdentityServiceEmailRequest,
//   IdentityServiceResetPasswordRequest,
//   IdentityServiceTokenRequest,
//   IdentityServiceChangePasswordRequest,
// } from '@/api/types.gen'

// Auth service - wrapper cho generated API functions
// Sử dụng TanStack Query mutations và queries
export const authService = {
  // Login - sử dụng generated mutation
  login: identityServiceLoginMutation(),

  // Register - sử dụng generated mutation
  register: identityServiceRegisterMutation(),

  // Forgot password - sử dụng generated mutation
  forgotPassword: identityServiceRequestPasswordResetMutation(),

  // Reset password - sử dụng generated mutation
  resetPassword: identityServiceResetPasswordMutation(),

  // Verify email - sử dụng generated mutation
  verifyEmail: identityServiceVerifyEmailMutation(),

  // Resend verification email - sử dụng generated mutation
  resendVerificationEmail: identityServiceResendVerificationEmailMutation(),

  // Change password - sử dụng generated mutation
  changePassword: identityServiceChangePasswordMutation(),

  // Get current user - sử dụng generated query options
  getCurrentUser: identityServiceGetCurrentUserOptions(),
}

/**
 * @deprecated Type aliases removed - use generated types directly from @/api/types.gen
 * Import IdentityService* types instead:
 * - IdentityServiceLoginRequest
 * - IdentityServiceRegisterRequest  
 * - IdentityServiceEmailRequest
 * - IdentityServiceResetPasswordRequest
 * - IdentityServiceTokenRequest
 * - IdentityServiceChangePasswordRequest
 */