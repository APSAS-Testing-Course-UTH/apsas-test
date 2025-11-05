/**
 * Mock Tutorials Data for Content Service
 *
 * Centralized source of truth for all tutorial mock data
 * Used by contentHandlers.ts via factory
 */

import type { ContentServiceTutorialResponse } from '@/api/types.gen'

export const mockTutorials: Record<string, ContentServiceTutorialResponse> = {
  'tut-001': {
    id: 'tut-001',
    title: 'JavaScript Fundamentals',
    content: 'Learn the basics of JavaScript programming language including variables, functions, and control structures.',
    creatorId: 'provider-001',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    tags: ['javascript', 'beginner', 'fundamentals'],
  },
  'tut-002': {
    id: 'tut-002',
    title: 'Python Data Structures',
    content: 'Comprehensive guide to Python data structures including lists, dictionaries, sets, and tuples.',
    creatorId: 'provider-001',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    tags: ['python', 'data-structures', 'intermediate'],
  },
}

/**
 * Helper: Get all tutorials
 */
export function getAllTutorials(): ContentServiceTutorialResponse[] {
  return Object.values(mockTutorials)
}

/**
 * Helper: Get tutorial by ID
 */
export function getTutorialById(id: string): ContentServiceTutorialResponse | undefined {
  return mockTutorials[id]
}
