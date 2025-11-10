import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useState } from 'react'
import {
  Box,
  Stack,
  Text,
  Anchor,
  Group,
  ActionIcon,
} from '@mantine/core'
import styles from './ResourceDetailModal.module.css'

/**
 * Interface for a heading extracted from markdown
 */
export interface Heading {
  id: string
  text: string
  level: number
}

/**
 * Props for ResourceTableOfContents component
 */
interface ResourceTableOfContentsProps {
  headings: Heading[]
  activeHeadingId?: string
  onLinkClick?: (headingId: string) => void
}

/**
 * ResourceTableOfContents Component
 * Displays an interactive table of contents for resource detail pages
 *
 * Features:
 * - Desktop: Sticky sidebar TOC with styled scrollbar
 * - Mobile: Collapsible TOC
 * - Click-to-scroll navigation with smooth behavior
 * - Active heading highlighting with visual feedback
 * - Proper scrollbar styling using Mantine theme colors
 * - Responsive design with Mantine Grid
 */
export function ResourceTableOfContents({
  headings,
  activeHeadingId,
  onLinkClick,
}: ResourceTableOfContentsProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(false)

  // Don't render if no headings
  if (headings.length === 0) {
    return null
  }

  const handleLinkClick = (headingId: string) => {
    // Find the heading by its index in the headings array
    const headingIndex = headings.findIndex(h => h.id === headingId)
    if (headingIndex >= 0) {
      // Get all h2 and h3 elements on the page
      const h2Elements = document.querySelectorAll('h2')
      const h3Elements = document.querySelectorAll('h3')
      const allElements = Array.from(h2Elements).concat(Array.from(h3Elements))
      
      // Get the element at this index
      const element = allElements[headingIndex] as HTMLElement
      if (element) {
        // Smooth scroll to heading in main window
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })

        // Call optional callback
        if (onLinkClick) {
          onLinkClick(headingId)
        }
      }
    }

    // Close mobile TOC after clicking
    setIsOpenMobile(false)
  }

  const toc = (
    <Stack gap="xs">
      {headings.map((heading) => {
        const isActive = activeHeadingId === heading.id
        const isH3 = heading.level === 3

        return (
          <Anchor
            key={heading.id}
            component="button"
            type="button"
            onClick={() => handleLinkClick(heading.id)}
            className={`${styles.tocLink} ${isActive ? styles.tocLinkActive : ''}`}
            style={{
              paddingLeft: isH3 ? '1.5rem' : '0.5rem',
            }}
          >
            {heading.text}
          </Anchor>
        )
      })}
    </Stack>
  )

  return (
    <>
      {/* Desktop Version - Sticky Sidebar with Proper Scrollbar */}
      <Box
        className={styles.tableOfContents}
        visibleFrom="md"
        style={{
          position: 'sticky',
          top: '20px',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto',
          paddingRight: '0.5rem',
          paddingLeft: '1rem',
          borderLeft: '2px solid var(--mantine-color-gray-2)',
        }}
      >
        <Text
          fw={700}
          size="sm"
          mb="md"
          style={{ color: 'var(--mantine-color-gray-8)' }}
        >
          Mục lục
        </Text>
        {toc}
      </Box>

      {/* Mobile Version - Collapsible */}
      <Box
        hiddenFrom="md"
        style={{
          marginBottom: '1rem',
          borderTop: '1px solid var(--mantine-color-gray-2)',
          borderBottom: '1px solid var(--mantine-color-gray-2)',
        }}
      >
        <Group
          justify="space-between"
          p="md"
          style={{
            backgroundColor: 'var(--mantine-color-gray-0)',
            cursor: 'pointer',
          }}
          onClick={() => setIsOpenMobile(!isOpenMobile)}
        >
          <Text fw={700} size="sm">
            Mục lục
          </Text>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
          >
            {isOpenMobile ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            )}
          </ActionIcon>
        </Group>

        {isOpenMobile && (
          <Box
            p="md"
            style={{
              backgroundColor: 'var(--mantine-color-gray-1)',
              maxHeight: '60vh',
              overflowY: 'auto',
            }}
            className={styles.tableOfContents}
          >
            {toc}
          </Box>
        )}
      </Box>
    </>
  )
}
