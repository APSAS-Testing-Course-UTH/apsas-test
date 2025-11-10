import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test-utils'
import { AdvancedFilter } from './AdvancedFilter'
import type { AssignmentFilterState, SubmissionFilterState } from '../hooks/useAdvancedFilter'

describe('AdvancedFilter Component', () => {
  let mockOnFilterChange: ReturnType<typeof vi.fn>
  let mockOnClear: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnFilterChange = vi.fn()
    mockOnClear = vi.fn()
  })

  describe('Rendering', () => {
    it('should render filter container with Vietnamese title', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="assignments"
        />
      )

      expect(screen.getByText('Bộ lọc nâng cao')).toBeInTheDocument()
    })

    it('should render search input with Vietnamese placeholder', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="assignments"
        />
      )

      expect(screen.getByPlaceholderText('Tìm kiếm...')).toBeInTheDocument()
    })

    it('should render all filter labels for assignments', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="assignments"
        />
      )

      expect(screen.getByText('Tìm kiếm')).toBeInTheDocument()
      expect(screen.getByText('Mức độ')).toBeInTheDocument()
      expect(screen.getByText('Trạng thái')).toBeInTheDocument()
    })

    it('should render Vietnamese clear filters button', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="assignments"
        />
      )

      expect(screen.getByRole('button', { name: /xóa bộ lọc/i })).toBeInTheDocument()
    })

    it('should not render difficulty field for submissions', () => {
      const filters: SubmissionFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="submissions"
        />
      )

      expect(screen.getByText('Tìm kiếm')).toBeInTheDocument()
      expect(screen.getByText('Trạng thái')).toBeInTheDocument()
      expect(screen.queryAllByText('Mức độ').length).toBe(0)
    })
  })

  describe('Search Functionality', () => {
    it('should display current search value in input', () => {
      const filters: AssignmentFilterState = { search: 'Java Programming' }

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="assignments"
        />
      )

      expect(screen.getByDisplayValue('Java Programming')).toBeInTheDocument()
    })

    it('should display empty input when search is not set', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="assignments"
        />
      )

      const searchInput = screen.getByPlaceholderText('Tìm kiếm...') as HTMLInputElement
      expect(searchInput.value).toBe('')
    })

    it('should call onFilterChange with search value', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="assignments"
        />
      )

      const searchInput = screen.getByPlaceholderText('Tìm kiếm...')
      fireEvent.change(searchInput, { target: { value: 'Test' } })

      expect(mockOnFilterChange).toHaveBeenCalledWith('search', 'Test')
    })
  })

  describe('Difficulty Filter (Assignments Only)', () => {
    it('should display difficulty filter label for assignments', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="assignments"
        />
      )

      expect(screen.getByText('Mức độ')).toBeInTheDocument()
    })

    it('should not display difficulty filter for submissions', () => {
      const filters: SubmissionFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="submissions"
        />
      )

      expect(screen.queryAllByText('Mức độ').length).toBe(0)
    })
  })

  describe('Status Filter', () => {
    it('should display status filter label', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="assignments"
        />
      )

      expect(screen.getByText('Trạng thái')).toBeInTheDocument()
    })

    it('should display status filter for submissions', () => {
      const filters: SubmissionFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="submissions"
        />
      )

      expect(screen.getByText('Trạng thái')).toBeInTheDocument()
    })
  })

  describe('Clear Filters Button', () => {
    it('should call onClear when clear button is clicked', () => {
      const filters: AssignmentFilterState = {
        search: 'Test',
        difficulty: 'HARD',
        status: 'PUBLISHED',
      }

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="assignments"
        />
      )

      const clearButton = screen.getByRole('button', { name: /xóa bộ lọc/i })
      fireEvent.click(clearButton)

      expect(mockOnClear).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when loading is true', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          isLoading={true}
          filterType="assignments"
        />
      )

      const clearButton = screen.getByRole('button', { name: /xóa bộ lọc/i })
      expect(clearButton).toBeDisabled()
    })

    it('should be enabled when loading is false', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          isLoading={false}
          filterType="assignments"
        />
      )

      const clearButton = screen.getByRole('button', { name: /xóa bộ lọc/i })
      expect(clearButton).not.toBeDisabled()
    })
  })

  describe('Loading State', () => {
    it('should disable search input when loading', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          isLoading={true}
          filterType="assignments"
        />
      )

      const searchInput = screen.getByPlaceholderText('Tìm kiếm...')
      expect(searchInput).toBeDisabled()
    })

    it('should enable search input when not loading', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          isLoading={false}
          filterType="assignments"
        />
      )

      const searchInput = screen.getByPlaceholderText('Tìm kiếm...')
      expect(searchInput).not.toBeDisabled()
    })
  })

  describe('Filter Combinations', () => {
    it('should support multiple active filters simultaneously', () => {
      const filters: AssignmentFilterState = {
        search: 'JavaScript',
        difficulty: 'MEDIUM',
        status: 'PUBLISHED',
      }

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="assignments"
        />
      )

      expect(screen.getByDisplayValue('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('Bộ lọc nâng cao')).toBeInTheDocument()
      expect(screen.getByText('Mức độ')).toBeInTheDocument()
      expect(screen.getByText('Trạng thái')).toBeInTheDocument()
    })
  })

  describe('Props Handling', () => {
    it('should accept empty filters object', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="assignments"
        />
      )

      expect(screen.getByPlaceholderText('Tìm kiếm...')).toBeInTheDocument()
    })

    it('should use assignments filter type by default', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByText('Mức độ')).toBeInTheDocument()
    })

    it('should support assignments filter type explicitly', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="assignments"
        />
      )

      expect(screen.getByText('Mức độ')).toBeInTheDocument()
    })

    it('should support submissions filter type', () => {
      const filters: SubmissionFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="submissions"
        />
      )

      expect(screen.getByText('Tìm kiếm')).toBeInTheDocument()
      expect(screen.getByText('Trạng thái')).toBeInTheDocument()
    })
  })

  describe('Vietnamese UI Compliance', () => {
    it('should display all Vietnamese labels', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="assignments"
        />
      )

      expect(screen.getByText('Bộ lọc nâng cao')).toBeInTheDocument() // Advanced Filter
      expect(screen.getByText('Tìm kiếm')).toBeInTheDocument() // Search
      expect(screen.getByText('Mức độ')).toBeInTheDocument() // Difficulty
      expect(screen.getByText('Trạng thái')).toBeInTheDocument() // Status
      expect(screen.getByRole('button', { name: /xóa bộ lọc/i })).toBeInTheDocument() // Clear Filter
    })

    it('should have Vietnamese placeholder text for search', () => {
      const filters: AssignmentFilterState = {}

      render(
        <AdvancedFilter
          filters={filters}
          onFilterChange={mockOnFilterChange}
          onClear={mockOnClear}
          filterType="assignments"
        />
      )

      expect(screen.getByPlaceholderText('Tìm kiếm...')).toBeInTheDocument()
    })
  })
})
