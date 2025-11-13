import { z } from 'zod'
import type { ContentServiceCreateAssignmentRequest, ContentServiceUpdateAssignmentRequest } from '@/api/types.gen'

/**
 * Test Case Schema - Nested validation for test cases
 * Mỗi test case cần: description, hidden, weight, input, output, timeout, memoryLimit
 */
export const testCaseSchema = z.object({
  order: z.number().int().positive('Thứ tự phải là số dương').optional(),
  description: z
    .string()
    .min(1, 'Mô tả test case bắt buộc')
    .max(500, 'Mô tả không được quá 500 ký tự'),
  hidden: z.boolean().default(false),
  weight: z.number().min(0, 'Trọng số không được âm').max(100, 'Trọng số không được vượt 100').default(1),
  input: z.string().min(1, 'Input bắt buộc'),
  output: z.string().min(1, 'Output bắt buộc'),
  timeout: z.number().int().positive('Timeout phải > 0').optional().default(5000),
  memoryLimit: z.number().int().positive('Memory limit phải > 0').optional().default(256),
})

export type TestCase = z.infer<typeof testCaseSchema>

/**
 * Assignment Form Schema - Base schema with all fields
 * Dùng cho cả create và update modes
 */
const assignmentFormBaseSchema = z.object({
  // Thông tin cơ bản
  title: z
    .string()
    .min(1, 'Tiêu đề bài tập bắt buộc')
    .max(255, 'Tiêu đề không được quá 255 ký tự'),

  description: z
    .string()
    .min(10, 'Mô tả phải có ít nhất 10 ký tự')
    .max(2000, 'Mô tả không được quá 2000 ký tự'),

  // Độ khó
  difficultyLevel: z
    .enum(['EASY', 'MEDIUM', 'HARD'])
    .refine(
      (val) => ['EASY', 'MEDIUM', 'HARD'].includes(val),
      'Độ khó phải là: Dễ, Trung bình hoặc Khó'
    ),

  // Ngôn ngữ lập trình (ít nhất 1)
  languages: z
    .array(z.string())
    .min(1, 'Phải chọn ít nhất 1 ngôn ngữ lập trình')
    .max(10, 'Tối đa 10 ngôn ngữ'),

  // Test cases (ít nhất 1)
  testCases: z
    .array(testCaseSchema)
    .min(1, 'Phải có ít nhất 1 test case')
    .max(50, 'Tối đa 50 test cases'),

  // Điểm tối đa
  maxScore: z
    .number()
    .int('Điểm tối đa phải là số nguyên')
    .min(1, 'Điểm tối đa phải >= 1')
    .max(1000, 'Điểm tối đa không được vượt 1000')
    .default(100),

  // Kỹ năng liên quan (tuỳ chọn)
  skillIds: z
    .array(z.string().uuid('ID kỹ năng không hợp lệ'))
    .optional()
    .default([]),

  // Hướng dẫn liên quan (tuỳ chọn)
  tutorialIds: z
    .array(z.string().uuid('ID hướng dẫn không hợp lệ'))
    .optional()
    .default([]),

  // Ngày bắt đầu (tuỳ chọn) - from HTML date input as YYYY-MM-DD string or Date object
  startDate: z
    .union([z.date(), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null
      if (typeof val === 'string') {
        // Don't transform string - return as-is so toISODateString can handle it
        return val || null
      }
      return val
    }),

  // Ngày kết thúc (tuỳ chọn) - from HTML date input as YYYY-MM-DD string or Date object
  dueDate: z
    .union([z.date(), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null
      if (typeof val === 'string') {
        // Don't transform string - return as-is so toISODateString can handle it
        return val || null
      }
      return val
    }),
})
  // Validation cross-field: dueDate > startDate
  .refine(
    (data) => {
      if (!data.startDate || !data.dueDate) return true
      return data.dueDate > data.startDate
    },
    {
      message: 'Ngày kết thúc phải sau ngày bắt đầu',
      path: ['dueDate'],
    }
  )

/**
 * Create Assignment Schema
 * Tất cả fields bắt buộc (dùng cho tạo bài tập mới)
 */
export const createAssignmentSchema = assignmentFormBaseSchema.strict()

export type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>

/**
 * Update Assignment Schema
 * Tất cả fields tuỳ chọn (dùng cho chỉnh sửa bài tập)
 */
export const updateAssignmentSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Tiêu đề bài tập bắt buộc')
      .max(255, 'Tiêu đề không được quá 255 ký tự')
      .optional(),

    description: z
      .string()
      .min(10, 'Mô tả phải có ít nhất 10 ký tự')
      .max(2000, 'Mô tả không được quá 2000 ký tự')
      .optional(),

    difficultyLevel: z
      .enum(['EASY', 'MEDIUM', 'HARD'])
      .optional(),

    languages: z
      .array(z.string())
      .min(1, 'Phải chọn ít nhất 1 ngôn ngữ lập trình')
      .max(10, 'Tối đa 10 ngôn ngữ')
      .optional(),

    testCases: z
      .array(testCaseSchema)
      .min(1, 'Phải có ít nhất 1 test case')
      .max(50, 'Tối đa 50 test cases')
      .optional(),

    maxScore: z
      .number()
      .int('Điểm tối đa phải là số nguyên')
      .min(1, 'Điểm tối đa phải >= 1')
      .max(1000, 'Điểm tối đa không được vượt 1000')
      .optional(),

    skillIds: z
      .array(z.string().uuid('ID kỹ năng không hợp lệ'))
      .optional(),

    tutorialIds: z
      .array(z.string().uuid('ID hướng dẫn không hợp lệ'))
      .optional(),

    startDate: z
      .union([z.date(), z.string()])
      .optional()
      .nullable()
      .transform((val) => {
        if (!val) return null
        if (typeof val === 'string') {
          // Don't transform string - return as-is so toISODateString can handle it
          return val || null
        }
        return val
      }),

    dueDate: z
      .union([z.date(), z.string()])
      .optional()
      .nullable()
      .transform((val) => {
        if (!val) return null
        if (typeof val === 'string') {
          // Don't transform string - return as-is so toISODateString can handle it
          return val || null
        }
        return val
      }),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.dueDate) return true
      return data.dueDate > data.startDate
    },
    {
      message: 'Ngày kết thúc phải sau ngày bắt đầu',
      path: ['dueDate'],
    }
  )
  .strict()

export type UpdateAssignmentFormData = z.infer<typeof updateAssignmentSchema>

/**
 * Helper: Get schema based on mode
 */
export const getAssignmentFormSchema = (mode: 'create' | 'edit') => {
  return mode === 'create' ? createAssignmentSchema : updateAssignmentSchema
}

/**
 * Helper: Type casting for API
 */
export const toCreateAssignmentRequest = (data: CreateAssignmentFormData): ContentServiceCreateAssignmentRequest => {
  // Helper to safely convert dates - handle both Date objects and ISO strings
  const toISODateString = (date: Date | string | null | undefined): string | undefined => {
    if (!date) return undefined
    let dateObj: Date
    
    if (typeof date === 'string') {
      // Convert YYYY-MM-DD to ISO 8601 datetime with time at midnight UTC
      // "2025-11-09" → "2025-11-09T00:00:00Z"
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return `${date}T00:00:00Z`
      }
      // Already ISO format, return as-is
      return date
    }
    
    // It's a Date object, convert to ISO string
    return (date as Date).toISOString()
  }

  return {
    title: data.title,
    description: data.description,
    difficultyLevel: data.difficultyLevel,
    languages: data.languages,
    testCases: data.testCases,
    maxScore: data.maxScore,
    skillIds: data.skillIds && data.skillIds.length > 0 ? data.skillIds : undefined,
    tutorialIds: data.tutorialIds && data.tutorialIds.length > 0 ? data.tutorialIds : undefined,
    startDate: toISODateString(data.startDate as any) as any,
    dueDate: toISODateString(data.dueDate as any) as any,
  }
}

export const toUpdateAssignmentRequest = (data: UpdateAssignmentFormData): ContentServiceUpdateAssignmentRequest => {
  // Helper to safely convert dates - handle both Date objects and ISO strings
  const toISODateString = (date: Date | string | null | undefined): string | undefined => {
    if (!date) return undefined
    let dateObj: Date
    
    if (typeof date === 'string') {
      // Convert YYYY-MM-DD to ISO 8601 datetime with time at midnight UTC
      // "2025-11-09" → "2025-11-09T00:00:00Z"
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return `${date}T00:00:00Z`
      }
      // Already ISO format, return as-is
      return date
    }
    
    // It's a Date object, convert to ISO string
    return (date as Date).toISOString()
  }

  return {
    title: data.title,
    description: data.description,
    difficultyLevel: data.difficultyLevel,
    languages: data.languages,
    testCases: data.testCases,
    maxScore: data.maxScore,
    skillIds: data.skillIds && data.skillIds.length > 0 ? data.skillIds : undefined,
    tutorialIds: data.tutorialIds && data.tutorialIds.length > 0 ? data.tutorialIds : undefined,
    startDate: toISODateString(data.startDate as any) as any,
    dueDate: toISODateString(data.dueDate as any) as any,
  }
}
