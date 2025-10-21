import { http, HttpResponse } from 'msw'
import type { EvaluationServiceRuntimeResponse } from '@/api/types.gen'

const BASE_URL = 'http://localhost:3000'

export const evaluationHandlers = [
  /**
   * GET /api/v1/runtimes
   * Get supported programming language runtimes
   * No authentication required - public endpoint
   */
  http.get(`${BASE_URL}/api/v1/runtimes`, () => {
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
]