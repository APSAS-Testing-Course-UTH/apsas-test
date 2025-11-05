import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { usePerformanceData } from './usePerformanceData'

describe('usePerformanceData', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
  })

  // Test wrapper using createElement to avoid JSX parsing issues
  function wrapper({ children }: { children: ReactNode }) {
    const { createElement } = require('react')
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }

  it('should fetch performance data', async () => {
    const { result } = renderHook(() => usePerformanceData(), { wrapper })

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    // Wait for data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify data structure
    expect(result.current.stats).toBeDefined()
    expect(result.current.trendData).toBeDefined()
    expect(result.current.skillProgress).toBeDefined()
    expect(result.current.submissions).toBeDefined()
  })

  it('should calculate stats correctly', async () => {
    const { result } = renderHook(() => usePerformanceData(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const { stats } = result.current

    // Verify stats properties exist
    expect(stats.totalSubmissions).toBeGreaterThanOrEqual(0)
    expect(stats.passedSubmissions).toBeGreaterThanOrEqual(0)
    expect(stats.failedSubmissions).toBeGreaterThanOrEqual(0)
    expect(stats.successRate).toBeGreaterThanOrEqual(0)
    expect(stats.successRate).toBeLessThanOrEqual(100)
    expect(stats.averageScore).toBeGreaterThanOrEqual(0)
    expect(stats.averageScore).toBeLessThanOrEqual(100)
    expect(stats.totalSkillsAttempted).toBeGreaterThanOrEqual(0)
    expect(stats.skillsPassedCount).toBeGreaterThanOrEqual(0)
  })

  it('should return empty state when no submissions', async () => {
    const { result } = renderHook(() => usePerformanceData('nonexistent'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // When empty, stats should still be valid but zeroed
    const { stats } = result.current
    expect(stats.totalSubmissions).toBe(0)
    expect(stats.passedSubmissions).toBe(0)
    expect(stats.failedSubmissions).toBe(0)
    expect(stats.successRate).toBe(0)
  })

  it('should fetch student-specific performance data', async () => {
    const { result } = renderHook(() => usePerformanceData('student-001'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify we got data
    expect(result.current.submissions).toBeDefined()
    expect(Array.isArray(result.current.submissions)).toBe(true)
  })

  it('should create trend data from submissions', async () => {
    const { result } = renderHook(() => usePerformanceData(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const { trendData } = result.current

    // Each trend point should have required properties
    trendData.forEach((point) => {
      expect(point.date).toBeDefined()
      expect(point.score).toBeGreaterThanOrEqual(0)
      expect(['passed', 'failed']).toContain(point.status)
      expect(point.assignmentTitle).toBeDefined()
      expect(point.submissionId).toBeDefined()
    })
  })

  it('should calculate skill progress', async () => {
    const { result } = renderHook(() => usePerformanceData(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const { skillProgress } = result.current

    // Each skill should have progress metrics
    skillProgress.forEach((skill) => {
      expect(skill.skillId).toBeDefined()
      expect(skill.skillName).toBeDefined()
      expect(skill.attemptCount).toBeGreaterThanOrEqual(0)
      expect(skill.passCount).toBeGreaterThanOrEqual(0)
      expect(skill.progressPercentage).toBeGreaterThanOrEqual(0)
      expect(skill.progressPercentage).toBeLessThanOrEqual(100)
      // passCount should not exceed attemptCount
      expect(skill.passCount).toBeLessThanOrEqual(skill.attemptCount)
    })
  })
})
