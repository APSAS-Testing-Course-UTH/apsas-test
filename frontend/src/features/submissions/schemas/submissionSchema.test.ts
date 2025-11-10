import { describe, it, expect } from 'vitest'
import {
  submissionSchema,
  validateSubmission,
  validateSubmissionAsync,
  validateCode,
  validateLanguage,
  validateAssignmentId,
  TEST_CASES,
} from './submissionSchema'
import type { SubmissionInput } from './submissionSchema'

/**
 * Submission Schema Tests (Phase 3.1)
 * ===================================
 * 
 * Comprehensive test suite for submission validation
 * with Vietnamese error message verification
 * 
 * Test Coverage:
 * - 25+ test cases
 * - Valid scenarios
 * - Invalid scenarios
 * - Edge cases
 * - Vietnamese localization
 */

describe('submissionSchema', () => {
  describe('Valid Submissions', () => {
    it('should validate correct submission', () => {
      const result = submissionSchema.safeParse(TEST_CASES.valid)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.assignmentId).toBe(TEST_CASES.valid.assignmentId)
        expect(result.data.code).toBe(TEST_CASES.valid.code)
        expect(result.data.language).toBe(TEST_CASES.valid.language)
      }
    })

    it('should accept code with various characters', () => {
      const validCode = `
        function fibonacci(n) {
          if (n <= 1) return n
          return fibonacci(n - 1) + fibonacci(n - 2)
        }
        console.log(fibonacci(10))
      `
      const result = submissionSchema.safeParse({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: validCode,
        language: 'javascript',
      })
      expect(result.success).toBe(true)
    })

    it('should accept code with special characters', () => {
      const result = submissionSchema.safeParse({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: 'const regex = /[a-z]+/gi; const str = "Hello World!"',
        language: 'javascript',
      })
      expect(result.success).toBe(true)
    })

    it('should accept code at maximum length (10,000 chars)', () => {
      const result = submissionSchema.safeParse({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: 'x'.repeat(10000),
        language: 'python',
      })
      expect(result.success).toBe(true)
    })

    it('should accept single character code', () => {
      const result = submissionSchema.safeParse({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: 'x',
        language: 'java',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('Invalid Submissions - Code Field', () => {
    it('should reject empty code', () => {
      const result = submissionSchema.safeParse({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: '',
        language: 'javascript',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Mã không được để trống')
      }
    })

    it('should reject code with only whitespace', () => {
      const result = submissionSchema.safeParse(TEST_CASES.invalid.whitespaceOnlyCode)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Mã phải chứa ít nhất một ký tự'
        )
      }
    })

    it('should reject code exceeding 10,000 characters', () => {
      const result = submissionSchema.safeParse({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: 'x'.repeat(10001),
        language: 'javascript',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Mã quá dài (tối đa 10,000 ký tự)'
        )
      }
    })

    it('should show correct error message for null code', () => {
      const result = submissionSchema.safeParse({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: null,
        language: 'javascript',
      })
      expect(result.success).toBe(false)
    })

    it('should show correct error message for undefined code', () => {
      const result = submissionSchema.safeParse({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        language: 'javascript',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('Invalid Submissions - Language Field', () => {
    it('should reject empty language', () => {
      const result = submissionSchema.safeParse({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: 'console.log("test")',
        language: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Vui lòng chọn ngôn ngữ lập trình'
        )
      }
    })

    it('should reject null language', () => {
      const result = submissionSchema.safeParse({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: 'console.log("test")',
        language: null,
      })
      expect(result.success).toBe(false)
    })

    it('should reject undefined language', () => {
      const result = submissionSchema.safeParse({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: 'console.log("test")',
      })
      expect(result.success).toBe(false)
    })

    it('should accept language with various formats', () => {
      const languages = ['python', 'javascript', 'java', 'c++', 'rust']
      languages.forEach((lang) => {
        const result = submissionSchema.safeParse({
          assignmentId: '123e4567-e89b-12d3-a456-426614174000',
          code: 'test',
          language: lang,
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Invalid Submissions - Assignment ID Field', () => {
    it('should reject invalid UUID format', () => {
      const result = submissionSchema.safeParse({
        assignmentId: 'not-a-uuid',
        code: 'console.log("test")',
        language: 'javascript',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('ID bài tập không hợp lệ')
      }
    })

    it('should reject empty assignment ID', () => {
      const result = submissionSchema.safeParse({
        assignmentId: '',
        code: 'console.log("test")',
        language: 'javascript',
      })
      expect(result.success).toBe(false)
    })

    it('should reject null assignment ID', () => {
      const result = submissionSchema.safeParse({
        assignmentId: null,
        code: 'console.log("test")',
        language: 'javascript',
      })
      expect(result.success).toBe(false)
    })

    it('should reject undefined assignment ID', () => {
      const result = submissionSchema.safeParse({
        code: 'console.log("test")',
        language: 'javascript',
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid UUID formats', () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '00000000-0000-0000-0000-000000000000',
      ]
      validUuids.forEach((uuid) => {
        const result = submissionSchema.safeParse({
          assignmentId: uuid,
          code: 'test',
          language: 'python',
        })
        expect(result.success).toBe(true)
      })
    })

    it('should reject UUID with wrong format', () => {
      const invalidUuids = [
        '123e4567e89b12d3a456426614174000', // Missing hyphens
        '123e4567-e89b-12d3-a456-426614174', // Too short
        '123e4567-e89b-12d3-a456-4266141740000', // Too long
        '123e4567-e89b-12d3-a456-42661417400g', // Invalid character
      ]
      invalidUuids.forEach((uuid) => {
        const result = submissionSchema.safeParse({
          assignmentId: uuid,
          code: 'test',
          language: 'python',
        })
        expect(result.success).toBe(false)
      })
    })
  })

  describe('validateSubmission Function', () => {
    it('should return success object for valid data', () => {
      const result = validateSubmission(TEST_CASES.valid)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.code).toBe(TEST_CASES.valid.code)
      }
    })

    it('should return error object for invalid data', () => {
      const result = validateSubmission({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: '',
        language: 'javascript',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.code).toBeDefined()
        expect(result.errors.code).toBe('Mã không được để trống')
      }
    })

    it('should handle multiple field errors', () => {
      const result = validateSubmission({
        assignmentId: 'invalid-uuid',
        code: '',
        language: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(Object.keys(result.errors).length).toBeGreaterThan(0)
      }
    })

    it('should trim whitespace from code', () => {
      const result = validateSubmission({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: '  console.log("test")  ',
        language: 'javascript',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.code).toBe('console.log("test")')
      }
    })
  })

  describe('validateSubmissionAsync Function', () => {
    it('should validate correct submission asynchronously', async () => {
      const result = await validateSubmissionAsync(TEST_CASES.valid)
      expect(result.assignmentId).toBe(TEST_CASES.valid.assignmentId)
      expect(result.code).toBe(TEST_CASES.valid.code)
      expect(result.language).toBe(TEST_CASES.valid.language)
    })

    it('should throw error for invalid submission', async () => {
      await expect(
        validateSubmissionAsync({
          assignmentId: 'invalid',
          code: '',
          language: '',
        })
      ).rejects.toThrow()
    })
  })

  describe('validateField Function', () => {
    it('should validate code field individually', () => {
      const error = validateCode('')
      expect(error).toBe('Mã không được để trống')
    })

    it('should validate language field individually', () => {
      const error = validateLanguage('')
      expect(error).toBe('Vui lòng chọn ngôn ngữ lập trình')
    })

    it('should validate assignment ID field individually', () => {
      const error = validateAssignmentId('invalid-uuid')
      expect(error).toBe('ID bài tập không hợp lệ')
    })

    it('should return undefined for valid fields', () => {
      expect(validateCode('console.log("test")')).toBeUndefined()
      expect(validateLanguage('javascript')).toBeUndefined()
      expect(
        validateAssignmentId('123e4567-e89b-12d3-a456-426614174000')
      ).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle code with leading/trailing newlines', () => {
      const result = validateSubmission({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: '\n\nprint("test")\n\n',
        language: 'python',
      })
      expect(result.success).toBe(true)
    })

    it('should handle code with tabs and spaces', () => {
      const result = validateSubmission({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: '\tdef hello():\n\t\tprint("world")',
        language: 'python',
      })
      expect(result.success).toBe(true)
    })

    it('should handle very long language strings', () => {
      const result = validateSubmission({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: 'test',
        language: 'a'.repeat(100),
      })
      expect(result.success).toBe(true)
    })

    it('should handle extra fields in input (should be stripped)', () => {
      const result = validateSubmission({
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: 'test',
        language: 'python',
        extraField: 'should-be-removed',
        anotherField: 123,
      } as any)
      expect(result.success).toBe(true)
      if (result.success) {
        expect('extraField' in result.data).toBe(false)
        expect('anotherField' in result.data).toBe(false)
      }
    })
  })

  describe('Type Inference', () => {
    it('should correctly infer type from schema', () => {
      const submission: SubmissionInput = {
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        code: 'print("hello")',
        language: 'python',
      }
      expect(submission.assignmentId).toBeDefined()
      expect(submission.code).toBeDefined()
      expect(submission.language).toBeDefined()
    })
  })
})
