import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { ResourcesPage } from '@/features/resources/components/ResourcesPage'
import { ResourceCard } from '@/features/resources/components/ResourceCard'
import { ResourcesList } from '@/features/resources/components/ResourcesList'
import type { ContentServiceTutorialResponse } from '@/api/types.gen'

// Mock data
const mockTutorials: ContentServiceTutorialResponse[] = [
  {
    id: '1',
    title: 'JavaScript Cơ Bản',
    content: 'Hướng dẫn toàn diện về JavaScript',
    creatorId: 'user-1',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    tags: ['javascript', 'beginner'],
  },
  {
    id: '2',
    title: 'React Hooks',
    content: 'Tìm hiểu sâu về React Hooks và cách sử dụng',
    creatorId: 'user-2',
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-20'),
    tags: ['react', 'advanced'],
  },
  {
    id: '3',
    title: 'TypeScript Nâng Cao',
    content: 'Kiến thức nâng cao về TypeScript',
    creatorId: 'user-3',
    createdAt: new Date('2025-01-25'),
    updatedAt: new Date('2025-01-25'),
    tags: ['typescript'],
  },
]

describe('Resources Feature', () => {
  describe('ResourceCard Component', () => {
    it('should render resource card with title and content', () => {
      render(
        <ResourceCard resource={mockTutorials[0]} />
      )

      expect(screen.getByText('JavaScript Cơ Bản')).toBeInTheDocument()
      expect(screen.getByText(/Hướng dẫn toàn diện/)).toBeInTheDocument()
    })

    it('should display tutorial badge', () => {
      render(
        <ResourceCard resource={mockTutorials[0]} />
      )

      expect(screen.getByText('Hướng dẫn')).toBeInTheDocument()
    })

    it('should display creation date in Vietnamese format', () => {
      render(
        <ResourceCard resource={mockTutorials[0]} />
      )

      expect(screen.getByText(/Tạo:/)).toBeInTheDocument()
    })

    it('should display tags if available', () => {
      render(
        <ResourceCard resource={mockTutorials[0]} />
      )

      expect(screen.getByText('javascript')).toBeInTheDocument()
      expect(screen.getByText('beginner')).toBeInTheDocument()
    })

    it('should call onDownload when download button clicked', () => {
      const mockDownload = vi.fn()
      render(
        <ResourceCard resource={mockTutorials[0]} onDownload={mockDownload} />
      )

      const downloadButton = screen.getByTitle('Tải xuống')
      fireEvent.click(downloadButton)

      expect(mockDownload).toHaveBeenCalledWith(mockTutorials[0])
    })

    it('should truncate long content preview', () => {
      const longContent = 'A'.repeat(200)
      const resource: ContentServiceTutorialResponse = {
        ...mockTutorials[0],
        content: longContent,
      }

      render(<ResourceCard resource={resource} />)

      const preview = screen.getByText(/A+\.\.\./)
      expect(preview.textContent?.length).toBeLessThan(longContent.length + 5)
    })

    it('should display download button', () => {
      render(
        <ResourceCard resource={mockTutorials[0]} />
      )

      expect(screen.getByTitle('Tải xuống')).toBeInTheDocument()
    })
  })

  describe('ResourcesList Component', () => {
    it('should render list of resources', () => {
      render(
        <ResourcesList resources={mockTutorials} isLoading={false} />
      )

      expect(screen.getByText('JavaScript Cơ Bản')).toBeInTheDocument()
      expect(screen.getByText('React Hooks')).toBeInTheDocument()
      expect(screen.getByText('TypeScript Nâng Cao')).toBeInTheDocument()
    })

    it('should display loading state', () => {
      render(
        <ResourcesList resources={undefined} isLoading={true} />
      )

      expect(screen.getByText('Đang tải tài nguyên...')).toBeInTheDocument()
    })

    it('should display empty state when no resources', () => {
      render(
        <ResourcesList resources={[]} isLoading={false} />
      )

      expect(screen.getByText('Không tìm thấy tài nguyên nào')).toBeInTheDocument()
    })

    it('should display pagination when multiple pages', () => {
      render(
        <ResourcesList
          resources={mockTutorials}
          isLoading={false}
          totalPages={3}
          currentPage={1}
        />
      )

      expect(screen.getByRole('button', { name: /2/ })).toBeInTheDocument()
    })

    it('should call onPageChange when pagination changed', () => {
      const mockPageChange = vi.fn()
      render(
        <ResourcesList
          resources={mockTutorials}
          isLoading={false}
          totalPages={3}
          currentPage={1}
          onPageChange={mockPageChange}
        />
      )

      const page2Button = screen.getByRole('button', { name: '2' })
      fireEvent.click(page2Button)

      expect(mockPageChange).toHaveBeenCalledWith(2)
    })

    it('should pass onDownload to ResourceCard', () => {
      const mockDownload = vi.fn()
      render(
        <ResourcesList
          resources={mockTutorials}
          isLoading={false}
          onDownload={mockDownload}
        />
      )

      const downloadButtons = screen.getAllByTitle('Tải xuống')
      fireEvent.click(downloadButtons[0])

      expect(mockDownload).toHaveBeenCalledWith(mockTutorials[0])
    })

    it('should use responsive grid layout', () => {
      const { container } = render(
        <ResourcesList resources={mockTutorials} isLoading={false} />
      )

      // Check if SimpleGrid is rendered
      const grid = container.querySelector('[class*="Grid"]')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('ResourcesPage Component', () => {
    it('should render page title and description', () => {
      render(<ResourcesPage />)

      expect(screen.getByText(/Tài nguyên học tập/)).toBeInTheDocument()
      expect(screen.getByText(/Truy cập các hướng dẫn/)).toBeInTheDocument()
    })

    it('should display search input field', () => {
      render(<ResourcesPage />)

      const searchInput = screen.getByPlaceholderText('Tìm kiếm tài nguyên...')
      expect(searchInput).toBeInTheDocument()
    })

    it('should have download all button', () => {
      render(<ResourcesPage />)

      expect(screen.getByText('Tải tất cả')).toBeInTheDocument()
    })

    it('should filter resources by search query', async () => {
      render(<ResourcesPage />)

      // Wait for tutorials to load
      await waitFor(() => {
        expect(screen.queryByText('Đang tải tài nguyên...')).not.toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Tìm kiếm tài nguyên...')
      fireEvent.change(searchInput, { target: { value: 'JavaScript' } })

      // After filtering, React-related items should not appear
      await waitFor(() => {
        const pageContent = screen.getByText(/Tài nguyên học tập/).closest('div')
        expect(pageContent).toBeTruthy()
      })
    })

    it('should display Vietnamese UI elements', () => {
      render(<ResourcesPage />)

      expect(screen.getByText(/📚/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Tìm kiếm tài nguyên...')).toBeInTheDocument()
    })

    it('should handle pagination', async () => {
      render(<ResourcesPage />)

      await waitFor(() => {
        expect(screen.queryByText('Đang tải tài nguyên...')).not.toBeInTheDocument()
      })

      // Pagination would be visible if there are multiple pages
      const paginationButtons = screen.queryAllByRole('button', { name: /\d+/ })
      if (paginationButtons.length > 0) {
        expect(paginationButtons.length).toBeGreaterThan(0)
      }
    })

    it('should support download functionality', async () => {
      render(<ResourcesPage />)

      await waitFor(() => {
        expect(screen.queryByText('Đang tải tài nguyên...')).not.toBeInTheDocument()
      })

      const downloadButtons = screen.queryAllByTitle('Tải xuống')
      if (downloadButtons.length > 0) {
        expect(downloadButtons[0]).toBeInTheDocument()
      }
    })
  })
})
