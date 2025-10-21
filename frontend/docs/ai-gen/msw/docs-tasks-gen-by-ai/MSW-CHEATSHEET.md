# MSW Cheatsheet for APSAS Frontend

**Version:** 1.0 | **Date:** October 20, 2025 | **MSW Version:** 2.11.5

## 🚀 Quick Start

### Installation
```bash
bun add --save-dev msw
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

---

## 📝 Handler Patterns

### HTTP Methods
```typescript
import { http, HttpResponse } from 'msw'

// GET
http.get('/api/users', () => {
  return HttpResponse.json({ users: [] })
})

// POST
http.post('/api/users', async ({ request }) => {
  const body = await request.json()
  return HttpResponse.json({ created: true })
})

// PUT
http.put('/api/users/:id', async ({ params, request }) => {
  const { id } = params
  const updates = await request.json()
  return HttpResponse.json({ updated: id })
})

// PATCH
http.patch('/api/users/:id', async ({ params, request }) => {
  const { id } = params
  const updates = await request.json()
  return HttpResponse.json({ patched: id })
})

// DELETE
http.delete('/api/users/:id', ({ params }) => {
  const { id } = params
  return HttpResponse.json({ deleted: id })
})
```

### Authentication Middleware
```typescript
// src/mocks/middleware/withAuth.ts
export function withAuth(handler) {
  return async ({ request, params }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = auth.substring(7)
    const user = validateToken(token)
    if (!user) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return handler({ request, params, user, token })
  }
}

// Usage
http.get('/api/protected', withAuth(({ user }) => {
  return HttpResponse.json({ message: `Hello ${user.firstName}` })
}))
```

---

## 🔐 Authentication & Tokens

### Mock Credentials
```typescript
// src/mocks/data/users.ts
export const MOCK_CREDENTIALS = {
  admin: {
    email: 'admin@apsas.edu.vn',
    password: 'Admin@123',
    token: 'admin-token',
    role: 'ADMIN'
  },
  lecturer: {
    email: 'lecturer@apsas.edu.vn',
    password: 'Lecturer@123',
    token: 'lecturer-token',
    role: 'INSTRUCTOR'
  },
  student: {
    email: 'student@apsas.edu.vn',
    password: 'Student@123',
    token: 'student-token',
    role: 'STUDENT'
  },
  provider: {
    email: 'provider@apsas.edu.vn',
    password: 'Provider@123',
    token: 'provider-token',
    role: 'CONTENT_PROVIDER'
  }
}
```

### Auth Headers Helper
```typescript
// Test helpers
export function createAuthHeaders(role = 'student') {
  return {
    'Authorization': `Bearer ${MOCK_CREDENTIALS[role].token}`,
    'Content-Type': 'application/json'
  }
}

// Usage
const response = await fetch('/api/protected', {
  headers: createAuthHeaders('admin')
})
```

---

## 🧪 Testing Patterns

### Basic Test Structure
```typescript
describe('API Handler', () => {
  it('should return success', async () => {
    const response = await fetch('/api/test')
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
```

### Authentication Tests
```typescript
describe('Auth Required', () => {
  it('should reject without token', async () => {
    const response = await fetch('/api/protected')
    expect(response.status).toBe(401)
  })

  it('should accept with valid token', async () => {
    const response = await fetch('/api/protected', {
      headers: createAuthHeaders('student')
    })
    expect(response.status).toBe(200)
  })
})
```

### CRUD Tests
```typescript
describe('CRUD Operations', () => {
  it('should create resource', async () => {
    const response = await fetch('/api/resources', {
      method: 'POST',
      headers: createAuthHeaders('admin'),
      body: JSON.stringify({ name: 'Test' })
    })
    expect(response.status).toBe(201)
  })

  it('should read resource', async () => {
    const response = await fetch('/api/resources/123')
    expect(response.status).toBe(200)
  })

  it('should update resource', async () => {
    const response = await fetch('/api/resources/123', {
      method: 'PUT',
      headers: createAuthHeaders('admin'),
      body: JSON.stringify({ name: 'Updated' })
    })
    expect(response.status).toBe(200)
  })

  it('should delete resource', async () => {
    const response = await fetch('/api/resources/123', {
      method: 'DELETE',
      headers: createAuthHeaders('admin')
    })
    expect(response.status).toBe(200)
  })
})
```

---

## 📊 Pagination

### Request Parameters
```typescript
// Query parameters
?page=0&size=10&sort=createdAt,desc
```

### Response Structure
```typescript
{
  "content": [...],           // Array of items
  "pageNumber": 0,            // Current page (0-based)
  "pageSize": 10,             // Items per page
  "totalElements": 25,        // Total items
  "totalPages": 3,            // Total pages
  "first": true,              // Is first page
  "last": false,              // Is last page
  "hasNext": true,            // Has next page
  "hasPrevious": false        // Has previous page
}
```

### Pagination Handler
```typescript
http.get('/api/resources', ({ request }) => {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page')) || 0
  const size = Number(url.searchParams.get('size')) || 10

  const allItems = getAllResources()
  const start = page * size
  const end = start + size
  const content = allItems.slice(start, end)

  return HttpResponse.json({
    content,
    pageNumber: page,
    pageSize: size,
    totalElements: allItems.length,
    totalPages: Math.ceil(allItems.length / size),
    first: page === 0,
    last: page >= Math.ceil(allItems.length / size) - 1,
    hasNext: end < allItems.length,
    hasPrevious: page > 0
  })
})
```

---

## 🚨 Error Responses

### Standard Error Format
```typescript
{
  "error": "ErrorType",
  "message": "Human readable message",
  "details": { /* optional */ }
}
```

### Error Helpers
```typescript
// src/mocks/middleware/errorHandler.ts
export const ErrorResponses = {
  badRequest: (message) =>
    HttpResponse.json({ error: 'Bad Request', message }, { status: 400 }),

  unauthorized: (message = 'Authentication required') =>
    HttpResponse.json({ error: 'Unauthorized', message }, { status: 401 }),

  forbidden: (message = 'Access denied') =>
    HttpResponse.json({ error: 'Forbidden', message }, { status: 403 }),

  notFound: (resource = 'Resource') =>
    HttpResponse.json({ error: 'Not Found', message: `${resource} not found` }, { status: 404 }),

  conflict: (message) =>
    HttpResponse.json({ error: 'Conflict', message }, { status: 409 }),

  serverError: (message = 'Internal server error') =>
    HttpResponse.json({ error: 'Internal Server Error', message }, { status: 500 })
}
```

### Usage
```typescript
if (!resource) {
  return ErrorResponses.notFound('User')
}

if (!hasPermission) {
  return ErrorResponses.forbidden('Admin access required')
}
```

---

## 🔄 Advanced Features

### Concurrent Requests (MSW 2.0)
```typescript
describe('Concurrent Requests', () => {
  it('should handle multiple requests', async () => {
    await server.boundary(async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        fetch(`/api/users/${i}`)
      )

      const responses = await Promise.all(promises)
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
    })
  })
})
```

### Request Interception
```typescript
// Override handler in test
server.use(
  http.get('/api/test', () => {
    return HttpResponse.json({ overridden: true })
  })
)

// Reset after test
afterEach(() => {
  server.resetHandlers()
})
```

### File Upload
```typescript
http.post('/api/upload', async ({ request }) => {
  const formData = await request.formData()
  const file = formData.get('file') as File

  return HttpResponse.json({
    success: true,
    fileName: file.name,
    fileSize: file.size
  })
})
```

### Delayed Responses
```typescript
http.get('/api/slow', async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return HttpResponse.json({ data: 'slow response' })
})
```

---

## 🛠️ Common Commands

### Development
```bash
# Start dev server
bun run dev

# Run tests
bun run test

# Run tests with coverage
bun run test:coverage

# Run tests in UI mode
bun run test:ui

# Type checking
bun run type-check
```

### MSW Specific
```bash
# Initialize MSW
bunx msw init public/ --save

# Check MSW version
bun outdated msw

# Update MSW
bun update msw
```

---

## 📋 File Structure

```
src/
├── mocks/
│   ├── handlers/
│   │   ├── index.ts              # Export all handlers
│   │   ├── identityHandlers.ts   # Auth & user endpoints
│   │   ├── submissionHandlers.ts # Submission endpoints
│   │   ├── contentHandlers.ts    # Content endpoints
│   │   └── supportHandlers.ts    # Support endpoints
│   ├── middleware/
│   │   ├── withAuth.ts          # Authentication
│   │   └── errorHandler.ts      # Error responses
│   ├── data/
│   │   └── users.ts             # Mock user data
│   ├── server.ts                # Node server setup
│   └── browser.ts               # Browser setup
├── test/
│   ├── setup.ts                 # Test configuration
│   └── test-utils.tsx           # Custom render utilities
└── types/
    └── api/
        ├── types.gen.ts         # Generated API types
        └── zod.gen.ts           # Validation schemas
```

---

## 🔍 Debug Tips

### Check Handler Registration
```typescript
// src/mocks/handlers/index.ts
console.log('Handlers registered:', handlers.length)
export const handlers = [...]
```

### Log Requests
```typescript
http.get('/api/debug', ({ request }) => {
  console.log('Request:', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers)
  })
  return HttpResponse.json({ debug: true })
})
```

### Test Isolation
```typescript
beforeEach(() => {
  server.resetHandlers() // Reset to defaults
})

afterEach(() => {
  server.resetHandlers() // Clean up overrides
})
```

---

## 📊 Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate/ constraint violation |
| 422 | Unprocessable | Business logic errors |
| 500 | Server Error | Unexpected errors |

---

## 🎯 Quick Assertions

### Response Assertions
```typescript
// Success responses
expect(response.status).toBe(200)
expect(response.status).toBe(201)

// Error responses
expect(response.status).toBe(400)
expect(response.status).toBe(401)
expect(response.status).toBe(403)
expect(response.status).toBe(404)

// JSON content
expect(response.headers.get('content-type')).toContain('application/json')
```

### Data Assertions
```typescript
const data = await response.json()

// Structure checks
expect(data).toHaveProperty('id')
expect(data).toHaveProperty('createdAt')

// Type checks
expect(typeof data.id).toBe('string')
expect(Array.isArray(data.items)).toBe(true)

// Value checks
expect(data.status).toBe('ACTIVE')
expect(data.items.length).toBeGreaterThan(0)
```

---

## 🚀 Performance Tips

### Efficient Lookups
```typescript
// Use Maps for O(1) access
const userMap = new Map(users.map(u => [u.id, u]))

function findUser(id) {
  return userMap.get(id) || null
}
```

### Lazy Loading
```typescript
let largeDataset = null

function getLargeData() {
  if (!largeDataset) {
    largeDataset = generateLargeMockData()
  }
  return largeDataset
}
```

### Minimal Responses
```typescript
// Only return needed data
http.get('/api/users', () => {
  return HttpResponse.json({
    users: mockUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email
    }))
  })
})
```

---

## 📚 Resources

### Official
- [MSW Docs](https://mswjs.io/)
- [MSW GitHub](https://github.com/mswjs/msw)
- [MSW Recipes](https://mswjs.io/docs/recipes/)

### APSAS Specific
- `docs/ai-gen/msw/MSW-IMPLEMENTATION-GUIDE.md`
- `docs/ai-gen/msw/MSW-TESTING-GUIDE.md`
- `docs/ai-gen/msw/README.md`

---

## 🆘 Emergency Fixes

### Handler Not Working
```typescript
// Check if handler is exported
export const handlers = [
  ...identityHandlers,  // Make sure this includes your handler
  // ... other handlers
]

// Check server setup
const server = setupServer(...handlers)
```

### Tests Failing
```typescript
// Reset handlers between tests
beforeEach(() => {
  server.resetHandlers()
})

// Check test setup
beforeAll(() => server.listen())
afterAll(() => server.close())
```

### Auth Issues
```typescript
// Check token format
const headers = {
  'Authorization': `Bearer ${MOCK_CREDENTIALS.admin.token}`
}

// Verify token exists
console.log('Token:', MOCK_CREDENTIALS.admin.token)
```

---

**Last Updated:** October 20, 2025
**Quick Reference Version:** 1.0
**For Full Docs:** See MSW-IMPLEMENTATION-GUIDE.md</content>
<parameter name="filePath">d:\apsas\frontend\docs\ai-gen\msw\docs-tasks-gen-by-ai\MSW-CHEATSHEET.md