/**
 * Instructor Query Keys
 * 
 * Centralized query key factory for instructor features.
 * Consolidates keys from dashboard, feedback, chat, and assignments.
 * Follows TanStack Query best practices for hierarchical key structure.
 * 
 * @example
 * ```typescript
 * // Dashboard stats
 * useQuery({ queryKey: instructorKeys.dashboard.stats(), ... })
 * 
 * // Recent submissions
 * useQuery({ queryKey: instructorKeys.dashboard.recentSubmissions(), ... })
 * 
 * // Feedback stats
 * useQuery({ queryKey: instructorKeys.feedback.stats(), ... })
 * 
 * // Chat sessions
 * useQuery({ queryKey: instructorKeys.chat.sessions(), ... })
 * 
 * // Chat messages
 * useQuery({ queryKey: instructorKeys.chat.messages(sessionId), ... })
 * 
 * // Assignments
 * useQuery({ queryKey: instructorKeys.assignments.list({ page, size }), ... })
 * 
 * // Invalidate all dashboard data
 * queryClient.invalidateQueries({ queryKey: instructorKeys.dashboard.all() })
 * 
 * // Invalidate everything
 * queryClient.invalidateQueries({ queryKey: instructorKeys.all })
 * ```
 */

interface PaginationParams {
  page: number
  size: number
}

interface AssignmentListParams extends PaginationParams {
  sort?: string
}

export const instructorKeys = {
  all: ['instructor'] as const,
  
  // Dashboard
  dashboard: {
    all: () => [...instructorKeys.all, 'dashboard'] as const,
    stats: () => [...instructorKeys.dashboard.all(), 'stats'] as const,
    recentSubmissions: () => [...instructorKeys.dashboard.all(), 'recent-submissions'] as const,
    upcomingDeadlines: () => [...instructorKeys.dashboard.all(), 'upcoming-deadlines'] as const,
    analytics: () => [...instructorKeys.dashboard.all(), 'analytics'] as const,
  },
  
  // Feedback
  feedback: {
    all: () => [...instructorKeys.all, 'feedback'] as const,
    stats: () => [...instructorKeys.feedback.all(), 'stats'] as const,
    history: () => [...instructorKeys.feedback.all(), 'history'] as const,
  },
  
  // Chat
  chat: {
    all: () => [...instructorKeys.all, 'chat'] as const,
    sessions: () => [...instructorKeys.chat.all(), 'sessions'] as const,
    messages: (sessionId: string) => [...instructorKeys.chat.all(), 'messages', sessionId] as const,
  },
  
  // Assignments (instructor-specific)
  assignments: {
    all: () => [...instructorKeys.all, 'assignments'] as const,
    lists: () => [...instructorKeys.assignments.all(), 'list'] as const,
    list: (params: AssignmentListParams) => [...instructorKeys.assignments.lists(), params] as const,
    details: () => [...instructorKeys.assignments.all(), 'detail'] as const,
    detail: (id: string) => [...instructorKeys.assignments.details(), id] as const,
  },
  
  // Submissions (instructor view)
  submissions: {
    all: () => [...instructorKeys.all, 'submissions'] as const,
    lists: () => [...instructorKeys.submissions.all(), 'list'] as const,
    list: (params: { assignmentId?: string; page?: number; size?: number }) => 
      [...instructorKeys.submissions.lists(), params] as const,
    details: () => [...instructorKeys.submissions.all(), 'detail'] as const,
    detail: (id: string) => [...instructorKeys.submissions.details(), id] as const,
  },
}

// Legacy exports for backward compatibility (will be removed in next cleanup)
/** @deprecated Use instructorKeys.dashboard instead */
export const instructorDashboardKeys = instructorKeys.dashboard

/** @deprecated Use instructorKeys.assignments instead */
export const instructorAssignmentKeys = instructorKeys.assignments
