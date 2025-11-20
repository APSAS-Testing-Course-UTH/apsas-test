/**
 * MarkdownContent Component
 * Renders markdown content with professional styling
 * Vietnamese UI-focused with optimized typography
 */

import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import { useMemo } from 'react'

import styles from './MarkdownContent.module.css'

interface MarkdownContentProps {
  /**
   * Markdown content to render
   */
  content: string

  /**
   * Optional custom className for wrapper
   */
  className?: string
}

/**
 * MarkdownContent Component
 * Renders markdown with Vietnamese-optimized styling
 *
 * @example
 * ```tsx
 * <MarkdownContent content="# Heading\n\nParagraph with **bold** text" />
 * ```
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  // Custom components for markdown elements
  const components: Components = useMemo(
    () => ({
      // Code blocks
      code(props) {
        const { node, className: codeClassName, children, ...rest } = props
        const match = /language-(\w+)/.exec(codeClassName || '')
        const language = match ? match[1] : ''
        
        // Check if inline code (when not in pre tag)
        const isInline = !props.className?.includes('language-')

        // Inline code
        if (isInline) {
          return (
            <code className={codeClassName} {...rest}>
              {children}
            </code>
          )
        }

        // Block code
        return (
          <code
            className={`${codeClassName || ''} language-${language || 'text'}`}
            {...rest}
          >
            {children}
          </code>
        )
      },

      // Links - open external links in new tab
      a({ node, href, children, ...props }) {
        const isExternal = href?.startsWith('http')
        return (
          <a
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            {...props}
          >
            {children}
          </a>
        )
      },

      // Headings with id for anchor links
      h1({ node, children, ...props }) {
        const id = String(children).toLowerCase().replace(/\s+/g, '-')
        return (
          <h1 id={id} {...props}>
            {children}
          </h1>
        )
      },
      h2({ node, children, ...props }) {
        const id = String(children).toLowerCase().replace(/\s+/g, '-')
        return (
          <h2 id={id} {...props}>
            {children}
          </h2>
        )
      },
      h3({ node, children, ...props }) {
        const id = String(children).toLowerCase().replace(/\s+/g, '-')
        return (
          <h3 id={id} {...props}>
            {children}
          </h3>
        )
      },
    }),
    []
  )

  return (
    <div className={`${styles.markdownContent} ${className || ''}`}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  )
}
