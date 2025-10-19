import { env } from './env'

// API Endpoints configuration
export const API_ENDPOINTS = {
  // Identity Service
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
  },

  // User Management
  USERS: {
    CURRENT: '/api/v1/users/me',
    PROFILE: '/api/v1/users/profile',
    UPDATE_PROFILE: '/api/v1/users/profile',
  },

  // Content Service (placeholders)
  CONTENT: {
    TUTORIALS: '/api/v1/content/tutorials',
    COURSES: '/api/v1/content/courses',
  },

  // Evaluation Service (placeholders)
  EVALUATION: {
    SUBMISSIONS: '/api/v1/evaluation/submissions',
    RESULTS: '/api/v1/evaluation/results',
  },
} as const

// API Configuration object
export const API_CONFIG = {
  BASE_URL: env.VITE_API_BASE_URL,
  TIMEOUT: env.VITE_API_TIMEOUT,
  VERSION: 'v1',

  // Build full URLs
  getUrl: (endpoint: string): string => {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    return `${env.VITE_API_BASE_URL}/${cleanEndpoint}`
  },

  // Get full URL cho specific service endpoint
  getAuthUrl: (endpoint: keyof typeof API_ENDPOINTS.AUTH): string => {
    return API_CONFIG.getUrl(API_ENDPOINTS.AUTH[endpoint])
  },

  getUserUrl: (endpoint: keyof typeof API_ENDPOINTS.USERS): string => {
    return API_CONFIG.getUrl(API_ENDPOINTS.USERS[endpoint])
  },
} as const

// Environment-specific configurations
export const ENVIRONMENT_CONFIG = {
  isProduction: env.VITE_APP_ENV === 'production',
  isStaging: env.VITE_APP_ENV === 'staging',
  isDevelopment: env.VITE_APP_ENV === 'development',

  // Enable/disable features based on environment
  enableDevTools: env.VITE_ENABLE_DEVTOOLS,
  enableMSW: env.VITE_ENABLE_MSW,
  enableCSP: env.VITE_CSP_ENABLED,

  // Analytics
  gaTrackingId: env.VITE_GA_TRACKING_ID,
} as const