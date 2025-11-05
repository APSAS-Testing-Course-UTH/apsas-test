import { Select } from '@mantine/core';
import type { FormSelectProps } from '../../types';
import styles from './Form.module.css';

/**
 * FormSelect - Mantine-wrapped select component with Vietnamese support
 * 
 * Provides a consistent select/dropdown component with support for custom options,
 * error messages, and Vietnamese labeling.
 * 
 * @example
 * ```tsx
 * <FormSelect
 *   label="Ngôn ngữ lập trình"
 *   placeholder="Chọn ngôn ngữ..."
 *   options={[
 *     { label: 'Python', value: 'python' },
 *     { label: 'JavaScript', value: 'js' },
 *   ]}
 *   error={errors.language}
 *   value={formData.language}
 *   onChange={(value) => setFormData({ ...formData, language: value })}
 *   required
 * />
 * ```
 */
export function FormSelect({
  label,
  placeholder,
  error,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  size = 'md',
  className,
}: FormSelectProps) {
  return (
    <div className={`${styles.formGroup} ${className || ''}`}>
      <Select
        label={label}
        placeholder={placeholder}
        value={value || null}
        onChange={(val) => onChange?.(val || '')}
        data={options}
        error={error}
        required={required}
        disabled={disabled}
        size={size}
        className={styles.formSelect}
        radius="md"
        searchable={false}
        aria-label={label}
        aria-invalid={!!error}
      />
    </div>
  );
}
