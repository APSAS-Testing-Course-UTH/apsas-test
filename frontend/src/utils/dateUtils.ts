/**
 * Vietnamese Date Utilities - Date Formatting and Status Helpers
 * 
 * Provides utilities for:
 * - Vietnamese date formatting (short, long, relative)
 * - Assignment status calculation (overdue, due soon, upcoming)
 * - Urgency level determination (color-coded)
 * - Duration calculations
 * 
 * @module dateUtils
 */

/**
 * Vietnamese month names and day names
 */
const VIETNAMESE_MONTHS = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
]

const VIETNAMESE_DAY_NAMES = [
  'Chủ nhật',
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
]

/**
 * Assignment status urgency levels
 */
export type UrgencyLevel = 'overdue' | 'urgent' | 'soon' | 'upcoming' | 'draft'

/**
 * Format date to Vietnamese short format: "dd/mm/yyyy"
 */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return 'N/A'
  const day = String(dateObj.getDate()).padStart(2, '0')
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const year = dateObj.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format date to Vietnamese long format: "dd Tháng mm, yyyy"
 */
export function formatDateLong(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return 'N/A'
  const day = dateObj.getDate()
  const month = VIETNAMESE_MONTHS[dateObj.getMonth()]
  const year = dateObj.getFullYear()
  return `${day} ${month}, ${year}`
}

/**
 * Format date with day name: "Thứ 2, dd/mm/yyyy"
 */
export function formatDateWithDay(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return 'N/A'
  const dayName = VIETNAMESE_DAY_NAMES[dateObj.getDay()]
  const shortDate = formatDateShort(dateObj)
  return `${dayName}, ${shortDate}`
}

/**
 * Format time: "HH:mm"
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return 'N/A'
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Format full datetime: "dd/mm/yyyy HH:mm"
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return 'N/A'
  const shortDate = formatDateShort(dateObj)
  const time = formatTime(dateObj)
  return `${shortDate} ${time}`
}

/**
 * Get relative time text: "2 ngày trước", "trong 3 ngày", etc.
 */
export function getRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return 'N/A'

  const now = new Date()
  const diffMs = dateObj.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Check if it's today (same calendar day)
  const isSameDay =
    dateObj.getDate() === now.getDate() &&
    dateObj.getMonth() === now.getMonth() &&
    dateObj.getFullYear() === now.getFullYear()

  if (isSameDay) return 'hôm nay'

  // Past dates
  if (diffDays < -1) return `${Math.abs(diffDays)} ngày trước`
  if (diffDays === -1) return 'hôm qua'

  // Future dates
  if (diffDays === 1) return 'trong 1 ngày'
  if (diffDays >= 2 && diffDays <= 7) return `trong ${diffDays} ngày`
  if (diffDays > 7 && diffDays <= 30) return `trong ${Math.ceil(diffDays / 7)} tuần`
  if (diffDays > 30) return `trong ${Math.ceil(diffDays / 30)} tháng`

  // Less than a day
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
  if (diffHours === 0) return 'trong giây'
  if (diffHours === 1) return 'trong 1 giờ'
  return `trong ${diffHours} giờ`
}

/**
 * Get remaining days until a deadline
 */
export function getRemainingDays(
  dueDate: Date | string | null | undefined
): number {
  if (!dueDate) return 0
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  if (isNaN(dateObj.getTime())) return 0
  const now = new Date()
  const diffMs = dateObj.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Determine urgency level for an assignment
 */
export function getUrgencyLevel(
  _startDate: Date | string | null | undefined,
  dueDate: Date | string | null | undefined,
  status?: string
): UrgencyLevel {
  // Draft assignments are not urgent
  if (status === 'DRAFT' || status === 'ARCHIVED') return 'draft'

  if (!dueDate) return 'upcoming'

  const remainingDays = getRemainingDays(dueDate)

  // Overdue: past due date
  if (remainingDays < 0) return 'overdue'

  // Urgent: due within 1 day
  if (remainingDays <= 1) return 'urgent'

  // Soon: due within 3 days
  if (remainingDays <= 3) return 'soon'

  // Upcoming: more time
  return 'upcoming'
}

/**
 * Get urgency label in Vietnamese
 */
export function getUrgencyLabel(urgencyLevel: UrgencyLevel): string {
  switch (urgencyLevel) {
    case 'overdue':
      return 'Quá hạn'
    case 'urgent':
      return 'Sắp hết hạn'
    case 'soon':
      return 'Sắp hết hạn'
    case 'upcoming':
      return 'Còn thời gian'
    case 'draft':
      return 'Bản nháp'
    default:
      return 'Không xác định'
  }
}

/**
 * Get color code for urgency badge
 */
export function getUrgencyColor(urgencyLevel: UrgencyLevel): string {
  switch (urgencyLevel) {
    case 'overdue':
      return '#d32f2f'
    case 'urgent':
      return '#f57c00'
    case 'soon':
      return '#fbc02d'
    case 'upcoming':
      return '#388e3c'
    case 'draft':
      return '#9e9e9e'
    default:
      return '#757575'
  }
}

/**
 * Get urgency color as CSS class
 */
export function getUrgencyColorClass(urgencyLevel: UrgencyLevel): string {
  switch (urgencyLevel) {
    case 'overdue':
      return 'red'
    case 'urgent':
      return 'orange'
    case 'soon':
      return 'yellow'
    case 'upcoming':
      return 'green'
    case 'draft':
      return 'gray'
    default:
      return 'gray'
  }
}

/**
 * Calculate duration between two dates in readable format
 */
export function calculateDuration(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined
): string {
  if (!startDate || !endDate) return 'N/A'
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'N/A'

  const diffMs = Math.abs(end.getTime() - start.getTime())
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const weeks = Math.floor(days / 7)
  const remainingDays = days % 7

  if (weeks === 0 && days === 0) return 'Trong ngày'
  if (weeks === 0) return `${days} ngày`
  if (remainingDays === 0) return `${weeks} tuần`
  return `${weeks} tuần ${remainingDays} ngày`
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string | null | undefined): boolean {
  if (!date) return false
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return false
  const today = new Date()
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string | null | undefined): boolean {
  if (!date) return false
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return false
  return dateObj < new Date()
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date | string | null | undefined): boolean {
  if (!date) return false
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return false
  return dateObj > new Date()
}

/**
 * Get submission deadline status text
 */
export function getDeadlineStatusText(
  _startDate: Date | string | null | undefined,
  dueDate: Date | string | null | undefined
): string {
  if (!dueDate) return 'Không có hạn nộp'

  const remaining = getRemainingDays(dueDate)

  if (remaining < 0) {
    return `Quá hạn ${Math.abs(remaining)} ngày`
  }

  if (remaining === 0 || isToday(dueDate)) {
    return 'Hạn nộp hôm nay'
  }

  if (remaining === 1) {
    return 'Hạn nộp ngày mai'
  }

  if (remaining <= 7) {
    return `Còn ${remaining} ngày`
  }

  return `Còn ${Math.ceil(remaining / 7)} tuần`
}

/**
 * Format assignment timeline display
 */
export function formatAssignmentTimeline(
  startDate: Date | string | null | undefined,
  dueDate: Date | string | null | undefined
): string {
  const start = startDate ? formatDateShort(startDate) : 'N/A'
  const due = dueDate ? formatDateShort(dueDate) : 'N/A'
  return `Từ ${start} đến ${due}`
}
