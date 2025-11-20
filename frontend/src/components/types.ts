/**
 * Component Type Definitions
 * Shared types for all UI components
 */

import type { ReactNode } from 'react';

/**
 * Button Component Types
 */
export interface ButtonProps {
  /**
   * Button text or content
   */
  children: ReactNode;

  /**
   * Button variant style
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'subtle';

  /**
   * Button size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Is button in loading state?
   * @default false
   */
  loading?: boolean;

  /**
   * Is button disabled?
   * @default false
   */
  disabled?: boolean;

  /**
   * Button click handler
   */
  onClick?: () => void | Promise<void>;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Button type
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * Aria label for accessibility
   */
  'aria-label'?: string;
}

/**
 * Card Component Types
 */
export interface CardProps {
  children: ReactNode;
  shadow?: boolean | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withBorder?: boolean;
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * Form Input Component Types
 */
export interface FormInputProps {
  /**
   * Input label (Vietnamese)
   */
  label?: string;

  /**
   * Input placeholder (Vietnamese)
   */
  placeholder?: string;

  /**
   * Input value
   */
  value?: string;

  /**
   * Change handler
   */
  onChange?: (value: string) => void;

  /**
   * Input type
   * @default 'text'
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';

  /**
   * Is field required?
   * @default false
   */
  required?: boolean;

  /**
   * Error message (Vietnamese)
   */
  error?: string | null;

  /**
   * Is field disabled?
   * @default false
   */
  disabled?: boolean;

  /**
   * Input size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Focus handler
   */
  onFocus?: () => void;

  /**
   * Blur handler
   */
  onBlur?: () => void;
}

export interface FormSelectProps {
  /**
   * Select label (Vietnamese)
   */
  label?: string;

  /**
   * Placeholder (Vietnamese)
   */
  placeholder?: string;

  /**
   * Selected value
   */
  value?: string;

  /**
   * Change handler
   */
  onChange?: (value: string) => void;

  /**
   * Available options
   */
  options: Array<{ label: string; value: string }>;

  /**
   * Is field required?
   * @default false
   */
  required?: boolean;

  /**
   * Error message (Vietnamese)
   */
  error?: string | null;

  /**
   * Is field disabled?
   * @default false
   */
  disabled?: boolean;

  /**
   * Select size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Allow search in dropdown
   * @default true
   */
  searchable?: boolean;

  /**
   * Allow multiple selections
   * @default false
   */
  multiple?: boolean;
}

export interface FormTextareaProps {
  /**
   * Textarea label (Vietnamese)
   */
  label?: string;

  /**
   * Placeholder (Vietnamese)
   */
  placeholder?: string;

  /**
   * Textarea value
   */
  value?: string;

  /**
   * Change handler
   */
  onChange?: (value: string) => void;

  /**
   * Number of visible rows
   * @default 4
   */
  rows?: number;

  /**
   * Is field required?
   * @default false
   */
  required?: boolean;

  /**
   * Error message (Vietnamese)
   */
  error?: string | null;

  /**
   * Is field disabled?
   * @default false
   */
  disabled?: boolean;

  /**
   * Textarea size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Maximum length
   */
  maxLength?: number;

  /**
   * Show character count
   * @default false
   */
  showCharCount?: boolean;

  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * Badge Component Types
 */
export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'filled' | 'light' | 'outline' | 'dot';
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fullWidth?: boolean;
}

/**
 * @deprecated StatusBadgeProps removed - duplicate of Badge.tsx definition
 * Import from: @/components/ui/Badge/Badge
 */

/**
 * Modal Component Types
 */
export interface ModalProps {
  /**
   * Is modal open?
   */
  isOpen: boolean;

  /**
   * Modal title (Vietnamese)
   */
  title?: string;

  /**
   * Modal content
   */
  children: ReactNode;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Modal size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Can close by clicking backdrop
   * @default true
   */
  closeOnClickOutside?: boolean;

  /**
   * Show close button
   * @default true
   */
  showCloseButton?: boolean;
}

export interface ConfirmDialogProps {
  /**
   * Is dialog open?
   */
  isOpen: boolean;

  /**
   * Dialog title (Vietnamese)
   */
  title: string;

  /**
   * Dialog message (Vietnamese)
   */
  message: string;

  /**
   * Confirm handler
   */
  onConfirm: () => void | Promise<void>;

  /**
   * Cancel handler
   */
  onCancel: () => void;

  /**
   * Confirm button text (Vietnamese)
   * @default "Xác nhận"
   */
  confirmText?: string;

  /**
   * Cancel button text (Vietnamese)
   * @default "Hủy"
   */
  cancelText?: string;

  /**
   * Button variant (default: danger for destructive actions)
   * @default 'danger'
   */
  confirmVariant?: 'primary' | 'danger' | 'secondary';

  /**
   * Is loading
   * @default false
   */
  isLoading?: boolean;

  /**
   * Dialog size
   * @default 'sm'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Loader Component Types
 */
export interface SpinnerProps {
  /**
   * Loader size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Loader color
   * @default 'primary'
   */
  color?: string;

  /**
   * Loading message (Vietnamese)
   */
  message?: string;

  /**
   * Full screen spinner
   * @default false
   */
  fullScreen?: boolean;
}

export interface SkeletonLoaderProps {
  /**
   * Number of lines to show
   * @default 1
   */
  lines?: number;

  /**
   * Height of each line
   * @default 'md'
   */
  height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Width of skeleton
   * @default '100%'
   */
  width?: string | number;

  /**
   * Circle skeleton
   * @default false
   */
  circle?: boolean;

  /**
   * Loading message (Vietnamese)
   */
  message?: string;
}

/**
 * Tabs Component Types
 */
export interface Tab {
  /**
   * Tab label (Vietnamese)
   */
  label: string;

  /**
   * Tab content
   */
  content: ReactNode;

  /**
   * Tab key (for identification)
   */
  key: string;
}

export interface TabsProps {
  /**
   * Array of tabs
   */
  tabs: Tab[];

  /**
   * Default active tab key
   */
  defaultTab?: string;

  /**
   * Tab change handler
   */
  onChange?: (tabKey: string) => void;

  /**
   * Tabs variant
   * @default 'default'
   */
  variant?: 'default' | 'outline' | 'pills';

  /**
   * Grow tabs to fill space
   * @default false
   */
  grow?: boolean;

  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * Toast/Notification Types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id?: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = persistent
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface UseToastReturn {
  show: (toast: Omit<ToastMessage, 'id'>) => string;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  close: (id: string) => void;
  closeAll: () => void;
}

// Types are exported above and ready to use
// No default export needed
