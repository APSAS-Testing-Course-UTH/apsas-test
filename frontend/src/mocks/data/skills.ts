/**
 * Mock Skills Data for Content Service
 *
 * Centralized source of truth for all skills mock data
 * Used by contentHandlers.ts via factory
 */

import type { ContentServiceSkillResponse } from '@/api/types.gen'

export const mockSkills: Record<string, ContentServiceSkillResponse> = {
  'skill-001': {
    id: 'skill-001',
    name: 'JavaScript Functions',
    description: 'Understanding and implementing functions in JavaScript',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  'skill-002': {
    id: 'skill-002',
    name: 'Python List Comprehensions',
    description: 'Mastering list comprehensions for efficient Python code',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
}

/**
 * Helper: Get all skills
 */
export function getAllSkills(): ContentServiceSkillResponse[] {
  return Object.values(mockSkills)
}

/**
 * Helper: Get skill by ID
 */
export function getSkillById(id: string): ContentServiceSkillResponse | undefined {
  return mockSkills[id]
}
