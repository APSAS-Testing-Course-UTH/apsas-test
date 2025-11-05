/**
 * useStompSession Hook
 * 
 * Manages real-time messaging for a specific support session
 * Handles message subscriptions, sending, and deduplication
 * 
 * Features:
 * - Subscribe to session messages
 * - Send messages
 * - Message deduplication (prevents duplicates on reconnect)
 * - Real-time message updates
 * - Auto-cleanup on unmount
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import type { StompSubscription } from '@stomp/stompjs'
import { useWebSocketConnection } from './useWebSocketConnection'
import { getAuthToken } from '@/configs/axios-config'
import type { SupportMessage } from '../types'

interface UseStompSessionOptions {
  sessionId: string | null | undefined
  onMessageReceived?: (message: SupportMessage) => void
  onError?: (error: Error) => void
}

interface UseStompSessionReturn {
  messages: SupportMessage[]
  isConnected: boolean
  isSending: boolean
  error: Error | null
  sendMessage: (content: string) => Promise<void>
}

export function useStompSession(options: UseStompSessionOptions): UseStompSessionReturn {
  const { sessionId, onMessageReceived, onError } = options

  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Memoize the onError callback to prevent infinite re-renders
  const handleWebSocketError = useCallback((err: Error) => {
    setError(err)
    onError?.(err)
  }, [onError])

  const webSocket = useWebSocketConnection({
    debug: true,
    onError: handleWebSocketError,
  })

  const subscriptionRef = useRef<StompSubscription | null>(null)
  const messageIdsRef = useRef<Set<string>>(new Set())
  const webSocketSubscribeRef = useRef(webSocket.subscribe)

  // Update the ref when webSocket.subscribe changes (shouldn't normally happen since it's memoized)
  useEffect(() => {
    webSocketSubscribeRef.current = webSocket.subscribe
  }, [webSocket.subscribe])

  // Subscribe to session messages
  useEffect(() => {
    if (!sessionId || !webSocket.isConnected) {
      return
    }

    console.log('[StompSession] Subscribing to session:', sessionId)

    const destination = `/topic/support/${sessionId}`

    const subscription = webSocketSubscribeRef.current(destination, (message: SupportMessage) => {
      // Deduplicate messages by ID
      if (message.id && messageIdsRef.current.has(message.id)) {
        console.log('[StompSession] Duplicate message ignored:', message.id)
        return
      }

      if (message.id) {
        messageIdsRef.current.add(message.id)
      }

      console.log('[StompSession] New message received:', message)
      setMessages((prev) => {
        // Check if message already exists
        const exists = prev.some((m) => m.id === message.id)
        if (exists) {
          return prev
        }
        return [...prev, message]
      })

      onMessageReceived?.(message)
    })

    subscriptionRef.current = subscription

    // Cleanup on unmount or sessionId change
    return () => {
      if (subscriptionRef.current) {
        console.log('[StompSession] Unsubscribing from session:', sessionId)
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [sessionId, webSocket.isConnected])

  // Send message with fallback from WebSocket to REST
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!sessionId) {
        throw new Error('Session ID is required to send message')
      }

      if (!content.trim()) {
        throw new Error('Message content cannot be empty')
      }

      setIsSending(true)
      try {
        // Try WebSocket (STOMP) first if connected
        if (webSocket.isConnected) {
          console.log('[StompSession] Attempting to send via WebSocket...')
          const destination = `/app/support/sessions/${sessionId}/message`
          const body = {
            sessionId,
            content: content.trim(),
          }

          console.log('[StompSession] Sending message:', { destination, body })
          webSocket.send(destination, body)
          // Message will be received back through subscription
        } else {
          // Fallback to REST API if WebSocket not connected
          console.log('[StompSession] WebSocket not connected, falling back to REST API...')
          
          // Send via REST endpoint
          const token = getAuthToken()
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          }
          if (token) {
            headers.Authorization = `Bearer ${token}`
          }
          
          const sendResponse = await fetch(
            `http://localhost:8080/api/v1/support/sessions/${sessionId}/messages`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                content: content.trim(),
              }),
            }
          )
          
          if (!sendResponse.ok) {
            throw new Error(`Failed to send message: ${sendResponse.status} ${sendResponse.statusText}`)
          }
          
          const message: SupportMessage = await sendResponse.json()
          console.log('[StompSession] Message sent via REST:', message)
          
          // Add to local messages
          setMessages((prev) => [...prev, message])
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        console.error('[StompSession] Failed to send message:', error)
        setError(error)
        onError?.(error)
        throw error
      } finally {
        setIsSending(false)
      }
    },
    [sessionId, webSocket.isConnected, webSocket.send, onError]
  )

  // Load initial messages (optional - if API provides them)
  useEffect(() => {
    if (!sessionId) {
      setMessages([])
      messageIdsRef.current.clear()
    }
  }, [sessionId])

  return {
    messages,
    isConnected: webSocket.isConnected,
    isSending,
    error: error || webSocket.error,
    sendMessage,
  }
}
