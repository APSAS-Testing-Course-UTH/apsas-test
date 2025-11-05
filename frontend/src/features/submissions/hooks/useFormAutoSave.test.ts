import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormAutoSave, AUTO_SAVE_LABELS } from './useFormAutoSave';

describe('useFormAutoSave Hook', () => {
  const DRAFT_KEY = 'draft:test-assignment-123';
  const DEFAULT_CODE = 'const x = 5;';
  const DEFAULT_RUNTIME_ID = 'python-3.11';

  // ==================== SETUP ====================
  beforeEach(() => {
    // Clear localStorage before each test
    try {
      localStorage.clear();
    } catch {
      // localStorage might not be available during module load
    }
    vi.clearAllMocks();
  });

  afterEach(() => {
    try {
      localStorage.clear();
    } catch {
      // localStorage might not be available during cleanup
    }
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ==================== BASIC FUNCTIONALITY ====================
  describe('Basic Functionality', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: DRAFT_KEY,
          code: '',
          runtimeId: null,
        })
      );

      expect(result.current.lastSavedTime).toBeNull();
      expect(result.current.isDraft).toBe(false);
      expect(result.current.isSaving).toBe(false);
    });

    it('should return all required methods', () => {
      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: DRAFT_KEY,
          code: '',
          runtimeId: null,
        })
      );

      expect(typeof result.current.saveDraft).toBe('function');
      expect(typeof result.current.clearDraft).toBe('function');
      expect(typeof result.current.recoverDraft).toBe('function');
    });

    it('should have isDraft = false when no draft exists', () => {
      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: DRAFT_KEY,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
        })
      );

      expect(result.current.isDraft).toBe(false);
    });

    it('should handle empty code string', () => {
      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: DRAFT_KEY,
          code: '',
          runtimeId: null,
        })
      );

      expect(result.current.lastSavedTime).toBeNull();
      expect(result.current.isDraft).toBe(false);
    });
  });

  // ==================== DEBOUNCE BEHAVIOR ====================
  describe('Debounce Behavior', () => {
    it('should debounce saves on code change', async () => {
      const onSave = vi.fn();
      let renderCount = 0;

      const { rerender } = renderHook(
        ({ code, runtimeId }) =>
          useFormAutoSave({
            draftKey: `${DRAFT_KEY}-${++renderCount}`,
            code,
            runtimeId,
            debounceMs: 100,
            onSave,
          }),
        {
          initialProps: { code: '', runtimeId: DEFAULT_RUNTIME_ID },
        }
      );

      // Update code multiple times
      rerender({ code: 'const x', runtimeId: DEFAULT_RUNTIME_ID });
      rerender({ code: 'const x = ', runtimeId: DEFAULT_RUNTIME_ID });
      rerender({ code: 'const x = 5;', runtimeId: DEFAULT_RUNTIME_ID });

      // Should eventually save after debounce
      await waitFor(
        () => {
          expect(onSave.mock.calls.length).toBeGreaterThan(0);
        },
        { timeout: 2000 }
      );
    });

    it('should save immediately with manual saveDraft call', async () => {
      const onSave = vi.fn();

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: DRAFT_KEY,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
          debounceMs: 5000, // Long debounce
          onSave,
        })
      );

      // Manually call saveDraft
      await act(async () => {
        await result.current.saveDraft();
      });

      expect(onSave).toHaveBeenCalled();
    });

    it('should only save once for multiple rapid changes', async () => {
      const onSave = vi.fn();
      let renderCount = 0;

      const { rerender } = renderHook(
        ({ code }) =>
          useFormAutoSave({
            draftKey: `${DRAFT_KEY}-${++renderCount}`,
            code,
            runtimeId: DEFAULT_RUNTIME_ID,
            debounceMs: 100,
            onSave,
          }),
        {
          initialProps: { code: '' },
        }
      );

      // Make 5 rapid changes
      for (let i = 0; i < 5; i++) {
        rerender({ code: `line ${i}` });
      }

      // Should save only once after debounce
      await waitFor(
        () => {
          expect(onSave.mock.calls.length).toBe(1);
        },
        { timeout: 2000 }
      );
    });

    it('should handle debounce cancel on unmount', async () => {
      vi.useFakeTimers();
      const onSave = vi.fn();

      const { unmount } = renderHook(() =>
        useFormAutoSave({
          draftKey: DRAFT_KEY,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
          debounceMs: 1000,
          onSave,
        })
      );

      // Unmount before debounce completes
      unmount();
      vi.advanceTimersByTime(1500);

      // Should not have saved after unmount
      expect(onSave).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should respect custom debounce delay', async () => {
      const onSave = vi.fn();
      let renderCount = 0;

      const { rerender } = renderHook(
        ({ code }) =>
          useFormAutoSave({
            draftKey: `${DRAFT_KEY}-${++renderCount}`,
            code,
            runtimeId: DEFAULT_RUNTIME_ID,
            debounceMs: 200, // Custom delay
            onSave,
          }),
        {
          initialProps: { code: '' },
        }
      );

      rerender({ code: DEFAULT_CODE });

      // Should eventually save after custom delay
      await waitFor(
        () => {
          expect(onSave).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });
  });

  // ==================== LOCALSTORAGE PERSISTENCE ====================
  describe('localStorage Persistence', () => {
    it('should save draft to localStorage with correct structure', async () => {
      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: DRAFT_KEY,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
        })
      );

      await act(async () => {
        await result.current.saveDraft();
      });

      const stored = localStorage.getItem(DRAFT_KEY);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveProperty('code', DEFAULT_CODE);
      expect(parsed).toHaveProperty('runtimeId', DEFAULT_RUNTIME_ID);
      expect(parsed).toHaveProperty('savedAt');
    });

    it('should include ISO timestamp in saved draft', async () => {
      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: DRAFT_KEY,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
        })
      );

      await act(async () => {
        await result.current.saveDraft();
      });

      const stored = localStorage.getItem(DRAFT_KEY);
      const parsed = JSON.parse(stored!);

      // Should be valid ISO string
      expect(new Date(parsed.savedAt).toISOString()).toBe(parsed.savedAt);
    });

    it('should retrieve draft from localStorage with recoverDraft', async () => {
      // Save a draft
      const draftData = {
        code: 'test code',
        runtimeId: 'python-3.9',
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: DRAFT_KEY,
          code: '',
          runtimeId: null,
        })
      );

      const recovered = result.current.recoverDraft();

      expect(recovered).toEqual(draftData);
    });

    it('should clear draft from localStorage', async () => {
      // Save a draft first
      const { result: saveResult } = renderHook(() =>
        useFormAutoSave({
          draftKey: DRAFT_KEY,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
        })
      );

      await act(async () => {
        await saveResult.current.saveDraft();
      });

      expect(localStorage.getItem(DRAFT_KEY)).toBeTruthy();

      // Now clear it
      const { result: clearResult } = renderHook(() =>
        useFormAutoSave({
          draftKey: DRAFT_KEY,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
        })
      );

      act(() => {
        clearResult.current.clearDraft();
      });

      expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    });

    it('should use correct localStorage key format', async () => {
      const customKey = 'draft:assignment-456';

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: customKey,
          code: 'custom code',
          runtimeId: 'js-18',
        })
      );

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(localStorage.getItem(customKey)).toBeTruthy();
      expect(localStorage.getItem(DRAFT_KEY)).toBeNull(); // Wrong key doesn't exist
    });

    it('should handle empty string code in draft', async () => {
      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: DRAFT_KEY,
          code: '',
          runtimeId: DEFAULT_RUNTIME_ID,
        })
      );

      await act(async () => {
        await result.current.saveDraft();
      });

      const stored = localStorage.getItem(DRAFT_KEY);
      const parsed = JSON.parse(stored!);

      expect(parsed.code).toBe('');
    });
  });

  // ==================== DRAFT RECOVERY ====================
  describe('Draft Recovery', () => {
    it('should recover existing draft on mount', async () => {
      // Pre-populate localStorage
      const draftKey = `${DRAFT_KEY}-recover1`;
      const draftData = {
        code: 'recovered code',
        runtimeId: 'python-3.11',
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey,
          code: '',
          runtimeId: null,
        })
      );

      expect(result.current.isDraft).toBe(true);
      expect(result.current.lastSavedTime).toBeTruthy();
    });

    it('should have isDraft = true when draft exists', async () => {
      const draftKey = `${DRAFT_KEY}-recover2`;
      const draftData = {
        code: 'existing draft',
        runtimeId: 'java-11',
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey,
          code: '',
          runtimeId: null,
        })
      );

      expect(result.current.isDraft).toBe(true);
    });

    it('should have isDraft = false when no draft exists', () => {
      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-recover3`,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
        })
      );

      expect(result.current.isDraft).toBe(false);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      // Store invalid JSON
      const draftKey = `${DRAFT_KEY}-recover4`;
      localStorage.setItem(draftKey, 'invalid json {]');

      const onError = vi.fn();

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey,
          code: '',
          runtimeId: null,
          onError,
        })
      );

      const recovered = result.current.recoverDraft();

      expect(recovered).toBeNull();
      expect(onError).toHaveBeenCalled();
    });

    it('should handle malformed draft object', () => {
      // Missing required fields
      const draftKey = `${DRAFT_KEY}-recover5`;
      const malformedDraft = {
        code: 'missing savedAt',
      };
      localStorage.setItem(draftKey, JSON.stringify(malformedDraft));

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey,
          code: '',
          runtimeId: null,
        })
      );

      const recovered = result.current.recoverDraft();

      expect(recovered).toBeNull();
    });

    it('should return null when draft key does not exist', () => {
      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-recover6`,
          code: '',
          runtimeId: null,
        })
      );

      const recovered = result.current.recoverDraft();

      expect(recovered).toBeNull();
    });
  });

  // ==================== LAST SAVED TIME ====================
  describe('Last Saved Time Formatting', () => {
    it('should update lastSavedTime after save', async () => {
      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-time1`,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
        })
      );

      expect(result.current.lastSavedTime).toBeNull();

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(result.current.lastSavedTime).toBeTruthy();
      expect(typeof result.current.lastSavedTime).toBe('string');
    });

    it('should format time for Vietnamese locale', async () => {
      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-time2`,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
        })
      );

      await act(async () => {
        await result.current.saveDraft();
      });

      // Should be formatted as HH:MM (24-hour format)
      const timeRegex = /^\d{2}:\d{2}$/;
      expect(result.current.lastSavedTime).toMatch(timeRegex);
    });

    it('should maintain null lastSavedTime if no saves', () => {
      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-time3`,
          code: '',
          runtimeId: null,
        })
      );

      expect(result.current.lastSavedTime).toBeNull();
    });

    it('should update lastSavedTime from recovered draft', () => {
      const draftKey = `${DRAFT_KEY}-time4`;
      const now = new Date();
      const draftData = {
        code: 'draft code',
        runtimeId: 'python-3.11',
        savedAt: now.toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey,
          code: '',
          runtimeId: null,
        })
      );

      expect(result.current.lastSavedTime).toBeTruthy();
      expect(typeof result.current.lastSavedTime).toBe('string');
    });
  });

  // ==================== ERROR HANDLING ====================
  describe('Error Handling', () => {
    it('should call onError when localStorage is unavailable', async () => {
      const onError = vi.fn();

      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      let callCount = 0;
      localStorage.setItem = vi.fn(() => {
        callCount++;
        if (callCount > 0) throw new Error('localStorage full');
      });

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-error1`,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
          onError,
        })
      );

      await act(async () => {
        await result.current.saveDraft();
      });

      // Should eventually call onError
      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      }, { timeout: 1000 });

      // Restore
      localStorage.setItem = originalSetItem;
    });

    it('should handle corrupted JSON gracefully', () => {
      const onError = vi.fn();

      localStorage.setItem(`${DRAFT_KEY}-corrupt1`, 'not valid json');

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-corrupt1`,
          code: '',
          runtimeId: null,
          onError,
        })
      );

      const recovered = result.current.recoverDraft();

      expect(recovered).toBeNull();
      // onError should be called when trying to recover
      expect(onError).toHaveBeenCalled();
    });

    it('should continue form function even if auto-save fails', async () => {
      const onError = vi.fn();

      // Mock localStorage to throw
      const originalSetItem = localStorage.setItem;
      let callCount = 0;
      localStorage.setItem = vi.fn(() => {
        callCount++;
        if (callCount > 0) throw new Error('quota exceeded');
      });

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-error2`,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
          onError,
        })
      );

      // Should still work even though save fails
      await act(async () => {
        await result.current.saveDraft();
      });

      expect(result.current).toBeDefined();

      // Should eventually call onError
      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      }, { timeout: 1000 });

      localStorage.setItem = originalSetItem;
    });

    it('should call onError when clearing draft fails', () => {
      const onError = vi.fn();

      // First, set up a draft so we have something to clear
      const draftKey = `${DRAFT_KEY}-error3`;
      localStorage.setItem(draftKey, JSON.stringify({
        code: DEFAULT_CODE,
        runtimeId: DEFAULT_RUNTIME_ID,
        savedAt: new Date().toISOString(),
      }));

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
          onError,
        })
      );

      // Verify draft exists
      expect(localStorage.getItem(draftKey)).toBeTruthy();

      // NOW mock localStorage.removeItem to throw ONLY for the draftKey
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn((key: string) => {
        // Only throw when removing the actual draft key, not the test key
        if (key === draftKey) {
          throw new Error('removeItem failed');
        }
        return originalRemoveItem.call(localStorage, key);
      });

      try {
        act(() => {
          result.current.clearDraft();
        });

        // Should call onError
        expect(onError).toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      } finally {
        localStorage.removeItem = originalRemoveItem;
      }
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle very large code (>100KB)', async () => {
      const largeCode = 'x'.repeat(100000); // 100KB
      vi.useFakeTimers();

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-edge1`,
          code: largeCode,
          runtimeId: DEFAULT_RUNTIME_ID,
        })
      );

      await act(async () => {
        await result.current.saveDraft();
      });

      await act(async () => {
        vi.runAllTimersAsync();
      });

      const stored = localStorage.getItem(`${DRAFT_KEY}-edge1`);
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.code.length).toBe(largeCode.length);

      vi.useRealTimers();
    });

    it('should handle special characters in code', async () => {
      const specialCode = '!@#$%^&*()_+-=[]{}|;:,.<>?`"\'\\n\t';
      vi.useFakeTimers();

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-edge2`,
          code: specialCode,
          runtimeId: DEFAULT_RUNTIME_ID,
        })
      );

      await act(async () => {
        await result.current.saveDraft();
      });

      await act(async () => {
        vi.runAllTimersAsync();
      });

      const stored = localStorage.getItem(`${DRAFT_KEY}-edge2`);
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.code).toBe(specialCode);

      vi.useRealTimers();
    });

    it('should handle runtime ID changes', async () => {
      vi.useFakeTimers();
      
      const { rerender, result } = renderHook(
        ({ code, runtimeId }) =>
          useFormAutoSave({
            draftKey: `${DRAFT_KEY}-edge3`,
            code,
            runtimeId,
            debounceMs: 100,
          }),
        {
          initialProps: { code: DEFAULT_CODE, runtimeId: 'python-3.11' },
        }
      );

      // Change runtime
      rerender({ code: DEFAULT_CODE, runtimeId: 'javascript-18' });

      // Manual save to check
      await act(async () => {
        await result.current.saveDraft();
      });

      await act(async () => {
        vi.runAllTimersAsync();
      });

      const stored = localStorage.getItem(`${DRAFT_KEY}-edge3`);
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.runtimeId).toBe('javascript-18');

      vi.useRealTimers();
    });

    it('should not crash with null runtime ID', async () => {
      vi.useFakeTimers();
      
      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-edge4`,
          code: DEFAULT_CODE,
          runtimeId: null,
        })
      );

      await act(async () => {
        await result.current.saveDraft();
      });

      await act(async () => {
        vi.runAllTimersAsync();
      });

      const stored = localStorage.getItem(`${DRAFT_KEY}-edge4`);
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.runtimeId).toBeNull();

      vi.useRealTimers();
    });

    it('should handle rapid mount/unmount', async () => {
      const { unmount: unmount1 } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-edge5`,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
        })
      );

      unmount1();

      const { unmount: unmount2 } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-edge6`,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
        })
      );

      unmount2();

      // Should not crash or cause memory leaks
      expect(true).toBe(true);
    });

    it('should handle empty string as code after saving', async () => {
      vi.useFakeTimers();
      
      const { rerender, result } = renderHook(
        ({ code }) =>
          useFormAutoSave({
            draftKey: `${DRAFT_KEY}-edge7`,
            code,
            runtimeId: DEFAULT_RUNTIME_ID,
            debounceMs: 100,
          }),
        {
          initialProps: { code: DEFAULT_CODE },
        }
      );

      // Clear code
      rerender({ code: '' });

      // Manual save
      await act(async () => {
        await result.current.saveDraft();
      });

      await act(async () => {
        vi.runAllTimersAsync();
      });

      const stored = localStorage.getItem(`${DRAFT_KEY}-edge7`);
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.code).toBe('');

      vi.useRealTimers();
    });
  });

  // ==================== VIETNAMESE UI LABELS ====================
  describe('Vietnamese UI Labels', () => {
    it('should export Vietnamese UI labels', () => {
      expect(AUTO_SAVE_LABELS).toBeDefined();
      expect(AUTO_SAVE_LABELS.lastSaved).toBeDefined();
      expect(AUTO_SAVE_LABELS.clearDraft).toBeDefined();
    });

    it('should format lastSaved label correctly', () => {
      const time = '14:30';
      const label = AUTO_SAVE_LABELS.lastSaved(time);

      expect(label).toBe('Lưu gần đây lúc 14:30');
      expect(label).toContain('Lưu gần đây');
    });

    it('should have all required Vietnamese labels', () => {
      expect(AUTO_SAVE_LABELS.clearDraft).toBe('Xóa bản nháp');
      expect(AUTO_SAVE_LABELS.draftRecovered).toBe('Bản nháp được phục hồi');
      expect(AUTO_SAVE_LABELS.unsavedChanges).toBe('Có thay đổi chưa lưu');
      expect(AUTO_SAVE_LABELS.saveFailed).toBe('Lỗi lưu bản nháp');
    });
  });

  // ==================== CALLBACK INTEGRATION ====================
  describe('Callback Integration', () => {
    it('should call onSave callback after successful save', async () => {
      const onSave = vi.fn();
      vi.useFakeTimers();

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-cb1`,
          code: '',  // Start with empty code
          runtimeId: DEFAULT_RUNTIME_ID,
          onSave,
        })
      );

      // Don't clear all mocks - instead, record initial calls
      const initialCallCount = onSave.mock.calls.length;

      await act(async () => {
        await result.current.saveDraft();
      });

      await act(async () => {
        vi.runAllTimersAsync();
      });

      // Should be called at least once more after saveDraft
      expect(onSave.mock.calls.length).toBeGreaterThan(initialCallCount);

      vi.useRealTimers();
    });

    it('should call onError callback on save failure', async () => {
      const onError = vi.fn();
      vi.useFakeTimers();

      // Mock localStorage to fail on saveDraft
      const originalSetItem = localStorage.setItem;
      let callCount = 0;
      localStorage.setItem = vi.fn(() => {
        callCount++;
        if (callCount > 0) throw new Error('Storage error');
      });

      try {
        const { result } = renderHook(() =>
          useFormAutoSave({
            draftKey: `${DRAFT_KEY}-cb2`,
            code: DEFAULT_CODE,
            runtimeId: DEFAULT_RUNTIME_ID,
            onError,
          })
        );

        await act(async () => {
          await result.current.saveDraft();
        });

        // Process timers to trigger debounce
        await act(async () => {
          vi.runAllTimersAsync();
        });

        // Should call onError
        expect(onError).toHaveBeenCalled();
      } finally {
        localStorage.setItem = originalSetItem;
        vi.useRealTimers();
      }
    });

    it('should not call callbacks after unmount', async () => {
      const onSave = vi.fn();
      const onError = vi.fn();

      const { unmount } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-cb3`,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
          onSave,
          onError,
        })
      );

      unmount();

      // Callbacks should not be called after unmount
      expect(onSave).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  // ==================== STATE UPDATES ====================
  describe('State Updates', () => {
    it('should update isSaving during save operation', async () => {
      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-state1`,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
        })
      );

      expect(result.current.isSaving).toBe(false);

      const savePromise = act(async () => {
        await result.current.saveDraft();
      });

      // After save promise resolves, isSaving should be false
      await savePromise;
      expect(result.current.isSaving).toBe(false);
    });

    it('should reset isDraft to false when clearing draft', async () => {
      // Create with existing draft
      const draftData = {
        code: 'draft code',
        runtimeId: 'python-3.11',
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`${DRAFT_KEY}-state2`, JSON.stringify(draftData));

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-state2`,
          code: '',
          runtimeId: null,
        })
      );

      expect(result.current.isDraft).toBe(true);

      act(() => {
        result.current.clearDraft();
      });

      expect(result.current.isDraft).toBe(false);
    });
  });

  // ==================== MULTIPLE INSTANCES ====================
  describe('Multiple Instances', () => {
    it('should handle multiple hooks with different draft keys', async () => {
      vi.useFakeTimers();
      const key1 = `${DRAFT_KEY}-multi1`;
      const key2 = `${DRAFT_KEY}-multi2`;

      const { result: result1 } = renderHook(() =>
        useFormAutoSave({
          draftKey: key1,
          code: 'code 1',
          runtimeId: 'python-3.11',
        })
      );

      const { result: result2 } = renderHook(() =>
        useFormAutoSave({
          draftKey: key2,
          code: 'code 2',
          runtimeId: 'java-11',
        })
      );

      await act(async () => {
        await result1.current.saveDraft();
        await result2.current.saveDraft();
      });

      await act(async () => {
        vi.runAllTimersAsync();
      });

      expect(localStorage.getItem(key1)).toBeTruthy();
      expect(localStorage.getItem(key2)).toBeTruthy();

      const draft1 = JSON.parse(localStorage.getItem(key1)!);
      const draft2 = JSON.parse(localStorage.getItem(key2)!);

      expect(draft1.code).toBe('code 1');
      expect(draft2.code).toBe('code 2');

      vi.useRealTimers();
    });

    it('should not interfere with unrelated localStorage entries', async () => {
      vi.useFakeTimers();
      // Add unrelated data to localStorage
      localStorage.setItem('other:key', 'other data');

      const { result } = renderHook(() =>
        useFormAutoSave({
          draftKey: `${DRAFT_KEY}-multi3`,
          code: DEFAULT_CODE,
          runtimeId: DEFAULT_RUNTIME_ID,
        })
      );

      await act(async () => {
        await result.current.saveDraft();
      });

      await act(async () => {
        vi.runAllTimersAsync();
      });

      expect(localStorage.getItem('other:key')).toBe('other data');

      vi.useRealTimers();
    });
  });
});
