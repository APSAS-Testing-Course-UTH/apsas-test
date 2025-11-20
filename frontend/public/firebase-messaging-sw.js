/**
 * Firebase Cloud Messaging Service Worker
 * 
 * This Service Worker handles background notifications when the app is closed or not in focus.
 * It must be placed in the public/ directory to be accessible from the root domain.
 * 
 * Based on: https://github.com/firebase/quickstart-js/blob/master/messaging/firebase-messaging-sw.js
 */

// Import Firebase scripts from CDN (Compat version for Service Worker)
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js')

// Firebase configuration (static - same as main app)
const firebaseConfig = {
  apiKey: 'AIzaSyBuuGp_re2Djk1C2NSom7XSRHWu62lquxE',
  authDomain: 'p106-oop-apsas.firebaseapp.com',
  projectId: 'p106-oop-apsas',
  storageBucket: 'p106-oop-apsas.firebasestorage.app',
  messagingSenderId: '789797755411',
  appId: '1:789797755411:web:1e240003d0f36acb523de6',
  measurementId: 'G-24HDP3DWSC',
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// Get Firebase Messaging instance
const messaging = firebase.messaging()

/**
 * Handle background messages (when app is closed or not in focus)
 * 
 * This handler receives push notifications from FCM and displays them
 * as system notifications.
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] Background message received:', payload)

  // Extract notification data from payload
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Thông báo mới'
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: payload.notification?.icon || payload.data?.icon || '/logo192.png',
    badge: '/logo192.png',
    tag: payload.data?.tag || 'apsas-notification',
    data: {
      url: payload.data?.url || payload.fcmOptions?.link || '/',
      ...payload.data,
    },
    requireInteraction: false,
    vibrate: [200, 100, 200],
  }

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions)
})

/**
 * Handle notification click
 * 
 * When user clicks on a notification, open the app or focus existing window.
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification.tag)

  // Close the notification
  event.notification.close()

  // Get URL from notification data (or default to homepage)
  const urlToOpen = event.notification.data?.url || '/'

  // Handle the click - open or focus the app
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if there's already an open window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Focus existing window and navigate
            return client.focus().then(() => {
              if ('navigate' in client) {
                return client.navigate(urlToOpen)
              }
              // If navigate not supported, send message to client
              return client.postMessage({
                type: 'NOTIFICATION_CLICK',
                url: urlToOpen,
              })
            })
          }
        }

        // No existing window found - open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

/**
 * Service Worker activation
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Firebase Messaging Service Worker activated')
  event.waitUntil(self.clients.claim())
})

console.log('[Service Worker] Firebase Messaging Service Worker loaded')
