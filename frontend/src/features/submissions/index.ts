/**
 * Submissions Feature
 * ====================
 * Code submission, evaluation, and related features
 * 
 * Main Components:
 * - CodeSubmissionForm: Form for submitting code
 * - LanguageSelector: Runtime/language selection
 * - CodeDisplay: Read-only code display
 * - CodeSubmissionPage: Full page layout
 * - InstructorSubmissionsList: Submissions list for instructors
 * - ProvideFeedbackModal: Modal for providing feedback
 * - SubmissionDetailCard: Detailed submission information card
 * - TestCaseResults: Test case execution results display
 * 
 * Features:
 * - 50+ programming languages support
 * - Character counter and validation
 * - Auto-save to localStorage
 * - Copy to clipboard
 * - Real-time submission status
 * - Error handling and notifications
 * - Instructor feedback system
 * - Test case execution details
 */

// Instructor API Hooks
export { 
  useInstructorSubmissions,
  useInstructorSubmissionDetail,
  useProvideFeedback,
  instructorSubmissionKeys,
  useAssignmentSubmissions,
} from './api/useInstructorSubmissions'

// Instructor Components
export { InstructorSubmissionsList } from './components/InstructorSubmissionsList'
export { ProvideFeedbackModal } from './components/ProvideFeedbackModal'
export { SubmissionDetailCard } from './components/SubmissionDetailCard'
export { TestCaseResults } from './components/TestCaseResults'

