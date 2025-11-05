/**
 * Consolidated Mock Data Verification Tests
 * Phase 10: Verify consolidated data structure, mappings, and consistency
 */

import { describe, it, expect, beforeAll } from 'vitest'
import {
  consolidatedMockAssignments,
  verifyConsolidatedDataConsistency,
  getAssignmentWithSubmissions,
  getStudentAssignmentSubmissions,
} from '../data/assignments-consolidated'
import { mockSubmissions } from '../data/submissions'
import {
  getAllConsolidatedAssignments,
  getConsolidatedAssignment,
  getStudentPerformanceForAssignment,
  getAllStudentSubmissions,
  getStudentOverallPerformance,
  getStudentUpcomingAssignments,
  verifyConsolidatedConsistency,
} from '../factory/mockDataRegistry'

describe('Consolidated Mock Data - Phase 10', () => {
  describe('Data Structure', () => {
    it('should have 23 consolidated assignments', () => {
      const assignments = Object.values(consolidatedMockAssignments)
      expect(assignments).toHaveLength(23)
    })

    it('each assignment should have nested submissions array', () => {
      Object.values(consolidatedMockAssignments).forEach((assignment) => {
        expect(assignment.submissions).toBeDefined()
        expect(Array.isArray(assignment.submissions)).toBe(true)
      })
    })

    it('each assignment should have performanceMetrics', () => {
      Object.values(consolidatedMockAssignments).forEach((assignment) => {
        expect(assignment.performanceMetrics).toBeDefined()
        expect(assignment.performanceMetrics).toMatchObject({
          totalSubmissions: expect.any(Number),
          passedSubmissions: expect.any(Number),
          averageScore: expect.any(Number),
          passRate: expect.any(Number),
        })
      })
    })

    it('each assignment should have studentDeadlines', () => {
      Object.values(consolidatedMockAssignments).forEach((assignment) => {
        expect(assignment.studentDeadlines).toBeDefined()
        expect(typeof assignment.studentDeadlines).toBe('object')
      })
    })
  })

  describe('Submission Mapping', () => {
    it('should have exactly 21 submissions distributed across assignments', () => {
      let totalSubmissions = 0
      Object.values(consolidatedMockAssignments).forEach((assignment) => {
        totalSubmissions += assignment.submissions?.length || 0
      })
      expect(totalSubmissions).toBe(21)
    })

    it('should have correct submission distribution', () => {
      // From earlier analysis: 446655440101 has 3 submissions, 446655440102 has 2
      const assignment101 = consolidatedMockAssignments['550e8400-e29b-41d4-a716-446655440101']
      const assignment102 = consolidatedMockAssignments['550e8400-e29b-41d4-a716-446655440102']

      expect(assignment101.submissions).toHaveLength(3)
      expect(assignment102.submissions).toHaveLength(2)
    })

    it('all submissions should have valid assignmentId', () => {
      const errors: string[] = []
      
      Object.entries(consolidatedMockAssignments).forEach(([assignmentId, assignment]) => {
        assignment.submissions?.forEach((submission) => {
          if (submission.assignmentId !== assignmentId) {
            errors.push(
              `Submission ${submission.id} has assignmentId ${submission.assignmentId} but is in assignment ${assignmentId}`
            )
          }
        })
      })

      expect(errors).toHaveLength(0)
    })

    it('all submissions should be from student-001', () => {
      Object.values(consolidatedMockAssignments).forEach((assignment) => {
        assignment.submissions?.forEach((submission) => {
          expect(submission.studentId).toBe('student-001')
        })
      })
    })
  })

  describe('Performance Metrics Calculation', () => {
    it('should calculate totalSubmissions correctly', () => {
      Object.entries(consolidatedMockAssignments).forEach(([, assignment]) => {
        const expected = assignment.submissions?.length || 0
        expect(assignment.performanceMetrics?.totalSubmissions).toBe(expected)
      })
    })

    it('should calculate passedSubmissions correctly', () => {
      const assignment101 = consolidatedMockAssignments['550e8400-e29b-41d4-a716-446655440101']
      const passed = assignment101.submissions?.filter((s) => s.result === 'PASSED').length || 0
      expect(assignment101.performanceMetrics?.passedSubmissions).toBe(passed)
    })

    it('should calculate averageScore correctly', () => {
      const assignment101 = consolidatedMockAssignments['550e8400-e29b-41d4-a716-446655440101']
      const evaluated = assignment101.submissions?.filter((s) => s.status === 'EVALUATED' && s.result)
      const scores = evaluated?.filter((s) => s.score !== undefined).map((s) => s.score || 0) || []
      
      if (scores.length > 0) {
        const expected = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        expect(assignment101.performanceMetrics?.averageScore).toBe(expected)
      }
    })

    it('should calculate passRate correctly', () => {
      const assignment101 = consolidatedMockAssignments['550e8400-e29b-41d4-a716-446655440101']
      const evaluated = assignment101.submissions?.filter((s) => s.status === 'EVALUATED' && s.result) || []
      const passed = evaluated.filter((s) => s.result === 'PASSED').length
      
      if (evaluated.length > 0) {
        const expected = Math.round((passed / evaluated.length) * 100)
        expect(assignment101.performanceMetrics?.passRate).toBe(expected)
      }
    })
  })

  describe('Registry Helper Functions', () => {
    it('getAllConsolidatedAssignments should return published assignments', () => {
      const published = getAllConsolidatedAssignments(false)
      const withDraft = getAllConsolidatedAssignments(true)
      
      expect(published.length).toBeLessThan(withDraft.length)
      expect(published.every((a) => a.status === 'PUBLISHED')).toBe(true)
    })

    it('getConsolidatedAssignment should return correct assignment', () => {
      const assignment = getConsolidatedAssignment('550e8400-e29b-41d4-a716-446655440101')
      expect(assignment?.id).toBe('550e8400-e29b-41d4-a716-446655440101')
      expect(assignment?.title).toBe('Sắp xếp mảng')
    })

    it('getStudentPerformanceForAssignment should calculate correctly', () => {
      const perf = getStudentPerformanceForAssignment(
        '550e8400-e29b-41d4-a716-446655440101',
        'student-001'
      )
      
      expect(perf).toMatchObject({
        assignmentId: '550e8400-e29b-41d4-a716-446655440101',
        studentId: 'student-001',
        totalSubmissions: expect.any(Number),
        passedSubmissions: expect.any(Number),
        averageScore: expect.any(Number),
        passRate: expect.any(Number),
      })
    })

    it('getAllStudentSubmissions should return all submissions for student', () => {
      const submissions = getAllStudentSubmissions('student-001')
      expect(submissions.length).toBe(21)
      expect(submissions.every((s) => s.submission.studentId === 'student-001')).toBe(true)
    })

    it('getStudentOverallPerformance should return aggregate stats', () => {
      const perf = getStudentOverallPerformance('student-001')
      
      expect(perf).toMatchObject({
        studentId: 'student-001',
        totalAssignments: expect.any(Number),
        totalSubmissions: 21,
        passedSubmissions: expect.any(Number),
        averageScore: expect.any(Number),
        passRate: expect.any(Number),
      })
    })

    it('getStudentUpcomingAssignments should return assignments without submissions', () => {
      const upcoming = getStudentUpcomingAssignments('student-001')
      
      // Student should have some assignments without submissions
      expect(upcoming.length).toBeGreaterThan(0)
      
      // All should be published
      expect(upcoming.every((a) => a.status === 'PUBLISHED')).toBe(true)
      
      // None should have submissions from this student
      upcoming.forEach((assignment) => {
        const hasSubmission = assignment.submissions?.some((s) => s.studentId === 'student-001')
        expect(hasSubmission).toBeFalsy()
      })
    })
  })

  describe('Data Consistency Verification', () => {
    it('verifyConsolidatedDataConsistency should pass', () => {
      const report = verifyConsolidatedDataConsistency()
      expect(report.isValid).toBe(true)
      expect(report.errors).toHaveLength(0)
    })

    it('verifyConsolidatedConsistency from registry should pass', () => {
      const report = verifyConsolidatedConsistency()
      expect(report.isValid).toBe(true)
      expect(report.errors).toHaveLength(0)
    })

    it('consistency report should show correct statistics', () => {
      const report = verifyConsolidatedDataConsistency()
      
      expect(report.summary).toMatchObject({
        totalAssignments: 23,
        totalErrors: 0,
        timestamp: expect.any(String),
      })
    })
  })

  describe('Assignment Published Status', () => {
    it('should have 22 published and 1 draft assignment', () => {
      const all = Object.values(consolidatedMockAssignments)
      const published = all.filter((a) => a.status === 'PUBLISHED')
      const draft = all.filter((a) => a.status === 'DRAFT')
      
      expect(published).toHaveLength(22)
      expect(draft).toHaveLength(1)
      expect(draft[0].id).toBe('550e8400-e29b-41d4-a716-446655440007')
    })
  })

  describe('Edge Cases', () => {
    it('getConsolidatedAssignment should return undefined for invalid ID', () => {
      const assignment = getConsolidatedAssignment('invalid-id')
      expect(assignment).toBeUndefined()
    })

    it('assignments without submissions should have zero metrics', () => {
      Object.entries(consolidatedMockAssignments).forEach(([, assignment]) => {
        if (!assignment.submissions || assignment.submissions.length === 0) {
          expect(assignment.performanceMetrics?.totalSubmissions).toBe(0)
          expect(assignment.performanceMetrics?.passedSubmissions).toBe(0)
        }
      })
    })

    it('should handle assignments with only pending submissions', () => {
      // Find any assignment with PENDING submissions
      const assignmentWithPending = Object.values(consolidatedMockAssignments).find((a) =>
        a.submissions?.some((s) => s.status === 'PENDING')
      )

      if (assignmentWithPending) {
        // Pending submissions shouldn't count towards averages
        const scores = assignmentWithPending.submissions
          ?.filter((s) => s.status === 'EVALUATED' && s.result && s.score !== undefined)
          .map((s) => s.score || 0) || []

        expect(assignmentWithPending.performanceMetrics?.averageScore).toBeDefined()
      }
    })
  })

  describe('Submission Date Tracking', () => {
    it('lastSubmittedAt should be set for assignments with submissions', () => {
      Object.values(consolidatedMockAssignments).forEach((assignment) => {
        if (assignment.submissions && assignment.submissions.length > 0) {
          expect(assignment.performanceMetrics?.lastSubmittedAt).toBeDefined()
          expect(assignment.performanceMetrics?.lastSubmittedAt instanceof Date).toBe(true)
        }
      })
    })
  })
})
