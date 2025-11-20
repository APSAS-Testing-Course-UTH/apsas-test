/**
 * Spinner Component
 * Animated loading indicator with optional message
 */

import type { SpinnerProps } from '@/components/types';
import styles from './Loaders.module.css';

/**
 * Spinner - Rotating loading indicator
 *
 * @example
 * ```tsx
 * // Basic spinner
 * <Spinner />
 *
 * // With message
 * <Spinner message="Đang tải..." />
 *
 * // Full screen
 * <Spinner fullScreen size="xl" message="Xin chờ một chút..." />
 *
 * // Different sizes
 * <Spinner size="sm" />
 * <Spinner size="lg" />
 * ```
 */
export function Spinner({
  size = 'md',
  color = 'primary',
  message,
  fullScreen = false,
}: SpinnerProps) {
  const spinnerClass = `${styles.spinner} ${styles[`spinner--${size}`]} ${styles[`spinner--${color}`]} ${
    fullScreen ? styles['spinner--fullscreen'] : ''
  }`;

  const spinnerContent = (
    <div
      role="status"
      aria-busy="true"
      aria-label={message || 'Đang tải...'}
      aria-live="polite"
      className={spinnerClass}
      style={{
        '--spinner-color': `var(--color-${color}, #0066cc)`,
      } as React.CSSProperties}
    >
      <svg
        className={styles.spinner__svg}
        width={getSizePixels(size)}
        height={getSizePixels(size)}
        viewBox="0 0 50 50"
        preserveAspectRatio="xMidYMid"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="31.4 94.2"
          strokeLinecap="round"
        />
      </svg>

      {message && <div className={styles.spinner__message}>{message}</div>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={styles.spinner__overlay}>
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}

/**
 * Get pixel size based on size prop
 */
function getSizePixels(size: SpinnerProps['size']): number {
  const sizeMap: Record<NonNullable<SpinnerProps['size']>, number> = {
    xs: 20,
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64,
  };
  return sizeMap[size || 'md'];
}