import { z } from 'zod'

/**
 * Submission Validation Schema (Phase 3.1)
 * ========================================
 * 
 * Comprehensive Zod validation schema for code submissions
 * with Vietnamese error messages and comprehensive coverage.
 * 
 * API Reference: POST /api/v1/submissions
 * Backend Schema: CreateSubmissionRequest {
 *   assignmentId: string (UUID)
 *   code: string (1+ chars, no max specified but form limit is 10,000)
 *   language: string (must be valid runtime language)
 * }
 */

/**
 * Base submission validation schema
 * 
 * Validates:
 * - assignmentId: Must be valid UUID format
 * - code: Must be 1-10,000 characters
 * - language: Must be non-empty string
 */
export const submissionSchema = z.object({
  assignmentId: z
    .string()
    .uuid('ID bài tập không hợp lệ')
    .describe('UUID của bài tập'),

  code: z
    .string('Mã không được để trống')
    .min(1, 'Mã không được để trống')
    .max(10000, 'Mã quá dài (tối đa 10,000 ký tự)')
    .transform((val) => val.trim())
    .refine(
      (val) => val.length > 0,
      'Mã phải chứa ít nhất một ký tự (không tính khoảng trắng)'
    )
    .describe('Mã nguồn của bài nộp'),

  language: z
    .string('Vui lòng chọn ngôn ngữ lập trình')
    .min(1, 'Vui lòng chọn ngôn ngữ lập trình')
    .describe('Ngôn ngữ lập trình'),
})

/**
 * Type inferred from schema
 * Use this in components/hooks instead of creating manual types
 */
export type SubmissionInput = z.infer<typeof submissionSchema>

/**
 * Safe parsing function with detailed error handling
 * 
 * Returns: { success: true; data } | { success: false; errors }
 * 
 * Example:
 * const result = validateSubmission(formData)
 * if (result.success) {
 *   await submitCode(result.data)
 * } else {
 *   displayErrors(result.errors)
 * }
 */
export function validateSubmission(data: unknown) {
  try {
    const validated = submissionSchema.parse(data)
    return { success: true as const, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert Zod error format to field -> message mapping
      const fieldErrors: Record<string, string> = {}
      error.issues.forEach((issue) => {
        const path = issue.path.join('.')
        fieldErrors[path] = issue.message
      })
      return { success: false as const, errors: fieldErrors }
    }
    return {
      success: false as const,
      errors: { general: 'Lỗi không xác định' },
    }
  }
}

/**
 * Safe async parsing function (recommended for React hooks)
 * 
 * Example:
 * try {
 *   const validated = await submissionSchema.parseAsync(data)
 *   await submitCode(validated)
 * } catch (error) {
 *   // Handle error
 * }
 */
export async function validateSubmissionAsync(data: unknown) {
  return await submissionSchema.parseAsync(data)
}

/**
 * Partial validation for specific fields
 * Useful for real-time validation as user types
 * 
 * Example:
 * validateField('code', inputValue)
 * validateField('language', selectedLanguage)
 */
export function validateField(
  field: keyof SubmissionInput,
  value: unknown
): string | undefined {
  const fieldSchema = submissionSchema.pick({ [field]: true })

  try {
    fieldSchema.parse({ [field]: value })
    return undefined // No error
  } catch (error) {
    if (error instanceof z.ZodError && error.issues.length > 0) {
      const firstIssue = error.issues[0]
      if (firstIssue && firstIssue.message) {
        return firstIssue.message
      }
    }
    return 'Lỗi xác thực'
  }
}

/**
 * Validation for code field specifically
 * Used for real-time code editor validation
 */
export function validateCode(code: unknown): string | undefined {
  return validateField('code', code)
}

/**
 * Validation for language field specifically
 * Used for language select validation
 */
export function validateLanguage(language: unknown): string | undefined {
  return validateField('language', language)
}

/**
 * Validation for assignment ID specifically
 */
export function validateAssignmentId(assignmentId: unknown): string | undefined {
  return validateField('assignmentId', assignmentId)
}

/**
 * Test validation with common invalid scenarios
 * (For debugging and testing)
 */
export const TEST_CASES = {
  valid: {
    assignmentId: '123e4567-e89b-12d3-a456-426614174000',
    code: 'console.log("hello")',
    language: 'javascript',
  },
  invalid: {
    emptyCode: {
      assignmentId: '123e4567-e89b-12d3-a456-426614174000',
      code: '',
      language: 'javascript',
      expectedError: 'Mã không được để trống',
    },
    whitespaceOnlyCode: {
      assignmentId: '123e4567-e89b-12d3-a456-426614174000',
      code: '   \n  \t  ',
      language: 'javascript',
      expectedError: 'Mã phải chứa ít nhất một ký tự',
    },
    codeTooLong: {
      assignmentId: '123e4567-e89b-12d3-a456-426614174000',
      code: 'x'.repeat(10001),
      language: 'javascript',
      expectedError: 'Mã quá dài',
    },
    invalidUuid: {
      assignmentId: 'not-a-uuid',
      code: 'console.log("test")',
      language: 'javascript',
      expectedError: 'ID bài tập không hợp lệ',
    },
    noLanguage: {
      assignmentId: '123e4567-e89b-12d3-a456-426614174000',
      code: 'print("hello")',
      language: '',
      expectedError: 'Vui lòng chọn ngôn ngữ',
    },
    missingAssignmentId: {
      code: 'console.log("test")',
      language: 'javascript',
      expectedError: 'Required',
    },
    missingCode: {
      assignmentId: '123e4567-e89b-12d3-a456-426614174000',
      language: 'javascript',
      expectedError: 'Required',
    },
    missingLanguage: {
      assignmentId: '123e4567-e89b-12d3-a456-426614174000',
      code: 'console.log("test")',
      expectedError: 'Required',
    },
  },
}
