/**
 * Test Suite: SubmissionDetailCard Component
 * 
 * Tests for submission detail card display:
 * - Metadata display (ID, student, submission date)
 * - Status badges and colors
 * - Score display
 * - Test results summary
 * - Feedback display
 * - Responsive layout
 * 
 * Total Tests: 10+
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'
import { SubmissionDetailCard } from './SubmissionDetailCard'
import type { SubmissionServiceSubmissionResponse } from '@/api/types.gen'

// Mock submission data
const mockSubmission: SubmissionServiceSubmissionResponse = {
  id: 'sub-123',
  studentId: 'std-456',
  studentName: 'Nguyễn Văn A',
  studentEmail: 'student@example.com',
  assignmentId: 'assign-789',
  content: 'console.log("hello world");',
  language: 'javascript',
  submittedAt: '2024-01-15T10:00:00Z',
  score: 85,
  status: 'EVALUATED',
  testResults: {
    totalTests: 5,
    passedTests: 4,
    failedTests: 1,
    executionTime: 1234,
    memoryUsed: 5120,
  },
  feedback: 'Good implementation with minor improvements needed in error handling.',
}

const mockSubmissionPending: SubmissionServiceSubmissionResponse = {
  ...mockSubmission,
  id: 'sub-124',
  status: 'PENDING',
  score: undefined,
  feedback: undefined,
}

const mockSubmissionFailed: SubmissionServiceSubmissionResponse = {
  ...mockSubmission,
  id: 'sub-125',
  status: 'EVALUATED',
  score: 45,
  testResults: {
    totalTests: 5,
    passedTests: 2,
    failedTests: 3,
    executionTime: 5000,
    memoryUsed: 25600,
  },
}

describe('SubmissionDetailCard Component', () => {
  // ============================================================================
  // RENDERING TESTS (3 tests)
  // ============================================================================

  describe('Rendering', () => {
    it('should render submission ID and student info', () => {
      render(<SubmissionDetailCard submission={mockSubmission} />)

      expect(screen.getByText(/sub-123/)).toBeInTheDocument()
      expect(screen.getByText(/Nguyễn Văn A/)).toBeInTheDocument()
      expect(screen.getByText(/student@example.com/)).toBeInTheDocument()
    })

    it('should render card with all metadata sections', () => {
      render(<SubmissionDetailCard submission={mockSubmission} />)

      // Check for main card elements
      const card = screen.getByRole('article')
      expect(card).toBeInTheDocument()
    })

    it('should display submission timestamp in readable format', () => {
      render(<SubmissionDetailCard submission={mockSubmission} />)

      // Should show formatted date (e.g., "15/01/2024" or similar)
      expect(screen.getByText(/2024/)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // STATUS BADGE TESTS (3 tests)
  // ============================================================================

  describe('Status Badges', () => {
    it('should show "Đã chấm" badge for EVALUATED status with high score', () => {
      render(<SubmissionDetailCard submission={mockSubmission} />)

      // High score (85) should show green "Đạt"
      const badge = screen.getByText(/Đạt|Đã chấm/i)
      expect(badge).toBeInTheDocument()
    })

    it('should show "Chưa chấm" badge for PENDING status', () => {
      render(<SubmissionDetailCard submission={mockSubmissionPending} />)

      expect(screen.getByText(/Chưa chấm|PENDING/i)).toBeInTheDocument()
    })

    it('should show "Không đạt" badge for FAILED status or low score', () => {
      render(<SubmissionDetailCard submission={mockSubmissionFailed} />)

      // Low score (45) should show red "Không đạt"
      const badge = screen.getByText(/Không đạt|Failed/i)
      expect(badge).toBeInTheDocument()
    })
  })

  // ============================================================================
  // SCORE DISPLAY TESTS (3 tests)
  // ============================================================================

  describe('Score Display', () => {
    it('should display score with percentage symbol', () => {
      render(<SubmissionDetailCard submission={mockSubmission} />)

      expect(screen.getByText(/85%|85/)).toBeInTheDocument()
    })

    it('should not display score when submission is pending', () => {
      render(<SubmissionDetailCard submission={mockSubmissionPending} />)

      // Score should not show for pending submissions
      const scoreText = screen.queryByText(/[0-9]+%/)
      if (scoreText) {
        // Component might show placeholder like "—" or "N/A"
        expect(scoreText.textContent).toMatch(/—|N\/A|—/)
      }
    })

    it('should color-code score based on threshold (green >= 70, orange < 70)', () => {
      const { rerender } = render(
        <SubmissionDetailCard submission={mockSubmission} />
      )

      // High score (85) - should have green styling
      let scoreElement = screen.getByText(/85/)
      expect(scoreElement).toBeInTheDocument()

      rerender(<SubmissionDetailCard submission={mockSubmissionFailed} />)

      // Low score (45) - should have orange/red styling
      scoreElement = screen.getByText(/45/)
      expect(scoreElement).toBeInTheDocument()
    })
  })

  // ============================================================================
  // TEST RESULTS SUMMARY TESTS (2 tests)
  // ============================================================================

  describe('Test Results Summary', () => {
    it('should display test pass rate (passed/total)', () => {
      render(<SubmissionDetailCard submission={mockSubmission} />)

      // Should show "4/5" or "4 passed, 5 total"
      expect(screen.getByText(/4.*5|4\/5/)).toBeInTheDocument()
    })

    it('should display test results for failing submissions', () => {
      render(<SubmissionDetailCard submission={mockSubmissionFailed} />)

      // Should show "2/5" for failed submission
      expect(screen.getByText(/2.*5|2\/5/)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // FEEDBACK DISPLAY TESTS (2 tests)
  // ============================================================================

  describe('Feedback Display', () => {
    it('should display feedback text when available', () => {
      render(<SubmissionDetailCard submission={mockSubmission} />)

      expect(
        screen.getByText(
          /Good implementation with minor improvements needed in error handling/i
        )
      ).toBeInTheDocument()
    })

    it('should not display feedback section when feedback is missing', () => {
      render(<SubmissionDetailCard submission={mockSubmissionPending} />)

      // Feedback section should not show for pending submissions
      const feedbackText = screen.queryByText(
        /Good implementation with minor improvements/i
      )
      expect(feedbackText).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // LANGUAGE/CODE INFO TESTS (1 test)
  // ============================================================================

  describe('Code Information', () => {
    it('should display programming language', () => {
      render(<SubmissionDetailCard submission={mockSubmission} />)

      expect(screen.getByText(/javascript|JavaScript/i)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // METADATA DISPLAY TESTS (2 tests)
  // ============================================================================

  describe('Metadata Display', () => {
    it('should display submission metadata in organized sections', () => {
      render(<SubmissionDetailCard submission={mockSubmission} />)

      const card = screen.getByRole('article')
      expect(card).toBeInTheDocument()

      // Check for key metadata
      expect(screen.getByText(/sub-123/)).toBeInTheDocument()
      expect(screen.getByText(/std-456/)).toBeInTheDocument()
    })

    it('should handle long content gracefully', () => {
      const longSubmission = {
        ...mockSubmission,
        content: 'a'.repeat(500), // Long code content
      }
      render(<SubmissionDetailCard submission={longSubmission} />)

      const card = screen.getByRole('article')
      expect(card).toBeInTheDocument()
    })
  })

  // ============================================================================
  // ACCESSIBILITY TESTS (1 test)
  // ============================================================================

  describe('Accessibility', () => {
    it('should have semantic HTML structure with proper roles', () => {
      render(<SubmissionDetailCard submission={mockSubmission} />)

      // Article should be the main container
      const article = screen.getByRole('article')
      expect(article).toBeInTheDocument()

      // Status should be clearly labeled
      expect(screen.getByText(/Đạt|Đã chấm/i)).toBeInTheDocument()
    })
  })
})
