/**
 * AssignmentDetail Component Tests
 * Proper Vitest approach with mocks at module scope
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'

// Must mock BEFORE importing the component
vi.mock('@tanstack/react-router', () => ({
  useParams: vi.fn(() => ({ id: '550e8400-e29b-41d4-a716-446655440000' })),
  useNavigate: vi.fn(() => vi.fn()),
}))

vi.mock('../api/useAssignmentDetailQuery', () => ({
  useAssignmentDetailQuery: vi.fn(),
  assignmentDetailKeys: {
    all: ['assignmentDetail'],
    detail: (id: string) => ['assignmentDetail', id],
  },
}))

import { AssignmentDetail } from './AssignmentDetail'
import { useAssignmentDetailQuery } from '../api/useAssignmentDetailQuery'

// Mock data matching API response structure
const mockAssignment: ContentServiceAssignmentResponse = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Build a Calculator',
  description: 'Create a simple calculator application that can perform basic arithmetic operations.',
  difficultyLevel: 'MEDIUM',
  maxScore: 100,
  status: 'PUBLISHED',
  dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  languages: ['javascript', 'python'],
  testCases: [
    {
      order: 1,
      description: 'Test addition: 2 + 3 = 5',
      hidden: false,
      weight: 1.0,
      input: '2+3',
      output: '5',
      timeout: 5000,
      memoryLimit: 128,
    },
    {
      order: 2,
      description: 'Test subtraction: 10 - 4 = 6',
      hidden: false,
      weight: 1.0,
      input: '10-4',
      output: '6',
      timeout: 5000,
      memoryLimit: 128,
    },
  ],
  skills: [
    {
      id: 'skill-001',
      name: 'JavaScript Functions',
      description: 'Understanding functions',
    },
  ],
  tutorials: [
    {
      id: 'tut-001',
      title: 'JavaScript Fundamentals',
      content: 'Learn JavaScript basics',
    },
  ],
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <MantineProvider>{children}</MantineProvider>
}

describe('AssignmentDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should display loading state initially', () => {
      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      })

      render(<AssignmentDetail />, { wrapper: TestWrapper })

      // Should show loading state
      expect(screen.queryByText(/Đang tải|Loading/i)).toBeInTheDocument()
    })
  })

  describe('Data Loading and Display', () => {
    beforeEach(() => {
      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: mockAssignment,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any)
    })

    it('should display assignment title', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      expect(screen.getByText('Build a Calculator')).toBeInTheDocument()
    })

    it('should display assignment description', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      expect(
        screen.getByText(/Create a simple calculator application/i)
      ).toBeInTheDocument()
    })

    it('should display assignment ID', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      expect(
        screen.getByText(/550e8400-e29b-41d4-a716-446655440000/i)
      ).toBeInTheDocument()
    })
  })

  describe('Metadata Display', () => {
    beforeEach(() => {
      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: mockAssignment,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any)
    })

    it('should display difficulty level in Vietnamese', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      // Vietnamese difficulty label
      expect(screen.getByText(/Độ khó|MEDIUM/i)).toBeInTheDocument()
    })

    it('should display max score', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      expect(screen.getByText(/100/)).toBeInTheDocument()
    })

    it('should display status badge', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      expect(screen.getByText(/PUBLISHED|Đã công bố/i)).toBeInTheDocument()
    })
  })

  describe('Vietnamese UI Labels', () => {
    beforeEach(() => {
      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: mockAssignment,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any)
    })

    it('should display Vietnamese labels for sections', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })

      // Check for Vietnamese section labels - use getAllByText since there are multiple
      const sectionLabels = screen.getAllByText(/Mô tả bài toán|Bộ kiểm tra|Kỹ năng|Tài liệu/i)
      expect(sectionLabels.length).toBeGreaterThan(0)
    })

    it('should display Vietnamese button labels', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })

      // Vietnamese button labels - check specifically, multiple "Nộp bài" buttons exist
      expect(screen.getByRole('button', { name: 'Quay lại danh sách' })).toBeInTheDocument()
      const submitButtons = screen.getAllByRole('button', { name: 'Nộp bài' })
      expect(submitButtons.length).toBeGreaterThan(0)
    })

    it('should use Vietnamese for metadata section', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })

      // Look for Vietnamese metadata labels - use getAllByText since there are multiple
      const metadataLabels = screen.getAllByText(/Độ khó|Điểm tối đa|Hạn chót|Trạng thái/i)
      expect(metadataLabels.length).toBeGreaterThan(0)
    })
  })

  describe('Test Cases Display', () => {
    beforeEach(() => {
      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: mockAssignment,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any)
    })

    it('should display test case section', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      const elements = screen.queryAllByText(/Bộ kiểm tra/i)
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should display test case descriptions', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      const elements = screen.queryAllByText(/Test addition|Test subtraction/i)
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should display test case details', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      // Input/output section - look for at least one
      const inputElements = screen.queryAllByText(/Dữ liệu đầu vào/i)
      const outputElements = screen.queryAllByText(/Kết quả mong đợi/i)
      expect(inputElements.length + outputElements.length).toBeGreaterThan(0)
    })
  })

  describe('Skills Display', () => {
    beforeEach(() => {
      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: mockAssignment,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any)
    })

    it('should display skills section', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      expect(screen.getByText(/Kỹ năng|Skills/i)).toBeInTheDocument()
    })

    it('should display skill names', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      expect(screen.getByText(/JavaScript Functions/i)).toBeInTheDocument()
    })
  })

  describe('Tutorials Display', () => {
    beforeEach(() => {
      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: mockAssignment,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any)
    })

    it('should display tutorials section', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      expect(screen.getByText(/Tài liệu học tập|Tutorial/i)).toBeInTheDocument()
    })

    it('should display tutorial titles', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      expect(screen.getByText(/JavaScript Fundamentals/i)).toBeInTheDocument()
    })
  })

  describe('Buttons and Navigation', () => {
    beforeEach(() => {
      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: mockAssignment,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any)
    })

    it('should display back button with Vietnamese label', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      const buttons = screen.getAllByRole('button', { name: /Quay lại/i })
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should display submit button with Vietnamese label', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      const buttons = screen.getAllByRole('button', { name: /Nộp bài/i })
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Languages Display', () => {
    beforeEach(() => {
      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: mockAssignment,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any)
    })

    it('should display supported languages', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })
      // Languages are shown in the languages section
      expect(screen.queryByText('javascript')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should display error message when API fails', () => {
      const mockError = new Error('API Error')
      ;(mockError as any).response = { status: 500 }

      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
        refetch: vi.fn(),
      } as any)

      render(<AssignmentDetail />, { wrapper: TestWrapper })

      // Should show error - find the specific error message
      expect(screen.queryByText('API Error')).toBeInTheDocument()
    })

    it('should display not found message on 404', () => {
      const mockError = new Error('Not Found')
      ;(mockError as any).response = { status: 404 }

      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
        refetch: vi.fn(),
      } as any)

      render(<AssignmentDetail />, { wrapper: TestWrapper })

      // Should show not found message
      expect(screen.getByText(/không tìm|not found|404/i)).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    beforeEach(() => {
      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: mockAssignment,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any)
    })

    it('should render all sections together', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })

      // All main sections should be present - use getAllByText for multiple matches
      expect(screen.getByText(/Build a Calculator/)).toBeInTheDocument()
      expect(screen.getAllByText(/Bộ kiểm tra/i)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Kỹ năng/i)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Tài liệu/i)[0]).toBeInTheDocument()
    })

    it('should render proper structure', () => {
      const { container } = render(<AssignmentDetail />, { wrapper: TestWrapper })

      // Should render in a container
      expect(container.querySelector('[class*="Container"]')).toBeInTheDocument()
    })

    it('should be consistent with Vietnamese UI', () => {
      render(<AssignmentDetail />, { wrapper: TestWrapper })

      // Multiple Vietnamese labels should be present
      const vietnameseElements = screen.queryAllByText(
        /Độ khó|Điểm tối đa|Bộ kiểm tra|Kỹ năng|Tài liệu|Quay lại|Nộp bài/i
      )
      expect(vietnameseElements.length).toBeGreaterThan(3)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty test cases gracefully', () => {
      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: { ...mockAssignment, testCases: [] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any)

      render(<AssignmentDetail />, { wrapper: TestWrapper })

      // Should still render without crashing
      expect(screen.getByText(/Build a Calculator/)).toBeInTheDocument()
    })

    it('should handle empty skills gracefully', () => {
      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: { ...mockAssignment, skills: [] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any)

      render(<AssignmentDetail />, { wrapper: TestWrapper })

      // Should still render without crashing
      expect(screen.getByText(/Build a Calculator/)).toBeInTheDocument()
    })

    it('should handle empty tutorials gracefully', () => {
      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: { ...mockAssignment, tutorials: [] },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any)

      render(<AssignmentDetail />, { wrapper: TestWrapper })

      // Should still render without crashing
      expect(screen.getByText(/Build a Calculator/)).toBeInTheDocument()
    })

    it('should filter out hidden test cases', () => {
      const assignmentWithHidden = {
        ...mockAssignment,
        testCases: [
          ...(mockAssignment.testCases || []),
          {
            order: 3,
            description: 'Hidden test case',
            hidden: true,
            weight: 1.0,
            input: 'hidden',
            output: 'hidden',
            timeout: 5000,
            memoryLimit: 128,
          },
        ],
      }

      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: assignmentWithHidden,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any)

      render(<AssignmentDetail />, { wrapper: TestWrapper })

      // Should not display hidden test case
      expect(screen.queryByText(/Hidden test case/)).not.toBeInTheDocument()
      // But should display visible ones
      expect(screen.getByText(/Test addition/)).toBeInTheDocument()
    })

    it('should render with different difficulty levels', () => {
      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: { ...mockAssignment, difficultyLevel: 'HARD' },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any)

      render(<AssignmentDetail />, { wrapper: TestWrapper })

      // Find the specific difficulty badge, not the label
      const difficultyBadge = screen.getByText('Khó')
      expect(difficultyBadge).toBeInTheDocument()
    })

    it('should render with different status values', () => {
      ;(useAssignmentDetailQuery as any).mockReturnValue({
        data: { ...mockAssignment, status: 'DRAFT' },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as any)

      render(<AssignmentDetail />, { wrapper: TestWrapper })

      expect(screen.queryByText(/DRAFT|Bản nháp/i)).toBeInTheDocument()
    })
  })
})
