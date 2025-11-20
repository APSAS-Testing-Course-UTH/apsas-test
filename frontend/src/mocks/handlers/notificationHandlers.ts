/**
 * Notification Service MSW Handlers
 * 
 * Mock handlers for notification-service endpoints:
 * - GET /api/v1/preferences - Get user notification preferences
 * - PATCH /api/v1/preferences - Update notification preferences
 * - POST /api/v1/devices/register - Register FCM device
 * - GET /api/v1/devices - Get user devices
 * - DELETE /api/v1/devices/{token} - Remove device
 */

import { http, HttpResponse } from 'msw'
import type {
  NotificationServiceNotificationPreferencesResponse,
  NotificationServiceNotificationPreferencesRequest,
  NotificationServiceRegisterDeviceRequest, // ✅ Re-added for POST /devices/register
  NotificationServiceDeviceTokenResponse,
} from '@/api/types.gen'

// In-memory storage for preferences (per-user)
const userPreferences = new Map<string, NotificationServiceNotificationPreferencesResponse>()

// In-memory storage for devices
const userDevices = new Map<string, NotificationServiceDeviceTokenResponse[]>()

// Helper to get userId from auth header
function getUserIdFromAuth(request: Request): string {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return 'anonymous'
  
  // In real app, decode JWT to get userId
  // For now, extract from mock token
  const token = authHeader.replace('Bearer ', '')
  if (token.includes('student')) return 'student-001'
  if (token.includes('instructor')) return 'instructor-001'
  if (token.includes('admin')) return 'admin-001'
  return 'anonymous'
}

// Default preferences factory - creates preferences with all required fields
function getDefaultPreferences(userId: string): NotificationServiceNotificationPreferencesResponse {
  return {
    id: crypto.randomUUID(), // ✅ MATCHES Backend OpenAPI spec (notification-service.json line 161)
    userId, // ✅ MATCHES Backend OpenAPI spec (notification-service.json line 162)
    emailEnabled: true,
    pushEnabled: false,
    emailAssignmentPublished: true,
    emailSubmissionEvaluated: true,
    pushAssignmentPublished: false,
    pushSubmissionEvaluated: false,
    createdAt: new Date(), // ✅ MATCHES Backend OpenAPI spec (notification-service.json line 169)
    updatedAt: new Date(), // ✅ MATCHES Backend OpenAPI spec (notification-service.json line 170)
  }
}

export const notificationHandlers = [
  // GET /api/v1/preferences - Get notification preferences
  // ✅ MATCHES Backend OpenAPI spec (notification-service.json line 38)
  http.get('**/api/v1/preferences', ({ request }) => {
    const userId = getUserIdFromAuth(request)
    
    // Get user preferences or return defaults with full schema
    const preferences = userPreferences.get(userId) || getDefaultPreferences(userId)
    
    return HttpResponse.json(preferences, { status: 200 })
  }),

  // PATCH /api/v1/preferences - Update notification preferences
  // ✅ MATCHES Backend OpenAPI spec (notification-service.json line 57)
  http.patch('**/api/v1/preferences', async ({ request }) => {
    const userId = getUserIdFromAuth(request)
    const body = await request.json() as NotificationServiceNotificationPreferencesRequest
    
    // Merge with existing or defaults
    const current = userPreferences.get(userId) || getDefaultPreferences(userId)
    const updated: NotificationServiceNotificationPreferencesResponse = {
      ...current,
      ...body,
      updatedAt: new Date(), // Update timestamp on modification
    }
    
    // Save to storage
    userPreferences.set(userId, updated)
    
    return HttpResponse.json(updated, { status: 200 })
  }),

  // POST /api/v1/devices/register - Register FCM device token
  // ✅ MATCHES Backend OpenAPI spec (notification-service.json line 16)
  http.post('**/api/v1/devices/register', async ({ request }) => {
    const userId = getUserIdFromAuth(request)
    const body = await request.json() as NotificationServiceRegisterDeviceRequest
    
    // Create new device token
    const newDevice: NotificationServiceDeviceTokenResponse = {
      id: crypto.randomUUID(),
      token: body.token,
      deviceType: body.deviceType,
      userAgent: body.userAgent,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    // Get existing devices
    const devices = userDevices.get(userId) || []
    
    // Check if device already exists (by token)
    const existingIndex = devices.findIndex(d => d.token === body.token)
    if (existingIndex >= 0) {
      // Update existing device
      devices[existingIndex] = { ...newDevice, id: devices[existingIndex].id }
    } else {
      // Add new device
      devices.push(newDevice)
    }
    
    // Save to storage
    userDevices.set(userId, devices)
    
    // ✅ MATCHES Backend OpenAPI spec: 201 Created (notification-service.json line 26)
    return HttpResponse.json(newDevice, { status: 201 })
  }),

  // GET /api/v1/devices - Get user devices
  // ✅ MATCHES Backend OpenAPI spec (notification-service.json line 84)
  http.get('**/api/v1/devices', ({ request }) => {
    const userId = getUserIdFromAuth(request)
    
    // Get user devices
    const devices = userDevices.get(userId) || []
    
    return HttpResponse.json(devices, { status: 200 })
  }),

  // DELETE /api/v1/devices/{token} - Remove device
  // ✅ MATCHES Backend OpenAPI spec (notification-service.json line 107)
  http.delete('**/api/v1/devices/:token', ({ request, params }) => {
    const userId = getUserIdFromAuth(request)
    const { token } = params
    
    // Get user devices
    const devices = userDevices.get(userId) || []
    
    // Filter out the device with matching token
    const updated = devices.filter(d => d.token !== token)
    userDevices.set(userId, updated)
    
    return new HttpResponse(null, { status: 204 })
  }),
]
