/**
 * useWebSocketConnection Hook
 * 
 * Manages WebSocket connection using STOMP protocol
 * Handles connection lifecycle, subscriptions, and messaging
 * 
 * Features:
 * - Auto-connect on mount
 * - Auto-reconnect on disconnect
 * - Subscription management
 * - Error handling
 * - Connection state tracking
 * - HeartBeat support
 * - SockJS fallback
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { Client, type IStompSocket, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

interface UseWebSocketConnectionOptions {
  url?: string
  debug?: boolean
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: Error) => void
}

interface UseWebSocketConnectionReturn {
  isConnected: boolean
  error: Error | null
  subscribe: (destination: string, callback: (message: any) => void) => StompSubscription | null
  send: (destination: string, body: any) => void
  disconnect: () => void
}

export function useWebSocketConnection(
  options: UseWebSocketConnectionOptions = {}
): UseWebSocketConnectionReturn {
  const {
    url = 'http://localhost:8085/ws/support',
    debug = false,
    onConnected,
    onDisconnected,
    onError,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const clientRef = useRef<Client | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 1 // Limit reconnection attempts to 1 (no automatic retry in dev)
  const reconnectDelayMs = 5000 // Increase delay (was 3000)
  
  // Store callbacks in refs to avoid recreating client when callbacks change
  const callbacksRef = useRef({ onConnected, onDisconnected, onError })
  useEffect(() => {
    callbacksRef.current = { onConnected, onDisconnected, onError }
  }, [onConnected, onDisconnected, onError])
  
  // Disable WebSocket in development to prevent infinite loop from SockJS fallback
  // The support service (8085) isn't running in dev, causing continuous retry attempts
  const isWebSocketEnabled = import.meta.env.PROD || import.meta.env.VITE_ENABLE_WEBSOCKET === 'true'

  // Create and configure STOMP client
  const createClient = useCallback(() => {
    const client = new Client({
      brokerURL: url,
      connectHeaders: {
        // Add auth token if available
        'X-Auth-Token': localStorage.getItem('authToken') || '',
      },
      debug: (str) => {
        if (debug) {
          console.log('[WebSocket Debug]', str)
        }
      },
      onConnect: () => {
        console.log('[WebSocket] Connected')
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
        callbacksRef.current.onConnected?.()
      },
      onStompError: (frame) => {
        const errorMessage = `STOMP Error: ${frame.headers['message']}`
        console.error('[WebSocket Error]', errorMessage, frame)
        const err = new Error(errorMessage)
        setError(err)
        callbacksRef.current.onError?.(err)
      },
      onWebSocketError: (event) => {
        const errorMessage = 'WebSocket connection error'
        console.error('[WebSocket Error]', errorMessage, event)
        const err = new Error(errorMessage)
        setError(err)
        callbacksRef.current.onError?.(err)
      },
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected')
        setIsConnected(false)
        callbacksRef.current.onDisconnected?.()
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[WebSocket] Attempting to reconnect...', {
              attempt: reconnectAttemptsRef.current,
              maxAttempts: maxReconnectAttempts,
            })
            if (clientRef.current) {
              clientRef.current.activate()
            }
          }, reconnectDelayMs)
        } else {
          const errorMessage = 'Max reconnection attempts reached'
          console.error('[WebSocket]', errorMessage)
          const err = new Error(errorMessage)
          setError(err)
          callbacksRef.current.onError?.(err)
        }
      },
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      reconnectDelay: 5000,
      forceBinaryWSFrames: true,
      // Use SockJS for fallback support
      webSocketFactory: () => {
        return new (SockJS as any)(url, null, {
          transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
        }) as IStompSocket
      },
    })

    clientRef.current = client
    return client
  }, [url, debug])

  // Connect on mount (only if WebSocket is enabled)
  useEffect(() => {
    // Skip WebSocket connection in development to prevent infinite loop from SockJS fallback
    // The support service (8085) isn't running in dev, causing continuous reconnection attempts
    if (!isWebSocketEnabled) {
      // Log at debug level only - this is expected behavior in development
      console.debug('[WebSocket] WebSocket disabled in development. Using REST fallback with polling.')
      // Don't set error state - REST fallback will handle messaging
      return
    }

    const client = createClient()
    client.activate()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (client && client.connected) {
        client.deactivate()
      }
    }
  }, [createClient, isWebSocketEnabled])

  // Subscribe to destination
  const subscribe = useCallback(
    (destination: string, callback: (message: any) => void): StompSubscription | null => {
      if (!clientRef.current || !clientRef.current.connected) {
        console.warn('[WebSocket] Not connected, cannot subscribe to', destination)
        return null
      }

      console.log('[WebSocket] Subscribing to', destination)
      
      const subscription = clientRef.current.subscribe(destination, (message) => {
        try {
          const body = JSON.parse(message.body)
          console.log('[WebSocket] Message received:', { destination, body })
          callback(body)
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err, message.body)
        }
      })

      return subscription
    },
    []
  )

  // Send message to destination
  const send = useCallback((destination: string, body: any) => {
    if (!clientRef.current || !clientRef.current.connected) {
      console.warn('[WebSocket] Not connected, cannot send to', destination)
      return
    }

    console.log('[WebSocket] Sending message:', { destination, body })
    clientRef.current.publish({
      destination,
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
      },
    })
  }, [])

  // Manual disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.deactivate()
    }
  }, [])

  return {
    isConnected,
    error,
    subscribe,
    send,
    disconnect,
  }
}
