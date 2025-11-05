import { http, HttpResponse } from 'msw'
import type { EvaluationServiceRuntimeResponse } from '@/api/types.gen'
import { withAuth } from '../middleware/withAuth'
import { MSW_BASE_URL } from '../config'
// import { errorResponses } from '../middleware/errorHandler'

console.log('[Evaluation Handlers] Using base URL:', MSW_BASE_URL)

// Mock evaluation data by submission ID
const mockEvaluations: Record<string, any> = {}

// Helper to calculate score from test results
const calculateScore = (testResults: any[]): number => {
  if (testResults.length === 0) return 0
  const passedCount = testResults.filter((t) => t.passed).length
  return Math.round((passedCount / testResults.length) * 100)
}

// Helper to generate test case results
const generateTestResults = (_assignmentId: string, _submissionId: string) => {
  return [
    {
      order: 1,
      description: 'Test case 1: Basic functionality',
      hidden: false,
      weight: 1.0,
      input: 'input_1',
      output: 'expected_output_1',
      passed: Math.random() > 0.2, // 80% pass rate
      actualOutput: 'expected_output_1',
      executionTime: Math.random() * 100,
      memoryUsed: Math.random() * 50,
    },
    {
      order: 2,
      description: 'Test case 2: Edge cases',
      hidden: false,
      weight: 1.0,
      input: 'edge_case_input',
      output: 'expected_edge_output',
      passed: Math.random() > 0.3, // 70% pass rate
      actualOutput: 'expected_edge_output',
      executionTime: Math.random() * 100,
      memoryUsed: Math.random() * 50,
    },
    {
      order: 3,
      description: 'Hidden test case (not visible)',
      hidden: true,
      weight: 2.0,
      input: 'hidden_input',
      output: 'hidden_output',
      passed: Math.random() > 0.4, // 60% pass rate
      actualOutput: 'hidden_output',
      executionTime: Math.random() * 100,
      memoryUsed: Math.random() * 50,
    },
  ]
}

export const evaluationHandlers = [
  /**
   * GET /api/v1/runtimes
   * Get supported programming language runtimes
   * No authentication required - public endpoint
   * SDK calls /api/v1/runtimes (not /api/v1/evaluation/runtimes)
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

  /**
   * GET /api/v1/evaluations/{submissionId}
   * Get evaluation results for a submission
   * Students can see only their own evaluations
   */
  http.get(`/api/v1/evaluations/:submissionId`,
    withAuth(({ params }: { params: { submissionId: string } }) => {
      const { submissionId } = params

      // Check if evaluation exists
      if (!mockEvaluations[submissionId]) {
        // Simulate evaluation if not found - generate mock results
        const testResults = generateTestResults('assign-001', submissionId)
        const score = calculateScore(testResults)
        const result = testResults.some((t) => !t.passed)
          ? 'FAILED'
          : testResults.every((t) => t.passed)
            ? 'PASSED'
            : 'PARTIAL'

        mockEvaluations[submissionId] = {
          submissionId,
          status: 'EVALUATED',
          result,
          score,
          testCaseResults: testResults,
          evaluatedAt: new Date().toISOString(),
          feedback: 'Good attempt! Check the failing test cases above.',
        }
      }

      return HttpResponse.json(mockEvaluations[submissionId], { status: 200 })
    })
  ),

  /**
   * GET /api/v1/analytics/student/performance
   * Get student performance statistics
   * Authenticated students only
   */
  http.get(`/api/v1/analytics/student/performance`,
    withAuth(() => {
      const performance = {
        totalAssignments: 12,
        completedAssignments: 8,
        averageScore: 78.5,
        scoreByDifficulty: {
          easy: 95,
          medium: 78,
          hard: 62,
        },
        recentSubmissions: [
          {
            assignmentId: 'assign-001',
            title: 'Calculator',
            score: 100,
            date: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            assignmentId: 'assign-002',
            title: 'String Manipulation',
            score: 65,
            date: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
        skillsProgress: {
          'JavaScript Functions': 85,
          'Python List Comprehensions': 72,
          'Array Algorithms': 68,
          'Object Oriented Design': 45,
        },
      }

      return HttpResponse.json(performance, { status: 200 })
    })
  ),

  /**
   * GET /api/v1/grades/student/summary
   * Get student grades summary
   * Authenticated students only
   */
  http.get(`/api/v1/grades/student/summary`,
    withAuth(() => {
      const summary = {
        currentGPA: 3.2,
        currentGrade: 'B',
        coursePercentage: 78.5,
        trend: 'improving',
        nextMilestone: {
          grade: 'B+',
          requiredPercentage: 85,
          currentPercentage: 78.5,
          pointsNeeded: 6.5,
        },
        gradeDistribution: {
          A: 0,
          'B+': 0,
          B: 8,
          'C+': 3,
          C: 1,
          F: 0,
        },
      }

      return HttpResponse.json(summary, { status: 200 })
    })
  ),

  /**
   * GET /api/v1/analytics/assignments/{id}/class-stats
   * Get class statistics for an assignment (Instructor only)
   */
  http.get(`/api/v1/analytics/assignments/:assignmentId/class-stats`,
    withAuth(({ params }: { params: { assignmentId: string } }) => {
      const { assignmentId } = params

      const stats = {
        assignmentId,
        assignmentTitle: 'Build a Calculator',
        totalSubmissions: 45,
        totalStudents: 50,
        submissionRate: 0.9,
        averageScore: 72.3,
        medianScore: 75,
        minScore: 0,
        maxScore: 100,
        scoreDistribution: {
          excellent: 12, // 90-100
          good: 18, // 75-89
          average: 10, // 60-74
          poor: 5, // <60
        },
        commonErrors: [
          {
            type: 'TIMEOUT',
            count: 8,
            percentage: 17.8,
          },
          {
            type: 'WRONG_OUTPUT',
            count: 12,
            percentage: 26.7,
          },
          {
            type: 'COMPILATION_ERROR',
            count: 5,
            percentage: 11.1,
          },
        ],
        averageSubmissionTime: 180, // minutes
        onTimeSubmissions: 42,
        lateSubmissions: 3,
      }

      return HttpResponse.json(stats, { status: 200 })
    })
  ),

  /**
   * GET /api/v1/submissions/{id}/score
   * Get detailed score breakdown for a submission
   */
  http.get(`/api/v1/submissions/:submissionId/score`,
    withAuth(({ params }: { params: { submissionId: string } }) => {
      const { submissionId } = params

      // Get or generate evaluation for this submission
      if (!mockEvaluations[submissionId]) {
        const testResults = generateTestResults('assign-001', submissionId)
        const score = calculateScore(testResults)

        mockEvaluations[submissionId] = {
          submissionId,
          testCaseResults: testResults,
          score,
        }
      }

      const evaluation = mockEvaluations[submissionId]
      const testResults = evaluation.testCaseResults || []

      const scoreBreakdown = {
        submissionId,
        totalScore: evaluation.score || 0,
        maxScore: 100,
        percentage: evaluation.score || 0,
        breakdown: {
          testCases: {
            passed: testResults.filter((t: any) => t.passed).length,
            total: testResults.length,
            points: Math.round((testResults.filter((t: any) => t.passed).length / testResults.length) * 100),
          },
          codeQuality: {
            points: 0,
            feedback: 'Not yet evaluated',
          },
          efficiency: {
            points: 0,
            feedback: 'Not yet evaluated',
          },
          documentation: {
            points: 0,
            feedback: 'Not yet evaluated',
          },
        },
        evaluatedAt: new Date().toISOString(),
      }

      return HttpResponse.json(scoreBreakdown, { status: 200 })
    })
  ),
]
