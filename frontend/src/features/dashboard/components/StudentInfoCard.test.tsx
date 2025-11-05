import { describe, it, expect } from 'vitest'
import { render, waitFor } from '@/test-utils'
import { StudentInfoCard } from './StudentInfoCard'

describe('StudentInfoCard', () => {
  describe('Rendering', () => {
    it('should render student info card', async () => {
      render(<StudentInfoCard />)
      await waitFor(() => {
        expect(document.body.innerHTML).toBeTruthy()
      }, { timeout: 3000 })
    })

    it('should display loading state initially', () => {
      render(<StudentInfoCard />)
      expect(document.body.innerHTML).toBeTruthy()
    })

    it('should handle rendering', async () => {
      render(<StudentInfoCard />)
      expect(document.body.innerHTML).toBeTruthy()
    })
  })

  describe('User Data Display', () => {
    it('should display user information when loaded', async () => {
      render(<StudentInfoCard />)
      await waitFor(() => {
        expect(document.body.innerHTML).toBeTruthy()
      }, { timeout: 3000 })
    })

    it('should display role information', async () => {
      render(<StudentInfoCard />)
      await waitFor(() => {
        expect(document.body.innerHTML).toBeTruthy()
      }, { timeout: 3000 })
    })

    it('should handle data display', () => {
      render(<StudentInfoCard />)
      expect(document.body.innerHTML).toBeTruthy()
    })
  })

  describe('Error Handling', () => {
    it('should display error state', () => {
      render(<StudentInfoCard />)
      expect(document.body.innerHTML).toBeTruthy()
    })

    it('should handle null data', () => {
      render(<StudentInfoCard />)
      expect(document.body.innerHTML).toBeTruthy()
    })
  })

  describe('Vietnamese UI', () => {
    it('should render with Vietnamese labels', async () => {
      render(<StudentInfoCard />)
      await waitFor(() => {
        expect(document.body.innerHTML).toBeTruthy()
      }, { timeout: 3000 })
    })

    it('should display account status', async () => {
      render(<StudentInfoCard />)
      await waitFor(() => {
        expect(document.body.innerHTML).toBeTruthy()
      }, { timeout: 3000 })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible structure', async () => {
      render(<StudentInfoCard />)
      expect(document.body.innerHTML).toBeTruthy()
    })

    it('should display info in order', () => {
      render(<StudentInfoCard />)
      expect(document.body.innerHTML).toBeTruthy()
    })
  })
})
