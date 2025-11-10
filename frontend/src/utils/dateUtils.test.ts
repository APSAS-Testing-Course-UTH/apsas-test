/**
 * Tests for Vietnamese Date Utilities
 */

import { describe, it, expect } from 'vitest'
import {
  formatDateShort,
  formatDateLong,
  formatDateWithDay,
  formatTime,
  formatDateTime,
  getRelativeTime,
  getRemainingDays,
  getUrgencyLevel,
  getUrgencyLabel,
  getUrgencyColor,
  getUrgencyColorClass,
  calculateDuration,
  isToday,
  isPast,
  isFuture,
  getDeadlineStatusText,
  formatAssignmentTimeline,
} from './dateUtils'

describe('Vietnamese Date Utils', () => {
  describe('formatDateShort', () => {
    it('should format date as dd/mm/yyyy', () => {
      const date = new Date(2025, 10, 7) // Nov 7, 2025
      const result = formatDateShort(date)
      expect(result).toMatch(/\d{2}\/\d{2}\/2025/)
    })

    it('should pad single-digit day and month', () => {
      const date = new Date(2025, 0, 5) // Jan 5, 2025
      expect(formatDateShort(date)).toBe('05/01/2025')
    })

    it('should handle null/undefined', () => {
      expect(formatDateShort(null)).toBe('N/A')
      expect(formatDateShort(undefined)).toBe('N/A')
    })
  })

  describe('formatDateLong', () => {
    it('should format date with Vietnamese month name', () => {
      const date = new Date(2025, 10, 7)
      expect(formatDateLong(date)).toContain('Tháng')
      expect(formatDateLong(date)).toContain('2025')
    })

    it('should handle December correctly', () => {
      const date = new Date(2025, 11, 25)
      expect(formatDateLong(date)).toContain('Tháng 12')
    })
  })

  describe('formatDateWithDay', () => {
    it('should include day name', () => {
      const date = new Date(2025, 10, 7)
      const result = formatDateWithDay(date)
      expect(result).toMatch(/Thứ|Chủ/)
      expect(result).toContain('/')
    })
  })

  describe('formatTime', () => {
    it('should format time as HH:mm', () => {
      const date = new Date(2025, 10, 7, 9, 30)
      expect(formatTime(date)).toBe('09:30')
    })

    it('should pad single-digit minutes', () => {
      const date = new Date(2025, 10, 7, 5, 3)
      expect(formatTime(date)).toBe('05:03')
    })

    it('should return N/A for invalid dates', () => {
      expect(formatTime(null)).toBe('N/A')
    })
  })

  describe('formatDateTime', () => {
    it('should combine date and time', () => {
      const date = new Date(2025, 10, 7, 9, 30)
      const result = formatDateTime(date)
      expect(result).toContain('/')
      expect(result).toContain(':')
      expect(result).toContain('2025')
    })
  })

  describe('getRelativeTime', () => {
    it('should show "hôm nay" for today', () => {
      const today = new Date()
      expect(getRelativeTime(today)).toBe('hôm nay')
    })

    it('should show "hôm qua" for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(getRelativeTime(yesterday)).toBe('hôm qua')
    })

    it('should show future days', () => {
      const future = new Date()
      future.setDate(future.getDate() + 3)
      expect(getRelativeTime(future)).toContain('3 ngày')
    })

    it('should show past days', () => {
      const past = new Date()
      past.setDate(past.getDate() - 5)
      expect(getRelativeTime(past)).toBe('5 ngày trước')
    })
  })

  describe('getRemainingDays', () => {
    it('should calculate positive days for future dates', () => {
      const future = new Date()
      future.setDate(future.getDate() + 5)
      const remaining = getRemainingDays(future)
      expect(remaining).toBe(5)
    })

    it('should calculate negative days for past dates', () => {
      const past = new Date()
      past.setDate(past.getDate() - 3)
      const remaining = getRemainingDays(past)
      expect(remaining).toBe(-3)
    })

    it('should return 0 for null', () => {
      expect(getRemainingDays(null)).toBe(0)
    })
  })

  describe('getUrgencyLevel', () => {
    it('should return "draft" for DRAFT status', () => {
      expect(getUrgencyLevel(null, null, 'DRAFT')).toBe('draft')
    })

    it('should return "overdue" for past dates', () => {
      const past = new Date()
      past.setDate(past.getDate() - 1)
      expect(getUrgencyLevel(null, past)).toBe('overdue')
    })

    it('should return "urgent" for today or tomorrow', () => {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      const level = getUrgencyLevel(null, today)
      expect(level === 'urgent' || level === 'soon').toBe(true)
    })

    it('should return "soon" for 1-3 days away', () => {
      const soon = new Date()
      soon.setDate(soon.getDate() + 2)
      expect(getUrgencyLevel(null, soon)).toBe('soon')
    })

    it('should return "upcoming" for distant future', () => {
      const future = new Date()
      future.setDate(future.getDate() + 10)
      expect(getUrgencyLevel(null, future)).toBe('upcoming')
    })
  })

  describe('getUrgencyLabel', () => {
    it('should return Vietnamese labels', () => {
      expect(getUrgencyLabel('overdue')).toBe('Quá hạn')
      expect(getUrgencyLabel('urgent')).toBe('Sắp hết hạn')
      expect(getUrgencyLabel('upcoming')).toBe('Còn thời gian')
      expect(getUrgencyLabel('draft')).toBe('Bản nháp')
    })
  })

  describe('getUrgencyColor', () => {
    it('should return valid color codes', () => {
      expect(getUrgencyColor('overdue')).toBe('#d32f2f')
      expect(getUrgencyColor('upcoming')).toBe('#388e3c')
      expect(getUrgencyColor('draft')).toBe('#9e9e9e')
    })
  })

  describe('getUrgencyColorClass', () => {
    it('should return CSS class names', () => {
      expect(getUrgencyColorClass('overdue')).toBe('red')
      expect(getUrgencyColorClass('urgent')).toBe('orange')
      expect(getUrgencyColorClass('upcoming')).toBe('green')
    })
  })

  describe('calculateDuration', () => {
    it('should calculate weeks and days', () => {
      const start = new Date(2025, 10, 1)
      const end = new Date(2025, 10, 11)
      expect(calculateDuration(start, end)).toContain('tuần')
    })

    it('should show only days when less than a week', () => {
      const start = new Date(2025, 10, 1)
      const end = new Date(2025, 10, 5)
      expect(calculateDuration(start, end)).toBe('4 ngày')
    })
  })

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date()
      expect(isToday(today)).toBe(true)
    })

    it('should return false for other dates', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(isToday(tomorrow)).toBe(false)
    })
  })

  describe('isPast', () => {
    it('should return true for past dates', () => {
      const past = new Date()
      past.setDate(past.getDate() - 1)
      expect(isPast(past)).toBe(true)
    })

    it('should return false for future dates', () => {
      const future = new Date()
      future.setDate(future.getDate() + 1)
      expect(isPast(future)).toBe(false)
    })
  })

  describe('isFuture', () => {
    it('should return true for future dates', () => {
      const future = new Date()
      future.setDate(future.getDate() + 1)
      expect(isFuture(future)).toBe(true)
    })

    it('should return false for past dates', () => {
      const past = new Date()
      past.setDate(past.getDate() - 1)
      expect(isFuture(past)).toBe(false)
    })
  })

  describe('getDeadlineStatusText', () => {
    it('should show overdue status', () => {
      const past = new Date()
      past.setDate(past.getDate() - 2)
      const text = getDeadlineStatusText(null, past)
      expect(text).toContain('Quá hạn')
    })

    it('should show today deadline', () => {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      expect(getDeadlineStatusText(null, today)).toBe('Hạn nộp hôm nay')
    })

    it('should show days remaining', () => {
      const future = new Date()
      future.setDate(future.getDate() + 5)
      expect(getDeadlineStatusText(null, future)).toBe('Còn 5 ngày')
    })
  })

  describe('formatAssignmentTimeline', () => {
    it('should format timeline', () => {
      const start = new Date(2025, 10, 1)
      const due = new Date(2025, 10, 15)
      const timeline = formatAssignmentTimeline(start, due)
      expect(timeline).toContain('Từ')
      expect(timeline).toContain('đến')
      expect(timeline).toContain('2025')
    })

    it('should handle missing dates', () => {
      expect(formatAssignmentTimeline(null, null)).toBe('Từ N/A đến N/A')
    })
  })
})
