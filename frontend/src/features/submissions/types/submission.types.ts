/**
 * Submissions Feature - Types
 * ============================
 * Type definitions for submissions feature
 *
 * IMPORTANT: Use SubmissionServiceCreateSubmissionRequest and SubmissionServiceSubmissionResponse
 * from @/api/types.gen (auto-generated from OpenAPI spec) instead of custom types.
 *
 * These custom types are maintained for internal feature logic only.
 */

/**
 * Runtime - Programming language available on backend
 * 
 * Fetched from GET /api/v1/runtimes endpoint
 */
export interface Runtime {
  id: string;
  language: string;           // e.g., "python", "java", "javascript"
  version: string;             // e.g., "3.12.0"
  runtime: string;             // e.g., "CPython", "OpenJDK"
  aliases: string[];           // Alternative names
  compiled: boolean;           // Whether language requires compilation
  cpuTime: number;             // CPU time limit (seconds)
  timeout: number;             // Execution timeout (seconds)
}

/**
 * DEPRECATED: Use SubmissionServiceCreateSubmissionRequest from @/api/types.gen instead
 * 
 * This is what backend API expects:
 * {
 *   assignmentId: string   // UUID
 *   code: string           // Student's code
 *   language: string       // Language name
 * }
 *
 * Note: studentId is NOT sent in request (backend gets it from JWT token)
 */
export interface SubmissionData {
  assignmentId: string;
  code: string;
  language: string;
}

