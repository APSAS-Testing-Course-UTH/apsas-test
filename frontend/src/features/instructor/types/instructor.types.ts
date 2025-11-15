/**
 * Instructor Portal - TypeScript Types
 * 
 * Định nghĩa các kiểu dữ liệu cho Instructor Portal
 * Vietnamese: Các loại dữ liệu dành cho Bảng điều khiển Giảng viên
 */

/**
 * Dashboard Statistics for Instructor
 * Vietnamese: Thống kê bảng điều khiển
 */
export interface InstructorDashboardStats {
  activeAssignments: number;
  pendingEvaluations: number;
  totalStudents: number;
  completionRate: number; // 0-100%
  averageScore: number; // 0-100%
}

/**
 * Recent Submission Summary
 * Vietnamese: Tóm tắt bài nộp gần đây
 */
export interface RecentSubmissionSummary {
  submissionId: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: Date;
  status: 'PENDING' | 'EVALUATED' | 'RETURNED';
  score?: number;
}

/**
 * Upcoming Deadline
 * Vietnamese: Deadline sắp tới
 */
export interface UpcomingDeadline {
  assignmentId: string;
  assignmentTitle: string;
  dueDate: Date;
  daysRemaining: number;
  submissionCount: number;
  totalStudents: number;
}

/**
 * Instructor Quick Action
 * Vietnamese: Hành động nhanh của giảng viên
 */
export interface InstructorQuickAction {
  id: string;
  title: string; // Vietnamese title
  description?: string;
  icon: string;
  href: string;
  count?: number; // Badge count (e.g., pending evaluations)
}

/**
 * Dashboard Filter Options
 * Vietnamese: Tùy chọn lọc
 */
export interface DashboardFilterOptions {
  timeRange?: 'week' | 'month' | 'quarter';
  assignmentId?: string;
  classId?: string;
}

/**
 * Assignment Schedule Update
 * Vietnamese: Cập nhật lịch trình bài tập
 */
export interface AssignmentScheduleUpdate {
  assignmentId: string;
  startDate?: Date;
  dueDate?: Date;
  description?: string;
}

/**
 * Submission Filter for Instructor
 * Vietnamese: Bộ lọc bài nộp cho giảng viên
 */
export interface InstructorSubmissionFilter {
  assignmentId?: string;
  status?: 'PENDING' | 'EVALUATED' | 'FAILED';
  studentId?: string;
  sortBy?: 'submittedAt' | 'score' | 'studentName';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Code Submission Details (for viewing)
 * Vietnamese: Chi tiết bài nộp code
 */
export interface CodeSubmissionDetail {
  submissionId: string;
  studentId: string;
  studentName: string;
  assignmentId: string;
  assignmentTitle: string;
  language: string;
  code: string;
  submittedAt: Date;
  evaluationStatus: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  testResults?: {
    passed: number;
    total: number;
    details: Array<{
      testName: string;
      passed: boolean;
      expectedOutput?: string;
      actualOutput?: string;
    }>;
  };
  score?: number;
  feedback?: string;
}

/**
 * Feedback Form Data
 * Vietnamese: Dữ liệu biểu mẫu phản hồi
 */
export interface FeedbackFormData {
  submissionId: string;
  feedback: string; // Min: 10, Max: 5000 characters
  rating?: 'excellent' | 'good' | 'fair' | 'poor';
  suggestedImprovements?: string[];
}
