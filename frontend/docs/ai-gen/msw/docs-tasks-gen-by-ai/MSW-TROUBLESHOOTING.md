# MSW Troubleshooting Guide for APSAS Frontend

**Version:** 1.0 | **Date:** October 20, 2025 | **MSW Version:** 2.11.5

## 🚨 Common Issues & Solutions

### 1. Handler Not Intercepting Requests

**Symptoms:**
- API calls going to real server instead of MSW
- Tests failing with network errors
- Console shows real API responses

**Solutions:**

#### Check Handler Registration
```typescript
// src/mocks/handlers/index.ts
// ❌ Wrong - handlers not exported
const handlers = [http.get('/api/test', () => HttpResponse.json({}))]

// ✅ Correct - handlers exported
export const handlers = [
  http.get('/api/test', () => HttpResponse.json({}))
]
```

#### Verify Server Setup
```typescript
// src/mocks/server.ts
// ❌ Wrong - missing spread operator
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(handlers) // Missing ...handlers

// ✅ Correct
export const server = setupServer(...handlers)
```

#### Check Test Setup
```typescript
// src/test/setup.ts
// ❌ Wrong - server not started
import { server } from '@/mocks/server'

// ✅ Correct
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

#### Verify Handler URL Pattern
```typescript
// ❌ Wrong - exact match only
http.get('http://localhost:3000/api/users', () => {})

// ✅ Correct - relative path
http.get('/api/users', () => {})

// ✅ Also correct - full URL if needed
http.get('https://api.apsas.edu.vn/users', () => {})
```

---

### 2. Authentication Issues

**Symptoms:**
- 401 Unauthorized errors
- Token validation failing
- Auth headers not working

**Solutions:**

#### Check Token Format
```typescript
// ❌ Wrong - missing Bearer prefix
const headers = {
  'Authorization': 'token123'
}

// ✅ Correct
const headers = {
  'Authorization': 'Bearer token123'
}
```

#### Verify Token Validation
```typescript
// src/mocks/middleware/withAuth.ts
export function withAuth(handler) {
  return async ({ request }) => {
    const auth = request.headers.get('Authorization')

    // ❌ Wrong - case sensitive
    if (!auth?.startsWith('bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ Correct - case insensitive
    if (!auth?.toLowerCase().startsWith('bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = auth.substring(7) // Remove 'Bearer '
    // ... rest of validation
  }
}
```

#### Check Mock Credentials
```typescript
// src/mocks/data/users.ts
export const MOCK_CREDENTIALS = {
  admin: {
    email: 'admin@apsas.edu.vn',
    password: 'Admin@123',
    token: 'admin-token', // Make sure this matches
    role: 'ADMIN'
  }
}

// Test usage
const response = await fetch('/api/protected', {
  headers: { 'Authorization': `Bearer admin-token` }
})
```

---

### 3. Request Body Issues

**Symptoms:**
- POST/PUT requests failing
- Body parsing errors
- Form data not working

**Solutions:**

#### JSON Body Parsing
```typescript
// ❌ Wrong - not awaiting
http.post('/api/users', ({ request }) => {
  const body = request.json() // Missing await
  return HttpResponse.json({ created: true })
})

// ✅ Correct
http.post('/api/users', async ({ request }) => {
  const body = await request.json()
  return HttpResponse.json({ created: true })
})
```

#### Form Data Handling
```typescript
// ✅ Correct - form data
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

#### URL-encoded Data
```typescript
// ✅ Correct - URL encoded
http.post('/api/form', async ({ request }) => {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')

  return HttpResponse.json({ success: true })
})
```

---

### 4. Response Format Issues

**Symptoms:**
- Incorrect response structure
- Missing headers
- Wrong content type

**Solutions:**

#### JSON Response Format
```typescript
// ❌ Wrong - plain object
http.get('/api/users', () => {
  return { users: [] } // Not using HttpResponse
})

// ✅ Correct
import { HttpResponse } from 'msw'

http.get('/api/users', () => {
  return HttpResponse.json({ users: [] })
})
```

#### Custom Headers
```typescript
// ✅ Correct - with headers
http.get('/api/data', () => {
  return HttpResponse.json(
    { data: 'test' },
    {
      headers: {
        'X-Custom-Header': 'value',
        'Cache-Control': 'no-cache'
      }
    }
  )
})
```

#### Error Responses
```typescript
// ✅ Correct - error response
http.get('/api/error', () => {
  return HttpResponse.json(
    { error: 'Something went wrong' },
    { status: 500 }
  )
})
```

---

### 5. Path Parameter Issues

**Symptoms:**
- Dynamic routes not working
- Params undefined
- Wrong parameter values

**Solutions:**

#### Path Parameter Syntax
```typescript
// ❌ Wrong - incorrect syntax
http.get('/api/users/:id', ({ params }) => {
  const { id } = params
  return HttpResponse.json({ user: { id } })
})

// ✅ Correct - same syntax
http.get('/api/users/:id', ({ params }) => {
  const { id } = params
  return HttpResponse.json({ user: { id } })
})
```

#### Multiple Parameters
```typescript
// ✅ Correct - multiple params
http.get('/api/courses/:courseId/assignments/:assignmentId', ({ params }) => {
  const { courseId, assignmentId } = params
  return HttpResponse.json({
    courseId,
    assignmentId
  })
})
```

#### Query Parameters
```typescript
// ✅ Correct - query params
http.get('/api/users', ({ request }) => {
  const url = new URL(request.url)
  const page = url.searchParams.get('page') || '0'
  const size = url.searchParams.get('size') || '10'

  return HttpResponse.json({
    page: Number(page),
    size: Number(size)
  })
})
```

---

### 6. Test Isolation Issues

**Symptoms:**
- Tests affecting each other
- Handler overrides persisting
- Flaky tests

**Solutions:**

#### Reset Handlers
```typescript
// src/test/setup.ts
import { server } from '@/mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers()) // Reset after each test
afterAll(() => server.close())
```

#### Override Handlers in Tests
```typescript
describe('Specific Test', () => {
  it('should override handler', () => {
    server.use(
      http.get('/api/test', () => {
        return HttpResponse.json({ overridden: true })
      })
    )

    // Test code here
  })

  afterEach(() => {
    server.resetHandlers() // Clean up override
  })
})
```

#### Test-Specific Setup
```typescript
describe('Feature Tests', () => {
  let originalHandlers

  beforeEach(() => {
    originalHandlers = [...server.listHandlers()]
  })

  afterEach(() => {
    server.resetHandlers()
    // Restore original if needed
  })
})
```

---

### 7. TypeScript Issues

**Symptoms:**
- Type errors with MSW
- Import issues
- Type mismatches

**Solutions:**

#### Import Types
```typescript
// ❌ Wrong - missing types
import { http, HttpResponse } from 'msw'

// ✅ Correct - with proper imports
import { http, HttpResponse, type HttpHandler } from 'msw'
```

#### Handler Types
```typescript
// ✅ Correct - typed handlers
const handlers: HttpHandler[] = [
  http.get('/api/users', () => {
    return HttpResponse.json({ users: [] })
  })
]
```

#### Request/Response Types
```typescript
// ✅ Correct - typed request handling
http.post('/api/users', async ({ request }) => {
  const body = await request.json() as { name: string; email: string }

  return HttpResponse.json({
    id: '123',
    ...body
  })
})
```

---

### 8. Performance Issues

**Symptoms:**
- Slow tests
- Memory leaks
- Large mock data problems

**Solutions:**

#### Efficient Data Structures
```typescript
// ❌ Wrong - array search
const users = [{ id: '1', name: 'John' }, { id: '2', name: 'Jane' }]

function findUser(id) {
  return users.find(u => u.id === id) // O(n) search
}

// ✅ Correct - Map for O(1) access
const userMap = new Map(users.map(u => [u.id, u]))

function findUser(id) {
  return userMap.get(id) || null
}
```

#### Lazy Loading
```typescript
// ✅ Correct - lazy load large data
let largeDataset = null

function getLargeData() {
  if (!largeDataset) {
    largeDataset = generateLargeMockData()
  }
  return largeDataset
}
```

#### Minimal Responses
```typescript
// ✅ Correct - only return needed data
http.get('/api/users', () => {
  return HttpResponse.json({
    users: mockUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email
    })) // Exclude sensitive data
  })
})
```

---

### 9. Browser vs Node Issues

**Symptoms:**
- Different behavior in browser vs tests
- MSW not working in development

**Solutions:**

#### Environment-Specific Setup
```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

// src/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

#### Conditional Setup
```typescript
// src/mocks/index.ts
import { isNode } from '@/utils/environment'

if (isNode) {
  const { server } = await import('./server')
  server.listen()
} else {
  const { worker } = await import('./browser')
  worker.start()
}
```

#### Development Setup
```typescript
// src/main.tsx
if (process.env.NODE_ENV === 'development') {
  const { worker } = await import('./mocks/browser')
  worker.start({
    onUnhandledRequest: 'bypass' // Don't warn about unhandled requests
  })
}
```

---

### 10. Version Compatibility Issues

**Symptoms:**
- MSW 1.x code not working with 2.x
- Breaking changes
- Deprecated APIs

**Solutions:**

#### MSW 2.0 Migration
```typescript
// MSW 1.x → 2.x changes

// ❌ Old syntax
import { rest } from 'msw'
rest.get('/api/users', (req, res, ctx) => {
  return res(ctx.json({ users: [] }))
})

// ✅ New syntax
import { http, HttpResponse } from 'msw'
http.get('/api/users', () => {
  return HttpResponse.json({ users: [] })
})
```

#### Handler Registration
```typescript
// MSW 1.x
const server = setupServer(...handlers)

// MSW 2.x - same
const server = setupServer(...handlers)
```

#### Response Creation
```typescript
// MSW 1.x
return res(
  ctx.status(200),
  ctx.json({ data: 'test' }),
  ctx.set('X-Custom', 'value')
)

// MSW 2.x
return HttpResponse.json(
  { data: 'test' },
  {
    status: 200,
    headers: { 'X-Custom': 'value' }
  }
)
```

---

## 🔍 Debug Tools

### Request Logging
```typescript
// src/mocks/middleware/logger.ts
export function withLogging(handler) {
  return async (args) => {
    console.log('MSW Request:', {
      url: args.request.url,
      method: args.request.method,
      headers: Object.fromEntries(args.request.headers)
    })

    const response = await handler(args)

    console.log('MSW Response:', {
      status: response.status,
      headers: response.headers
    })

    return response
  }
}

// Usage
export const handlers = [
  withLogging(http.get('/api/debug', () => {
    return HttpResponse.json({ debug: true })
  }))
]
```

### Handler Inspection
```typescript
// Check registered handlers
console.log('Handlers:', server.listHandlers().length)

// Check specific handler
const handlers = server.listHandlers()
handlers.forEach((handler, index) => {
  console.log(`${index}: ${handler.info.method} ${handler.info.path}`)
})
```

### Network Inspection
```typescript
// In browser dev tools
// Check Network tab for intercepted requests
// Look for MSW headers in response
// Check console for MSW logs
```

---

## 🧪 Test Debugging

### Failing Test Investigation
```typescript
it('should work', async () => {
  // Add debugging
  console.log('Starting test')

  const response = await fetch('/api/test')
  console.log('Response status:', response.status)

  const data = await response.json()
  console.log('Response data:', data)

  expect(response.status).toBe(200)
})
```

### Handler Override Testing
```typescript
describe('Override Test', () => {
  it('should use override', () => {
    // Override handler
    server.use(
      http.get('/api/test', () => {
        return HttpResponse.json({ overridden: true })
      })
    )

    // Test with override
    return fetch('/api/test')
      .then(res => res.json())
      .then(data => {
        expect(data.overridden).toBe(true)
      })
  })
})
```

---

## 🚀 Quick Fixes

### Emergency Handler
```typescript
// Temporary catch-all handler
http.get('*', ({ request }) => {
  console.warn('Unhandled request:', request.url)
  return HttpResponse.json(
    { error: 'Not implemented' },
    { status: 501 }
  )
})
```

### Reset Everything
```typescript
// Nuclear option - reset all
server.resetHandlers()
server.close()
server.listen()
```

### Check MSW Status
```typescript
// Verify MSW is running
console.log('MSW running:', server.listening)
console.log('Handlers count:', server.listHandlers().length)
```

---

## 📋 Checklist

### Before Running Tests
- [ ] MSW server started in test setup
- [ ] Handlers properly exported
- [ ] No syntax errors in handlers
- [ ] Mock data initialized
- [ ] Test isolation configured

### When Tests Fail
- [ ] Check handler registration
- [ ] Verify request URL matching
- [ ] Check authentication headers
- [ ] Validate response format
- [ ] Test handler isolation

### Performance Issues
- [ ] Use efficient data structures
- [ ] Implement lazy loading
- [ ] Minimize response size
- [ ] Check for memory leaks

---

## 📚 Resources

### Official Documentation
- [MSW Migration Guide](https://mswjs.io/docs/migrations/1.x-to-2.x/)
- [MSW Recipes](https://mswjs.io/docs/recipes/)
- [MSW API Reference](https://mswjs.io/docs/api/)

### APSAS Specific
- `docs/ai-gen/msw/MSW-IMPLEMENTATION-GUIDE.md`
- `docs/ai-gen/msw/MSW-TESTING-GUIDE.md`
- `docs/ai-gen/msw/MSW-CHEATSHEET.md`

### Community
- [MSW GitHub Issues](https://github.com/mswjs/msw/issues)
- [Stack Overflow MSW](https://stackoverflow.com/questions/tagged/msw)

---

## 🆘 Getting Help

### Debug Information
When reporting issues, include:
- MSW version: `bun list msw`
- Node version: `node --version`
- Test runner: Vitest/Jest
- Error messages and stack traces
- Minimal reproduction code
- Handler configuration

### Common Patterns
```typescript
// Minimal reproduction
describe('MSW Issue', () => {
  it('reproduces the problem', async () => {
    // Setup
    server.use(
      http.get('/api/test', () => {
        return HttpResponse.json({ test: true })
      })
    )

    // Test
    const response = await fetch('/api/test')
    const data = await response.json()

    // This should work but doesn't
    expect(data.test).toBe(true)
  })
})
```

---

**Last Updated:** October 20, 2025
**Troubleshooting Version:** 1.0
**For Full Implementation:** See MSW-IMPLEMENTATION-GUIDE.md</content>
<parameter name="filePath">d:\apsas\frontend\docs\ai-gen\msw\docs-tasks-gen-by-ai\MSW-TROUBLESHOOTING.md