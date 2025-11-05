import { Textarea } from '@mantine/core';
import type { FormTextareaProps } from '../../types';
import styles from './Form.module.css';

/**
 * FormTextarea - Mantine-wrapped textarea component with Vietnamese support
 * 
 * Provides a consistent textarea component with support for character counting,
 * error messages, and Vietnamese labeling.
 * 
 * @example
 * ```tsx
 * <FormTextarea
 *   label="Mô tả bài toán"
 *   placeholder="Nhập mô tả chi tiết..."
 *   rows={10}
 *   maxLength={2000}
 *   showCharCount={true}
 *   error={errors.description}
 *   value={formData.description}
 *   onChange={(value) => setFormData({ ...formData, description: value })}
 *   required
 * />
 * ```
 */
export function FormTextarea({
  label,
  placeholder,
  error,
  value,
  onChange,
  rows = 4,
  maxLength,
  showCharCount = false,
  required = false,
  disabled = false,
  size = 'md',
  className,
}: FormTextareaProps) {
  const charCount = value ? value.length : 0;
  const isNearMax = maxLength && charCount > maxLength * 0.9;
  const isAtMax = maxLength && charCount >= maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!disabled) {
      onChange?.(e.currentTarget.value);
    }
  };

  return (
    <div className={`${styles.formGroup} ${className || ''}`}>
      <Textarea
        label={label}
        placeholder={placeholder}
        value={value || ''}
        onChange={handleChange}
        error={error}
        required={required}
        disabled={disabled}
        size={size}
        rows={rows}
        maxLength={maxLength}
        className={styles.formTextarea}
        radius="md"
        aria-label={label}
        aria-invalid={!!error}
      />
      {showCharCount && maxLength && (
        <div
          className={`${styles.charCount} ${
            isAtMax ? styles.error : isNearMax ? styles.warning : ''
          }`}
        >
          {charCount} / {maxLength}
        </div>
      )}
    </div>
  );
}
