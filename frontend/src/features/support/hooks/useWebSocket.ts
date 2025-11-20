/**
 * useWebSocket Hook - WebSocket Connection Manager
 *
 * Manages WebSocket connection using STOMP over SockJS
 * Matches backend configuration: SockJS + STOMP on /ws/support
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs"
import SockJS from "sockjs-client"

interface WebSocketConfig {
  url: string
  debug?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

interface WebSocketHook {
  isConnected: boolean
  error: Error | null
  subscribe: (destination: string, callback: (message: IMessage) => void) => StompSubscription | null
  send: (destination: string, body: Record<string, unknown>) => void
  disconnect: () => void
}

export function useWebSocket(config: WebSocketConfig): WebSocketHook {
  const { url, debug = false, onConnect, onDisconnect, onError } = config

  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const clientRef = useRef<Client | null>(null)
  const isConnectingRef = useRef(false)
  
  // Store callbacks in refs to avoid recreating client on callback changes
  const callbacksRef = useRef({ onConnect, onDisconnect, onError })
  
  useEffect(() => {
    callbacksRef.current = { onConnect, onDisconnect, onError }
  }, [onConnect, onDisconnect, onError])

  const connect = useCallback(() => {
    if (isConnectingRef.current || clientRef.current?.active) {
      return
    }

    isConnectingRef.current = true

    try {
      const client = new Client({
        // Use SockJS for backend compatibility
        webSocketFactory: () => new SockJS(url) as WebSocket,

        connectHeaders: {
          Authorization: `Bearer ${localStorage.getItem("apsas_token") || ""}`,
        },

        debug: debug ? (str) => console.log("[STOMP]", str) : undefined,

        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        onConnect: () => {
          console.log("[WebSocket] Connected successfully")
          setIsConnected(true)
          setError(null)
          isConnectingRef.current = false
          callbacksRef.current.onConnect?.()
        },

        onStompError: (frame) => {
          const err = new Error(`STOMP error: ${frame.headers["message"] || "Unknown"}`)
          console.error("[WebSocket] STOMP error:", frame)
          setError(err)
          callbacksRef.current.onError?.(err)
        },

        onWebSocketError: (event) => {
          const err = new Error("WebSocket connection error")
          console.error("[WebSocket] Connection error:", event)
          setError(err)
          isConnectingRef.current = false
          callbacksRef.current.onError?.(err)
        },

        onDisconnect: () => {
          console.log("[WebSocket] Disconnected")
          setIsConnected(false)
          isConnectingRef.current = false
          callbacksRef.current.onDisconnect?.()
        },
      })

      clientRef.current = client
      client.activate()
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create WebSocket client")
      console.error("[WebSocket] Setup error:", error)
      setError(error)
      isConnectingRef.current = false
      callbacksRef.current.onError?.(error)
    }
  }, [url, debug])

  const disconnect = useCallback(() => {
    isConnectingRef.current = false
    if (clientRef.current) {
      clientRef.current.deactivate()
      clientRef.current = null
    }
    setIsConnected(false)
  }, [])

  const subscribe = useCallback(
    (destination: string, callback: (message: IMessage) => void): StompSubscription | null => {
      if (!clientRef.current?.connected) {
        console.warn("[WebSocket] Cannot subscribe - not connected")
        return null
      }

      console.log("[WebSocket] Subscribing to:", destination)
      return clientRef.current.subscribe(destination, callback)
    },
    [],
  )

  const send = useCallback((destination: string, body: Record<string, unknown>) => {
    if (!clientRef.current?.connected) {
      console.warn("[WebSocket] Cannot send - not connected")
      return
    }

    console.log("[WebSocket] Sending to:", destination, body)
    clientRef.current.publish({
      destination,
      body: JSON.stringify(body),
    })
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return {
    isConnected,
    error,
    subscribe,
    send,
    disconnect,
  }
}
