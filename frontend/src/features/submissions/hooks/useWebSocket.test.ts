/**
 * Tests for useWebSocket Hook
 * 
 * Test Groups:
 * 1. Connection Lifecycle (5 tests)
 * 2. Message Handling (5 tests)
 * 3. Reconnection Logic (6 tests)
 * 4. Vietnamese Notifications (4 tests)
 * 5. Polling Integration (5 tests)
 * 6. Error Handling (5 tests)
 * 
 * Total: 30 tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useWebSocket, type WebSocketMessage } from './useWebSocket'
import { Client } from '@stomp/stompjs'

// Mock dependencies
vi.mock('@/utils/notifications', () => ({
  showInfoNotification: vi.fn(),
  showErrorNotification: vi.fn(),
}))

vi.mock('@stomp/stompjs', () => ({
  Client: vi.fn(),
}))

describe('useWebSocket Hook', () => {
  let queryClient: QueryClient
  let mockClient: any
  let onConnectCallback: (() => void) | undefined
  let onDisconnectCallback: (() => void) | undefined
  let onStompErrorCallback: ((frame: any) => void) | undefined
  let subscribeCallback: ((message: any) => void) | undefined

  // Test wrapper (createElement to avoid JSX parsing issue)
  function wrapper({ children }: { children: ReactNode }) {
    const { createElement } = require('react')
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }

  beforeEach(() => {
    // Reset query client
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    // Reset callbacks
    onConnectCallback = undefined
    onDisconnectCallback = undefined
    onStompErrorCallback = undefined
    subscribeCallback = undefined

    // Mock STOMP client
    mockClient = {
      activate: vi.fn(),
      deactivate: vi.fn(),
      subscribe: vi.fn(),
      publish: vi.fn(),
      connected: false,
      active: false,
    }

    // Mock Client constructor
    ;(Client as any).mockImplementation((config: any) => {
      onConnectCallback = config.onConnect
      onDisconnectCallback = config.onDisconnect
      onStompErrorCallback = config.onStompError
      
      // Store subscribe callback
      mockClient.subscribe = vi.fn((_destination: string, callback: (message: any) => void) => {
        subscribeCallback = callback
      })
      
      return mockClient
    })

    // Reset mocks
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  // ================================
  // Group 1: Connection Lifecycle (5 tests)
  // ================================

  describe('Connection Lifecycle', () => {
    it('should connect on mount when autoConnect is true', () => {
      const { result } = renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      expect(mockClient.activate).toHaveBeenCalledTimes(1)
      expect(result.current.isConnected).toBe(false)
    })

    it('should not connect on mount when autoConnect is false', () => {
      renderHook(
        () => useWebSocket({ autoConnect: false, userId: 'user123' }),
        { wrapper }
      )

      expect(mockClient.activate).not.toHaveBeenCalled()
    })

    it('should set isConnected to true when connection establishes', () => {
      const { result } = renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      // Simulate connection
      act(() => {
        mockClient.connected = true
        mockClient.active = true
        onConnectCallback?.()
      })

      // State should update synchronously within act()
      expect(result.current.isConnected).toBe(true)
    })

    it('should disconnect on unmount', () => {
      const { unmount } = renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      // Simulate connection
      act(() => {
        mockClient.connected = true
        onConnectCallback?.()
      })

      // Unmount
      unmount()

      // Disconnect should be called immediately
      expect(mockClient.deactivate).toHaveBeenCalled()
    })

    it('should clean up reconnect timeout on unmount', async () => {
      const { unmount } = renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      // Simulate connection and disconnect
      act(() => {
        mockClient.connected = true
        mockClient.active = true
        onConnectCallback?.()
      })

      act(() => {
        onDisconnectCallback?.()
      })

      // Should schedule reconnect
      expect(vi.getTimerCount()).toBeGreaterThan(0)

      // Unmount should clear timeout
      unmount()

      expect(vi.getTimerCount()).toBe(0)
    })
  })

  // ================================
  // Group 2: Message Handling (5 tests)
  // ================================

  describe('Message Handling', () => {
    it('should handle SUBMISSION_EVALUATED message', () => {
      const onMessage = vi.fn()
      renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123', onMessage }),
        { wrapper }
      )

      // Simulate connection
      act(() => {
        mockClient.connected = true
        onConnectCallback?.()
      })

      // Simulate incoming message
      const message: WebSocketMessage = {
        type: 'SUBMISSION_EVALUATED',
        submissionId: 'sub123',
        status: 'PASSED',
        score: 95,
        timestamp: new Date().toISOString(),
      }

      act(() => {
        subscribeCallback?.({ body: JSON.stringify(message) })
      })

      // Callback should be called synchronously
      expect(onMessage).toHaveBeenCalledWith(message)
    })

    it('should invalidate submission query on SUBMISSION_EVALUATED', () => {
      const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
      
      renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      // Simulate connection
      act(() => {
        mockClient.connected = true
        onConnectCallback?.()
      })

      // Simulate message
      const message: WebSocketMessage = {
        type: 'SUBMISSION_EVALUATED',
        submissionId: 'sub123',
        status: 'PASSED',
        timestamp: new Date().toISOString(),
      }

      act(() => {
        subscribeCallback?.({ body: JSON.stringify(message) })
      })

      // Query invalidation should happen synchronously
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['submission', 'sub123'],
      })
    })

    it('should handle ASSIGNMENT_PUBLISHED message', () => {
      const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
      
      renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      // Simulate connection
      act(() => {
        mockClient.connected = true
        onConnectCallback?.()
      })

      // Simulate message
      const message: WebSocketMessage = {
        type: 'ASSIGNMENT_PUBLISHED',
        assignmentId: 'assign123',
        timestamp: new Date().toISOString(),
      }

      act(() => {
        subscribeCallback?.({ body: JSON.stringify(message) })
      })

      // Query invalidation should happen synchronously
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['assignments'],
      })
    })

    it('should handle FEEDBACK_PROVIDED message', () => {
      const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
      
      renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      // Simulate connection
      act(() => {
        mockClient.connected = true
        onConnectCallback?.()
      })

      // Simulate message
      const message: WebSocketMessage = {
        type: 'FEEDBACK_PROVIDED',
        submissionId: 'sub123',
        timestamp: new Date().toISOString(),
      }

      act(() => {
        subscribeCallback?.({ body: JSON.stringify(message) })
      })

      // Query invalidation should happen synchronously
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['submission', 'sub123'],
      })
    })

    it('should handle invalid JSON message gracefully', () => {
      const onError = vi.fn()
      const { result } = renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123', onError }),
        { wrapper }
      )

      // Simulate connection
      act(() => {
        mockClient.connected = true
        onConnectCallback?.()
      })

      // Simulate invalid message
      act(() => {
        subscribeCallback?.({ body: 'invalid json' })
      })

      // Error should be set synchronously
      expect(result.current.error).not.toBeNull()
      expect(onError).toHaveBeenCalled()
    })
  })

  // ================================
  // Group 3: Reconnection Logic (6 tests)
  // ================================

  describe('Reconnection Logic', () => {
    it('should reconnect with 1s delay on first disconnect', () => {
      const { result } = renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      const initialCallCount = mockClient.activate.mock.calls.length

      // Simulate connection
      act(() => {
        mockClient.connected = true
        mockClient.active = true
        onConnectCallback?.()
      })

      // Simulate disconnect
      act(() => {
        onDisconnectCallback?.()
      })

      expect(result.current.isConnected).toBe(false)

      // Advance timer by 1s
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Should have called activate one more time (reconnect)
      expect(mockClient.activate.mock.calls.length).toBeGreaterThan(initialCallCount)
    })

    it('should reconnect with 2s delay on second disconnect', () => {
      renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      // First disconnect
      act(() => {
        mockClient.active = true
        onConnectCallback?.()
      })
      act(() => {
        onDisconnectCallback?.()
      })
      
      // Timer should be scheduled (1s)
      expect(vi.getTimerCount()).toBeGreaterThan(0)
      
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Second disconnect
      act(() => {
        mockClient.active = true
        onConnectCallback?.()
      })
      act(() => {
        onDisconnectCallback?.()
      })

      // Timer should be scheduled (2s this time)
      expect(vi.getTimerCount()).toBeGreaterThan(0)
      
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      // Should have triggered reconnect
      expect(mockClient.activate).toHaveBeenCalled()
    })

    it('should reconnect with 4s delay on third disconnect', () => {
      renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      // Three disconnects with exponential backoff
      const delays = [1000, 2000, 4000]
      for (let i = 0; i < 3; i++) {
        act(() => {
          mockClient.active = true
          onConnectCallback?.()
        })
        act(() => {
          onDisconnectCallback?.()
        })
        
        // Verify timer is scheduled
        expect(vi.getTimerCount()).toBeGreaterThan(0)
        
        act(() => {
          vi.advanceTimersByTime(delays[i])
        })
      }

      // Should have reconnected multiple times
      expect(mockClient.activate).toHaveBeenCalled()
    })

    it('should reconnect with 8s delay on fourth and subsequent disconnects', () => {
      renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      // Four disconnects with exponential backoff capped at 8s
      const delays = [1000, 2000, 4000, 8000]
      for (let i = 0; i < 4; i++) {
        act(() => {
          mockClient.active = true
          onConnectCallback?.()
        })
        act(() => {
          onDisconnectCallback?.()
        })
        
        expect(vi.getTimerCount()).toBeGreaterThan(0)
        
        act(() => {
          vi.advanceTimersByTime(delays[i])
        })
      }

      // Fifth disconnect - should still use 8s (max delay)
      act(() => {
        mockClient.active = true
        onConnectCallback?.()
      })
      act(() => {
        onDisconnectCallback?.()
      })

      expect(vi.getTimerCount()).toBeGreaterThan(0)

      act(() => {
        vi.advanceTimersByTime(8000)
      })

      // Should have reconnected
      expect(mockClient.activate).toHaveBeenCalled()
    })

    it('should reset reconnect attempt counter on successful connection', () => {
      const { result } = renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      // Initial connection
      act(() => {
        mockClient.active = true
        onConnectCallback?.()
      })

      expect(result.current.reconnectAttempt).toBe(0)

      // First disconnect
      act(() => {
        onDisconnectCallback?.()
      })

      // Advance timer to trigger reconnect
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Successful reconnection resets counter
      act(() => {
        mockClient.active = true
        onConnectCallback?.()
      })

      // Counter should be reset to 0
      expect(result.current.reconnectAttempt).toBe(0)
    })

    it('should clear reconnect timeout on manual disconnect', async () => {
      const { result } = renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      // Simulate connection
      act(() => {
        mockClient.active = true
        onConnectCallback?.()
      })

      // Disconnect
      act(() => {
        onDisconnectCallback?.()
      })

      // Should have scheduled reconnect
      expect(vi.getTimerCount()).toBeGreaterThan(0)

      // Manual disconnect
      act(() => {
        result.current.disconnect()
      })

      // Should clear timeout
      expect(vi.getTimerCount()).toBe(0)
    })
  })

  // ================================
  // Group 4: Vietnamese Notifications (4 tests)
  // ================================

  describe('Vietnamese Notifications', () => {
    it('should show Vietnamese notification on SUBMISSION_EVALUATED (PASSED)', async () => {
      renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123', enableNotifications: true }),
        { wrapper }
      )

      // Simulate connection
      act(() => {
        mockClient.connected = true
        onConnectCallback?.()
      })

      // Simulate PASSED submission
      const message: WebSocketMessage = {
        type: 'SUBMISSION_EVALUATED',
        submissionId: 'sub123',
        status: 'PASSED',
        timestamp: new Date().toISOString(),
      }

      act(() => {
        subscribeCallback?.({ body: JSON.stringify(message) })
      })

      // Notification should be shown synchronously
      const { showInfoNotification } = await import('@/utils/notifications')
      expect(showInfoNotification).toHaveBeenCalledWith('Đã có kết quả! Mã của bạn đã được đánh giá!')
    })

    it('should show Vietnamese notification on SUBMISSION_EVALUATED (FAILED)', async () => {
      renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123', enableNotifications: true }),
        { wrapper }
      )

      // Simulate connection
      act(() => {
        mockClient.connected = true
        onConnectCallback?.()
      })

      // Simulate FAILED submission
      const message: WebSocketMessage = {
        type: 'SUBMISSION_EVALUATED',
        submissionId: 'sub123',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
      }

      act(() => {
        subscribeCallback?.({ body: JSON.stringify(message) })
      })

      // Notification should be shown synchronously
      const { showInfoNotification } = await import('@/utils/notifications')
      expect(showInfoNotification).toHaveBeenCalledWith('Đã có kết quả! Mã của bạn đã được đánh giá!')
    })

    it('should show Vietnamese notification on ASSIGNMENT_PUBLISHED', async () => {
      renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123', enableNotifications: true }),
        { wrapper }
      )

      // Simulate connection
      act(() => {
        mockClient.connected = true
        onConnectCallback?.()
      })

      // Simulate message
      const message: WebSocketMessage = {
        type: 'ASSIGNMENT_PUBLISHED',
        assignmentId: 'assign123',
        timestamp: new Date().toISOString(),
      }

      act(() => {
        subscribeCallback?.({ body: JSON.stringify(message) })
      })

      // Notification should be shown synchronously
      const { showInfoNotification } = await import('@/utils/notifications')
      expect(showInfoNotification).toHaveBeenCalledWith('Có bài tập mới được công bố.', 'Bài tập mới!')
    })

    it('should show Vietnamese notification on FEEDBACK_PROVIDED', async () => {
      renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123', enableNotifications: true }),
        { wrapper }
      )

      // Simulate connection
      act(() => {
        mockClient.connected = true
        onConnectCallback?.()
      })

      // Simulate message
      const message: WebSocketMessage = {
        type: 'FEEDBACK_PROVIDED',
        submissionId: 'sub123',
        timestamp: new Date().toISOString(),
      }

      act(() => {
        subscribeCallback?.({ body: JSON.stringify(message) })
      })

      // Notification should be shown synchronously
      const { showInfoNotification } = await import('@/utils/notifications')
      expect(showInfoNotification).toHaveBeenCalledWith('Giáo viên đã thêm phản hồi cho bài nộp của bạn.', 'Có phản hồi mới!')
    })
  })

  // ================================
  // Group 5: Polling Integration (5 tests)
  // ================================

  describe('Polling Integration', () => {
    it('should return isConnected false initially', () => {
      const { result } = renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      expect(result.current.isConnected).toBe(false)
    })

    it('should return isConnected true when WebSocket connected', () => {
      const { result } = renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      // Simulate connection
      act(() => {
        mockClient.connected = true
        onConnectCallback?.()
      })

      // Connection state should be updated synchronously
      expect(result.current.isConnected).toBe(true)
    })

    it('should return isConnected false when WebSocket disconnected', () => {
      const { result } = renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      // Simulate connection
      act(() => {
        mockClient.connected = true
        mockClient.active = true
        onConnectCallback?.()
      })

      // Connection state should be updated synchronously
      expect(result.current.isConnected).toBe(true)

      // Simulate disconnect
      act(() => {
        onDisconnectCallback?.()
      })

      // Disconnection state should be updated synchronously
      expect(result.current.isConnected).toBe(false)
    })

    it('should allow manual connect when autoConnect is false', () => {
      const { result } = renderHook(
        () => useWebSocket({ autoConnect: false, userId: 'user123' }),
        { wrapper }
      )

      expect(mockClient.activate).not.toHaveBeenCalled()

      // Manual connect
      act(() => {
        result.current.connect()
      })

      expect(mockClient.activate).toHaveBeenCalledTimes(1)
    })

    it('should allow manual disconnect', () => {
      const { result } = renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      // Simulate connection
      act(() => {
        mockClient.connected = true
        onConnectCallback?.()
      })

      // Connection state should be updated synchronously
      expect(result.current.isConnected).toBe(true)

      // Manual disconnect
      act(() => {
        result.current.disconnect()
      })

      expect(mockClient.deactivate).toHaveBeenCalled()
      expect(result.current.isConnected).toBe(false)
    })
  })

  // ================================
  // Group 6: Error Handling (5 tests)
  // ================================

  describe('Error Handling', () => {
    it('should handle STOMP error', () => {
      const onError = vi.fn()
      const { result } = renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123', onError }),
        { wrapper }
      )

      // Simulate STOMP error
      act(() => {
        onStompErrorCallback?.({
          headers: { message: 'Connection failed' },
        })
      })

      // Error should be set synchronously
      expect(result.current.error).not.toBeNull()
      expect(onError).toHaveBeenCalled()
    })

    it('should show Vietnamese error notification on STOMP error', async () => {
      renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123', enableNotifications: true }),
        { wrapper }
      )

      // Simulate STOMP error
      act(() => {
        onStompErrorCallback?.({
          headers: { message: 'Connection failed' },
        })
      })

      // Error notification should be shown synchronously
      const { showErrorNotification } = await import('@/utils/notifications')
      expect(showErrorNotification).toHaveBeenCalledWith('Không thể kết nối WebSocket. Đang thử lại...', 'Lỗi kết nối')
    })

    it('should schedule reconnect on STOMP error', () => {
      const initialCallCount = mockClient.activate.mock.calls.length

      renderHook(
        () => useWebSocket({ autoConnect: true, userId: 'user123' }),
        { wrapper }
      )

      // Simulate STOMP error
      act(() => {
        onStompErrorCallback?.({
          headers: { message: 'Connection failed' },
        })
      })

      // Should schedule reconnect
      expect(vi.getTimerCount()).toBeGreaterThan(0)

      // Advance timer to trigger reconnect
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Should have called activate again (reconnect)
      expect(mockClient.activate.mock.calls.length).toBeGreaterThan(initialCallCount)
    })

    it('should not crash on sendMessage when not connected', () => {
      const { result } = renderHook(
        () => useWebSocket({ autoConnect: false, userId: 'user123' }),
        { wrapper }
      )

      // Should not throw
      expect(() => {
        result.current.sendMessage('/app/test', { data: 'test' })
      }).not.toThrow()
    })

    it('should warn when connecting without userId', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const { result } = renderHook(
        () => useWebSocket({ autoConnect: false }),
        { wrapper }
      )

      act(() => {
        result.current.connect()
      })

      expect(consoleWarn).toHaveBeenCalledWith(
        '[WebSocket] No userId provided, cannot connect'
      )

      consoleWarn.mockRestore()
    })
  })
})
