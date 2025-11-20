/**
 * useSupportSession Hook - Support Session Manager
 *
 * Manages WebSocket messaging for a specific support session
 * Handles subscriptions, sending messages, and message state
 */

import { useCallback, useEffect, useRef, useState } from "react"
import type { IMessage, StompSubscription } from "@stomp/stompjs"
import { supportServiceSendMessage } from "@/api/sdk.gen"
import type { SupportServiceSupportMessageResponse, SupportServiceSupportSessionResponse } from "@/api/types.gen"

interface WebSocketMessage<T> {
  type: "NEW_MESSAGE" | "NEW_SESSION" | "SESSION_JOINED" | "SESSION_CLOSED" | "GET_SESSION"
  data: T
}

interface UseSupportSessionOptions {
  sessionId: string | undefined
  isConnected: boolean
  subscribe: (destination: string, callback: (message: IMessage) => void) => StompSubscription | null
  send: (destination: string, body: Record<string, unknown>) => void
}

interface UseSupportSessionReturn {
  messages: SupportServiceSupportMessageResponse[]
  sendMessage: (content: string) => Promise<void>
  isSending: boolean
  error: Error | null
}

export function useSupportSession(options: UseSupportSessionOptions): UseSupportSessionReturn {
  const { sessionId, isConnected, subscribe, send } = options

  const [messages, setMessages] = useState<SupportServiceSupportMessageResponse[]>([])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const subscriptionRef = useRef<StompSubscription | null>(null)
  const messageIdsRef = useRef<Set<string>>(new Set())

  // Subscribe to session messages
  useEffect(() => {
    if (!sessionId || !isConnected) {
      return
    }

    const destination = `/topic/support/${sessionId}`
    console.log("[SupportSession] Subscribing to:", destination)

    subscriptionRef.current = subscribe(destination, (message: IMessage) => {
      try {
        const wsMessage = JSON.parse(message.body) as WebSocketMessage<
          SupportServiceSupportMessageResponse | SupportServiceSupportSessionResponse
        >

        console.log("[SupportSession] Received WebSocket message:", wsMessage)

        if (wsMessage.type === "NEW_MESSAGE") {
          const newMessage = wsMessage.data as SupportServiceSupportMessageResponse

          // Deduplicate by message ID
          if (newMessage.id && messageIdsRef.current.has(newMessage.id)) {
            console.log("[SupportSession] Duplicate message, skipping:", newMessage.id)
            return
          }

          if (newMessage.id) {
            messageIdsRef.current.add(newMessage.id)
          }

          console.log("[SupportSession] Adding new message:", newMessage)
          setMessages((prev) => [...prev, newMessage])
        }
      } catch (err) {
        console.error("[SupportSession] Failed to parse message:", err)
      }
    })

    return () => {
      if (subscriptionRef.current) {
        console.log("[SupportSession] Unsubscribing from:", destination)
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [sessionId, isConnected, subscribe])

  // Send message function
  const sendMessageFn = useCallback(
    async (content: string) => {
      if (!sessionId) {
        throw new Error("No session ID")
      }

      if (!content.trim()) {
        throw new Error("Message cannot be empty")
      }

      setIsSending(true)
      setError(null)

      try {
        if (isConnected) {
          // Send via WebSocket
          console.log("[SupportSession] Sending via WebSocket")
          const destination = `/app/support/sessions/${sessionId}/messages/send`
          send(destination, { content: content.trim() })
        } else {
          // Fallback to REST API
          console.log("[SupportSession] Sending via REST API")
          const response = await supportServiceSendMessage({
            path: { sessionId },
            body: { content: content.trim() },
          })

          if (response.data?.messages) {
            const latestMessage = response.data.messages[response.data.messages.length - 1]
            if (latestMessage && latestMessage.id && !messageIdsRef.current.has(latestMessage.id)) {
              messageIdsRef.current.add(latestMessage.id)
              setMessages((prev) => [...prev, latestMessage])
            }
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to send message")
        console.error("[SupportSession] Send failed:", error)
        setError(error)
        throw error
      } finally {
        setIsSending(false)
      }
    },
    [sessionId, isConnected, send],
  )

  // Reset messages when session changes
  useEffect(() => {
    setMessages([])
    messageIdsRef.current.clear()
  }, [sessionId])

  return {
    messages,
    sendMessage: sendMessageFn,
    isSending,
    error,
  }
}
