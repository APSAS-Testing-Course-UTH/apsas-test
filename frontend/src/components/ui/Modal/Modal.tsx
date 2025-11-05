import { useEffect, useRef, useCallback } from 'react';
import type { ModalProps, ConfirmDialogProps } from '../../types';
import styles from './Modal.module.css';

/**
 * Modal Component - Accessible modal/dialog component
 *
 * Features:
 * - Close on escape key
 * - Close on backdrop click (configurable)
 * - Focus management
 * - ARIA attributes
 * - Responsive design
 * - Dark mode support
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Xác nhận">
 *   <p>Nội dung modal</p>
 * </Modal>
 * ```
 */
export function Modal({
  isOpen,
  title,
  children,
  onClose,
  size = 'md',
  closeOnClickOutside = true,
  showCloseButton = true,
  className,
  ...rest
}: ModalProps & { className?: string }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.code === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Focus dialog
    if (dialogRef.current) {
      dialogRef.current.focus();
    }

    // Return focus on close
    return () => {
      if (previouslyFocusedElement.current?.focus) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnClickOutside && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnClickOutside, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className={`${styles.modalContainer} ${styles.isOpen}`}>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${styles.dark}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`${styles.modal} ${styles[`modal-${size}`]} ${className || ''}`}
        tabIndex={-1}
        {...rest}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className={styles.modalHeader}>
            {title && (
              <h2 id="modal-title" className={styles.modalTitle}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Đóng"
                title="Đóng (Esc)"
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

/**
 * ConfirmDialog Component - Confirmation dialog with preset buttons
 *
 * Features:
 * - Pre-configured with Confirm/Cancel buttons
 * - Support for different button variants (primary, danger, secondary)
 * - Loading state
 * - Vietnamese labels
 * - Async onConfirm support
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <ConfirmDialog
 *   isOpen={isOpen}
 *   title="Xác nhận xóa"
 *   message="Bạn có chắc chắn muốn xóa?"
 *   onConfirm={() => handleDelete()}
 *   onCancel={() => setIsOpen(false)}
 * />
 * ```
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmVariant = 'danger',
  isLoading = false,
  size = 'sm',
  className,
  ...rest
}: ConfirmDialogProps & { className?: string }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || isLoading) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.code === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    if (dialogRef.current) {
      dialogRef.current.focus();
    }

    return () => {
      if (previouslyFocusedElement.current?.focus) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen]);

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error in onConfirm:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.modalContainer} ${styles.isOpen}`}>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${styles.dark}`}
        onClick={isLoading ? undefined : onCancel}
        aria-hidden="true"
      />

      {/* Confirm Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className={`${styles.modal} ${styles[`modal-${size}`]} ${className || ''}`}
        tabIndex={-1}
        {...rest}
      >
        {/* Dialog Header */}
        <div className={styles.modalHeader}>
          <h2 id="confirm-title" className={styles.modalTitle}>
            {title}
          </h2>
        </div>

        {/* Dialog Body */}
        <div className={styles.modalBody}>
          <p className={styles.dialogMessage}>{message}</p>
        </div>

        {/* Dialog Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles[`variant-${confirmVariant}`]}`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
