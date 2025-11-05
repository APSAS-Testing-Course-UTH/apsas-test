import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { TestCaseResults } from './TestCaseResults'
import type { SubmissionServiceTestCaseResultResponse } from '@/api/types.gen'

// Test wrapper with MantineProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <MantineProvider>{children}</MantineProvider>
}

describe('TestCaseResults', () => {
  const mockTestCases: SubmissionServiceTestCaseResultResponse[] = [
    {
      order: 1,
      description: 'Test case 1: Basic input',
      hidden: false,
      weight: 10,
      input: '5',
      output: '120',
      passed: true,
      actualOutput: '120',
      executionTime: 45,
      memoryUsed: 102400, // 100 KB
    },
    {
      order: 2,
      description: 'Test case 2: Edge case',
      hidden: false,
      weight: 10,
      input: '0',
      output: '1',
      passed: true,
      actualOutput: '1',
      executionTime: 32,
      memoryUsed: 98304, // 96 KB
    },
    {
      order: 3,
      description: 'Test case 3: Large input',
      hidden: false,
      weight: 15,
      input: '10',
      output: '3628800',
      passed: false,
      actualOutput: '362880',
      errorMessage: 'Wrong answer',
      executionTime: 120,
      memoryUsed: 204800, // 200 KB
    },
    {
      order: 4,
      description: 'Test case 4: Hidden test',
      hidden: true,
      weight: 20,
      input: '15',
      output: '1307674368000',
      passed: true,
      actualOutput: '1307674368000',
      executionTime: 200,
      memoryUsed: 512000, // 500 KB
    },
  ]

  describe('Empty State', () => {
    it('should render empty state when no test cases', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={[]} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Không có kết quả test nào')).toBeInTheDocument()
    })

    it('should not render table when no test cases', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={[]} />
        </TestWrapper>
      )
      
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('Table Display', () => {
    it('should render table with test cases', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('should render Vietnamese table headers', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      expect(screen.getByText('STT')).toBeInTheDocument()
      expect(screen.getByText('Mô tả')).toBeInTheDocument()
      expect(screen.getByText('Trạng thái')).toBeInTheDocument()
      expect(screen.getByText('Thời gian')).toBeInTheDocument()
      expect(screen.getByText('Bộ nhớ')).toBeInTheDocument()
      expect(screen.getByText('Hành động')).toBeInTheDocument()
    })

    it('should render all visible test cases', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Test case 1: Basic input')).toBeInTheDocument()
      expect(screen.getByText('Test case 2: Edge case')).toBeInTheDocument()
      expect(screen.getByText('Test case 3: Large input')).toBeInTheDocument()
    })

    it('should not render hidden test case details by default', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      expect(screen.queryByText('Test case 4: Hidden test')).not.toBeInTheDocument()
    })
  })

  describe('Status Badges', () => {
    it('should display passed badge for passed tests', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      const passedBadges = screen.getAllByText('Đạt')
      expect(passedBadges).toHaveLength(2) // Test case 1 and 2
    })

    it('should display failed badge for failed tests', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Không đạt')).toBeInTheDocument()
    })
  })

  describe('Execution Metrics', () => {
    it('should display execution time in milliseconds', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      expect(screen.getByText('45 ms')).toBeInTheDocument()
      expect(screen.getByText('32 ms')).toBeInTheDocument()
      expect(screen.getByText('120 ms')).toBeInTheDocument()
    })

    it('should display memory usage in KB', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      expect(screen.getByText('100.00 KB')).toBeInTheDocument()
      expect(screen.getByText('96.00 KB')).toBeInTheDocument()
      expect(screen.getByText('200.00 KB')).toBeInTheDocument()
    })

    it('should handle missing execution time', () => {
      const testCasesWithoutTime = [
        { ...mockTestCases[0], executionTime: undefined },
      ]
      render(
        <TestWrapper>
          <TestCaseResults testCases={testCasesWithoutTime} />
        </TestWrapper>
      )
      
      expect(screen.getByText('N/A')).toBeInTheDocument()
    })

    it('should handle missing memory usage', () => {
      const testCasesWithoutMemory = [
        { ...mockTestCases[0], memoryUsed: undefined },
      ]
      render(
        <TestWrapper>
          <TestCaseResults testCases={testCasesWithoutMemory} />
        </TestWrapper>
      )
      
      expect(screen.getByText('N/A')).toBeInTheDocument()
    })
  })

  describe('Expand/Collapse Details', () => {
    it('should show expand button for each test case', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      const expandButtons = screen.getAllByText('Xem chi tiết')
      expect(expandButtons.length).toBeGreaterThan(0)
    })

    it('should expand test case details on button click', async () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      const expandButton = screen.getAllByText('Xem chi tiết')[0]
      fireEvent.click(expandButton)
      
      await waitFor(() => {
        expect(screen.getByText('Đầu vào:')).toBeInTheDocument()
        expect(screen.getByText('Kết quả mong đợi:')).toBeInTheDocument()
        expect(screen.getByText('Kết quả thực tế:')).toBeInTheDocument()
      })
    })

    it('should display input/output when expanded', async () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      const expandButton = screen.getAllByText('Xem chi tiết')[0]
      fireEvent.click(expandButton)
      
      await waitFor(() => {
        const inputs = screen.getAllByText('5')
        const outputs = screen.getAllByText('120')
        expect(inputs.length).toBeGreaterThan(0)
        expect(outputs.length).toBeGreaterThan(0)
      })
    })

    it('should change button text when expanded', async () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      const expandButton = screen.getAllByText('Xem chi tiết')[0]
      fireEvent.click(expandButton)
      
      await waitFor(() => {
        expect(screen.getByText('Ẩn chi tiết')).toBeInTheDocument()
      })
    })

    it('should collapse details when clicking hide button', async () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      const expandButton = screen.getAllByText('Xem chi tiết')[0]
      fireEvent.click(expandButton)
      
      await waitFor(() => {
        expect(screen.getByText('Ẩn chi tiết')).toBeInTheDocument()
      })
      
      const collapseButton = screen.getByText('Ẩn chi tiết')
      fireEvent.click(collapseButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Đầu vào:')).not.toBeInTheDocument()
      })
    })

    it('should only expand one test case at a time', async () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      const expandButtons = screen.getAllByText('Xem chi tiết')
      
      // Expand first test case
      fireEvent.click(expandButtons[0])
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument()
      })
      
      // Expand second test case
      fireEvent.click(expandButtons[1])
      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument()
        expect(screen.queryByText('5')).not.toBeInTheDocument()
      })
    })
  })

  describe('Failed Test Details', () => {
    it('should display error message for failed tests', async () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      const expandButtons = screen.getAllByText('Xem chi tiết')
      fireEvent.click(expandButtons[2]) // Failed test
      
      await waitFor(() => {
        expect(screen.getByText(/Wrong answer/i)).toBeInTheDocument()
      })
    })

    it('should highlight differences between expected and actual output', async () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      const expandButtons = screen.getAllByText('Xem chi tiết')
      fireEvent.click(expandButtons[2]) // Failed test
      
      await waitFor(() => {
        expect(screen.getByText('3628800')).toBeInTheDocument()
        expect(screen.getByText('362880')).toBeInTheDocument()
      })
    })
  })

  describe('Hidden Tests', () => {
    it('should display hidden test count', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      expect(screen.getByText(/1 bài test ẩn/i)).toBeInTheDocument()
    })

    it('should not display hidden test details by default', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      expect(screen.queryByText('Test case 4: Hidden test')).not.toBeInTheDocument()
      expect(screen.queryByText('15')).not.toBeInTheDocument()
    })

    it('should display hidden tests when showHiddenTests prop is true', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} showHiddenTests={true} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Test case 4: Hidden test')).toBeInTheDocument()
    })

    it('should not show hidden test count when showHiddenTests is true', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} showHiddenTests={true} />
        </TestWrapper>
      )
      
      expect(screen.queryByText(/bài test ẩn/i)).not.toBeInTheDocument()
    })
  })

  describe('Vietnamese UI', () => {
    it('should display all UI labels in Vietnamese', () => {
      render(
        <TestWrapper>
          <TestCaseResults testCases={mockTestCases} />
        </TestWrapper>
      )
      
      expect(screen.getByText('STT')).toBeInTheDocument()
      expect(screen.getByText('Mô tả')).toBeInTheDocument()
      expect(screen.getByText('Trạng thái')).toBeInTheDocument()
      expect(screen.getByText('Thời gian')).toBeInTheDocument()
      expect(screen.getByText('Bộ nhớ')).toBeInTheDocument()
      expect(screen.getByText('Hành động')).toBeInTheDocument()
      expect(screen.getAllByText('Xem chi tiết').length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle test case with no description', () => {
      const testCaseNoDesc = [
        { ...mockTestCases[0], description: undefined },
      ]
      render(
        <TestWrapper>
          <TestCaseResults testCases={testCaseNoDesc} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Test case #1')).toBeInTheDocument()
    })

    it('should handle test case with no order', () => {
      const testCaseNoOrder = [
        { ...mockTestCases[0], order: undefined },
      ]
      render(
        <TestWrapper>
          <TestCaseResults testCases={testCaseNoOrder} />
        </TestWrapper>
      )
      
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('should handle very large memory usage in MB', () => {
      const testCaseLargeMemory = [
        { ...mockTestCases[0], memoryUsed: 5242880 }, // 5 MB
      ]
      render(
        <TestWrapper>
          <TestCaseResults testCases={testCaseLargeMemory} />
        </TestWrapper>
      )
      
      expect(screen.getByText('5.00 MB')).toBeInTheDocument()
    })

    it('should handle very long execution time in seconds', () => {
      const testCaseLongTime = [
        { ...mockTestCases[0], executionTime: 5000 }, // 5 seconds
      ]
      render(
        <TestWrapper>
          <TestCaseResults testCases={testCaseLongTime} />
        </TestWrapper>
      )
      
      expect(screen.getByText('5.00 s')).toBeInTheDocument()
    })
  })
})
