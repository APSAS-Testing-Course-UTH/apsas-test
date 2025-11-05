import { TextInput } from '@mantine/core';
import type { FormInputProps } from '../../types';
import styles from './Form.module.css';

/**
 * FormInput - Mantine-wrapped text input component with Vietnamese support
 * 
 * Provides a consistent text input component with support for various input types,
 * error messages, and Vietnamese labeling.
 * 
 * @example
 * ```tsx
 * <FormInput
 *   label="Email"
 *   type="email"
 *   placeholder="Nhập email của bạn..."
 *   error={errors.email}
 *   value={formData.email}
 *   onChange={(value) => setFormData({ ...formData, email: value })}
 *   required
 * />
 * ```
 */
export function FormInput({
  label,
  placeholder,
  error,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  size = 'md',
  className,
}: FormInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange?.(e.currentTarget.value);
    }
  };

  return (
    <div className={`${styles.formGroup} ${className || ''}`}>
      <TextInput
        label={label}
        placeholder={placeholder}
        type={type}
        value={value || ''}
        onChange={handleChange}
        error={error}
        required={required}
        disabled={disabled}
        size={size}
        className={styles.formInput}
        radius="md"
        aria-label={label}
        aria-invalid={!!error}
      />
    </div>
  );
}
