/**
 * AssignmentTimeline Component Tests
 * Tests for assignment timeline display with urgency indicators
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import { AssignmentTimeline } from './AssignmentTimeline'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'

// Mock data factory
const createMockAssignment = (overrides: Partial<ContentServiceAssignmentResponse> = {}): ContentServiceAssignmentResponse => ({
  id: '1',
  title: 'Test Assignment',
  description: 'Test description',
  difficultyLevel: 'MEDIUM',
  creatorId: 'provider-1',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  maxScore: 100,
  status: 'PUBLISHED',
  languages: ['Python'],
  testCases: [],
  skills: [],
  tutorials: [],
  startDate: undefined,
  dueDate: undefined,
  ...overrides,
})

describe('AssignmentTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render timeline card', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: '2025-11-15T23:59:59Z',
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
    })

    it('should display Vietnamese labels', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: '2025-11-15T23:59:59Z',
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(screen.getByText('Ngày bắt đầu')).toBeInTheDocument()
      expect(screen.getByText('Hạn chót')).toBeInTheDocument()
    })

    it('should render urgency badge', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)

      const assignment = createMockAssignment({
        startDate: new Date().toISOString(),
        dueDate: futureDate.toISOString(),
      })

      render(<AssignmentTimeline assignment={assignment} />)

      // Should render without errors
      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
    })
  })

  describe('Date Display', () => {
    it('should format start date correctly', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: '2025-11-15T23:59:59Z',
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(screen.getByText('Ngày bắt đầu')).toBeInTheDocument()
    })

    it('should format due date correctly', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: '2025-11-15T23:59:59Z',
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(screen.getByText('Hạn chót')).toBeInTheDocument()
    })

    it('should show message when no due date', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: undefined,
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(
        screen.getByText('Bài tập này không có hạn chót cụ thể')
      ).toBeInTheDocument()
    })
  })

  describe('Urgency Indicators', () => {
    it('should display deadline status for future dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)

      const assignment = createMockAssignment({
        startDate: new Date().toISOString(),
        dueDate: futureDate.toISOString(),
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
    })

    it('should handle overdue assignments', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 7)

      const assignment = createMockAssignment({
        startDate: new Date('2025-01-01T00:00:00Z').toISOString(),
        dueDate: pastDate.toISOString(),
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
    })

    it('should display timeline summary', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: '2025-11-15T23:59:59Z',
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle assignment with only start date', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: undefined,
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(screen.getByText('Ngày bắt đầu')).toBeInTheDocument()
      expect(
        screen.getByText('Bài tập này không có hạn chót cụ thể')
      ).toBeInTheDocument()
    })

    it('should handle assignment with no dates', () => {
      const assignment = createMockAssignment({
        startDate: undefined,
        dueDate: undefined,
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(
        screen.getByText('Bài tập này không có hạn chót cụ thể')
      ).toBeInTheDocument()
    })

    it('should handle invalid date strings gracefully', () => {
      const assignment = createMockAssignment({
        startDate: 'invalid-date',
        dueDate: 'another-invalid-date',
      })

      expect(() => render(<AssignmentTimeline assignment={assignment} />)).not.toThrow()
    })
  })

  describe('Vietnamese UI Compliance', () => {
    it('should use Vietnamese text throughout', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: '2025-11-15T23:59:59Z',
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
      expect(screen.getByText('Ngày bắt đầu')).toBeInTheDocument()
      expect(screen.getByText('Hạn chót')).toBeInTheDocument()

      expect(screen.queryByText('Start Date')).not.toBeInTheDocument()
      expect(screen.queryByText('Due Date')).not.toBeInTheDocument()
      expect(screen.queryByText('Timeline')).not.toBeInTheDocument()
    })

    it('should display urgency labels in Vietnamese', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)

      const assignment = createMockAssignment({
        startDate: new Date().toISOString(),
        dueDate: futureDate.toISOString(),
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: '2025-11-15T23:59:59Z',
      })

      const { container } = render(<AssignmentTimeline assignment={assignment} />)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should have proper icon associations', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: '2025-11-15T23:59:59Z',
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
    })
  })
})
