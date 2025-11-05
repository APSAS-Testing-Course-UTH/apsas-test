import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { InstructorFeedback } from './InstructorFeedback'

describe('InstructorFeedback', () => {
  describe('Empty State', () => {
    it('should render empty state when no feedback provided', () => {
      render(<InstructorFeedback />)
      
      expect(screen.getByText('Chưa có phản hồi nào')).toBeInTheDocument()
    })

    it('should display Vietnamese empty state message', () => {
      render(<InstructorFeedback feedback={undefined} />)
      
      const emptyMessage = screen.getByText(/chưa có phản hồi/i)
      expect(emptyMessage).toBeInTheDocument()
    })

    it('should not show feedback card when feedback is empty string', () => {
      render(<InstructorFeedback feedback="" />)
      
      expect(screen.getByText('Chưa có phản hồi nào')).toBeInTheDocument()
      expect(screen.queryByRole('article')).not.toBeInTheDocument()
    })
  })

  describe('Feedback Display', () => {
    it('should display feedback card when feedback exists', () => {
      const feedback = 'Good work! Keep improving.'
      render(<InstructorFeedback feedback={feedback} />)
      
      expect(screen.getByRole('article')).toBeInTheDocument()
      expect(screen.queryByText('Chưa có phản hồi nào')).not.toBeInTheDocument()
    })

    it('should display plain text feedback', () => {
      const feedback = 'Your code is well-structured.'
      render(<InstructorFeedback feedback={feedback} />)
      
      expect(screen.getByText(feedback)).toBeInTheDocument()
    })

    it('should display Vietnamese title', () => {
      const feedback = 'Feedback content'
      render(<InstructorFeedback feedback={feedback} />)
      
      expect(screen.getByText('Phản hồi từ giáo viên')).toBeInTheDocument()
    })
  })

  describe('Markdown Rendering', () => {
    it('should render markdown bold text', () => {
      const feedback = 'This is **bold** text'
      render(<InstructorFeedback feedback={feedback} />)
      
      const boldElement = screen.getByText('bold')
      expect(boldElement.tagName).toBe('STRONG')
    })

    it('should render markdown italic text', () => {
      const feedback = 'This is *italic* text'
      render(<InstructorFeedback feedback={feedback} />)
      
      const italicElement = screen.getByText('italic')
      expect(italicElement.tagName).toBe('EM')
    })

    it('should render markdown headings', () => {
      const feedback = '# Main Feedback'
      render(<InstructorFeedback feedback={feedback} />)
      
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Main Feedback')
    })

    it('should render markdown lists', () => {
      const feedback = '- Item 1\n- Item 2\n- Item 3'
      render(<InstructorFeedback feedback={feedback} />)
      
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)
      expect(listItems[0]).toHaveTextContent('Item 1')
    })

    it('should render markdown code blocks', () => {
      const feedback = '```javascript\nconst x = 10;\n```'
      render(<InstructorFeedback feedback={feedback} />)
      
      const codeElement = screen.getByText(/const x = 10/)
      expect(codeElement).toBeInTheDocument()
    })
  })

  describe('Instructor Information', () => {
    it('should display instructor name when provided', () => {
      const instructor = { name: 'Prof. Nguyễn Văn A' }
      render(
        <InstructorFeedback
          feedback="Good work"
          instructor={instructor}
        />
      )
      
      expect(screen.getByText('Prof. Nguyễn Văn A')).toBeInTheDocument()
    })

    it('should display instructor avatar when provided', () => {
      const instructor = {
        name: 'Prof. Nguyễn Văn A',
        avatar: 'https://example.com/avatar.jpg',
      }
      render(
        <InstructorFeedback
          feedback="Good work"
          instructor={instructor}
        />
      )
      
      const avatar = screen.getByRole('img', { name: /prof\. nguyễn văn a/i })
      expect(avatar).toHaveAttribute('src', instructor.avatar)
    })

    it('should show default avatar when avatar not provided', () => {
      const instructor = { name: 'Prof. Nguyễn Văn A' }
      render(
        <InstructorFeedback
          feedback="Good work"
          instructor={instructor}
        />
      )
      
      // Mantine Avatar with name prop and color="initials" renders placeholder span with initials
      // Check for the placeholder span with title attribute
      const avatarPlaceholder = screen.getByTitle('Prof. Nguyễn Văn A')
      expect(avatarPlaceholder).toBeInTheDocument()
      expect(avatarPlaceholder).toHaveTextContent('PN') // First letters of each word
    })
  })

  describe('Timestamp Display', () => {
    it('should display timestamp when provided', () => {
      const createdAt = new Date('2025-10-29T10:00:00Z')
      render(
        <InstructorFeedback
          feedback="Good work"
          createdAt={createdAt}
        />
      )
      
      expect(screen.getByText(/đã phản hồi vào/i)).toBeInTheDocument()
    })

    it('should format timestamp in Vietnamese', () => {
      const createdAt = new Date('2025-10-29T10:00:00Z')
      render(
        <InstructorFeedback
          feedback="Good work"
          createdAt={createdAt}
        />
      )
      
      const timestamp = screen.getByText(/29.*tháng 10.*2025/i)
      expect(timestamp).toBeInTheDocument()
    })

    it('should not show timestamp when not provided', () => {
      render(<InstructorFeedback feedback="Good work" />)
      
      expect(screen.queryByText(/đã phản hồi vào/i)).not.toBeInTheDocument()
    })
  })

  describe('Vietnamese UI', () => {
    it('should have all labels in Vietnamese', () => {
      const instructor = { name: 'Prof. A' }
      const createdAt = new Date('2025-10-29T10:00:00Z')
      
      render(
        <InstructorFeedback
          feedback="Test feedback"
          instructor={instructor}
          createdAt={createdAt}
        />
      )
      
      // Check Vietnamese labels exist
      expect(screen.getByText('Phản hồi từ giáo viên')).toBeInTheDocument()
      expect(screen.getByText(/đã phản hồi vào/i)).toBeInTheDocument()
    })
  })
})
