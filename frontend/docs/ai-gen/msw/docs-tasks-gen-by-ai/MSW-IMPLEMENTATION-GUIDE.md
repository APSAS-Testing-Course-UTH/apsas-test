# MSW Implementation Guide for APSAS Frontend

**Version:** 1.0 | **Date:** October 20, 2025 | **MSW Version:** 2.11.5

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Setup & Configuration](#setup--configuration)
4. [Handler Implementation](#handler-implementation)
5. [Testing Patterns](#testing-patterns)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Migration Guide](#migration-guide)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- React 18+
- TypeScript 5+
- MSW 2.11.5

### Installation
```bash
# Install MSW
bun add --save-dev msw

# Initialize MSW for browser
bunx msw init public/ --save
```

### Basic Setup
```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

// src/test/setup.ts
import { server } from '@/mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### First Handler
```typescript
// src/mocks/handlers/example.ts
import { http, HttpResponse } from 'msw'

export const exampleHandlers = [
  http.get('/api/example', () => {
    return HttpResponse.json({ message: 'Hello from MSW!' })
  })
]
```

---

## 🏗️ Architecture Overview

### MSW 2.0 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │   MSW Server    │    │   Handlers      │
│   (React App)   │◄──►│   (Intercepts)  │◄──►│   (Mock Logic)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Service       │    │   Middleware    │    │   Mock Data     │
│   Worker        │    │   (withAuth)    │    │   (users.ts)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

#### 1. Server Setup
- **Browser Server**: `src/mocks/browser.ts` - For browser testing
- **Node Server**: `src/mocks/server.ts` - For Node.js testing
- **Service Worker**: `public/mockServiceWorker.js` - Browser interception

#### 2. Handlers
- **Identity Handlers**: Authentication & user management
- **Submission Handlers**: Code submission & evaluation
- **Content Handlers**: Tutorials, skills, assignments
- **Support Handlers**: Help desk functionality

#### 3. Middleware
- **withAuth**: Authentication & authorization
- **Error Handler**: Centralized error responses

#### 4. Mock Data
- **Users**: Role-based test users
- **Content**: Sample tutorials, skills, assignments
- **Submissions**: Test submissions with results

---

## ⚙️ Setup & Configuration

### 1. Environment Setup

#### Vitest Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

#### Test Setup File
```typescript
// src/test/setup.ts
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { server } from '@/mocks/server'

expect.extend(matchers)

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterAll(() => server.close())
```

### 2. Handler Organization

#### File Structure
```
src/mocks/
├── handlers/
│   ├── index.ts              # Export all handlers
│   ├── identityHandlers.ts   # Auth & user endpoints
│   ├── submissionHandlers.ts # Submission endpoints
│   ├── contentHandlers.ts    # Content endpoints
│   ├── supportHandlers.ts    # Support endpoints
│   └── __tests__/           # Handler tests
├── middleware/
│   ├── withAuth.ts          # Authentication middleware
│   └── errorHandler.ts      # Error handling
├── data/
│   └── users.ts             # Mock user data
├── server.ts                # Node server setup
└── browser.ts               # Browser setup
```

#### Handler Index
```typescript
// src/mocks/handlers/index.ts
import { identityHandlers } from './identityHandlers'
import { submissionHandlers } from './submissionHandlers'
import { contentHandlers } from './contentHandlers'
import { supportHandlers } from './supportHandlers'

export const handlers = [
  ...identityHandlers,
  ...submissionHandlers,
  ...contentHandlers,
  ...supportHandlers,
]
```

### 3. Mock Data Management

#### User Data Structure
```typescript
// src/mocks/data/users.ts
export const MOCK_USERS = {
  admin: {
    id: 'admin-001',
    email: 'admin@apsas.edu.vn',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN' as const,
    isActive: true,
    isEmailVerified: true,
  },
  lecturer: {
    id: 'lecturer-001',
    email: 'lecturer@apsas.edu.vn',
    firstName: 'Lecturer',
    lastName: 'User',
    role: 'INSTRUCTOR' as const,
    isActive: true,
    isEmailVerified: true,
  },
  student: {
    id: 'student-001',
    email: 'student@apsas.edu.vn',
    firstName: 'Student',
    lastName: 'User',
    role: 'STUDENT' as const,
    isActive: true,
    isEmailVerified: true,
  },
  provider: {
    id: 'provider-001',
    email: 'provider@apsas.edu.vn',
    firstName: 'Content',
    lastName: 'Provider',
    role: 'CONTENT_PROVIDER' as const,
    isActive: true,
    isEmailVerified: true,
  },
}

export const MOCK_CREDENTIALS = {
  admin: {
    email: MOCK_USERS.admin.email,
    password: 'Admin@123',
    token: 'admin-token',
    role: MOCK_USERS.admin.role,
  },
  lecturer: {
    email: MOCK_USERS.lecturer.email,
    password: 'Lecturer@123',
    token: 'lecturer-token',
    role: MOCK_USERS.lecturer.role,
  },
  student: {
    email: MOCK_USERS.student.email,
    password: 'Student@123',
    token: 'student-token',
    role: MOCK_USERS.student.role,
  },
  provider: {
    email: MOCK_USERS.provider.email,
    password: 'Provider@123',
    token: 'provider-token',
    role: MOCK_USERS.provider.role,
  },
}
```

---

## 🔧 Handler Implementation

### 1. Basic Handler Pattern

#### HTTP Methods
```typescript
import { http, HttpResponse } from 'msw'

// GET handler
http.get('/api/resource', () => {
  return HttpResponse.json({ data: 'response' })
})

// POST handler
http.post('/api/resource', async ({ request }) => {
  const body = await request.json()
  return HttpResponse.json({ created: true, data: body })
})

// PUT handler
http.put('/api/resource/:id', async ({ params, request }) => {
  const { id } = params
  const body = await request.json()
  return HttpResponse.json({ updated: true, id, data: body })
})

// DELETE handler
http.delete('/api/resource/:id', ({ params }) => {
  const { id } = params
  return HttpResponse.json({ deleted: true, id })
})
```

### 2. Authentication Middleware

#### withAuth Higher-Order Function
```typescript
// src/mocks/middleware/withAuth.ts
import { HttpResponse } from 'msw'
import { MOCK_USERS } from '../data/users'

export interface AuthenticatedRequest {
  user: typeof MOCK_USERS.admin
  token: string
}

export function withAuth(
  handler: (args: { request: Request; params?: any } & AuthenticatedRequest) => HttpResponse | Promise<HttpResponse>
) {
  return async ({ request, params }: { request: Request; params?: any }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized', message: 'Missing or invalid token' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const user = validateToken(token)

    if (!user) {
      return HttpResponse.json(
        { error: 'Unauthorized', message: 'Invalid token' },
        { status: 401 }
      )
    }

    return handler({ request, params, user, token })
  }
}

function validateToken(token: string) {
  // Token validation logic
  const userMap: Record<string, any> = {
    'admin-token': MOCK_USERS.admin,
    'lecturer-token': MOCK_USERS.lecturer,
    'student-token': MOCK_USERS.student,
    'provider-token': MOCK_USERS.provider,
  }

  return userMap[token] || null
}
```

#### Usage in Handlers
```typescript
// Protected handler
http.get('/api/protected', withAuth(({ user }) => {
  // user is now available
  return HttpResponse.json({ message: `Hello ${user.firstName}!` })
}))

// Role-based access
http.post('/api/admin-only', withAuth(({ user }) => {
  if (user.role !== 'ADMIN') {
    return HttpResponse.json(
      { error: 'Forbidden', message: 'Admin access required' },
      { status: 403 }
    )
  }

  return HttpResponse.json({ message: 'Admin action completed' })
}))
```

### 3. Error Handling

#### Centralized Error Responses
```typescript
// src/mocks/middleware/errorHandler.ts
import { HttpResponse } from 'msw'

export const ErrorResponses = {
  badRequest: (message: string) =>
    HttpResponse.json({ error: 'Bad Request', message }, { status: 400 }),

  unauthorized: (message = 'Authentication required') =>
    HttpResponse.json({ error: 'Unauthorized', message }, { status: 401 }),

  forbidden: (message = 'Access denied') =>
    HttpResponse.json({ error: 'Forbidden', message }, { status: 403 }),

  notFound: (resource = 'Resource') =>
    HttpResponse.json({ error: 'Not Found', message: `${resource} not found` }, { status: 404 }),

  conflict: (message: string) =>
    HttpResponse.json({ error: 'Conflict', message }, { status: 409 }),

  serverError: (message = 'Internal server error') =>
    HttpResponse.json({ error: 'Internal Server Error', message }, { status: 500 }),
}
```

#### Usage
```typescript
import { ErrorResponses } from '../middleware/errorHandler'

http.get('/api/resource/:id', ({ params }) => {
  const resource = findResource(params.id)

  if (!resource) {
    return ErrorResponses.notFound('Resource')
  }

  return HttpResponse.json(resource)
})
```

### 4. Pagination Implementation

#### Page Response Structure
```typescript
interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  hasNext: boolean
  hasPrevious: boolean
}
```

#### Pagination Handler
```typescript
http.get('/api/resources', ({ request }) => {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page')) || 0
  const size = Number(url.searchParams.get('size')) || 10

  const allItems = getAllResources()
  const totalElements = allItems.length
  const totalPages = Math.ceil(totalElements / size)
  const startIndex = page * size
  const endIndex = startIndex + size

  const content = allItems.slice(startIndex, endIndex)

  const response: PageResponse<any> = {
    content,
    pageNumber: page,
    pageSize: size,
    totalElements,
    totalPages,
    first: page === 0,
    last: page >= totalPages - 1,
    hasNext: page < totalPages - 1,
    hasPrevious: page > 0,
  }

  return HttpResponse.json(response)
})
```

### 5. Advanced Features

#### PATCH Operations
```typescript
http.patch('/api/resource/:id', withAuth(async ({ params, request, user }) => {
  const { id } = params
  const updates = await request.json()

  // Authorization check
  if (!canUpdate(user, id)) {
    return ErrorResponses.forbidden('Update not allowed')
  }

  // Validation
  const validation = validateUpdates(updates)
  if (!validation.valid) {
    return ErrorResponses.badRequest(validation.message)
  }

  // Update resource
  const updatedResource = updateResource(id, updates, user.id)

  return HttpResponse.json(updatedResource)
}))
```

#### File Upload Handling
```typescript
http.post('/api/upload', withAuth(async ({ request }) => {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return ErrorResponses.badRequest('No file provided')
  }

  // Validate file type and size
  if (!isValidFile(file)) {
    return ErrorResponses.badRequest('Invalid file type or size')
  }

  // Process file
  const result = await processFile(file)

  return HttpResponse.json({
    success: true,
    fileId: result.id,
    url: result.url
  })
}))
```

---

## 🧪 Testing Patterns

### 1. Handler Testing

#### Basic Test Structure
```typescript
// src/mocks/handlers/__tests__/example.test.ts
import { describe, it, expect } from 'vitest'
import { server } from '../../server'
import { MOCK_CREDENTIALS } from '../../data/users'

describe('Example Handler', () => {
  it('should return success response', async () => {
    const response = await fetch('/api/example')
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'Hello from MSW!' })
  })

  it('should require authentication', async () => {
    const response = await fetch('/api/protected')

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('should work with valid token', async () => {
    const response = await fetch('/api/protected', {
      headers: {
        'Authorization': `Bearer ${MOCK_CREDENTIALS.admin.token}`
      }
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Hello Admin!')
  })
})
```

### 2. Integration Testing

#### End-to-End Flow Test
```typescript
describe('User Registration Flow', () => {
  it('should complete full registration process', async () => {
    // 1. Register user
    const registerResponse = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newuser@test.com',
        password: 'Password@123',
        firstName: 'New',
        lastName: 'User'
      })
    })

    expect(registerResponse.status).toBe(201)
    const registerData = await registerResponse.json()
    expect(registerData.token).toBeDefined()

    // 2. Verify email
    const verifyResponse = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: registerData.verificationToken })
    })

    expect(verifyResponse.status).toBe(200)

    // 3. Login with new credentials
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newuser@test.com',
        password: 'Password@123'
      })
    })

    expect(loginResponse.status).toBe(200)
    const loginData = await loginResponse.json()
    expect(loginData.token).toBeDefined()
  })
})
```

### 3. Error Testing

#### Validation Error Testing
```typescript
describe('Input Validation', () => {
  it('should reject invalid email format', async () => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'Password@123',
        firstName: 'Test',
        lastName: 'User'
      })
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Bad Request')
    expect(data.message).toContain('email')
  })

  it('should reject weak passwords', async () => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User'
      })
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toContain('password')
  })
})
```

### 4. Concurrent Request Testing

#### MSW 2.0 Boundary Testing
```typescript
describe('Concurrent Requests', () => {
  it('should handle multiple simultaneous requests', async () => {
    server.boundary(() => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        fetch(`/api/resource/${i}`, {
          headers: { 'Authorization': `Bearer ${MOCK_CREDENTIALS.admin.token}` }
        })
      )

      return Promise.all(promises).then(responses => {
        responses.forEach(response => {
          expect(response.status).toBe(200)
        })
      })
    })
  })
})
```

---

## ✅ Best Practices

### 1. Handler Organization

#### Consistent Patterns
- Use `withAuth` for all protected endpoints
- Follow RESTful URL patterns
- Use consistent response formats
- Include proper error messages

#### Naming Conventions
```typescript
// Good: Descriptive and consistent
http.get('/api/users/:userId/profile', withAuth(getUserProfileHandler))
http.post('/api/users/:userId/posts', withAuth(createUserPostHandler))

// Bad: Inconsistent naming
http.get('/api/userProfile/:id', auth(getProfile))
http.post('/api/createPost', requireAuth(createPost))
```

### 2. Mock Data Management

#### Realistic Data
```typescript
// Good: Realistic test data
const mockUsers = [
  {
    id: 'user-001',
    email: 'john.doe@university.edu',
    firstName: 'John',
    lastName: 'Doe',
    role: 'STUDENT',
    enrolledDate: new Date('2023-09-01'),
    gpa: 3.7,
    courses: ['CS101', 'MATH201']
  }
]

// Bad: Minimal unrealistic data
const mockUsers = [
  { id: 1, name: 'User 1', role: 'admin' }
]
```

#### Data Relationships
```typescript
// Maintain referential integrity
const mockCourses = [
  { id: 'cs101', name: 'Introduction to CS', instructorId: 'inst-001' }
]

const mockEnrollments = [
  { studentId: 'stud-001', courseId: 'cs101', grade: 'A' }
]

// Ensure foreign keys exist
const mockInstructors = [
  { id: 'inst-001', name: 'Dr. Smith', department: 'Computer Science' }
]
```

### 3. Error Handling

#### Comprehensive Error Coverage
```typescript
// Test all error scenarios
describe('Error Scenarios', () => {
  it('should handle not found', async () => {
    const response = await fetch('/api/users/nonexistent-id')
    expect(response.status).toBe(404)
  })

  it('should handle unauthorized', async () => {
    const response = await fetch('/api/admin/users')
    expect(response.status).toBe(401)
  })

  it('should handle forbidden', async () => {
    const response = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${MOCK_CREDENTIALS.student.token}` }
    })
    expect(response.status).toBe(403)
  })

  it('should handle validation errors', async () => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Empty body
    })
    expect(response.status).toBe(400)
  })
})
```

### 4. Performance Considerations

#### Efficient Mock Data
```typescript
// Use Maps for O(1) lookups
const userMap = new Map(mockUsers.map(user => [user.id, user]))

// Efficient lookup
function findUser(id: string) {
  return userMap.get(id) || null
}

// Avoid linear searches
function findUserBad(id: string) {
  return mockUsers.find(user => user.id === id) || null // O(n)
}
```

#### Lazy Loading
```typescript
// Load large datasets on demand
let largeDataset: any[] | null = null

function getLargeDataset() {
  if (!largeDataset) {
    largeDataset = generateLargeMockData()
  }
  return largeDataset
}
```

### 5. Type Safety

#### TypeScript Integration
```typescript
// Use generated types
import type {
  IdentityServiceUserResponse,
  ContentServiceTutorialResponse
} from '@/api/types.gen'

// Type-safe handlers
http.get('/api/users/:id', withAuth(({ params }): HttpResponse<IdentityServiceUserResponse> => {
  const user = findUser(params.id)
  if (!user) return ErrorResponses.notFound('User')

  return HttpResponse.json(user)
}))
```

#### Zod Validation
```typescript
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'CONTENT_PROVIDER', 'ADMIN'])
})

http.post('/api/users', withAuth(async ({ request }) => {
  const body = await request.json()

  const validation = CreateUserSchema.safeParse(body)
  if (!validation.success) {
    return ErrorResponses.badRequest(validation.error.message)
  }

  const user = createUser(validation.data)
  return HttpResponse.json(user, { status: 201 })
}))
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Handlers Not Intercepting Requests
```typescript
// Problem: Requests going to real API
const server = setupServer(...handlers)

// Solution: Ensure server is started in test setup
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterAll(() => server.close())
```

#### 2. Authentication Not Working
```typescript
// Problem: 401 errors in tests
const response = await fetch('/api/protected', {
  headers: {
    'Authorization': 'Bearer invalid-token' // Wrong token
  }
})

// Solution: Use correct tokens from MOCK_CREDENTIALS
const response = await fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${MOCK_CREDENTIALS.admin.token}`
  }
})
```

#### 3. Type Errors
```typescript
// Problem: Type mismatch in responses
return HttpResponse.json({ data: 'string' }) // Type error

// Solution: Use proper typing
return HttpResponse.json({ data: 'string' } as MyResponseType)
```

#### 4. Handler Conflicts
```typescript
// Problem: Multiple handlers for same route
http.get('/api/users', handler1)
http.get('/api/users', handler2) // Conflict

// Solution: Combine handlers or use more specific routes
http.get('/api/users', combinedHandler)
http.get('/api/users/:id', userByIdHandler)
```

### Debug Tips

#### Logging Requests
```typescript
// Add logging to handlers
http.get('/api/debug', ({ request }) => {
  console.log('Request:', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries())
  })

  return HttpResponse.json({ debug: true })
})
```

#### MSW DevTools
```typescript
// Enable MSW dev tools in browser
if (process.env.NODE_ENV === 'development') {
  import('msw-devtools').then(({ setupWorker }) => {
    // MSW DevTools integration
  })
}
```

---

## 🔄 Migration Guide

### From MSW 1.x to 2.x

#### Breaking Changes
1. **Import Changes**
   ```typescript
   // MSW 1.x
   import { rest } from 'msw'

   // MSW 2.x
   import { http } from 'msw'
   ```

2. **Handler Syntax**
   ```typescript
   // MSW 1.x
   rest.get('/api/users', (req, res, ctx) => {
     return res(ctx.json({ users: [] }))
   })

   // MSW 2.x
   http.get('/api/users', () => {
     return HttpResponse.json({ users: [] })
   })
   ```

3. **Response Methods**
   ```typescript
   // MSW 1.x
   res(ctx.status(404), ctx.json({ error: 'Not found' }))

   // MSW 2.x
   HttpResponse.json({ error: 'Not found' }, { status: 404 })
   ```

#### Migration Steps
1. Update imports from `rest` to `http`
2. Replace `res(ctx.*())` with `HttpResponse.*()`
3. Update handler signatures
4. Test all handlers after migration

### From No MSW to MSW

#### Gradual Adoption
1. Start with simple endpoints
2. Add authentication middleware
3. Implement complex handlers
4. Add comprehensive tests

#### Integration Strategy
```typescript
// Conditional MSW usage
if (process.env.VITE_USE_MSW === 'true') {
  // Enable MSW
  import('./mocks/browser').then(({ worker }) => {
    worker.start()
  })
}
```

---

## 📚 Additional Resources

### Official Documentation
- [MSW Official Docs](https://mswjs.io/)
- [MSW GitHub](https://github.com/mswjs/msw)
- [MSW 2.0 Migration Guide](https://mswjs.io/docs/migrations/1.x-to-2.x/)

### Community Resources
- [MSW Recipes](https://mswjs.io/docs/recipes/)
- [MSW Examples](https://github.com/mswjs/examples)
- [Awesome MSW](https://github.com/mswjs/awesome-msw)

### Related Tools
- [Vitest](https://vitest.dev/) - Test runner
- [Testing Library](https://testing-library.com/) - React testing utilities
- [Zod](https://zod.dev/) - Schema validation

---

**Last Updated:** October 20, 2025
**MSW Version:** 2.11.5
**Authors:** APSAS Development Team</content>
<parameter name="filePath">d:\apsas\frontend\docs\ai-gen\msw\docs-tasks-gen-by-ai\MSW-IMPLEMENTATION-GUIDE.md