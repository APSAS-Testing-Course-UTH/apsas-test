import { notifications } from "@mantine/notifications"
import { IconCheck, IconX } from "@tabler/icons-react"

// Notification helpers

export const showSuccessNotification = (message: string, title?: string) => {
  notifications.show({
    title: title || "Success",
    message,
    color: "green",
    icon: <IconCheck size={16} />,
    autoClose: 4000,
  })
}

export const showErrorNotification = (message: string, title?: string) => {
  notifications.show({
    title: title || "Error",
    message,
    color: "red",
    icon: <IconX size={16} />,
    autoClose: 6000, // Errors stay longer
  })
}

export const showInfoNotification = (message: string, title?: string) => {
  notifications.show({
    title: title || "Info",
    message,
    color: "blue",
    autoClose: 5000,
  })
}

export const showWarningNotification = (message: string, title?: string) => {
  notifications.show({
    title: title || "Warning",
    message,
    color: "orange",
    autoClose: 5000,
  })
}

/**
 * Generic notification function that accepts type parameter
 * @param message - Notification message
 * @param type - Notification type: 'success', 'error', 'info', or 'warning'
 * @param title - Optional custom title
 */
export const showNotification = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info',
  title?: string
) => {
  switch (type) {
    case 'success':
      showSuccessNotification(message, title)
      break
    case 'error':
      showErrorNotification(message, title)
      break
    case 'warning':
      showWarningNotification(message, title)
      break
    case 'info':
    default:
      showInfoNotification(message, title)
      break
  }
}
