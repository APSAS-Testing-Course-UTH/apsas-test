/**
 * Submissions Feature - Schemas
 * ============================
 * 
 * Centralized validation schemas for submission feature
 * using Zod with Vietnamese error messages
 */

export {
  submissionSchema,
  validateSubmission,
  validateSubmissionAsync,
  validateField,
  validateCode,
  validateLanguage,
  validateAssignmentId,
  TEST_CASES,
  type SubmissionInput,
} from './submissionSchema'
