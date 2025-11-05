/**
 * Performance API Hooks
 * 
 * Migration Note: These hooks now use the Submissions API instead of a dedicated Performance API.
 * The Performance Service was not implemented on the backend, so we reuse the Submissions API
 * to fetch and calculate performance metrics from student submissions.
 * 
 * Endpoints:
 * - GET /api/v1/submissions - Get student's submissions (paginated)
 */

import { useQuery } from '@tanstack/react-query';
import { submissionServiceGetAllSubmissions, contentServiceGetAllAssignments } from '@/api/sdk.gen';
import type { SubmissionServicePageResponseSubmissionResponse, ContentServiceAssignmentResponse } from '@/api/types.gen';

// Query keys for caching
export const performanceKeys = {
  all: ['performance'],
  overview: () => [...performanceKeys.all, 'overview'],
  history: () => [...performanceKeys.all, 'history'],
  historyPage: (page: number, size: number) => [
    ...performanceKeys.history(),
    { page, size },
  ],
};

/**
 * Calculate performance metrics from submissions
 * 
 * @param submissions - Array of submissions
 * @returns Object with calculated metrics
 */
function calculateMetrics(submissions: SubmissionServicePageResponseSubmissionResponse) {
  if (!submissions.content || submissions.content.length === 0) {
    return {
      totalSubmissions: 0,
      passedSubmissions: 0,
      failedSubmissions: 0,
      successRate: 0,
      averageScore: 0,
    };
  }

  const contents = submissions.content;
  const total = contents.length;
  const passed = contents.filter((s) => s.result === 'PASSED').length;
  const failed = contents.filter((s) => s.result === 'FAILED').length;
  const scores = contents
    .filter((s) => s.score !== undefined && s.score !== null)
    .map((s) => s.score as number);
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return {
    totalSubmissions: total,
    passedSubmissions: passed,
    failedSubmissions: failed,
    successRate: total > 0 ? (passed / total) * 100 : 0,
    averageScore: Math.round(averageScore * 100) / 100,
  };
}

/**
 * Fetch current student's performance overview
 * Returns key metrics like average score, pass rate, submission counts
 * This hook fetches the first page of submissions and calculates metrics.
 * Cached for 10 minutes to improve performance
 */
export function useStudentPerformance() {
  return useQuery({
    queryKey: performanceKeys.overview(),
    queryFn: async () => {
      const response = await submissionServiceGetAllSubmissions({
        query: {
          page: '0',
          size: '10',
        },
      });
      // Return metrics calculated from submissions data
      return calculateMetrics(response.data || { content: [] });
    },
    staleTime: 10 * 60 * 1000, // 10 minute cache
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    retry: 1,
  });
}

/**
 * Fetch current student's submission history (paginated)
 * Returns full page of submissions with pagination metadata
 * 
 * @param page - Page number (0-indexed, default 0)
 * @param size - Number of items per page (default 10, max 50)
 */
export function useStudentHistory(page = 0, size = 10) {
  return useQuery({
    queryKey: performanceKeys.historyPage(page, size),
    queryFn: async () => {
      const response = await submissionServiceGetAllSubmissions({
        query: {
          page: String(page),
          size: String(size),
        },
      });
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minute cache
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    retry: 1,
  });
}

/**
 * Fetch all assignments for mapping assignment IDs to names
 * Used by performance page to display assignment names instead of IDs
 */
export function useAllAssignments() {
  return useQuery({
    queryKey: [...performanceKeys.all, 'assignments'],
    queryFn: async () => {
      const response = await contentServiceGetAllAssignments({
        query: {
          page: '0',
          size: '100', // Fetch enough assignments to cover most cases
        },
      });
      return response.data?.content || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minute cache
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    retry: 1,
  });
}
