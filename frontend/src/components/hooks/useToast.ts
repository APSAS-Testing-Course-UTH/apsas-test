/**
 * useToast Hook
 * Global toast notification system with Vietnamese support
 */

import { useCallback } from 'react';
import type { ToastMessage, UseToastReturn } from '../types';

// Toast storage - in a real app, this would use Zustand or similar
let toastId = 0;
const toasts = new Set<ToastMessage>();
const listeners = new Set<() => void>();

/**
 * useToast Hook
 * Provides methods to show notifications
 *
 * @example
 * ```tsx
 * const { success, error, warning } = useToast();
 *
 * success('Thành công', 'Bài nộp đã được lưu');
 * error('Lỗi', 'Kiểm tra kết nối mạng của bạn');
 * warning('Cảnh báo', 'Bài tập sắp hết hạn');
 * ```
 */
export function useToast(): UseToastReturn {
  const notifyListeners = useCallback(() => {
    listeners.forEach((listener) => listener());
  }, []);

  const show = useCallback(
    (toast: Omit<ToastMessage, 'id'>): string => {
      const id = `toast-${toastId++}`;
      const toastMessage: ToastMessage = { ...toast, id };
      toasts.add(toastMessage);

      // Auto-remove after duration
      if (toast.duration !== 0) {
        const duration = toast.duration || 3000;
        setTimeout(() => {
          toasts.delete(toastMessage);
          notifyListeners();
        }, duration);
      }

      notifyListeners();
      return id;
    },
    [notifyListeners]
  );

  const success = useCallback(
    (title: string, message?: string) => {
      show({ type: 'success', title, message });
    },
    [show]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      show({ type: 'error', title, message });
    },
    [show]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      show({ type: 'warning', title, message });
    },
    [show]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      show({ type: 'info', title, message });
    },
    [show]
  );

  const close = useCallback(
    (id: string) => {
      toasts.forEach((toast) => {
        if (toast.id === id) {
          toasts.delete(toast);
        }
      });
      notifyListeners();
    },
    [notifyListeners]
  );

  const closeAll = useCallback(() => {
    toasts.clear();
    notifyListeners();
  }, [notifyListeners]);

  return { show, success, error, warning, info, close, closeAll };
}

/**
 * Subscribe to toast changes
 * Internal use only
 */
export function subscribeToToasts(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Get current toasts
 * Internal use only
 */
export function getToasts(): ToastMessage[] {
  return Array.from(toasts);
}

export default useToast;
