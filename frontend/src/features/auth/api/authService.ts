import {
  identityServiceLoginMutation,
  identityServiceRegisterMutation,
  identityServiceRequestPasswordResetMutation,
  identityServiceResetPasswordMutation,
  identityServiceVerifyEmailMutation,
  identityServiceGetCurrentUserOptions,
  identityServiceChangePasswordMutation,
} from '@/api/@tanstack/react-query.gen'

import type {
  IdentityServiceLoginRequest,
  IdentityServiceRegisterRequest,
  IdentityServiceEmailRequest,
  IdentityServiceResetPasswordRequest,
  IdentityServiceTokenRequest,
  IdentityServiceChangePasswordRequest,
} from '@/api/types.gen'

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

  // Change password - sử dụng generated mutation
  changePassword: identityServiceChangePasswordMutation(),

  // Get current user - sử dụng generated query options
  getCurrentUser: identityServiceGetCurrentUserOptions(),
}

// Type exports cho convenience
export type {
  IdentityServiceLoginRequest as LoginRequest,
  IdentityServiceRegisterRequest as RegisterRequest,
  IdentityServiceEmailRequest as EmailRequest,
  IdentityServiceResetPasswordRequest as ResetPasswordRequest,
  IdentityServiceTokenRequest as TokenRequest,
  IdentityServiceChangePasswordRequest as ChangePasswordRequest,
}