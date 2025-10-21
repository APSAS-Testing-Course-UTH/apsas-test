# MSW Testing Guide for APSAS Frontend

**Version:** 1.0 | **Date:** October 20, 2025 | **MSW Version:** 2.11.5

## 📋 Table of Contents

1. [Overview](#overview)
2. [Test Setup](#test-setup)
3. [Handler Testing](#handler-testing)
4. [Integration Testing](#integration-testing)
5. [Error Testing](#error-testing)
6. [Advanced Testing](#advanced-testing)
7. [Best Practices](#best-practices)
8. [Debugging Tests](#debugging-tests)

---

## 🎯 Overview

This guide covers comprehensive testing strategies for MSW (Mock Service Worker) in the APSAS frontend application. It provides patterns and examples for testing all aspects of our mock API implementation.

### Testing Pyramid

```
┌─────────────────┐
│   E2E Tests     │ ← Full application flows
│   (Integration) │
├─────────────────┤
│ Component Tests │ ← React component behavior
│   (Unit)        │
├─────────────────┤
│  MSW Handler    │ ← API endpoint mocking
│    Tests        │
└─────────────────┘
```

### Test Categories

1. **Handler Tests**: Test individual MSW handlers
2. **Integration Tests**: Test complete API flows
3. **Error Tests**: Test error scenarios and edge cases
4. **Performance Tests**: Test concurrent requests and load

---

## ⚙️ Test Setup

### 1. Vitest Configuration

#### vite.config.ts
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/mocks/',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/',
      ],
    },
  },
})
```

### 2. Test Setup File

#### src/test/setup.ts
```typescript
import { expect, afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { server } from '@/mocks/server'

// Extend expect with jest-dom matchers
expect.extend(matchers)

// Clean up after each test
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Start MSW server
beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'bypass', // Let unhandled requests pass through
  })
)

afterAll(() => server.close())
```

### 3. Custom Test Utilities

#### src/test-utils.tsx
```typescript
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'
import { MantineProvider } from '@mantine/core'

// Create router instance
const router = createRouter({ routeTree })

// Custom render function
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}>
          {children}
        </RouterProvider>
      </QueryClientProvider>
    </MantineProvider>
  )

  return render(ui, { wrapper, ...options })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
```

### 4. Test Data Helpers

#### src/mocks/test-helpers.ts
```typescript
import { MOCK_CREDENTIALS, MOCK_USERS } from './data/users'

// Helper to create authenticated requests
export function createAuthHeaders(role: keyof typeof MOCK_CREDENTIALS = 'student') {
  return {
    'Authorization': `Bearer ${MOCK_CREDENTIALS[role].token}`,
    'Content-Type': 'application/json',
  }
}

// Helper to create request body
export function createRequestBody(overrides = {}) {
  return {
    email: 'test@example.com',
    password: 'Password@123',
    firstName: 'Test',
    lastName: 'User',
    ...overrides,
  }
}

// Helper to assert successful responses
export function assertSuccessResponse(response: Response, expectedStatus = 200) {
  expect(response.status).toBe(expectedStatus)
  expect(response.headers.get('content-type')).toContain('application/json')
}

// Helper to assert error responses
export function assertErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedError: string
) {
  expect(response.status).toBe(expectedStatus)
  expect(response.headers.get('content-type')).toContain('application/json')

  return response.json().then(data => {
    expect(data.error).toBe(expectedError)
    expect(data.message).toBeDefined()
  })
}
```

---

## 🧪 Handler Testing

### 1. Basic Handler Test Structure

#### Template for Handler Tests
```typescript
// src/mocks/handlers/__tests__/exampleHandler.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { server } from '../../server'
import { MOCK_CREDENTIALS } from '../../data/users'
import { createAuthHeaders, assertSuccessResponse } from '../../test-helpers'

describe('Example Handler', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  describe('GET /api/example', () => {
    it('should return example data', async () => {
      const response = await fetch('/api/example')
      await assertSuccessResponse(response)

      const data = await response.json()
      expect(data).toHaveProperty('message')
      expect(typeof data.message).toBe('string')
    })

    it('should handle query parameters', async () => {
      const response = await fetch('/api/example?limit=5&offset=10')
      await assertSuccessResponse(response)

      const data = await response.json()
      expect(data.limit).toBe(5)
      expect(data.offset).toBe(10)
    })
  })

  describe('POST /api/example', () => {
    it('should create new resource', async () => {
      const newResource = { name: 'Test Resource', value: 42 }

      const response = await fetch('/api/example', {
        method: 'POST',
        headers: createAuthHeaders('admin'),
        body: JSON.stringify(newResource),
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.id).toBeDefined()
      expect(data.name).toBe(newResource.name)
    })

    it('should require authentication', async () => {
      const response = await fetch('/api/example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      })

      expect(response.status).toBe(401)
    })
  })
})
```

### 2. Authentication Testing

#### Testing Protected Endpoints
```typescript
describe('Authentication Requirements', () => {
  it('should reject requests without authorization header', async () => {
    const response = await fetch('/api/protected-endpoint')
    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
    expect(data.message).toContain('token')
  })

  it('should reject requests with invalid token', async () => {
    const response = await fetch('/api/protected-endpoint', {
      headers: { 'Authorization': 'Bearer invalid-token' }
    })
    expect(response.status).toBe(401)
  })

  it('should accept requests with valid token', async () => {
    const response = await fetch('/api/protected-endpoint', {
      headers: createAuthHeaders('student')
    })
    expect(response.status).toBe(200)
  })
})
```

#### Role-Based Access Testing
```typescript
describe('Role-Based Access Control', () => {
  const endpoints = [
    { path: '/api/admin/users', allowedRoles: ['admin'] },
    { path: '/api/instructor/assignments', allowedRoles: ['admin', 'lecturer'] },
    { path: '/api/student/submissions', allowedRoles: ['admin', 'lecturer', 'student'] },
  ]

  endpoints.forEach(({ path, allowedRoles }) => {
    describe(`${path}`, () => {
      it(`should allow access for ${allowedRoles.join(', ')}`, async () => {
        for (const role of allowedRoles) {
          const response = await fetch(path, {
            headers: createAuthHeaders(role as keyof typeof MOCK_CREDENTIALS)
          })
          expect(response.status).toBe(200)
        }
      })

      it(`should deny access for unauthorized roles`, async () => {
        const allRoles = Object.keys(MOCK_CREDENTIALS) as Array<keyof typeof MOCK_CREDENTIALS>
        const unauthorizedRoles = allRoles.filter(role => !allowedRoles.includes(role))

        for (const role of unauthorizedRoles) {
          const response = await fetch(path, {
            headers: createAuthHeaders(role)
          })
          expect(response.status).toBe(403)

          const data = await response.json()
          expect(data.error).toBe('Forbidden')
        }
      })
    })
  })
})
```

### 3. CRUD Operations Testing

#### Create Operations
```typescript
describe('POST /api/resources', () => {
  it('should create resource with valid data', async () => {
    const newResource = {
      name: 'Test Resource',
      description: 'A test resource',
      category: 'test'
    }

    const response = await fetch('/api/resources', {
      method: 'POST',
      headers: createAuthHeaders('admin'),
      body: JSON.stringify(newResource),
    })

    expect(response.status).toBe(201)
    const created = await response.json()

    expect(created.id).toBeDefined()
    expect(created.name).toBe(newResource.name)
    expect(created.createdAt).toBeDefined()
    expect(created.createdBy).toBe(MOCK_USERS.admin.id)
  })

  it('should validate required fields', async () => {
    const invalidData = { description: 'Missing name' }

    const response = await fetch('/api/resources', {
      method: 'POST',
      headers: createAuthHeaders('admin'),
      body: JSON.stringify(invalidData),
    })

    expect(response.status).toBe(400)
    const error = await response.json()
    expect(error.error).toBe('Bad Request')
    expect(error.message).toContain('name')
  })

  it('should handle duplicate creation', async () => {
    const duplicateData = { name: 'Existing Resource' }

    // First creation
    await fetch('/api/resources', {
      method: 'POST',
      headers: createAuthHeaders('admin'),
      body: JSON.stringify(duplicateData),
    })

    // Second creation (should fail)
    const response = await fetch('/api/resources', {
      method: 'POST',
      headers: createAuthHeaders('admin'),
      body: JSON.stringify(duplicateData),
    })

    expect(response.status).toBe(409)
    const error = await response.json()
    expect(error.error).toBe('Conflict')
  })
})
```

#### Read Operations
```typescript
describe('GET /api/resources', () => {
  beforeEach(async () => {
    // Setup test data
    await createTestResources()
  })

  it('should return paginated list', async () => {
    const response = await fetch('/api/resources?page=0&size=10')
    await assertSuccessResponse(response)

    const data = await response.json()
    expect(data).toHaveProperty('content')
    expect(data).toHaveProperty('pageNumber', 0)
    expect(data).toHaveProperty('pageSize', 10)
    expect(data).toHaveProperty('totalElements')
    expect(Array.isArray(data.content)).toBe(true)
  })

  it('should handle pagination parameters', async () => {
    const response = await fetch('/api/resources?page=1&size=5')
    await assertSuccessResponse(response)

    const data = await response.json()
    expect(data.pageNumber).toBe(1)
    expect(data.pageSize).toBe(5)
    expect(data.content.length).toBeLessThanOrEqual(5)
  })

  it('should filter results', async () => {
    const response = await fetch('/api/resources?category=test')
    await assertSuccessResponse(response)

    const data = await response.json()
    data.content.forEach((item: any) => {
      expect(item.category).toBe('test')
    })
  })
})

describe('GET /api/resources/:id', () => {
  it('should return resource by id', async () => {
    const testResource = await createTestResource()

    const response = await fetch(`/api/resources/${testResource.id}`)
    await assertSuccessResponse(response)

    const data = await response.json()
    expect(data.id).toBe(testResource.id)
    expect(data.name).toBe(testResource.name)
  })

  it('should return 404 for non-existent resource', async () => {
    const response = await fetch('/api/resources/non-existent-id')
    expect(response.status).toBe(404)

    const error = await response.json()
    expect(error.error).toBe('Not Found')
  })
})
```

#### Update Operations
```typescript
describe('PUT /api/resources/:id', () => {
  it('should update resource completely', async () => {
    const testResource = await createTestResource()
    const updates = {
      name: 'Updated Name',
      description: 'Updated description',
      category: 'updated'
    }

    const response = await fetch(`/api/resources/${testResource.id}`, {
      method: 'PUT',
      headers: createAuthHeaders('admin'),
      body: JSON.stringify(updates),
    })

    await assertSuccessResponse(response)
    const updated = await response.json()

    expect(updated.id).toBe(testResource.id)
    expect(updated.name).toBe(updates.name)
    expect(updated.description).toBe(updates.description)
    expect(updated.updatedAt).toBeDefined()
  })

  it('should require ownership or admin rights', async () => {
    const otherUserResource = await createTestResource({ createdBy: 'other-user' })

    const response = await fetch(`/api/resources/${otherUserResource.id}`, {
      method: 'PUT',
      headers: createAuthHeaders('student'), // Not owner
      body: JSON.stringify({ name: 'Updated' }),
    })

    expect(response.status).toBe(403)
  })
})

describe('PATCH /api/resources/:id', () => {
  it('should update resource partially', async () => {
    const testResource = await createTestResource()
    const partialUpdate = { name: 'Partially Updated Name' }

    const response = await fetch(`/api/resources/${testResource.id}`, {
      method: 'PATCH',
      headers: createAuthHeaders('admin'),
      body: JSON.stringify(partialUpdate),
    })

    await assertSuccessResponse(response)
    const updated = await response.json()

    expect(updated.id).toBe(testResource.id)
    expect(updated.name).toBe(partialUpdate.name)
    expect(updated.description).toBe(testResource.description) // Unchanged
  })

  it('should validate partial updates', async () => {
    const testResource = await createTestResource()

    const response = await fetch(`/api/resources/${testResource.id}`, {
      method: 'PATCH',
      headers: createAuthHeaders('admin'),
      body: JSON.stringify({ invalidField: 'value' }),
    })

    expect(response.status).toBe(400)
  })
})
```

#### Delete Operations
```typescript
describe('DELETE /api/resources/:id', () => {
  it('should delete resource', async () => {
    const testResource = await createTestResource()

    const response = await fetch(`/api/resources/${testResource.id}`, {
      method: 'DELETE',
      headers: createAuthHeaders('admin'),
    })

    expect(response.status).toBe(200)
    const result = await response.json()
    expect(result.deleted).toBe(true)

    // Verify deletion
    const getResponse = await fetch(`/api/resources/${testResource.id}`)
    expect(getResponse.status).toBe(404)
  })

  it('should require proper permissions', async () => {
    const testResource = await createTestResource()

    const response = await fetch(`/api/resources/${testResource.id}`, {
      method: 'DELETE',
      headers: createAuthHeaders('student'), // Insufficient permissions
    })

    expect(response.status).toBe(403)
  })

  it('should handle deleting non-existent resource', async () => {
    const response = await fetch('/api/resources/non-existent-id', {
      method: 'DELETE',
      headers: createAuthHeaders('admin'),
    })

    expect(response.status).toBe(404)
  })
})
```

---

## 🔗 Integration Testing

### 1. End-to-End API Flows

#### User Registration Flow
```typescript
describe('User Registration Flow', () => {
  it('should complete full registration process', async () => {
    const userData = {
      email: 'newstudent@university.edu',
      password: 'SecurePass@123',
      firstName: 'New',
      lastName: 'Student',
      role: 'STUDENT'
    }

    // Step 1: Register
    const registerResponse = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    expect(registerResponse.status).toBe(201)
    const registerData = await registerResponse.json()
    expect(registerData.token).toBeDefined()
    expect(registerData.user.email).toBe(userData.email)

    // Step 2: Verify email
    const verifyResponse = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: registerData.verificationToken
      }),
    })

    expect(verifyResponse.status).toBe(200)

    // Step 3: Login
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    })

    expect(loginResponse.status).toBe(200)
    const loginData = await loginResponse.json()
    expect(loginData.token).toBeDefined()
    expect(loginData.user.isEmailVerified).toBe(true)

    // Step 4: Access protected resource
    const profileResponse = await fetch('/api/v1/users/me', {
      headers: { 'Authorization': `Bearer ${loginData.token}` },
    })

    expect(profileResponse.status).toBe(200)
    const profile = await profileResponse.json()
    expect(profile.email).toBe(userData.email)
  })
})
```

#### Assignment Submission Flow
```typescript
describe('Assignment Submission Flow', () => {
  let studentToken: string
  let assignmentId: string

  beforeEach(async () => {
    // Setup: Create student and assignment
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: MOCK_CREDENTIALS.student.email,
        password: MOCK_CREDENTIALS.student.password,
      }),
    })
    const loginData = await loginResponse.json()
    studentToken = loginData.token

    // Create assignment
    const assignmentResponse = await fetch('/api/v1/assignments', {
      method: 'POST',
      headers: createAuthHeaders('provider'),
      body: JSON.stringify({
        title: 'Test Assignment',
        description: 'Integration test assignment',
        difficultyLevel: 'EASY',
        languages: ['javascript'],
        testCases: [{
          order: 1,
          input: '2+2',
          output: '4',
          weight: 1.0,
        }],
      }),
    })
    const assignment = await assignmentResponse.json()
    assignmentId = assignment.id
  })

  it('should complete assignment submission workflow', async () => {
    // Step 1: Get assignment details
    const getAssignmentResponse = await fetch(`/api/v1/assignments/${assignmentId}`)
    expect(getAssignmentResponse.status).toBe(200)
    const assignment = await getAssignmentResponse.json()
    expect(assignment.title).toBe('Test Assignment')

    // Step 2: Submit solution
    const submissionResponse = await fetch('/api/v1/submissions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assignmentId,
        code: 'function solution() { return 2 + 2; }',
        language: 'javascript',
      }),
    })

    expect(submissionResponse.status).toBe(201)
    const submission = await submissionResponse.json()
    expect(submission.status).toBe('PENDING')
    expect(submission.assignmentId).toBe(assignmentId)

    // Step 3: Get submission with results
    const getSubmissionResponse = await fetch(`/api/v1/submissions/${submission.id}`, {
      headers: { 'Authorization': `Bearer ${studentToken}` },
    })

    expect(getSubmissionResponse.status).toBe(200)
    const submissionWithResults = await getSubmissionResponse.json()
    expect(submissionWithResults.testResults).toBeDefined()
    expect(Array.isArray(submissionWithResults.testResults)).toBe(true)

    // Step 4: Instructor provides feedback
    const feedbackResponse = await fetch(`/api/v1/submissions/${submission.id}/feedback`, {
      method: 'POST',
      headers: createAuthHeaders('lecturer'),
      body: JSON.stringify({
        feedback: 'Good job!',
        score: 95,
      }),
    })

    expect(feedbackResponse.status).toBe(200)
    const updatedSubmission = await feedbackResponse.json()
    expect(updatedSubmission.status).toBe('EVALUATED')
    expect(updatedSubmission.feedback).toBe('Good job!')
    expect(updatedSubmission.score).toBe(95)
  })
})
```

### 2. Cross-Service Integration

#### User Management Integration
```typescript
describe('User Management Integration', () => {
  it('should handle complete user lifecycle', async () => {
    const newUser = {
      email: 'lifecycle@test.com',
      password: 'TempPass@123',
      firstName: 'Life',
      lastName: 'Cycle',
      role: 'STUDENT'
    }

    // Create user (Admin only)
    const createResponse = await fetch('/api/v1/users', {
      method: 'POST',
      headers: createAuthHeaders('admin'),
      body: JSON.stringify(newUser),
    })

    expect(createResponse.status).toBe(201)
    const createdUser = await createResponse.json()

    // Get user details
    const getResponse = await fetch(`/api/v1/users/${createdUser.id}`, {
      headers: createAuthHeaders('lecturer'),
    })

    expect(getResponse.status).toBe(200)
    const userDetails = await getResponse.json()
    expect(userDetails.email).toBe(newUser.email)

    // Update user profile
    const updateResponse = await fetch('/api/v1/users/me', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${createdUser.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Updated',
        lastName: 'Name',
      }),
    })

    expect(updateResponse.status).toBe(200)

    // Deactivate user (Admin only)
    const deactivateResponse = await fetch(`/api/v1/users/${createdUser.id}/deactivate`, {
      method: 'PUT',
      headers: createAuthHeaders('admin'),
    })

    expect(deactivateResponse.status).toBe(200)

    // Verify deactivation
    const finalGetResponse = await fetch(`/api/v1/users/${createdUser.id}`, {
      headers: createAuthHeaders('admin'),
    })

    expect(finalGetResponse.status).toBe(200)
    const finalUser = await finalGetResponse.json()
    expect(finalUser.isActive).toBe(false)
  })
})
```

---

## 🚨 Error Testing

### 1. Input Validation

#### Required Fields Validation
```typescript
describe('Input Validation - Required Fields', () => {
  const requiredFieldTests = [
    {
      field: 'email',
      data: { password: 'Pass@123', firstName: 'Test', lastName: 'User' },
      message: 'email',
    },
    {
      field: 'password',
      data: { email: 'test@example.com', firstName: 'Test', lastName: 'User' },
      message: 'password',
    },
    {
      field: 'firstName',
      data: { email: 'test@example.com', password: 'Pass@123', lastName: 'User' },
      message: 'firstName',
    },
  ]

  requiredFieldTests.forEach(({ field, data, message }) => {
    it(`should reject missing ${field}`, async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      expect(response.status).toBe(400)
      const error = await response.json()
      expect(error.error).toBe('Bad Request')
      expect(error.message.toLowerCase()).toContain(message.toLowerCase())
    })
  })
})
```

#### Format Validation
```typescript
describe('Input Validation - Format', () => {
  const formatTests = [
    {
      description: 'invalid email format',
      data: { email: 'invalid-email', password: 'Pass@123', firstName: 'Test', lastName: 'User' },
      expectedError: 'email',
    },
    {
      description: 'weak password',
      data: { email: 'test@example.com', password: '123', firstName: 'Test', lastName: 'User' },
      expectedError: 'password',
    },
    {
      description: 'empty firstName',
      data: { email: 'test@example.com', password: 'Pass@123', firstName: '', lastName: 'User' },
      expectedError: 'firstName',
    },
  ]

  formatTests.forEach(({ description, data, expectedError }) => {
    it(`should reject ${description}`, async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      expect(response.status).toBe(400)
      const error = await response.json()
      expect(error.error).toBe('Bad Request')
      expect(error.message.toLowerCase()).toContain(expectedError.toLowerCase())
    })
  })
})
```

### 2. Business Logic Validation

#### Duplicate Prevention
```typescript
describe('Business Logic - Duplicates', () => {
  beforeEach(async () => {
    // Create initial user
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'Pass@123',
        firstName: 'Existing',
        lastName: 'User',
      }),
    })
  })

  it('should prevent duplicate email registration', async () => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'existing@example.com', // Same email
        password: 'Different@123',
        firstName: 'Different',
        lastName: 'User',
      }),
    })

    expect(response.status).toBe(409)
    const error = await response.json()
    expect(error.error).toBe('Conflict')
    expect(error.message.toLowerCase()).toContain('email')
  })
})
```

#### State Transitions
```typescript
describe('Business Logic - State Transitions', () => {
  it('should prevent invalid assignment status transitions', async () => {
    // Create draft assignment
    const createResponse = await fetch('/api/v1/assignments', {
      method: 'POST',
      headers: createAuthHeaders('provider'),
      body: JSON.stringify({
        title: 'Test Assignment',
        description: 'Test',
        difficultyLevel: 'EASY',
        languages: ['javascript'],
        testCases: [],
      }),
    })

    const assignment = await createResponse.json()

    // Try to archive draft assignment (should fail)
    const archiveResponse = await fetch(`/api/v1/assignments/${assignment.id}/archive`, {
      method: 'POST',
      headers: createAuthHeaders('provider'),
    })

    expect(archiveResponse.status).toBe(400)
    const error = await archiveResponse.json()
    expect(error.error).toBe('Bad Request')
    expect(error.message).toContain('status')
  })

  it('should allow valid status transitions', async () => {
    // Create and publish assignment
    const createResponse = await fetch('/api/v1/assignments', {
      method: 'POST',
      headers: createAuthHeaders('provider'),
      body: JSON.stringify({
        title: 'Test Assignment',
        description: 'Test',
        difficultyLevel: 'EASY',
        languages: ['javascript'],
        testCases: [],
      }),
    })

    const assignment = await createResponse.json()

    // Publish assignment
    await fetch(`/api/v1/assignments/${assignment.id}/publish`, {
      method: 'POST',
      headers: createAuthHeaders('provider'),
    })

    // Now archive should work
    const archiveResponse = await fetch(`/api/v1/assignments/${assignment.id}/archive`, {
      method: 'POST',
      headers: createAuthHeaders('provider'),
    })

    expect(archiveResponse.status).toBe(200)
  })
})
```

### 3. Resource Not Found

#### Non-existent Resources
```typescript
describe('Resource Not Found', () => {
  const notFoundTests = [
    {
      endpoint: '/api/v1/users/non-existent-user',
      method: 'GET',
      auth: 'lecturer',
    },
    {
      endpoint: '/api/v1/assignments/non-existent-assignment',
      method: 'GET',
      auth: 'student',
    },
    {
      endpoint: '/api/v1/submissions/non-existent-submission',
      method: 'GET',
      auth: 'student',
    },
  ]

  notFoundTests.forEach(({ endpoint, method, auth }) => {
    it(`should return 404 for ${endpoint}`, async () => {
      const response = await fetch(endpoint, {
        method,
        headers: createAuthHeaders(auth as keyof typeof MOCK_CREDENTIALS),
      })

      expect(response.status).toBe(404)
      const error = await response.json()
      expect(error.error).toBe('Not Found')
      expect(error.message).toContain('not found')
    })
  })
})
```

### 4. Authorization Failures

#### Insufficient Permissions
```typescript
describe('Authorization Failures', () => {
  it('should reject student from admin endpoints', async () => {
    const adminEndpoints = [
      { method: 'GET', path: '/api/v1/users' },
      { method: 'POST', path: '/api/v1/users' },
      { method: 'DELETE', path: '/api/v1/users/student-id' },
    ]

    for (const { method, path } of adminEndpoints) {
      const response = await fetch(path, {
        method,
        headers: createAuthHeaders('student'),
      })

      expect(response.status).toBe(403)
      const error = await response.json()
      expect(error.error).toBe('Forbidden')
    }
  })

  it('should reject unauthorized assignment modifications', async () => {
    // Create assignment as provider
    const createResponse = await fetch('/api/v1/assignments', {
      method: 'POST',
      headers: createAuthHeaders('provider'),
      body: JSON.stringify({
        title: 'Test',
        description: 'Test',
        difficultyLevel: 'EASY',
        languages: ['javascript'],
        testCases: [],
      }),
    })

    const assignment = await createResponse.json()

    // Try to modify as student (should fail)
    const updateResponse = await fetch(`/api/v1/assignments/${assignment.id}`, {
      method: 'PATCH',
      headers: createAuthHeaders('student'),
      body: JSON.stringify({ title: 'Modified by student' }),
    })

    expect(updateResponse.status).toBe(403)
  })
})
```

---

## ⚡ Advanced Testing

### 1. Concurrent Request Testing

#### MSW 2.0 Boundary API
```typescript
describe('Concurrent Requests', () => {
  it('should handle multiple simultaneous requests', async () => {
    await server.boundary(async () => {
      const requests = Array.from({ length: 10 }, (_, i) => ({
        id: `user-${i}`,
        email: `user${i}@test.com`,
        password: 'Pass@123',
        firstName: `User${i}`,
        lastName: 'Test',
      }))

      // Create multiple users concurrently
      const createPromises = requests.map(user =>
        fetch('/api/v1/users', {
          method: 'POST',
          headers: createAuthHeaders('admin'),
          body: JSON.stringify(user),
        })
      )

      const responses = await Promise.all(createPromises)

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201)
      })

      // Verify all users were created
      const listResponse = await fetch('/api/v1/users?page=0&size=20', {
        headers: createAuthHeaders('admin'),
      })

      const data = await listResponse.json()
      expect(data.totalElements).toBeGreaterThanOrEqual(10)
    })
  })

  it('should handle mixed success/failure scenarios', async () => {
    await server.boundary(async () => {
      const validUser = {
        email: 'valid@test.com',
        password: 'Pass@123',
        firstName: 'Valid',
        lastName: 'User',
      }

      const invalidUser = {
        // Missing required fields
        email: 'invalid@test.com',
      }

      const [validResponse, invalidResponse] = await Promise.all([
        fetch('/api/v1/users', {
          method: 'POST',
          headers: createAuthHeaders('admin'),
          body: JSON.stringify(validUser),
        }),
        fetch('/api/v1/users', {
          method: 'POST',
          headers: createAuthHeaders('admin'),
          body: JSON.stringify(invalidUser),
        }),
      ])

      expect(validResponse.status).toBe(201)
      expect(invalidResponse.status).toBe(400)
    })
  })
})
```

### 2. Request/Response Interception

#### Custom Request Matching
```typescript
describe('Request Interception', () => {
  it('should intercept requests based on custom logic', async () => {
    let interceptedRequest: Request | null = null

    server.use(
      http.post('/api/custom-endpoint', async ({ request }) => {
        interceptedRequest = request

        const body = await request.json()
        return HttpResponse.json({
          intercepted: true,
          originalBody: body,
          headers: Object.fromEntries(request.headers.entries()),
        })
      })
    )

    const response = await fetch('/api/custom-endpoint', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'X-Custom-Header': 'custom-value',
      },
      body: JSON.stringify({ test: 'data' }),
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data.intercepted).toBe(true)
    expect(data.originalBody).toEqual({ test: 'data' })
    expect(data.headers.authorization).toBe('Bearer test-token')
    expect(data.headers['x-custom-header']).toBe('custom-value')

    expect(interceptedRequest).not.toBeNull()
  })
})
```

### 3. Network Delay Simulation

#### Response Delays
```typescript
describe('Network Conditions', () => {
  it('should handle slow responses', async () => {
    server.use(
      http.get('/api/slow-endpoint', async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100))
        return HttpResponse.json({ data: 'slow response' })
      })
    )

    const startTime = Date.now()
    const response = await fetch('/api/slow-endpoint')
    const endTime = Date.now()

    expect(response.status).toBe(200)
    expect(endTime - startTime).toBeGreaterThanOrEqual(100)
  })

  it('should handle timeout scenarios', async () => {
    server.use(
      http.get('/api/timeout-endpoint', async () => {
        // Simulate very slow response
        await new Promise(resolve => setTimeout(resolve, 5000))
        return HttpResponse.json({ data: 'timeout response' })
      })
    )

    // Set short timeout
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 1000)

    try {
      await fetch('/api/timeout-endpoint', {
        signal: controller.signal,
      })
      fail('Should have timed out')
    } catch (error) {
      expect(error.name).toBe('AbortError')
    }
  })
})
```

### 4. File Upload Testing

#### Multipart Form Data
```typescript
describe('File Upload', () => {
  it('should handle file uploads', async () => {
    const fileContent = 'test file content'
    const file = new File([fileContent], 'test.txt', { type: 'text/plain' })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('description', 'Test file upload')

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: createAuthHeaders('student'),
      body: formData,
    })

    expect(response.status).toBe(201)
    const result = await response.json()

    expect(result.success).toBe(true)
    expect(result.fileId).toBeDefined()
    expect(result.fileName).toBe('test.txt')
    expect(result.fileSize).toBe(fileContent.length)
  })

  it('should validate file types', async () => {
    const invalidFile = new File(['invalid content'], 'test.exe', {
      type: 'application/x-msdownload'
    })

    const formData = new FormData()
    formData.append('file', invalidFile)

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: createAuthHeaders('student'),
      body: formData,
    })

    expect(response.status).toBe(400)
    const error = await response.json()
    expect(error.error).toBe('Bad Request')
    expect(error.message).toContain('file type')
  })
})
```

---

## ✅ Best Practices

### 1. Test Organization

#### File Structure
```
src/mocks/handlers/__tests__/
├── identity/
│   ├── auth.test.ts
│   ├── profile.test.ts
│   └── admin.test.ts
├── submission/
│   ├── crud.test.ts
│   └── feedback.test.ts
├── content/
│   ├── tutorials.test.ts
│   ├── skills.test.ts
│   └── assignments.test.ts
├── support/
│   └── sessions.test.ts
├── integration/
│   ├── user-flow.test.ts
│   └── assignment-flow.test.ts
└── utils/
    ├── test-helpers.ts
    └── fixtures.ts
```

#### Test Naming Conventions
```typescript
describe('Feature Name', () => {
  describe('HTTP Method /endpoint/path', () => {
    it('should describe expected behavior', async () => {
      // Test implementation
    })

    it('should handle edge case scenario', async () => {
      // Edge case test
    })
  })
})
```

### 2. Test Data Management

#### Fixtures and Factories
```typescript
// src/mocks/test-helpers.ts
export function createUserFixture(overrides = {}) {
  return {
    id: `user-${Date.now()}`,
    email: `user${Date.now()}@test.com`,
    password: 'TestPass@123',
    firstName: 'Test',
    lastName: 'User',
    role: 'STUDENT',
    isActive: true,
    isEmailVerified: true,
    ...overrides,
  }
}

export function createAssignmentFixture(overrides = {}) {
  return {
    title: 'Test Assignment',
    description: 'Test assignment description',
    difficultyLevel: 'MEDIUM',
    languages: ['javascript', 'python'],
    testCases: [
      {
        order: 1,
        input: '2+2',
        output: '4',
        weight: 1.0,
      },
    ],
    ...overrides,
  }
}
```

#### Test Data Cleanup
```typescript
describe('Test Data Cleanup', () => {
  let createdUsers: string[] = []
  let createdAssignments: string[] = []

  afterEach(async () => {
    // Clean up created resources
    for (const userId of createdUsers) {
      await fetch(`/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: createAuthHeaders('admin'),
      })
    }

    for (const assignmentId of createdAssignments) {
      await fetch(`/api/v1/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: createAuthHeaders('provider'),
      })
    }

    createdUsers = []
    createdAssignments = []
  })

  it('should create and cleanup test data', async () => {
    // Create test data
    const userResponse = await fetch('/api/v1/users', {
      method: 'POST',
      headers: createAuthHeaders('admin'),
      body: JSON.stringify(createUserFixture()),
    })

    const user = await userResponse.json()
    createdUsers.push(user.id)

    // Test logic here
    expect(user.id).toBeDefined()
  })
})
```

### 3. Assertion Patterns

#### Response Assertions
```typescript
export function assertSuccessfulResponse(response: Response, expectedStatus = 200) {
  expect(response.status).toBe(expectedStatus)
  expect(response.headers.get('content-type')).toContain('application/json')
}

export function assertErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedError: string
) {
  expect(response.status).toBe(expectedStatus)
  expect(response.headers.get('content-type')).toContain('application/json')

  return response.json().then(data => {
    expect(data.error).toBe(expectedError)
    expect(data.message).toBeDefined()
    expect(typeof data.message).toBe('string')
    expect(data.message.length).toBeGreaterThan(0)
  })
}

export function assertPaginatedResponse(response: Response) {
  return assertSuccessfulResponse(response).then(() =>
    response.json().then(data => {
      expect(data).toHaveProperty('content')
      expect(data).toHaveProperty('pageNumber')
      expect(data).toHaveProperty('pageSize')
      expect(data).toHaveProperty('totalElements')
      expect(data).toHaveProperty('totalPages')
      expect(Array.isArray(data.content)).toBe(true)
    })
  )
}
```

#### Data Structure Assertions
```typescript
export function assertUserShape(user: any) {
  expect(user).toHaveProperty('id')
  expect(user).toHaveProperty('email')
  expect(user).toHaveProperty('firstName')
  expect(user).toHaveProperty('lastName')
  expect(user).toHaveProperty('role')
  expect(user).toHaveProperty('isActive')
  expect(user).toHaveProperty('createdAt')
  expect(user).toHaveProperty('updatedAt')

  expect(typeof user.email).toBe('string')
  expect(user.email).toContain('@')
  expect(['STUDENT', 'INSTRUCTOR', 'CONTENT_PROVIDER', 'ADMIN']).toContain(user.role)
}

export function assertAssignmentShape(assignment: any) {
  expect(assignment).toHaveProperty('id')
  expect(assignment).toHaveProperty('title')
  expect(assignment).toHaveProperty('description')
  expect(assignment).toHaveProperty('difficultyLevel')
  expect(assignment).toHaveProperty('languages')
  expect(assignment).toHaveProperty('testCases')
  expect(assignment).toHaveProperty('status')
  expect(assignment).toHaveProperty('createdAt')

  expect(Array.isArray(assignment.languages)).toBe(true)
  expect(Array.isArray(assignment.testCases)).toBe(true)
  expect(['DRAFT', 'PUBLISHED', 'ARCHIVED']).toContain(assignment.status)
}
```

### 4. Performance Testing

#### Response Time Assertions
```typescript
describe('Performance Tests', () => {
  it('should respond within acceptable time', async () => {
    const startTime = performance.now()

    const response = await fetch('/api/fast-endpoint')
    await response.json()

    const endTime = performance.now()
    const responseTime = endTime - startTime

    expect(responseTime).toBeLessThan(100) // Less than 100ms
  })

  it('should handle load without degradation', async () => {
    const requestCount = 50
    const startTime = performance.now()

    const requests = Array.from({ length: requestCount }, () =>
      fetch('/api/list-endpoint?page=0&size=10')
    )

    await Promise.all(requests)

    const endTime = performance.now()
    const totalTime = endTime - startTime
    const avgTime = totalTime / requestCount

    expect(avgTime).toBeLessThan(50) // Average < 50ms per request
  })
})
```

---

## 🐛 Debugging Tests

### 1. Common Issues

#### Tests Not Running
```typescript
// Problem: MSW server not started
// Solution: Check test setup
beforeAll(() => server.listen())
afterAll(() => server.close())
```

#### Handler Not Intercepting
```typescript
// Problem: Request goes to real API
// Solution: Check handler registration
const handlers = [/* all handlers */]
const server = setupServer(...handlers)
```

#### Authentication Failing
```typescript
// Problem: 401 errors
// Solution: Check token format
const headers = {
  'Authorization': `Bearer ${MOCK_CREDENTIALS.admin.token}` // Correct format
}
```

### 2. Debug Logging

#### Request Logging
```typescript
// Add to handler for debugging
http.get('/api/debug', async ({ request }) => {
  console.log('Request:', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
  })

  const response = await fetch(request) // Forward to real API if needed
  return response
})
```

#### MSW DevTools Integration
```typescript
// In test setup or app
if (import.meta.env.DEV) {
  import('msw-devtools').then(({ setupWorker }) => {
    setupWorker().start()
  })
}
```

### 3. Test Isolation

#### Handler Reset
```typescript
describe('Test Isolation', () => {
  beforeEach(() => {
    server.resetHandlers() // Reset to original handlers
  })

  it('should use default handlers', async () => {
    // Test with default behavior
  })

  it('should override handlers', async () => {
    server.use(
      http.get('/api/test', () => HttpResponse.json({ overridden: true }))
    )

    const response = await fetch('/api/test')
    const data = await response.json()
    expect(data.overridden).toBe(true)
  })
})
```

---

## 📚 Additional Resources

### MSW Documentation
- [MSW Official Docs](https://mswjs.io/)
- [MSW GitHub Repository](https://github.com/mswjs/msw)
- [MSW 2.0 Migration Guide](https://mswjs.io/docs/migrations/1.x-to-2.x/)

### Testing Libraries
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

### Community Resources
- [MSW Recipes](https://mswjs.io/docs/recipes/)
- [Awesome MSW](https://github.com/mswjs/awesome-msw)
- [MSW Examples](https://github.com/mswjs/examples)

---

**Last Updated:** October 20, 2025
**MSW Version:** 2.11.5
**Test Framework:** Vitest
**Authors:** APSAS Development Team</content>
<parameter name="filePath">d:\apsas\frontend\docs\ai-gen\msw\docs-tasks-gen-by-ai\MSW-TESTING-GUIDE.md