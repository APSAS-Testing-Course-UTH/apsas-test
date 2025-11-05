/**
 * Card Component
 * Container component with header, body, and footer sections
 * Wraps Mantine Paper component
 */

import type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from '../../types';
import styles from './Card.module.css';

/**
 * Card - Main container component
 * Provides shadow, padding, border, and radius variants
 *
 * @example
 * ```tsx
 * <Card shadow="md" padding="md" withBorder>
 *   <CardHeader>Tiêu đề</CardHeader>
 *   <CardBody>Nội dung</CardBody>
 *   <CardFooter>Hành động</CardFooter>
 * </Card>
 * ```
 */
export function Card({
  children,
  shadow = 'md',
  padding = 'md',
  withBorder = false,
  radius = 'md',
  className,
}: CardProps) {
  const shadowClass =
    shadow === true
      ? styles['shadow-default']
      : shadow === false
        ? ''
        : styles[`shadow-${shadow}`];

  const paddingClass = styles[`padding-${padding}`];
  const radiusClass = styles[`radius-${radius}`];
  const borderClass = withBorder ? styles['with-border'] : '';

  return (
    <div
      className={`${styles.card} ${shadowClass} ${paddingClass} ${radiusClass} ${borderClass} ${className || ''}`.trim()}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader - Header section of Card
 * Typically used for titles and top actions
 *
 * @example
 * ```tsx
 * <CardHeader>Bài toán: Fibonacci</CardHeader>
 * ```
 */
export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={`${styles['card-header']} ${className || ''}`.trim()}>{children}</div>;
}

/**
 * CardBody - Main content section of Card
 * Contains primary card content
 *
 * @example
 * ```tsx
 * <CardBody>
 *   <p>Mô tả bài toán...</p>
 * </CardBody>
 * ```
 */
export function CardBody({ children, className }: CardBodyProps) {
  return <div className={`${styles['card-body']} ${className || ''}`.trim()}>{children}</div>;
}

/**
 * CardFooter - Footer section of Card
 * Typically used for action buttons and bottom content
 *
 * @example
 * ```tsx
 * <CardFooter>
 *   <button>Hủy</button>
 *   <button>Lưu</button>
 * </CardFooter>
 * ```
 */
export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={`${styles['card-footer']} ${className || ''}`.trim()}>{children}</div>;
}
