/**
 * Submission Hooks
 * ================
 * Custom React hooks for form auto-save and submission management
 */

import { useCallback, useEffect, useState, useRef } from 'react';

/**
 * Labels for auto-save UI
 */
export const AUTO_SAVE_LABELS = {
  lastSaved: (time: string) => `Lưu gần đây lúc ${time}`,
  clearDraft: 'Xóa bản nháp',
  unsavedChanges: 'Có thay đổi chưa được lưu',
  draftRecovered: 'Bản nháp được khôi phục',
  saveFailed: 'Lưu thất bại',
  noConnection: 'Không có kết nối',
};

/**
 * Auto-save hook for form draft recovery
 * Automatically saves form data to localStorage with debouncing
 * 
 * @param draftKey - Unique key for storing draft in localStorage
 * @param code - Current code content
 * @param runtimeId - Selected runtime/language ID
 * @param debounceMs - Debounce delay in milliseconds (default: 1000)
 * @param onError - Error callback for save failures
 * @returns Auto-save state and methods
 */
export function useFormAutoSave({
  draftKey,
  code,
  runtimeId,
  debounceMs = 1000,
  onError,
}: {
  draftKey: string;
  code: string;
  runtimeId: string | null;
  debounceMs?: number;
  onError?: (error: Error) => void;
}) {
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  
  // Use ref to store onError callback to avoid re-running useEffect on callback changes
  const onErrorRef = useRef(onError);
  
  // Update ref when onError changes
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Check if draft exists on mount
  const recoverDraft = useCallback(() => {
    try {
      const stored = localStorage.getItem(draftKey);
      if (stored) {
        const draft = JSON.parse(stored);
        setIsDraft(true);
        return draft;
      }
    } catch (error) {
      console.error('Failed to recover draft:', error);
      onErrorRef.current?.(error instanceof Error ? error : new Error('Draft recovery failed'));
    }
    return null;
  }, [draftKey]);

  // Save draft with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!code) return;

      try {
        setIsSaving(true);
        const draft = { code, runtimeId, savedAt: new Date().toISOString() };
        localStorage.setItem(draftKey, JSON.stringify(draft));
        
        // Format time for display
        const now = new Date();
        const timeStr = now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLastSavedTime(timeStr);
      } catch (error) {
        console.error('Auto-save failed:', error);
        onErrorRef.current?.(error instanceof Error ? error : new Error('Auto-save failed'));
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [code, runtimeId, draftKey, debounceMs]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
      setIsDraft(false);
      setLastSavedTime(null);
    } catch (error) {
      console.error('Failed to clear draft:', error);
      onErrorRef.current?.(error instanceof Error ? error : new Error('Clear draft failed'));
    }
  }, [draftKey]);

  const saveDraft = useCallback(() => {
    try {
      const draft = { code, runtimeId, savedAt: new Date().toISOString() };
      localStorage.setItem(draftKey, JSON.stringify(draft));
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastSavedTime(timeStr);
    } catch (error) {
      console.error('Save draft failed:', error);
      onErrorRef.current?.(error instanceof Error ? error : new Error('Save draft failed'));
    }
  }, [code, runtimeId, draftKey]);

  return {
    lastSavedTime,
    isDraft,
    isSaving,
    saveDraft,
    clearDraft,
    recoverDraft,
  };
}


/**
 * Submission Status Polling Hook
 * Polls a specific submission for status updates with configurable interval
 * 
 * @param submissionId - ID of submission to poll
 * @param enabled - Whether polling is active
 * @param interval - Poll interval in milliseconds (default: 5000)
 * @param onStatusChange - Callback when status changes
 * @returns Current submission data and polling state
 */
export function useSubmissionPolling({
  submissionId,
  enabled = true,
  interval = 5000,
  onStatusChange,
}: {
  submissionId: string;
  enabled?: boolean;
  interval?: number;
  onStatusChange?: (newStatus: string) => void;
}) {
  const [submission, setSubmission] = useState<any>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!enabled || !submissionId) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    let previousStatus: string | null = submission?.status || null;

    const pollInterval = setInterval(async () => {
      try {
        // Dynamic import to avoid circular dependencies
        const { submissionServiceGetSubmissionById } = await import('@/api/sdk.gen');
        
        const result = await submissionServiceGetSubmissionById({
          path: { id: submissionId },
        });

        if (result.error) {
          console.error('[useSubmissionPolling] Error:', result.error);
          return;
        }
        if (result.data) {
          setSubmission(result.data);

          // Trigger callback if status changed
          if (previousStatus && result.data.status && result.data.status !== previousStatus) {
            previousStatus = result.data.status;
            onStatusChange?.(result.data.status);
          } else if (!previousStatus && result.data.status) {
            previousStatus = result.data.status;
          }
        }
      } catch (error) {
        console.error('[useSubmissionPolling] Polling failed:', error);
      }
    }, interval);

    return () => {
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [enabled, interval, submissionId, onStatusChange]);

  return {
    submission,
    isPolling,
  };
}


/**
 * WebSocket Message Type
 */
export type WebSocketMessage = {
  type: 'SUBMISSION_EVALUATED' | 'SUBMISSION_FAILED' | string;
  submissionId?: string;
  [key: string]: any;
};

/**
 * WebSocket Connection Hook (Stub Implementation)
 * 
 * This is a stub hook for real-time WebSocket updates.
 * Currently returns a mock implementation that always shows as disconnected.
 * In production, this would establish a real WebSocket connection.
 * 
 * For real-time updates, the application currently relies on:
 * 1. useSubmissionPolling hook (5 second polling)
 * 2. Manual refetch on component mount
 * 3. User manual refresh
 * 
 * @param options - WebSocket configuration
 * @param options.userId - Current user ID
 * @param options.autoConnect - Whether to auto-connect (ignored in stub)
 * @param options.enableNotifications - Whether to show notifications (ignored in stub)
 * @param options.onMessage - Callback for incoming messages
 * @returns WebSocket connection state { isConnected }
 */
export function useWebSocket({
  userId: _userId,
  autoConnect: _autoConnect = true,
  enableNotifications: _enableNotifications = true,
  onMessage: _onMessage,
}: {
  userId?: string;
  autoConnect?: boolean;
  enableNotifications?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
} = {}) {
  const [isConnected, setIsConnected] = useState(false);

  // Stub: WebSocket not implemented yet
  // In real implementation, this would:
  // 1. Establish WebSocket connection on mount
  // 2. Listen for messages
  // 3. Call onMessage callback
  // 4. Handle reconnection on disconnect

  return {
    isConnected, // Always false in stub
    send: (_message: WebSocketMessage) => {
      console.warn('[useWebSocket] Send called but WebSocket stub not implemented');
    },
    disconnect: () => {
      setIsConnected(false);
    },
  };
}
