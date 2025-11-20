import { z } from 'zod'

// Schema validation cho environment variables
const envSchema = z.object({
  // API Configuration
  VITE_API_BASE_URL: z.url().min(1, 'API_BASE_URL không được rỗng'),
  VITE_API_TIMEOUT: z.string().transform(Number).pipe(z.number().min(1000).max(120000)),

  // App Configuration
  VITE_APP_NAME: z.string().min(1, 'APP_NAME không được rỗng'),
  VITE_APP_VERSION: z.string().min(1, 'APP_VERSION không được rỗng'),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']),

  // Development Tools
  VITE_ENABLE_DEVTOOLS: z.string().transform(val => val === 'true'),

  // MSW (Mock Service Worker) - for API mocking in development
  VITE_ENABLE_MSW: z.string().transform(val => val === 'true'),

  // Feature Flags
  VITE_ENABLE_AUTH: z.string().transform(val => val === 'true'),
  VITE_ENABLE_NOTIFICATIONS: z.string().transform(val => val === 'true'),
  VITE_ENABLE_WEBSOCKET: z.string().transform(val => val === 'true').optional().default(false),

  // Firebase Configuration
  VITE_FIREBASE_VAPID_KEY: z.string().min(1, 'FIREBASE_VAPID_KEY không được rỗng'),

  // WebSocket Configuration (required when VITE_ENABLE_WEBSOCKET=true)
  VITE_WEBSOCKET_URL: z.string().url('WEBSOCKET_URL phải là URL hợp lệ').optional(),

  // Security
  VITE_CSP_ENABLED: z.string().transform(val => val === 'true'),

  // Analytics (optional)
  VITE_GA_TRACKING_ID: z.string().optional(),
})

// Validate và export env variables
export const env = envSchema.parse(import.meta.env)

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>