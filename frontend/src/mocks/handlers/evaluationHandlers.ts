import { http, HttpResponse } from 'msw'
import type { EvaluationServiceRuntimeResponse } from '@/api/types.gen'
import { MSW_BASE_URL } from '../config'

console.log('[Evaluation Handlers] Using base URL:', MSW_BASE_URL)

/**
 * Evaluation Service Handlers
 * 
 * ⚠️ CRITICAL: Chỉ mock endpoints có trong Backend OpenAPI spec!
 * Backend evaluation-service.json CHỈ CÓ 1 ENDPOINT: GET /api/v1/runtimes
 * 
 * ❌ REMOVED (vượt scope BE):
 * - GET /api/v1/evaluations/{submissionId} - Evaluation results
 * - GET /api/v1/analytics/student/performance - Student analytics
 * - GET /api/v1/grades/student/summary - Grade summaries
 * - GET /api/v1/analytics/assignments/{id}/class-stats - Class stats
 * - GET /api/v1/submissions/{id}/score - Submission scores
 * 
 * Backend chưa implement evaluation/grading/analytics system!
 */
export const evaluationHandlers = [
  /**
   * GET /api/v1/runtimes
   * Get supported programming language runtimes
   * ✅ MATCHES Backend OpenAPI spec
   * No authentication required - public endpoint
   */
  http.get(`${MSW_BASE_URL}/api/v1/runtimes`, () => {
    const runtimes: EvaluationServiceRuntimeResponse[] = [
      {
        language: 'javascript',
        version: '18.0.0',
        aliases: ['js', 'node'],
        runtime: 'Node.js',
      },
      {
        language: 'python',
        version: '3.11.0',
        aliases: ['py', 'python3'],
        runtime: 'CPython',
      },
      {
        language: 'java',
        version: '21.0.0',
        aliases: ['java', 'jdk'],
        runtime: 'OpenJDK',
      },
      {
        language: 'cpp',
        version: '17.0.0',
        aliases: ['c++', 'cpp'],
        runtime: 'GCC',
      },
      {
        language: 'typescript',
        version: '5.0.0',
        aliases: ['ts', 'typescript'],
        runtime: 'Node.js',
      },
    ]

    return HttpResponse.json(runtimes, { status: 200 })
  }),

  // ❌ REMOVED: 5 handlers vượt scope Backend
  // Backend chưa có evaluation/analytics/grading APIs
  // Khi Backend implement, sẽ thêm lại handlers theo đúng OpenAPI specs
]
