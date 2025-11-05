/**
 * Test file to verify mock data consistency
 * Run this to check for orphaned data and broken relationships
 */
import { describe, it, expect } from 'vitest'
import { verifyDataConsistency, MOCK_DATA } from './mockDataFactory'

describe('Mock Data Consistency', () => {
  it('should have no data consistency errors', () => {
    const result = verifyDataConsistency()
    
    console.log('🔍 Mock Data Consistency Check Results:')
    console.log(`✅ Valid: ${result.valid}`)
    console.log(`📊 Total Errors: ${result.errors.length}`)
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors Found:')
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
    } else {
      console.log('✅ All data relationships are valid!')
    }
    
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should have all required mock data', () => {
    expect(MOCK_DATA.users).toBeDefined()
    expect(MOCK_DATA.assignments).toBeDefined()
    expect(MOCK_DATA.submissions).toBeDefined()
    expect(MOCK_DATA.tokens).toBeDefined()
    
    console.log('\n📦 Mock Data Summary:')
    console.log(`👥 Users: ${Object.keys(MOCK_DATA.users).length}`)
    console.log(`📝 Assignments: ${Object.keys(MOCK_DATA.assignments).length}`)
    console.log(`📤 Submissions: ${MOCK_DATA.submissions.length}`)
  })

  it('should have valid user roles', () => {
    const users = Object.values(MOCK_DATA.users)
    const roles = users.map(u => u.role)
    
    // Mock roles are lowercase (admin, instructor, student, provider)
    expect(roles.length).toBeGreaterThan(0)
    expect(roles).toContain('admin')
    expect(roles).toContain('instructor')
    expect(roles).toContain('student')
    expect(roles).toContain('provider')
    
    console.log('\n👤 Users by Role:')
    const roleCount = roles.reduce((acc: Record<string, number>, role) => {
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {})
    
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`)
    })
  })

  it('should have assignments with required fields', () => {
    const assignments = Object.values(MOCK_DATA.assignments)
    
    assignments.forEach((assignment) => {
      expect(assignment.id).toBeDefined()
      expect(assignment.title).toBeDefined()
      expect(assignment.description).toBeDefined()
      expect(assignment.creatorId).toBeDefined()
      expect(assignment.difficultyLevel).toBeDefined()
      expect(assignment.status).toBeDefined()
    })
    
    console.log(`\n✅ All ${assignments.length} assignments have required fields`)
  })

  it('should have submissions with valid references', () => {
    const submissions = MOCK_DATA.submissions
    
    submissions.forEach((submission) => {
      expect(submission.id).toBeDefined()
      expect(submission.assignmentId).toBeDefined()
      expect(submission.studentId).toBeDefined()
      expect(submission.submittedAt).toBeDefined()
      expect(submission.status).toBeDefined()
    })
    
    console.log(`\n✅ All ${submissions.length} submissions have required fields`)
  })
})
