import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Draft data structure stored in localStorage
 */
interface DraftData {
  code: string;
  runtimeId: string | null;
  savedAt: string; // ISO timestamp
}

/**
 * Hook parameters
 */
interface UseFormAutoSaveParams {
  draftKey: string; // localStorage key (e.g., "draft:123")
  code: string; // Current code value
  runtimeId: string | null; // Current runtime ID
  debounceMs?: number; // Debounce delay in ms (default: 1000)
  onSave?: () => void; // Callback after successful save
  onError?: (error: Error) => void; // Callback on error
}

/**
 * Hook return values
 */
interface UseFormAutoSaveReturn {
  lastSavedTime: string | null; // Formatted time (e.g., "10:30 AM")
  isDraft: boolean; // Is current form a recovered draft?
  isSaving: boolean; // Currently saving to localStorage?
  saveDraft: () => Promise<void>; // Manual save trigger
  clearDraft: () => void; // Clear draft from localStorage
  recoverDraft: () => DraftData | null; // Try to recover from localStorage
}

/**
 * Vietnamese UI Labels
 */
const AUTO_SAVE_LABELS = {
  lastSaved: (time: string) => `Lưu gần đây lúc ${time}`,
  clearDraft: 'Xóa bản nháp',
  unsavedChanges: 'Có thay đổi chưa lưu',
  draftRecovered: 'Bản nháp được phục hồi',
  saveFailed: 'Lỗi lưu bản nháp',
  noConnection: 'Lưu bản nháp cục bộ',
};

/**
 * Format ISO timestamp to Vietnamese time string (e.g., "10:30 AM")
 * Uses 24-hour format for clarity
 */
function formatTimeForVietnam(isoString: string): string {
  try {
    const date = new Date(isoString);
    const formatter = new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24-hour format (e.g., 14:30 instead of 2:30 PM)
    });
    return formatter.format(date);
  } catch {
    return '';
  }
}

/**
 * useFormAutoSave - Hook for auto-saving form data to localStorage
 *
 * Provides automatic draft saving with debouncing, draft recovery,
 * and Vietnamese UI support. Useful for preventing data loss in forms.
 *
 * Features:
 * - Debounced auto-save to localStorage
 * - Draft recovery on component mount
 * - Manual save trigger
 * - Clear draft functionality
 * - Error handling for localStorage unavailability
 * - Vietnamese UI labels
 *
 * @example
 * ```tsx
 * const { lastSavedTime, isDraft, clearDraft } = useFormAutoSave({
 *   draftKey: `draft:${assignmentId}`,
 *   code,
 *   runtimeId: selectedRuntimeId,
 *   debounceMs: 1000,
 *   onError: (error) => console.error(error),
 * });
 *
 * return (
 *   <div>
 *     {lastSavedTime && <p>{AUTO_SAVE_LABELS.lastSaved(lastSavedTime)}</p>}
 *     <button onClick={clearDraft}>{AUTO_SAVE_LABELS.clearDraft}</button>
 *   </div>
 * );
 * ```
 */
export function useFormAutoSave({
  draftKey,
  code,
  runtimeId,
  debounceMs = 1000,
  onSave,
  onError,
}: UseFormAutoSaveParams): UseFormAutoSaveReturn {
  // State management
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // References for debounce and cleanup
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Check if localStorage is available
   */
  const isLocalStorageAvailable = useCallback((): boolean => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Recover draft from localStorage
   */
  const recoverDraft = useCallback((): DraftData | null => {
    if (!isLocalStorageAvailable()) {
      return null;
    }

    try {
      const stored = localStorage.getItem(draftKey);
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored) as DraftData;

      // Validate draft structure
      if (!parsed || typeof parsed.code !== 'string' || !parsed.savedAt) {
        return null;
      }

      return parsed;
    } catch (error) {
      onError?.(new Error(`${AUTO_SAVE_LABELS.saveFailed}: ${error instanceof Error ? error.message : 'Invalid data'}`));
      return null;
    }
  }, [draftKey, isLocalStorageAvailable, onError]);

  /**
   * Save draft to localStorage
   */
  const saveDraft = useCallback(async (): Promise<void> => {
    if (!isLocalStorageAvailable()) {
      const error = new Error(AUTO_SAVE_LABELS.noConnection);
      onError?.(error);
      return;
    }

    if (!isMountedRef.current) {
      return;
    }

    try {
      setIsSaving(true);

      const draft: DraftData = {
        code,
        runtimeId,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(draftKey, JSON.stringify(draft));

      if (isMountedRef.current) {
        const formattedTime = formatTimeForVietnam(draft.savedAt);
        setLastSavedTime(formattedTime);
        onSave?.();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : AUTO_SAVE_LABELS.saveFailed;
      onError?.(new Error(errorMessage));
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [code, runtimeId, draftKey, isLocalStorageAvailable, onSave, onError]);

  /**
   * Clear draft from localStorage
   */
  const clearDraft = useCallback((): void => {
    if (!isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(draftKey);
      setLastSavedTime(null);
      setIsDraft(false);
    } catch (error) {
      onError?.(new Error(`Failed to clear draft: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }, [draftKey, isLocalStorageAvailable, onError]);

  /**
   * Effect: Recover draft on mount
   */
  useEffect(() => {
    const draft = recoverDraft();
    if (draft && isMountedRef.current) {
      setIsDraft(true);
      const formattedTime = formatTimeForVietnam(draft.savedAt);
      setLastSavedTime(formattedTime);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []); // Empty deps - only on mount

  /**
   * Effect: Debounced auto-save when code or runtimeId changes
   */
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced save
    debounceTimerRef.current = setTimeout(() => {
      if (isMountedRef.current && (code || runtimeId)) {
        saveDraft();
      }
    }, debounceMs);

    // Cleanup on unmount or effect re-run
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [code, runtimeId, debounceMs, saveDraft]);

  return {
    lastSavedTime,
    isDraft,
    isSaving,
    saveDraft,
    clearDraft,
    recoverDraft,
  };
}

// Export labels for use in components
export { AUTO_SAVE_LABELS };

// Export types for external use
export type { DraftData, UseFormAutoSaveParams, UseFormAutoSaveReturn };
