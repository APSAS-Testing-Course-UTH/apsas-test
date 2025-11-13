/**
 * Error Handler Utility for Content Provider Portal
 * Handles API errors and shows appropriate Vietnamese notifications
 */

import type { AxiosError } from 'axios'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle, IconCheck, IconInfoCircle } from '@tabler/icons-react'

export interface ApiErrorResponse {
  message?: string
  code?: string
  details?: Record<string, unknown>
  type?: string
}

/**
 * Map API error to Vietnamese user message
 */
export function getErrorMessage(error: AxiosError | Error | unknown): string {
  // Handle Axios errors
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError
    const status = axiosError.response?.status
    const data = axiosError.response?.data as ApiErrorResponse | undefined

    switch (status) {
      case 400:
        return data?.message || 'Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại.'
      case 401:
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
      case 403:
        return 'Bạn không có quyền thực hiện hành động này.'
      case 404:
        return 'Không tìm thấy tài nguyên yêu cầu.'
      case 409:
        return data?.message || 'Tài nguyên đã tồn tại hoặc xung đột dữ liệu.'
      case 422:
        return data?.message || 'Dữ liệu nhập không hợp lệ.'
      case 500:
        return 'Lỗi máy chủ. Vui lòng thử lại sau.'
      case 503:
        return 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.'
      default:
        return data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
    }
  }

  // Handle regular errors
  if (error instanceof Error) {
    return error.message || 'Có lỗi không xác định xảy ra.'
  }

  return 'Có lỗi không xác định xảy ra.'
}

/**
 * Show error notification
 */
export function showErrorNotification(
  title: string,
  message?: string,
  error?: AxiosError | Error | unknown
) {
  const finalMessage = message || getErrorMessage(error)

  notifications.show({
    title,
    message: finalMessage,
    color: 'red',
    icon: <IconAlertCircle size={16} />,
    autoClose: 6000,
  })
}

/**
 * Show success notification
 */
export function showSuccessNotification(title: string, message?: string) {
  notifications.show({
    title,
    message: message || 'Hoàn tất thành công',
    color: 'green',
    icon: <IconCheck size={16} />,
    autoClose: 4000,
  })
}

/**
 * Show info notification
 */
export function showInfoNotification(title: string, message?: string) {
  notifications.show({
    title,
    message: message || 'Thông tin',
    color: 'blue',
    icon: <IconInfoCircle size={16} />,
    autoClose: 4000,
  })
}

/**
 * Show warning notification for validation errors
 */
export function showValidationWarning(title: string, message: string) {
  notifications.show({
    title,
    message,
    color: 'yellow',
    icon: <IconAlertCircle size={16} />,
    autoClose: 4000,
  })
}

/**
 * Validate date range and show notification if invalid
 * Returns true if valid (both dates selected or both empty), false otherwise
 */
export function validateDateRange(startDate: string | null, endDate: string | null): boolean {
  if (!startDate && !endDate) {
    // Both empty is fine (no filter)
    return true
  }

  if ((startDate && !endDate) || (!startDate && endDate)) {
    // One selected but not the other
    showValidationWarning(
      'Lỗi lọc ngày tháng',
      'Vui lòng chọn cả hai ngày (Từ ngày và Đến ngày), hoặc không chọn ngày nào'
    )
    return false
  }

  // Both selected
  if (startDate && endDate && startDate > endDate) {
    showValidationWarning(
      'Lỗi lọc ngày tháng',
      'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc'
    )
    return false
  }

  return true
}
