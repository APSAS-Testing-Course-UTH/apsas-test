/**
 * Firebase Configuration for APSAS
 * 
 * This file contains Firebase Web App configuration.
 * Config values are loaded from environment variables with fallback to hardcoded values.
 * 
 * VAPID key is required for FCM web push notifications.
 * Get it from: Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBuuGp_re2Djk1C2NSom7XSRHWu62lquxE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'p106-oop-apsas.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'p106-oop-apsas',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'p106-oop-apsas.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '789797755411',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:789797755411:web:1e240003d0f36acb523de6',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-24HDP3DWSC',
} as const

/**
 * VAPID Public Key for FCM Web Push
 * 
 * This is a PUBLIC key - safe to expose in browser.
 * Required for getToken() to authenticate with FCM servers.
 */
export const vapidKey =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  'BN-tBfXeYExFIrrw-EPVAqN58o5dpkHiEK16j5dfkKS9jKr6RLm-Y10890LWW0kyRfc1Aq9qH5A4yjhogF6RSEo'

// Validation: Warn if VAPID key is missing
if (!vapidKey) {
  console.warn(
    '[Firebase Config] VAPID key không được cấu hình. Push notifications sẽ không hoạt động. ' +
      'Vui lòng thêm VITE_FIREBASE_VAPID_KEY vào .env.local'
  )
}
