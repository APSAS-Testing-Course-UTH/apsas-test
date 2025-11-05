/**
 * useWebSocket Hook
 * 
 * Custom hook for real-time WebSocket connection using STOMP over WebSocket
 * 
 * Features:
 * - Auto-connect to WebSocket server on mount
 * - Listen for submission status updates via STOMP
 * - Reconnect on disconnect with exponential backoff (1s, 2s, 4s, 8s)
 * - Clean disconnect on unmount
 * - Show Vietnamese toast notifications on status change
 * - Integration with useSubmissionPolling (stop when connected, resume when disconnected)
 * 
 * Architecture:
 * RabbitMQ (Backend) → STOMP Broker → WebSocket → Frontend
 *                                       ↓
 *                            useWebSocket Hook
 *                                       ↓
 *                         React Components (auto-update)
 * 
 * Use Cases:
 * - SubmissionDetail page: Real-time status updates without polling
 * - Reduce server load by replacing polling with push notifications
 * - Instant feedback when evaluation completes
 * 
 * Vietnamese UI: "Mã của bạn đã được đánh giá!" (Your code has been evaluated!)
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { Client, type IMessage } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { showInfoNotification, showErrorNotification } from '@/utils/notifications'

/**
 * WebSocket message types from backend
 */
export type WebSocketMessageType = 
  | 'SUBMISSION_EVALUATED'
  | 'ASSIGNMENT_PUBLISHED'
  | 'FEEDBACK_PROVIDED'

/**
 * WebSocket message structure
 */
export interface WebSocketMessage {
  type: WebSocketMessageType
  submissionId?: string
  assignmentId?: string
  status?: 'PASSED' | 'FAILED' | 'ERROR'
  score?: number
  timestamp: string
  data?: Record<string, unknown>
}

/**
 * Options for useWebSocket hook
 */
export interface UseWebSocketOptions {
  /**
   * WebSocket server URL
   * @default 'ws://localhost:8080/ws'
   */
  url?: string
  
  /**
   * Whether to auto-connect on mount
   * @default true
   */
  autoConnect?: boolean
  
  /**
   * User ID for subscribing to personal queue
   * Format: /user/{userId}/queue/notifications
   */
  userId?: string
  
  /**
   * Whether to enable Vietnamese notifications
   * @default true
   */
  enableNotifications?: boolean
  
  /**
   * Callback triggered when message received
   */
  onMessage?: (message: WebSocketMessage) => void
  
  /**
   * Callback triggered when connection error occurs
   */
  onError?: (error: Error) => void
}

/**
 * Return type for useWebSocket hook
 */
export interface UseWebSocketReturn {
  /**
   * Whether WebSocket is connected
   */
  isConnected: boolean
  
  /**
   * Current connection error
   */
  error: Error | null
  
  /**
   * Manually connect to WebSocket
   */
  connect: () => void
  
  /**
   * Manually disconnect from WebSocket
   */
  disconnect: () => void
  
  /**
   * Send message to WebSocket server
   */
  sendMessage: (destination: string, body: Record<string, unknown>) => void
  
  /**
   * Current reconnection attempt (for debugging)
   */
  reconnectAttempt: number
}

/**
 * Exponential backoff delays for reconnection
 * 1s, 2s, 4s, 8s, then stay at 8s
 */
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000]

/**
 * Custom hook for WebSocket connection with STOMP
 * 
 * @example
 * ```tsx
 * function SubmissionDetail({ submissionId, userId }: Props) {
 *   const { isConnected } = useWebSocket({
 *     userId,
 *     onMessage: (msg) => {
 *       if (msg.type === 'SUBMISSION_EVALUATED') {
 *         // UI updates automatically via query invalidation
 *       }
 *     }
 *   })
 * 
 *   return (
 *     <div>
 *       <Badge color={isConnected ? 'green' : 'gray'}>
 *         {isConnected ? 'Kết nối trực tiếp' : 'Chế độ polling'}
 *       </Badge>
 *     </div>
 *   )
 * }
 * ```
 */
export function useWebSocket({
  url = 'ws://localhost:8080/ws',
  autoConnect = true,
  userId,
  enableNotifications = true,
  onMessage,
  onError,
}: UseWebSocketOptions = {}): UseWebSocketReturn {
  // State
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)
  
  // Refs
  const clientRef = useRef<Client | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // React Query client for cache invalidation
  const queryClient = useQueryClient()
  
  /**
   * Handle incoming WebSocket message
   */
  const handleMessage = useCallback((message: IMessage) => {
    try {
      const data: WebSocketMessage = JSON.parse(message.body)
      
      // Trigger callback
      onMessage?.(data)
      
      // Handle SUBMISSION_EVALUATED event
      if (data.type === 'SUBMISSION_EVALUATED' && data.submissionId) {
        // Invalidate submission query to trigger refetch
        queryClient.invalidateQueries({
          queryKey: ['submission', data.submissionId],
        })
        
        // Show Vietnamese notification
        if (enableNotifications) {
          showInfoNotification('Đã có kết quả! Mã của bạn đã được đánh giá!')
        }
      }
      
      // Handle ASSIGNMENT_PUBLISHED event
      if (data.type === 'ASSIGNMENT_PUBLISHED' && data.assignmentId) {
        // Invalidate assignments query
        queryClient.invalidateQueries({
          queryKey: ['assignments'],
        })
        
        if (enableNotifications) {
          showInfoNotification('Có bài tập mới được công bố.', 'Bài tập mới!')
        }
      }
      
      // Handle FEEDBACK_PROVIDED event
      if (data.type === 'FEEDBACK_PROVIDED' && data.submissionId) {
        // Invalidate submission query
        queryClient.invalidateQueries({
          queryKey: ['submission', data.submissionId],
        })
        
        if (enableNotifications) {
          showInfoNotification('Giáo viên đã thêm phản hồi cho bài nộp của bạn.', 'Có phản hồi mới!')
        }
      }
    } catch (err) {
      console.error('[WebSocket] Error parsing message:', err)
      const error = err instanceof Error ? err : new Error('Failed to parse WebSocket message')
      setError(error)
      onError?.(error)
    }
  }, [onMessage, queryClient, enableNotifications, onError])
  
  /**
   * Reconnect with exponential backoff
   */
  const scheduleReconnect = useCallback(() => {
    // Clear existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    // Calculate delay
    const delayIndex = Math.min(reconnectAttempt, RECONNECT_DELAYS.length - 1)
    const delay = RECONNECT_DELAYS[delayIndex]
    
    console.log(`[WebSocket] Scheduling reconnect in ${delay}ms (attempt ${reconnectAttempt + 1})`)
    
    // Schedule reconnect
    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectAttempt((prev) => prev + 1)
      clientRef.current?.activate()
    }, delay)
  }, [reconnectAttempt])
  
  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (clientRef.current?.active) {
      console.warn('[WebSocket] Already connected')
      return
    }
    
    if (!userId) {
      console.warn('[WebSocket] No userId provided, cannot connect')
      return
    }
    
    try {
      // Create STOMP client
      const client = new Client({
        brokerURL: url,
        
        // Reconnection handled manually with exponential backoff
        reconnectDelay: 0,
        
        // Heartbeat
        heartbeatIncoming: 30000,
        heartbeatOutgoing: 30000,
        
        // Connection callbacks
        onConnect: () => {
          console.log('[WebSocket] Connected')
          setIsConnected(true)
          setError(null)
          setReconnectAttempt(0)
          
          // Clear reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
          }
          
          // Subscribe to personal notification queue
          const destination = `/user/${userId}/queue/notifications`
          client.subscribe(destination, handleMessage)
          console.log(`[WebSocket] Subscribed to ${destination}`)
        },
        
        onDisconnect: () => {
          console.log('[WebSocket] Disconnected')
          setIsConnected(false)
          
          // Schedule reconnect if not manually disconnected
          if (client.active) {
            scheduleReconnect()
          }
        },
        
        onStompError: (frame) => {
          console.error('[WebSocket] STOMP error:', frame.headers['message'])
          const error = new Error(frame.headers['message'] || 'STOMP error')
          setError(error)
          onError?.(error)
          
          // Show Vietnamese error notification
          if (enableNotifications) {
            showErrorNotification('Không thể kết nối WebSocket. Đang thử lại...', 'Lỗi kết nối')
          }
          
          // Schedule reconnect
          scheduleReconnect()
        },
        
        onWebSocketError: (event) => {
          console.error('[WebSocket] WebSocket error:', event)
          const error = new Error('WebSocket connection error')
          setError(error)
          onError?.(error)
        },
      })
      
      // Save client ref
      clientRef.current = client
      
      // Activate connection
      client.activate()
    } catch (err) {
      console.error('[WebSocket] Error creating client:', err)
      const error = err instanceof Error ? err : new Error('Failed to create WebSocket client')
      setError(error)
      onError?.(error)
    }
  }, [url, userId, handleMessage, onError, enableNotifications, scheduleReconnect])
  
  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    if (!clientRef.current) {
      return
    }
    
    console.log('[WebSocket] Disconnecting...')
    
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    // Deactivate client
    clientRef.current.deactivate()
    clientRef.current = null
    
    setIsConnected(false)
    setReconnectAttempt(0)
  }, [])
  
  /**
   * Send message to WebSocket server
   */
  const sendMessage = useCallback((destination: string, body: Record<string, unknown>) => {
    if (!clientRef.current?.connected) {
      console.warn('[WebSocket] Not connected, cannot send message')
      return
    }
    
    try {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      })
    } catch (err) {
      console.error('[WebSocket] Error sending message:', err)
      const error = err instanceof Error ? err : new Error('Failed to send WebSocket message')
      setError(error)
      onError?.(error)
    }
  }, [onError])
  
  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect()
    }
    
    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])
  
  return {
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage,
    reconnectAttempt,
  }
}
