import { useState } from 'react';
import { Button, Group, Tooltip } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { exportToCSV, type ExportType } from '../utils/exportUtils';
import { useToast } from '@/components/hooks/useToast';

/**
 * Props for ExportButton component
 */
interface ExportButtonProps {
  /**
   * Data array to export (assignments or submissions)
   */
  data: any[];

  /**
   * Type of data being exported
   */
  type: ExportType;

  /**
   * Optional custom filename (auto-generated if not provided)
   */
  filename?: string;

  /**
   * Loading state (disables button)
   */
  isLoading?: boolean;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Callback when export succeeds
   */
  onSuccess?: () => void;

  /**
   * Callback when export fails
   */
  onError?: (error: Error) => void;

  /**
   * Optional CSS class name
   */
  className?: string;

  /**
   * Button variant from Mantine
   */
  variant?: string;

  /**
   * Button size from Mantine
   */
  size?: string;
}

/**
 * ExportButton Component
 *
 * Provides a button to export data as CSV file with Vietnamese labels.
 * Handles loading states, error notifications, and success callbacks.
 *
 * @example
 * ```tsx
 * <ExportButton
 *   data={assignments}
 *   type="assignments"
 *   onSuccess={() => showNotification('Xuất dữ liệu thành công')}
 * />
 * ```
 */
export function ExportButton({
  data,
  type,
  filename,
  isLoading = false,
  disabled = false,
  onSuccess,
  onError,
  className,
  variant = 'light',
  size = 'sm',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { show } = useToast();

  /**
   * Check if data is empty
   */
  const isDataEmpty = !Array.isArray(data) || data.length === 0;

  /**
   * Get button label based on type
   */
  const getLabel = (): string => {
    if (type === 'assignments') {
      return `Tải xuống (${data.length})`;
    } else {
      return `Tải xuống (${data.length})`;
    }
  };

  /**
   * Get tooltip text
   */
  const getTooltip = (): string => {
    if (isDataEmpty) {
      return `Không có ${type === 'assignments' ? 'bài tập' : 'bài nộp'} để tải xuống`;
    }
    return `Tải xuống ${data.length} ${type === 'assignments' ? 'bài tập' : 'bài nộp'} dưới dạng CSV`;
  };

  /**
   * Handle export button click
   */
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Validate data
      if (isDataEmpty) {
        throw new Error(
          `Không có ${type === 'assignments' ? 'bài tập' : 'bài nộp'} để xuất`
        );
      }

      // Perform export
      exportToCSV(data, type, filename);

      // Show success notification
      show({
        type: 'success',
        title: 'Xuất dữ liệu thành công',
        message: `Tệp ${type === 'assignments' ? 'bài tập' : 'bài nộp'} đã được tải xuống`,
      });

      // Call success callback
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Lỗi không xác định';

      // Show error notification
      show({
        type: 'error',
        title: 'Lỗi khi xuất dữ liệu',
        message: errorMessage,
      });

      // Call error callback
      onError?.(new Error(errorMessage));
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Determine if button should be disabled
   */
  const isButtonDisabled = disabled || isLoading || isExporting || isDataEmpty;

  return (
    <Tooltip label={getTooltip()} disabled={!isDataEmpty}>
      <Button
        onClick={handleExport}
        disabled={isButtonDisabled}
        loading={isExporting}
        leftSection={!isExporting ? <IconDownload size={16} /> : undefined}
        variant={variant}
        size={size}
        className={className}
      >
        {isExporting ? 'Đang tải...' : getLabel()}
      </Button>
    </Tooltip>
  );
}

/**
 * Export button group with multiple export options
 */
interface ExportGroupProps {
  /**
   * Data array to export
   */
  data: any[];

  /**
   * Type of data
   */
  type: ExportType;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * On success callback
   */
  onSuccess?: () => void;
}

/**
 * ExportGroup Component
 *
 * Renders a group of export buttons (can extend for multiple formats)
 * Currently supports CSV export.
 *
 * @example
 * ```tsx
 * <ExportGroup data={assignments} type="assignments" />
 * ```
 */
export function ExportGroup({
  data,
  type,
  isLoading = false,
  onSuccess,
}: ExportGroupProps) {
  return (
    <Group gap="xs">
      <ExportButton
        data={data}
        type={type}
        isLoading={isLoading}
        onSuccess={onSuccess}
      />
    </Group>
  );
}
