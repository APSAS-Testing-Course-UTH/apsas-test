/**
 * Firebase Cloud Messaging Service
 * 
 * Handles FCM initialization, token generation, and message handling for APSAS.
 * Supports both foreground (app open) and background (app closed) notifications.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from 'firebase/messaging'
import { firebaseConfig, vapidKey } from '@/configs/firebase-config'
import { showNotification } from '@/utils/notifications'

let firebaseApp: FirebaseApp | null = null
let messaging: Messaging | null = null

/**
 * Initialize Firebase App and Messaging
 * Call this once at app startup
 */
export async function initializeFirebase(): Promise<void> {
  try {
    // Check if FCM is supported in this browser
    const supported = await isSupported()
    if (!supported) {
      console.warn('[Firebase] Firebase Cloud Messaging không được hỗ trợ trong trình duyệt này')
      return
    }

    // Initialize Firebase App (only once)
    if (!firebaseApp) {
      firebaseApp = initializeApp(firebaseConfig)
      console.log('[Firebase] Firebase App initialized successfully')
    }

    // Initialize Messaging (only once)
    if (!messaging) {
      messaging = getMessaging(firebaseApp)
      console.log('[Firebase] Firebase Messaging initialized successfully')
    }
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error)
    throw error
  }
}

/**
 * Request notification permission and get FCM token
 * 
 * This function:
 * 1. Checks browser notification permission
 * 2. Requests permission if not granted
 * 3. Registers Service Worker
 * 4. Gets FCM token from Firebase
 * 
 * @returns FCM token string or null if failed
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    // Initialize Firebase if not already done
    if (!messaging) {
      await initializeFirebase()
    }

    if (!messaging) {
      throw new Error('Firebase Messaging chưa được khởi tạo')
    }

    // Check if VAPID key is configured
    if (!vapidKey) {
      throw new Error(
        'VAPID key không được cấu hình. Vui lòng thêm VITE_FIREBASE_VAPID_KEY vào .env.local'
      )
    }

    // Check browser notification permission
    const permission = Notification.permission
    console.log('[Firebase] Current permission state:', permission)

    if (permission === 'denied') {
      showNotification(
        'Thông báo bị chặn',
        'error',
        'Vui lòng bật quyền thông báo trong cài đặt trình duyệt'
      )
      return null
    }

    // Request permission if not granted
    if (permission === 'default') {
      const newPermission = await Notification.requestPermission()
      console.log('[Firebase] Permission requested, result:', newPermission)

      if (newPermission !== 'granted') {
        showNotification('Quyền thông báo bị từ chối', 'error', 'Không thể nhận thông báo đẩy')
        return null
      }
    }

    // Get Service Worker registration
    const registration = await navigator.serviceWorker.ready
    console.log('[Firebase] Service Worker ready:', registration.active?.scriptURL)

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    })

    if (token) {
      console.log('[Firebase] FCM Token obtained:', token.substring(0, 20) + '...')
      return token
    } else {
      console.warn('[Firebase] No FCM token received')
      return null
    }
  } catch (error) {
    console.error('[Firebase] Error getting FCM token:', error)
    
    // User-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('VAPID')) {
        showNotification('Lỗi cấu hình', 'error', 'VAPID key không được cấu hình đúng')
      } else if (error.message.includes('permission')) {
        showNotification('Quyền thông báo bị từ chối', 'error', 'Vui lòng cấp quyền thông báo')
      } else {
        showNotification('Lỗi', 'error', 'Không thể lấy FCM token: ' + error.message)
      }
    }
    
    return null
  }
}

/**
 * Setup handler for foreground messages (when app is open)
 * 
 * This displays a toast notification when a message is received
 * while the user is viewing the app.
 * 
 * @returns Unsubscribe function to stop listening
 */
export function setupForegroundMessageHandler(): (() => void) | null {
  try {
    if (!messaging) {
      console.warn('[Firebase] Messaging not initialized, cannot setup foreground handler')
      return null
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[Firebase] Foreground message received:', payload)

      // Extract notification data
      const notification = payload.notification
      const data = payload.data

      if (notification) {
        const title = notification.title || 'Thông báo mới'
        const body = notification.body || ''

        // Show toast notification (app is open)
        showNotification(title, 'info', body)

        // Optional: Play sound, show badge, etc.
        if (data?.playSound === 'true') {
          // Play notification sound
          const audio = new Audio('/notification.mp3')
          audio.play().catch((err) => console.warn('Cannot play sound:', err))
        }
      }
    })

    console.log('[Firebase] Foreground message handler setup successfully')
    return unsubscribe
  } catch (error) {
    console.error('[Firebase] Error setting up foreground message handler:', error)
    return null
  }
}

/**
 * Check if FCM is supported in this browser
 */
export async function checkFCMSupport(): Promise<boolean> {
  try {
    const supported = await isSupported()
    return supported
  } catch (error) {
    console.error('[Firebase] Error checking FCM support:', error)
    return false
  }
}

/**
 * Get current notification permission state
 */
export function getNotificationPermission(): NotificationPermission {
  return Notification.permission
}

/**
 * Check if notifications are supported and permission is granted
 */
export function isNotificationEnabled(): boolean {
  return 'Notification' in window && Notification.permission === 'granted'
}

/**
 * Helper to get current FCM token (if already registered)
 * 
 * This is a lightweight version that doesn't request permission,
 * just returns existing token if available.
 */
export async function getCurrentToken(): Promise<string | null> {
  try {
    if (!messaging) {
      await initializeFirebase()
    }

    if (!messaging || !vapidKey) {
      return null
    }

    const registration = await navigator.serviceWorker.ready
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    })

    return token || null
  } catch (error) {
    console.error('[Firebase] Error getting current token:', error)
    return null
  }
}
