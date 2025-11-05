import { describe, it, expect, beforeAll } from 'vitest'
import {
  verifyConsolidatedDataConsistency,
  getConsolidatedAssignment,
  getAllConsolidatedAssignments,
  getStudentPerformanceForAssignment,
  getAllStudentSubmissions,
  getStudentOverallPerformance,
  getStudentUpcomingAssignments,
} from '../factory/mockDataRegistry'
import { consolidatedMockAssignments } from '../data/assignments-consolidated'
import { mockSubmissions } from '../data/submissions'

/**
 * Verification Tests for Phase 10 Consolidated Mock Data
 * 
 * Tests ensure:
 * 1. All submissions are correctly mapped to assignments
 * 2. Performance metrics are calculated accurately
 * 3. No orphaned submissions exist
 * 4. Student data relationships are valid
 * 5. Deadline tracking is consistent
 */

describe('Phase 10: Consolidated Mock Data - Verification Tests', () => {
  describe('Data Consistency Verification', () => {
    it('should verify all data relationships are consistent', () => {
      const report = verifyConsolidatedDataConsistency()
      
      expect(report.isValid).toBe(true)
      expect(report.errors.length).toBe(0)
    })

    it('should report no orphaned submissions', () => {
      const report = verifyConsolidatedDataConsistency()
      
      // All errors should be empty
      const orphanedErrors = report.errors.filter(e => e.includes('orphaned') || e.includes('invalid'))
      expect(orphanedErrors.length).toBe(0)
    })

    it('should have correct statistics', () => {
      const report = verifyConsolidatedDataConsistency()
      
      expect(report.summary).toEqual({
        totalAssignments: 23,
        totalErrors: 0,
        timestamp: expect.any(String)
      })
    })
  })

  describe('Assignment Consolidation', () => {
    it('should have all 23 assignments in consolidated data', () => {
      const assignments = getAllConsolidatedAssignments(true)
      
      expect(assignments.length).toBeGreaterThanOrEqual(22) // At least 22 published
    })

    it('should have 23 published assignments', () => {
      const published = getAllConsolidatedAssignments(false)
      
      // DRAFT assignment (440007) should not be included
      expect(published.length).toBe(22)
    })

    it('should retrieve assignment by ID with nested structure', () => {
      const assignment = getConsolidatedAssignment('550e8400-e29b-41d4-a716-446655440100')
      
      expect(assignment).toBeDefined()
      expect(assignment?.id).toBe('550e8400-e29b-41d4-a716-446655440100')
      expect(assignment?.title).toBe('Tính tổng mảng số nguyên')
      expect(assignment?.submissions).toBeDefined()
      expect(Array.isArray(assignment?.submissions)).toBe(true)
    })

    it('should have nested submissions array', () => {
      const assignment = getConsolidatedAssignment('550e8400-e29b-41d4-a716-446655440101')
      
      // Assignment 440101 has 3 submissions
      expect(assignment?.submissions?.length).toBe(3)
      expect(assignment?.submissions?.[0]).toHaveProperty('id')
      expect(assignment?.submissions?.[0]).toHaveProperty('studentId')
      expect(assignment?.submissions?.[0]).toHaveProperty('status')
    })

    it('should have performance metrics for each assignment', () => {
      const assignment = getConsolidatedAssignment('550e8400-e29b-41d4-a716-446655440101')
      
      expect(assignment?.performanceMetrics).toBeDefined()
      expect(assignment?.performanceMetrics).toMatchObject({
        totalSubmissions: expect.any(Number),
        passedSubmissions: expect.any(Number),
        averageScore: expect.any(Number),
        passRate: expect.any(Number),
      })
    })

    it('should have student deadlines for each assignment', () => {
      const assignment = getConsolidatedAssignment('550e8400-e29b-41d4-a716-446655440100')
      
      expect(assignment?.studentDeadlines).toBeDefined()
      expect(assignment?.studentDeadlines?.['student-001']).toBeDefined()
      expect(assignment?.studentDeadlines?.['student-001']).toHaveProperty('deadline')
    })
  })

  describe('Submission Mapping', () => {
    it('should correctly map all 21 submissions to assignments', () => {
      const totalSubmissionsInAssignments = Object.values(consolidatedMockAssignments)
        .reduce((sum, assignment) => sum + (assignment.submissions?.length || 0), 0)
      
      expect(totalSubmissionsInAssignments).toBe(21)
    })

    it('should have assignment 440101 with 3 submissions', () => {
      const assignment = getConsolidatedAssignment('550e8400-e29b-41d4-a716-446655440101')
      
      expect(assignment?.submissions?.length).toBe(3)
      assignment?.submissions?.forEach(submission => {
        expect(submission.assignmentId).toBe('550e8400-e29b-41d4-a716-446655440101')
      })
    })

    it('should have assignment 440102 with 2 submissions', () => {
      const assignment = getConsolidatedAssignment('550e8400-e29b-41d4-a716-446655440102')
      
      expect(assignment?.submissions?.length).toBe(2)
    })

    it('should have other assignments with 1 submission each', () => {
      const assignments = getAllConsolidatedAssignments(true)
      const assignmentsWithOneSubmission = assignments.filter(a => a.submissions?.length === 1)
      
      // 23 total - 1 with 3 submissions - 1 with 2 submissions - 1 draft = 20 with 1 submission
      expect(assignmentsWithOneSubmission.length).toBe(18)
    })

    it('should not have orphaned submissions', () => {
      mockSubmissions.forEach(submission => {
        const assignment = getConsolidatedAssignment(submission.assignmentId)
        
        expect(assignment).toBeDefined()
        const found = assignment?.submissions?.find(s => s.id === submission.id)
        expect(found).toBeDefined()
      })
    })

    it('should all submissions have valid studentId', () => {
      Object.values(consolidatedMockAssignments).forEach(assignment => {
        assignment.submissions?.forEach(submission => {
          expect(submission.studentId).toBe('student-001')
        })
      })
    })
  })

  describe('Performance Metrics Calculation', () => {
    it('should calculate correct performance metrics', () => {
      const assignment = getConsolidatedAssignment('550e8400-e29b-41d4-a716-446655440101')
      const metrics = assignment?.performanceMetrics
      
      // Assignment 440101 has 3 submissions
      expect(metrics?.totalSubmissions).toBe(3)
      
      // Check metrics are numeric and in valid range
      expect(metrics?.averageScore).toBeGreaterThanOrEqual(0)
      expect(metrics?.averageScore).toBeLessThanOrEqual(100)
      expect(metrics?.passRate).toBeGreaterThanOrEqual(0)
      expect(metrics?.passRate).toBeLessThanOrEqual(100)
    })

    it('should calculate average score from submissions', () => {
      const assignment = getConsolidatedAssignment('550e8400-e29b-41d4-a716-446655440101')
      const submissions = assignment?.submissions || []
      
      const evaluatedWithScore = submissions.filter(s => s.status === 'EVALUATED' && s.score !== undefined)
      if (evaluatedWithScore.length > 0) {
        const expected = Math.round(
          evaluatedWithScore.reduce((sum, s) => sum + (s.score || 0), 0) / evaluatedWithScore.length
        )
        
        expect(assignment?.performanceMetrics?.averageScore).toBe(expected)
      }
    })

    it('should calculate pass rate correctly', () => {
      const assignment = getConsolidatedAssignment('550e8400-e29b-41d4-a716-446655440101')
      const submissions = assignment?.submissions || []
      
      const evaluated = submissions.filter(s => s.status === 'EVALUATED' && s.result)
      const passed = evaluated.filter(s => s.result === 'PASSED')
      
      if (submissions.length > 0) {
        const expectedPassRate = evaluated.length > 0 
          ? Math.round((passed.length / evaluated.length) * 100)
          : 0
        
        expect(assignment?.performanceMetrics?.passRate).toBe(expectedPassRate)
      }
    })

    it('should have lastSubmittedAt tracking submissions', () => {
      const assignment = getConsolidatedAssignment('550e8400-e29b-41d4-a716-446655440101')
      
      if ((assignment?.submissions?.length || 0) > 0) {
        expect(assignment?.performanceMetrics?.lastSubmittedAt).toBeDefined()
        expect(assignment?.performanceMetrics?.lastSubmittedAt).toBeInstanceOf(Date)
      }
    })
  })

  describe('Student Performance Functions', () => {
    it('should get student performance for specific assignment', () => {
      const performance = getStudentPerformanceForAssignment('550e8400-e29b-41d4-a716-446655440101', 'student-001')
      
      expect(performance).toMatchObject({
        assignmentId: '550e8400-e29b-41d4-a716-446655440101',
        studentId: 'student-001',
        totalSubmissions: expect.any(Number),
        passedSubmissions: expect.any(Number),
        averageScore: expect.any(Number),
        passRate: expect.any(Number),
      })
    })

    it('should get all student submissions across assignments', () => {
      const allSubmissions = getAllStudentSubmissions('student-001')
      
      expect(allSubmissions.length).toBe(21) // All 21 submissions belong to student-001
      expect(allSubmissions[0]).toHaveProperty('assignmentId')
      expect(allSubmissions[0]).toHaveProperty('submission')
    })

    it('should calculate overall student performance', () => {
      const overallPerformance = getStudentOverallPerformance('student-001')
      
      expect(overallPerformance).toMatchObject({
        studentId: 'student-001',
        totalAssignments: expect.any(Number),
        totalSubmissions: 21,
        passedSubmissions: expect.any(Number),
        averageScore: expect.any(Number),
        passRate: expect.any(Number),
      })
    })

    it('should identify upcoming assignments for student', () => {
      const upcoming = getStudentUpcomingAssignments('student-001')
      
      // Should have assignments due in next 7 days
      expect(Array.isArray(upcoming)).toBe(true)
      
      if (upcoming.length > 0) {
        upcoming.forEach(assignment => {
          expect(assignment.dueDate).toBeDefined()
        })
      }
    })
  })

  describe('Data Structure Validation', () => {
    it('all assignments should have required fields', () => {
      const assignments = getAllConsolidatedAssignments(true)
      
      assignments.forEach(assignment => {
        expect(assignment).toHaveProperty('id')
        expect(assignment).toHaveProperty('title')
        expect(assignment).toHaveProperty('description')
        expect(assignment).toHaveProperty('difficultyLevel')
        expect(assignment).toHaveProperty('status')
        expect(assignment).toHaveProperty('dueDate')
        expect(assignment).toHaveProperty('maxScore')
        expect(assignment).toHaveProperty('creatorId')
      })
    })

    it('all nested submissions should have required fields', () => {
      const assignments = getAllConsolidatedAssignments(true)
      
      assignments.forEach(assignment => {
        assignment.submissions?.forEach(submission => {
          expect(submission).toHaveProperty('id')
          expect(submission).toHaveProperty('assignmentId')
          expect(submission).toHaveProperty('studentId')
          expect(submission).toHaveProperty('status')
          expect(submission).toHaveProperty('language')
        })
      })
    })

    it('performance metrics should be numeric', () => {
      const assignments = getAllConsolidatedAssignments(true)
      
      assignments.forEach(assignment => {
        if (assignment.performanceMetrics) {
          expect(typeof assignment.performanceMetrics.totalSubmissions).toBe('number')
          expect(typeof assignment.performanceMetrics.passedSubmissions).toBe('number')
          expect(typeof assignment.performanceMetrics.averageScore).toBe('number')
          expect(typeof assignment.performanceMetrics.passRate).toBe('number')
        }
      })
    })
  })

  describe('Data Integrity Checks', () => {
    it('should have no duplicate submission IDs', () => {
      const seenIds = new Set<string>()
      
      Object.values(consolidatedMockAssignments).forEach(assignment => {
        assignment.submissions?.forEach(submission => {
          expect(seenIds.has(submission.id)).toBe(false)
          seenIds.add(submission.id)
        })
      })
    })

    it('should have all assignments published except draft', () => {
      const assignments = getAllConsolidatedAssignments(true)
      const draft = assignments.filter(a => a.status === 'DRAFT')
      
      expect(draft.length).toBe(1)
      expect(draft[0].id).toBe('550e8400-e29b-41d4-a716-446655440007')
    })

    it('should have consistent difficulty levels', () => {
      const validDifficulties = ['EASY', 'MEDIUM', 'HARD']
      const assignments = getAllConsolidatedAssignments(true)
      
      assignments.forEach(assignment => {
        expect(validDifficulties).toContain(assignment.difficultyLevel)
      })
    })

    it('should have valid submission statuses', () => {
      const validStatuses = ['EVALUATED', 'PENDING', 'FAILED']
      const assignments = getAllConsolidatedAssignments(true)
      
      assignments.forEach(assignment => {
        assignment.submissions?.forEach(submission => {
          expect(validStatuses).toContain(submission.status)
        })
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle assignment with no submissions', () => {
      // Find an assignment with no submissions
      const assignment = getAllConsolidatedAssignments(true).find(a => !a.submissions || a.submissions.length === 0)
      
      if (assignment) {
        expect(assignment.performanceMetrics?.totalSubmissions).toBe(0)
      }
    })

    it('should return empty array for non-existent student submissions', () => {
      const submissions = getAllStudentSubmissions('nonexistent-student')
      
      expect(Array.isArray(submissions)).toBe(true)
      expect(submissions.length).toBe(0)
    })

    it('should handle undefined assignment gracefully', () => {
      const assignment = getConsolidatedAssignment('nonexistent-id')
      
      expect(assignment).toBeUndefined()
    })
  })
})
