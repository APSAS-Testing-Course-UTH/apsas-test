import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { SettingsPage } from './SettingsPage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  const renderComponent = () => {
    return render(
      <MantineProvider>
        <Notifications />
        <SettingsPage />
      </MantineProvider>
    )
  }

  it('should render settings page with Vietnamese title', () => {
    renderComponent()

    expect(screen.getByText('Cài đặt')).toBeInTheDocument()
  })

  it('should render tabs for General and Notifications with Vietnamese labels', () => {
    renderComponent()

    expect(screen.getByRole('tab', { name: /Cài đặt chung/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Thông báo/i })).toBeInTheDocument()
  })

  it('should display General Settings tab by default', () => {
    renderComponent()

    // General tab should be selected
    const generalTab = screen.getByRole('tab', { name: /Cài đặt chung/i })
    expect(generalTab).toHaveAttribute('data-active', 'true')

    // General settings content should be visible
    expect(screen.getByText('Giao diện')).toBeInTheDocument()
  })

  it('should switch to Notifications tab when clicked', async () => {
    renderComponent()
    const user = userEvent.setup()

    const notificationsTab = screen.getByRole('tab', { name: /Thông báo/i })
    await user.click(notificationsTab)

    // Notifications tab should be selected
    expect(notificationsTab).toHaveAttribute('data-active', 'true')

    // Notifications settings content should be visible
    expect(screen.getByText('Thông báo qua email')).toBeInTheDocument()
  })

  it('should render Paper container with border and shadow', () => {
    const { container } = renderComponent()

    const paper = container.querySelector('.mantine-Paper-root')
    expect(paper).toBeInTheDocument()
  })

  it('should contain both settings sections within tabs', () => {
    renderComponent()

    // General settings should be present (default tab)
    expect(screen.getByText('Giao diện')).toBeInTheDocument()
    expect(screen.getByText('Ngôn ngữ')).toBeInTheDocument()
    expect(screen.getByText('Múi giờ')).toBeInTheDocument()
  })

  it('should have proper container structure', () => {
    const { container } = renderComponent()

    const mainContainer = container.querySelector('.mantine-Container-root')
    expect(mainContainer).toBeInTheDocument()
    
    const tabs = container.querySelector('.mantine-Tabs-root')
    expect(tabs).toBeInTheDocument()
  })

  it('should render icons in tab labels', () => {
    renderComponent()

    // Check for SVG icons in tabs
    const generalTab = screen.getByRole('tab', { name: /Cài đặt chung/i })
    const notificationsTab = screen.getByRole('tab', { name: /Thông báo/i })

    expect(generalTab.querySelector('svg')).toBeInTheDocument()
    expect(notificationsTab.querySelector('svg')).toBeInTheDocument()
  })
})
