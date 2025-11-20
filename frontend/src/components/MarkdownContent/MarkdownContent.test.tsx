/**
 * MarkdownContent Component Tests
 * Verifies markdown rendering with syntax highlighting
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarkdownContent } from './MarkdownContent'

describe('MarkdownContent Component', () => {
  it('should render basic markdown heading', () => {
    render(<MarkdownContent content="# Test Heading" />)
    const heading = screen.getByRole('heading', { level: 1, name: 'Test Heading' })
    expect(heading).toBeInTheDocument()
  })

  it('should render markdown paragraph', () => {
    render(<MarkdownContent content="This is a test paragraph." />)
    expect(screen.getByText('This is a test paragraph.')).toBeInTheDocument()
  })

  it('should render bold text', () => {
    render(<MarkdownContent content="This is **bold text**" />)
    const boldText = screen.getByText('bold text')
    expect(boldText.tagName).toBe('STRONG')
  })

  it('should render italic text', () => {
    render(<MarkdownContent content="This is *italic text*" />)
    const italicText = screen.getByText('italic text')
    expect(italicText.tagName).toBe('EM')
  })

  it('should render inline code', () => {
    render(<MarkdownContent content="Use `console.log()` to debug" />)
    const codeElement = screen.getByText('console.log()')
    expect(codeElement.tagName).toBe('CODE')
  })

  it('should render code block', () => {
    const codeBlock = '```javascript\nconsole.log("Hello World");\n```'
    render(<MarkdownContent content={codeBlock} />)
    expect(screen.getByText('console.log("Hello World");')).toBeInTheDocument()
  })

  it('should render unordered list', () => {
    const markdown = `
- Item 1
- Item 2
- Item 3
    `
    render(<MarkdownContent content={markdown} />)
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('should render ordered list', () => {
    const markdown = `
1. First
2. Second
3. Third
    `
    render(<MarkdownContent content={markdown} />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()
  })

  it('should render links', () => {
    render(<MarkdownContent content="[Google](https://google.com)" />)
    const link = screen.getByRole('link', { name: 'Google' })
    expect(link).toHaveAttribute('href', 'https://google.com')
  })

  it('should open external links in new tab', () => {
    render(<MarkdownContent content="[External](https://example.com)" />)
    const link = screen.getByRole('link', { name: 'External' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render blockquote', () => {
    render(<MarkdownContent content="> This is a quote" />)
    expect(screen.getByText('This is a quote')).toBeInTheDocument()
  })

  it('should render multiple headings with different levels', () => {
    const markdown = `
# Heading 1
## Heading 2
### Heading 3
    `
    render(<MarkdownContent content={markdown} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Heading 1' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Heading 2' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Heading 3' })).toBeInTheDocument()
  })

  it('should handle empty content gracefully', () => {
    const { container } = render(<MarkdownContent content="" />)
    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should render Vietnamese text correctly', () => {
    const vietnameseContent = `
# Mô tả bài toán

Viết chương trình tính tổng các phần tử trong mảng số nguyên.

**Input**: mảng các số  
**Output**: tổng
    `
    render(<MarkdownContent content={vietnameseContent} />)
    expect(screen.getByText('Mô tả bài toán')).toBeInTheDocument()
    expect(screen.getByText('Input')).toBeInTheDocument()
    expect(screen.getByText('Output')).toBeInTheDocument()
  })

  it('should apply custom className when provided', () => {
    const { container } = render(<MarkdownContent content="Test" className="custom-class" />)
    const wrapper = container.querySelector('.custom-class')
    expect(wrapper).toBeInTheDocument()
  })

  it('should render complex markdown with multiple elements', () => {
    const complexMarkdown = `
# Assignment: Binary Search

## Description

Implement the **binary search** algorithm.

### Input Format

- Sorted array of integers
- Target value to search

### Output Format

Return the *index* of target, or \`-1\` if not found.

### Example

\`\`\`python
def binary_search(arr, target):
    # Your code here
    pass
\`\`\`

> **Note**: Array must be sorted!
    `
    render(<MarkdownContent content={complexMarkdown} />)
    
    expect(screen.getByRole('heading', { level: 1, name: 'Assignment: Binary Search' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Description' })).toBeInTheDocument()
    expect(screen.getByText('binary search')).toBeInTheDocument()
    expect(screen.getByText('Note')).toBeInTheDocument()
  })
})
