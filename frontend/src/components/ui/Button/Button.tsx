/**
 * Button Component
 * Mantine-based button with Vietnamese support
 * TDD Implementation: Tests were written first
 */

import { Button as MantineButton } from '@mantine/core';
import type { ButtonProps } from '../../types';

/**
 * Primary Button Component
 * Supports Vietnamese labels and multiple variants
 *
 * @example
 * ```tsx
 * <Button>Đăng nhập</Button>
 * <Button variant="danger" onClick={handleDelete}>Xóa</Button>
 * <Button loading>Đang tải...</Button>
 * ```
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className,
  fullWidth = false,
  type = 'button',
  'aria-label': ariaLabel,
}: ButtonProps) {
  // Map our variant names to Mantine button variants
  const mantineVariant = variant === 'primary' ? 'filled' : variant;

  // Combine CSS classes
  const classNames = [
    className,
    `variant-${variant}`,
    `size-${size}`,
    fullWidth && 'full-width',
    loading && 'loading',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <MantineButton
      type={type}
      variant={mantineVariant}
      size={size}
      loading={loading}
      disabled={disabled || loading}
      onClick={onClick}
      className={classNames}
      fullWidth={fullWidth}
      aria-label={ariaLabel}
      data-testid="button"
    >
      {children}
    </MantineButton>
  );
}

export default Button;
