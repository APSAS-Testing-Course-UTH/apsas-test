import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { GeneralSettings } from './GeneralSettings'

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

describe('GeneralSettings', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    
    // Mock scrollIntoView for Mantine Combobox
    Element.prototype.scrollIntoView = vi.fn()
    
    // Clear any existing notifications
    const notifications = document.querySelectorAll('.mantine-Notification-root')
    notifications.forEach(n => n.remove())
  })

  const renderComponent = () => {
    return render(
      <MantineProvider>
        <Notifications />
        <GeneralSettings />
      </MantineProvider>
    )
  }

  it('should render general settings section with Vietnamese title', () => {
    renderComponent()

    expect(screen.getByText('Cài đặt chung')).toBeInTheDocument()
  })

  it('should display all three setting fields with Vietnamese labels', () => {
    renderComponent()

    expect(screen.getByText('Giao diện')).toBeInTheDocument()
    expect(screen.getByText('Ngôn ngữ')).toBeInTheDocument()
    expect(screen.getByText('Múi giờ')).toBeInTheDocument()
  })

  it('should load default settings on initial render', () => {
    renderComponent()

    // Check default values by displayed text (Mantine Select shows labels, not values)
    const themeSelect = screen.getByPlaceholderText('Chọn giao diện')
    const languageSelect = screen.getByPlaceholderText('Chọn ngôn ngữ')
    const timezoneSelect = screen.getByPlaceholderText('Chọn múi giờ')

    expect(themeSelect).toHaveValue('Sáng')
    expect(languageSelect).toHaveValue('Tiếng Việt')
    expect(timezoneSelect).toHaveValue('Hồ Chí Minh (UTC+7)')
  })

  it('should auto-save settings to localStorage when changed', async () => {
    renderComponent()
    const user = userEvent.setup()

    // Change theme
    const themeSelect = screen.getByPlaceholderText('Chọn giao diện')
    await user.click(themeSelect)
    const darkOption = await screen.findByText('Tối')
    await user.click(darkOption)

    await waitFor(() => {
      const stored = localStorage.getItem('apsas_user_settings')
      expect(stored).toBeTruthy()
      if (stored) {
        const settings = JSON.parse(stored)
        expect(settings.general.theme).toBe('dark')
      }
    })
  })

  it('should show success notification when settings are changed', async () => {
    renderComponent()
    const user = userEvent.setup()

    // Change language
    const languageSelect = screen.getByPlaceholderText('Chọn ngôn ngữ')
    await user.click(languageSelect)
    const englishOption = await screen.findByText('English')
    await user.click(englishOption)

    await waitFor(() => {
      const notifications = screen.getAllByText('Đã lưu cài đặt thành công')
      expect(notifications.length).toBeGreaterThan(0)
    })
  })

  it('should not display save or reset buttons', () => {
    renderComponent()

    expect(screen.queryByText('Lưu thay đổi')).not.toBeInTheDocument()
    expect(screen.queryByText('Đặt lại')).not.toBeInTheDocument()
  })
})
