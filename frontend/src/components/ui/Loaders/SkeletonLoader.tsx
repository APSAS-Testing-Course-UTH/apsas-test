/**
 * SkeletonLoader Component
 * Placeholder animation for loading content
 */

import type { SkeletonLoaderProps } from '@/components/types';
import styles from './Loaders.module.css';

/**
 * SkeletonLoader - Content placeholder with shimmer animation
 *
 * @example
 * ```tsx
 * // Single line
 * <SkeletonLoader />
 *
 * // Multiple lines
 * <SkeletonLoader lines={3} />
 *
 * // Circle avatar
 * <SkeletonLoader circle width={64} />
 *
 * // With message
 * <SkeletonLoader lines={2} message="Đang tải dữ liệu..." />
 * ```
 */
export function SkeletonLoader({
  lines = 1,
  height = 'md',
  width = '100%',
  circle = false,
  message,
}: SkeletonLoaderProps) {
  const containerClass = `${styles.skeleton} ${
    circle ? styles['skeleton--circle'] : ''
  }`;

  const lineClass = `${styles.skeleton__line} ${
    styles[`skeleton__line--${height}`]
  } ${circle ? styles['skeleton__line--circle'] : ''}`;

  const widthStyle = typeof width === 'number' ? `${width}px` : width;

  const containerContent = (
    <div
      role="img"
      aria-busy="true"
      aria-label={message || 'Đang tải'}
      aria-hidden="false"
      className={containerClass}
    >
      {/* For circle, render only 1 line regardless of lines prop */}
      {circle ? (
        <div
          className={lineClass}
          style={{
            width: widthStyle,
            height: widthStyle,
          }}
        />
      ) : (
        /* For regular skeleton, render multiple lines */
        Array.from({ length: lines }).map((_, index) => (
          <div
            key={`skeleton-line-${index}`}
            className={lineClass}
            style={{
              width: widthStyle,
              // Last line can be shorter for natural look
              opacity: index === lines - 1 ? 0.85 : 1,
            }}
          />
        ))
      )}

      {message && <div className={styles.skeleton__message}>{message}</div>}
    </div>
  );

  return containerContent;
}

export default SkeletonLoader;