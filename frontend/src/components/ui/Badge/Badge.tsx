/**
 * Badge Component
 * Generic badge component and StatusBadge for assignment status
 */

import type { ReactNode } from 'react';
import type { StatusType } from '../../constants/statusLabels';
import { STATUS_LABELS, STATUS_COLORS } from '../../constants/statusLabels';
import styles from './Badge.module.css';

/**
 * Badge Props
 */
export interface BadgeComponentProps {
  /** Badge label text (Vietnamese) */
  label?: ReactNode;
  /** Badge color: primary, success, warning, error, info, gray, secondary */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gray' | 'secondary';
  /** Badge variant: solid, outline, light, dot */
  variant?: 'solid' | 'outline' | 'light' | 'dot';
  /** Badge size: sm, md, lg */
  size?: 'sm' | 'md' | 'lg';
  /** Children content (alternative to label prop) */
  children?: ReactNode;
  /** Custom CSS class */
  className?: string;
  /** Role for accessibility */
  role?: string;
  /** aria-label for accessibility */
  'aria-label'?: string;
}

/**
 * StatusBadge Props
 */
export interface StatusBadgeProps {
  /** Status type - uses Vietnamese labels */
  status: StatusType | string;
  /** Badge size: sm, md, lg (default: md) */
  size?: 'sm' | 'md' | 'lg';
  /** Badge variant: solid, outline, light, dot (default: solid) */
  variant?: 'solid' | 'outline' | 'light' | 'dot';
  /** Custom CSS class */
  className?: string;
  /** aria-label for accessibility (optional override) */
  'aria-label'?: string;
}

/**
 * Badge - Generic badge component
 * Displays a badge with customizable color, variant, and size
 *
 * @example
 * ```tsx
 * <Badge label="Mới" color="primary" />
 * <Badge label="Đạt" color="success" variant="outline" size="lg" />
 * ```
 */
export function Badge({
  label,
  color = 'primary',
  variant = 'solid',
  size = 'md',
  children,
  className,
  role,
  'aria-label': ariaLabel,
}: BadgeComponentProps) {
  const colorClass = styles[`badge-${color}`];
  const variantClass = styles[`variant-${variant}`];
  const sizeClass = styles[`size-${size}`];

  return (
    <span
      className={`${styles.badge} ${colorClass} ${variantClass} ${sizeClass} ${className || ''}`.trim()}
      role={role}
      aria-label={ariaLabel}
    >
      {label || children}
    </span>
  );
}

/**
 * StatusBadge - Status-specific badge component
 * Uses Vietnamese status labels and automatic color mapping
 *
 * @example
 * ```tsx
 * <StatusBadge status="PASSED" />              // Green "Đạt"
 * <StatusBadge status="FAILED" size="lg" />    // Red "Không đạt"
 * <StatusBadge status="PENDING" variant="outline" />  // Gray outline
 * ```
 */
export function StatusBadge({
  status,
  size = 'md',
  variant = 'solid',
  className,
  'aria-label': ariaLabel,
}: StatusBadgeProps) {
  // Get Vietnamese label from constants
  const label = STATUS_LABELS[status as StatusType] || status;

  // Get color from constants
  const colorName = STATUS_COLORS[status as StatusType] || 'gray';
  const colorClass = styles[`badge-${colorName}`];
  const variantClass = styles[`variant-${variant}`];
  const sizeClass = styles[`size-${size}`];

  return (
    <span
      className={`${styles.badge} ${colorClass} ${variantClass} ${sizeClass} ${className || ''}`.trim()}
      role="status"
      aria-label={ariaLabel || `Trạng thái: ${label}`}
    >
      {label}
    </span>
  );
}
