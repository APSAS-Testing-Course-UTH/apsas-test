/**
 * NotificationSettings Component
 * 
 * Allows users to manage notification preferences for email and push notifications.
 * Shows preferences for different event types (assignment published, submission evaluated).
 * 
 * Features:
 * - Toggle email notifications on/off
 * - Toggle push notifications on/off (with FCM integration)
 * - Configure specific event preferences
 * - Browser permission handling
 * - FCM token registration with backend
 * - Device management
 * - 100% Vietnamese UI
 * 
 * @module features/notifications/components
 */

import { useEffect, useState } from 'react'
import { Stack, Switch, Title, Text, Paper, Group, Loader, Alert, Badge, Code } from '@mantine/core'
import {
  IconBell,
  IconMail,
  IconDeviceMobile,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconInfoCircle,
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useRegisterDevice,
  useUserDevices,
} from '../api'
import { useForm } from '@mantine/form'
import type { NotificationServiceNotificationPreferencesRequest } from '@/api/types.gen'
import {
  requestNotificationPermission,
  getNotificationPermission,
  checkFCMSupport,
  initializeFirebase,
} from '@/services/firebase'

export function NotificationSettings() {
  // Fetch current preferences
  const { data: preferences, isLoading, error } = useNotificationPreferences()

  // Fetch registered devices
  const { data: devices } = useUserDevices()

  // Update mutation
  const { mutate: updatePreferences, isPending: isSaving } = useUpdateNotificationPreferences()

  // Register device mutation
  const { mutate: registerDevice, isPending: isRegistering } = useRegisterDevice()

  // Local state for push notifications
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default')
  const [fcmSupported, setFcmSupported] = useState<boolean>(true)
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)

  // Form state
  const form = useForm<NotificationServiceNotificationPreferencesRequest>({
    initialValues: {
      emailEnabled: false,
      pushEnabled: false,
      emailAssignmentPublished: false,
      emailSubmissionEvaluated: false,
      pushAssignmentPublished: false,
      pushSubmissionEvaluated: false,
    },
  })

  // Check FCM support on mount
  useEffect(() => {
    checkFCMSupport().then((supported) => {
      setFcmSupported(supported)
      if (!supported) {
        console.warn('[NotificationSettings] FCM not supported in this browser')
      }
    })

    // Initialize Firebase
    initializeFirebase().catch((error) => {
      console.error('[NotificationSettings] Firebase initialization failed:', error)
    })

    // Get initial permission state
    setPermissionState(getNotificationPermission())
  }, [])

  // Check if device is already registered
  useEffect(() => {
    if (devices && devices.length > 0) {
      // Find active device for this browser
      const currentDevice = devices.find((d) => d.isActive)
      if (currentDevice && currentDevice.token) {
        setFcmToken(currentDevice.token)
      }
    }
  }, [devices])

  // Load preferences into form
  useEffect(() => {
    if (preferences) {
      form.setValues({
        emailEnabled: preferences.emailEnabled ?? false,
        pushEnabled: preferences.pushEnabled ?? false,
        emailAssignmentPublished: preferences.emailAssignmentPublished ?? false,
        emailSubmissionEvaluated: preferences.emailSubmissionEvaluated ?? false,
        pushAssignmentPublished: preferences.pushAssignmentPublished ?? false,
        pushSubmissionEvaluated: preferences.pushSubmissionEvaluated ?? false,
      })
    }
  }, [preferences])

  // Handle push notification toggle
  const handlePushToggle = async (enabled: boolean) => {
    if (!enabled) {
      // User is disabling push - just update preference
      form.setFieldValue('pushEnabled', false)
      return
    }

    // User is enabling push - need to request permission and register device
    if (!fcmSupported) {
      notifications.show({
        title: 'Không hỗ trợ',
        message: 'Trình duyệt của bạn không hỗ trợ thông báo đẩy',
        color: 'red',
      })
      return
    }

    if (permissionState === 'denied') {
      notifications.show({
        title: 'Quyền bị từ chối',
        message: 'Vui lòng bật quyền thông báo trong cài đặt trình duyệt',
        color: 'orange',
      })
      return
    }

    try {
      setIsRequestingPermission(true)

      // Request permission and get FCM token
      const token = await requestNotificationPermission()

      if (!token) {
        notifications.show({
          title: 'Lỗi',
          message: 'Không thể lấy FCM token. Vui lòng thử lại.',
          color: 'red',
        })
        form.setFieldValue('pushEnabled', false)
        return
      }

      // Update permission state
      setPermissionState(getNotificationPermission())
      setFcmToken(token)

      // Register device with backend
      registerDevice(
        {
          token,
          deviceType: 'WEB',
          userAgent: navigator.userAgent,
        },
        {
          onSuccess: () => {
            form.setFieldValue('pushEnabled', true)
            notifications.show({
              title: 'Thành công',
              message: 'Đã bật thông báo đẩy',
              color: 'green',
            })
          },
          onError: (error) => {
            console.error('[NotificationSettings] Device registration failed:', error)
            form.setFieldValue('pushEnabled', false)
            notifications.show({
              title: 'Lỗi',
              message: 'Không thể đăng ký thiết bị. Vui lòng thử lại.',
              color: 'red',
            })
          },
        }
      )
    } catch (error) {
      console.error('[NotificationSettings] Error enabling push:', error)
      form.setFieldValue('pushEnabled', false)
      notifications.show({
        title: 'Lỗi',
        message: error instanceof Error ? error.message : 'Không thể bật thông báo đẩy',
        color: 'red',
      })
    } finally {
      setIsRequestingPermission(false)
    }
  }

  // Auto-save preferences when form values change
  const handleAutoSave = (values: NotificationServiceNotificationPreferencesRequest) => {
    updatePreferences(values, {
      onSuccess: () => {
        notifications.show({
          message: 'Đã lưu cài đặt thành công',
          color: 'green',
          autoClose: 2000,
        })
      },
      onError: (error) => {
        notifications.show({
          title: 'Lỗi',
          message: error instanceof Error ? error.message : 'Không thể lưu cài đặt',
          color: 'red',
        })
      },
    })
  }

  // Auto-save when preferences change (except push-related fields)
  useEffect(() => {
    if (!preferences) return // Don't save until initial load
    
    // Only auto-save if form has been touched
    const hasChanges = 
      form.values.emailEnabled !== preferences.emailEnabled ||
      form.values.emailAssignmentPublished !== preferences.emailAssignmentPublished ||
      form.values.emailSubmissionEvaluated !== preferences.emailSubmissionEvaluated ||
      form.values.pushAssignmentPublished !== preferences.pushAssignmentPublished ||
      form.values.pushSubmissionEvaluated !== preferences.pushSubmissionEvaluated
    
    if (hasChanges && !isSaving) {
      handleAutoSave(form.values)
    }
  }, [
    form.values.emailEnabled,
    form.values.emailAssignmentPublished,
    form.values.emailSubmissionEvaluated,
    form.values.pushAssignmentPublished,
    form.values.pushSubmissionEvaluated,
  ])

  // Get permission status badge
  const getPermissionBadge = () => {
    switch (permissionState) {
      case 'granted':
        return (
          <Badge color="green" leftSection={<IconCheck size={12} />}>
            Đã cho phép
          </Badge>
        )
      case 'denied':
        return (
          <Badge color="red" leftSection={<IconX size={12} />}>
            Đã từ chối
          </Badge>
        )
      default:
        return (
          <Badge color="gray" leftSection={<IconInfoCircle size={12} />}>
            Chưa yêu cầu
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <Paper withBorder p="xl" radius="md">
        <Group justify="center">
          <Loader size="lg" />
          <Text>Đang tải cài đặt thông báo...</Text>
        </Group>
      </Paper>
    )
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Lỗi" color="red">
        Không thể tải cài đặt thông báo. Vui lòng thử lại sau.
      </Alert>
    )
  }

  return (
    <Stack gap="lg">
        {/* Email Notifications Section */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Group gap="xs">
              <IconMail size={20} />
              <Title order={3}>Thông báo qua Email</Title>
            </Group>

            <Switch
              label="Bật thông báo email"
              description="Nhận thông báo qua email"
              size="md"
              disabled={isSaving}
              {...form.getInputProps('emailEnabled', { type: 'checkbox' })}
            />

            {form.values.emailEnabled && (
              <Stack gap="xs" pl="md">
                <Switch
                  label="Bài tập mới được xuất bản"
                  description="Thông báo khi có bài tập mới"
                  disabled={isSaving}
                  {...form.getInputProps('emailAssignmentPublished', { type: 'checkbox' })}
                />
                <Switch
                  label="Bài nộp được chấm điểm"
                  description="Thông báo khi bài nộp của bạn được đánh giá"
                  disabled={isSaving}
                  {...form.getInputProps('emailSubmissionEvaluated', { type: 'checkbox' })}
                />
              </Stack>
            )}
          </Stack>
        </Paper>

        {/* Push Notifications Section */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Group gap="xs" justify="space-between">
              <Group gap="xs">
                <IconDeviceMobile size={20} />
                <Title order={3}>Thông báo đẩy (Push)</Title>
              </Group>
              {getPermissionBadge()}
            </Group>

            {!fcmSupported && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                Trình duyệt của bạn không hỗ trợ thông báo đẩy. Vui lòng sử dụng Chrome, Firefox, hoặc
                Edge.
              </Alert>
            )}

            {fcmSupported && permissionState === 'denied' && (
              <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light">
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Quyền thông báo đã bị từ chối
                  </Text>
                  <Text size="xs">
                    Để bật lại, vui lòng:
                    <br />
                    1. Nhấn vào biểu tượng khóa bên trái thanh địa chỉ
                    <br />
                    2. Chọn "Cài đặt trang web"
                    <br />
                    3. Thay đổi "Thông báo" thành "Cho phép"
                    <br />
                    4. Tải lại trang
                  </Text>
                </Stack>
              </Alert>
            )}

            <Switch
              label="Bật thông báo đẩy"
              description="Nhận thông báo ngay lập tức trên thiết bị"
              size="md"
              disabled={!fcmSupported || isRegistering || isRequestingPermission}
              checked={form.values.pushEnabled}
              onChange={(event) => handlePushToggle(event.currentTarget.checked)}
            />

            {form.values.pushEnabled && fcmToken && (
              <Alert icon={<IconCheck size={16} />} color="green" variant="light">
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Thiết bị đã được đăng ký
                  </Text>
                  <Text size="xs">Bạn sẽ nhận được thông báo đẩy trên trình duyệt này.</Text>
                  {import.meta.env.DEV && (
                    <Code block style={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>
                      FCM Token: {fcmToken.substring(0, 50)}...
                    </Code>
                  )}
                </Stack>
              </Alert>
            )}

            {form.values.pushEnabled && (
              <Stack gap="xs" pl="md">
                <Switch
                  label="Bài tập mới được xuất bản"
                  description="Thông báo push khi có bài tập mới"
                  disabled={isSaving}
                  {...form.getInputProps('pushAssignmentPublished', { type: 'checkbox' })}
                />
                <Switch
                  label="Bài nộp được chấm điểm"
                  description="Thông báo push khi bài nộp được đánh giá"
                  disabled={isSaving}
                  {...form.getInputProps('pushSubmissionEvaluated', { type: 'checkbox' })}
                />
              </Stack>
            )}

            {form.values.pushEnabled && (
              <Alert icon={<IconBell size={16} />} color="blue" variant="light">
                <Text size="sm">
                  Thông báo đẩy sẽ xuất hiện ngay cả khi bạn không mở trang web. Bạn có thể tắt bất kỳ
                  lúc nào.
                </Text>
              </Alert>
            )}

            {devices && devices.length > 0 && (
              <Alert icon={<IconDeviceMobile size={16} />} color="blue" variant="light">
                <Text size="sm">
                  Số thiết bị đã đăng ký: <strong>{devices.length}</strong>
                </Text>
              </Alert>
            )}
          </Stack>
        </Paper>

      </Stack>
  )
}
