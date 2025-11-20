import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { NotificationSettings } from './NotificationSettings'

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

describe('NotificationSettings', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  const renderComponent = () => {
    return render(
      <MantineProvider>
        <Notifications />
        <NotificationSettings />
      </MantineProvider>
    )
  }

  it('should render notification settings section with Vietnamese title', () => {
    renderComponent()

    expect(screen.getByText('Thông báo')).toBeInTheDocument()
  })

  it('should display all notification switches with Vietnamese labels', () => {
    renderComponent()

    expect(screen.getByText('Thông báo qua email')).toBeInTheDocument()
    expect(screen.getByText('Thông báo đẩy')).toBeInTheDocument()
    expect(screen.getByText('Cập nhật bài tập')).toBeInTheDocument()
    expect(screen.getByText('Thông báo phản hồi')).toBeInTheDocument()
    expect(screen.getByText('Nhắc nhở hạn nộp')).toBeInTheDocument()
  })

  it('should load default notification preferences', () => {
    renderComponent()

    // Email notifications: ON (default)
    const emailSwitch = screen.getByRole('switch', { name: /Thông báo qua email/i })
    expect(emailSwitch).toBeChecked()

    // Push notifications: OFF (default)
    const pushSwitch = screen.getByRole('switch', { name: /Thông báo đẩy/i })
    expect(pushSwitch).not.toBeChecked()
  })

  it('should auto-save notification preferences to localStorage when toggled', async () => {
    renderComponent()
    const user = userEvent.setup()

    // Toggle push notifications
    const pushSwitch = screen.getByRole('switch', { name: /Thông báo đẩy/i })
    await user.click(pushSwitch)

    await waitFor(() => {
      const stored = localStorage.getItem('apsas_user_settings')
      expect(stored).toBeTruthy()
      if (stored) {
        const settings = JSON.parse(stored)
        expect(settings.notifications.pushNotifications).toBe(true)
      }
    })
  })

  it('should show success notification when preference is toggled', async () => {
    renderComponent()
    const user = userEvent.setup()

    // Toggle deadline reminders switch
    const deadlineSwitch = screen.getByRole('switch', { name: /Nhắc nhở hạn nộp/i })
    await user.click(deadlineSwitch)

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
