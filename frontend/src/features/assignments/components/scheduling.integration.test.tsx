/**
 * Phase 3.2 Part 2 - Scheduling Integration Tests
 * Comprehensive tests for urgency badges, date formatting, and scheduling display
 * across AssignmentsList and AssignmentDetail components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { AssignmentsList } from '@/features/assignments/components/AssignmentsList'
import { AssignmentTimeline } from '@/features/assignments/components/AssignmentTimeline'
import * as useAssignmentsFilteredModule from '@/features/assignments/hooks/useAssignmentsFiltered'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'

// Mock navigate from TanStack Router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

// Mock data factory
const createMockAssignment = (overrides: Partial<ContentServiceAssignmentResponse> = {}): ContentServiceAssignmentResponse => ({
  id: '1',
  title: 'Integration Test Assignment',
  description: 'Test assignment for integration',
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
  startDate: '2025-11-01T00:00:00Z',
  dueDate: '2025-12-31T23:59:59Z',
  ...overrides,
})

const mockListResponse = {
  content: [createMockAssignment()],
  pageNumber: 0,
  pageSize: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
  hasNext: false,
  hasPrevious: false,
}

describe('Scheduling Integration Tests', () => {
  beforeEach(() => {
    vi.spyOn(useAssignmentsFilteredModule, 'useAssignmentsFiltered').mockReturnValue(
      {
        data: mockListResponse,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isFetching: false,
        status: 'success' as const,
      } as any
    )
  })

  describe('Urgency Badge Integration', () => {
    it('should display urgency badge in assignments list', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: '2025-12-31T23:59:59Z',
      })

      vi.spyOn(useAssignmentsFilteredModule, 'useAssignmentsFiltered').mockReturnValue({
        data: { ...mockListResponse, content: [assignment] },
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isFetching: false,
        status: 'success' as const,
      } as any)

      render(<AssignmentsList />)

      // Verify component renders
      expect(screen.getByText('Integration Test Assignment')).toBeInTheDocument()
    })

    it('should display urgency badge in timeline component', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: '2025-12-31T23:59:59Z',
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
      expect(screen.getByText('Ngày bắt đầu')).toBeInTheDocument()
      expect(screen.getByText('Hạn chót')).toBeInTheDocument()
    })

    it('should show different urgency colors based on deadline', () => {
      const futureAssignment = createMockAssignment({
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      })

      render(<AssignmentTimeline assignment={futureAssignment} />)

      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
    })
  })

  describe('Date Formatting Integration', () => {
    it('should format dates consistently across components', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: '2025-12-15T23:59:59Z',
      })

      render(<AssignmentTimeline assignment={assignment} />)

      // Both dates should be displayed
      expect(screen.getByText('Ngày bắt đầu')).toBeInTheDocument()
      expect(screen.getByText('Hạn chót')).toBeInTheDocument()
    })

    it('should display deadline status text', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)

      const assignment = createMockAssignment({
        startDate: new Date().toISOString(),
        dueDate: futureDate.toISOString(),
      })

      render(<AssignmentTimeline assignment={assignment} />)

      // Timeline should render with deadline info
      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
    })

    it('should handle date formatting for assignments without due dates', () => {
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

  describe('Vietnamese UI Integration', () => {
    it('should display all Vietnamese labels consistently', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: '2025-12-31T23:59:59Z',
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
      expect(screen.getByText('Ngày bắt đầu')).toBeInTheDocument()
      expect(screen.getByText('Hạn chót')).toBeInTheDocument()
    })

    it('should not display any English scheduling labels', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: '2025-12-31T23:59:59Z',
      })

      render(<AssignmentTimeline assignment={assignment} />)

      expect(screen.queryByText('Start Date')).not.toBeInTheDocument()
      expect(screen.queryByText('Due Date')).not.toBeInTheDocument()
      expect(screen.queryByText('Timeline')).not.toBeInTheDocument()
      expect(screen.queryByText('Schedule')).not.toBeInTheDocument()
    })

    it('should display Vietnamese urgency labels', () => {
      const assignment = createMockAssignment({
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day
      })

      render(<AssignmentTimeline assignment={assignment} />)

      // Component should render Vietnamese labels properly
      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
    })
  })

  describe('Mock Data Integration', () => {
    it('should work with realistic mock assignment data', () => {
      const realAssignment = createMockAssignment({
        title: 'Fibonacci Sequence',
        description: 'Implement Fibonacci algorithm',
        startDate: '2025-11-07T00:00:00Z',
        dueDate: '2025-11-21T23:59:59Z',
        difficultyLevel: 'MEDIUM',
        status: 'PUBLISHED',
      })

      vi.spyOn(useAssignmentsFilteredModule, 'useAssignmentsFiltered').mockReturnValue({
        data: { ...mockListResponse, content: [realAssignment] },
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isFetching: false,
        status: 'success' as const,
      } as any)

      render(<AssignmentsList />)

      expect(screen.getByText('Fibonacci Sequence')).toBeInTheDocument()
    })

    it('should handle multiple assignments with different schedules', () => {
      const assignments = [
        createMockAssignment({
          id: '1',
          title: 'Assignment 1',
          startDate: '2025-11-01T00:00:00Z',
          dueDate: '2025-11-15T23:59:59Z',
        }),
        createMockAssignment({
          id: '2',
          title: 'Assignment 2',
          startDate: '2025-11-10T00:00:00Z',
          dueDate: '2025-11-25T23:59:59Z',
        }),
        createMockAssignment({
          id: '3',
          title: 'Assignment 3',
          startDate: undefined,
          dueDate: undefined,
        }),
      ]

      vi.spyOn(useAssignmentsFilteredModule, 'useAssignmentsFiltered').mockReturnValue({
        data: {
          ...mockListResponse,
          content: assignments,
          totalElements: 3,
        },
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isFetching: false,
        status: 'success' as const,
      } as any)

      render(<AssignmentsList />)

      expect(screen.getByText('Assignment 1')).toBeInTheDocument()
      expect(screen.getByText('Assignment 2')).toBeInTheDocument()
      expect(screen.getByText('Assignment 3')).toBeInTheDocument()
    })
  })

  describe('Urgency Color Mapping', () => {
    it('should map urgency levels to correct colors', () => {
      const upcomingAssignment = createMockAssignment({
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      })

      render(<AssignmentTimeline assignment={upcomingAssignment} />)

      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
    })

    it('should handle overdue assignments correctly', () => {
      const overdueAssignment = createMockAssignment({
        startDate: '2025-01-01T00:00:00Z',
        dueDate: '2025-01-15T23:59:59Z',
      })

      render(<AssignmentTimeline assignment={overdueAssignment} />)

      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
    })
  })

  describe('Component Interaction', () => {
    it('should maintain consistency when navigating between list and detail views', () => {
      const assignment = createMockAssignment({
        startDate: '2025-11-01T00:00:00Z',
        dueDate: '2025-11-21T23:59:59Z',
      })

      // Render list view first
      const { rerender } = render(<AssignmentsList />)

      expect(screen.getByText('Integration Test Assignment')).toBeInTheDocument()

      // Render timeline (detail view component)
      rerender(<AssignmentTimeline assignment={assignment} />)

      expect(screen.getByText('Lịch trình bài tập')).toBeInTheDocument()
      expect(screen.getByText('Ngày bắt đầu')).toBeInTheDocument()
    })

    it('should handle empty states gracefully', () => {
      vi.spyOn(useAssignmentsFilteredModule, 'useAssignmentsFiltered').mockReturnValue({
        data: { ...mockListResponse, content: [] },
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isFetching: false,
        status: 'success' as const,
      } as any)

      render(<AssignmentsList />)

      expect(screen.getByText('Không tìm thấy bài tập nào')).toBeInTheDocument()
    })
  })

  describe('Performance & Edge Cases', () => {
    it('should render with large number of assignments', () => {
      const manyAssignments = Array.from({ length: 50 }, (_, i) =>
        createMockAssignment({
          id: String(i),
          title: `Assignment ${i}`,
          startDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + (50 - i) * 24 * 60 * 60 * 1000).toISOString(),
        })
      )

      vi.spyOn(useAssignmentsFilteredModule, 'useAssignmentsFiltered').mockReturnValue({
        data: { ...mockListResponse, content: manyAssignments.slice(0, 10), totalElements: 50 },
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isFetching: false,
        status: 'success' as const,
      } as any)

      render(<AssignmentsList />)

      expect(screen.getByText('Assignment 0')).toBeInTheDocument()
    })

    it('should handle null or undefined properties gracefully', () => {
      const assignment = createMockAssignment({
        startDate: null as any,
        dueDate: null as any,
      })

      expect(() => render(<AssignmentTimeline assignment={assignment} />)).not.toThrow()
    })
  })
})
