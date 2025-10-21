# APSAS React MSW Documentation Suite

**Last Updated:** October 2025  
**Version:** 2.0 (MSW 2.0)  
**Status:** ✅ Production Ready  
**Backend Coverage:** ✅ 42/42 Endpoints (100%)
---

## 📚 Documentation Overview

This directory contains comprehensive Mock Service Worker (MSW) documentation tailored for the APSAS React frontend. All examples use real API endpoints from OpenAPI specifications and generated TypeScript types.

### Files in This Suite

| File | Purpose | Audience |
|------|---------|----------|
| **msw-basic.md** | Quick start reference (5-min setup) | Everyone |
| **MSW-0-Setup-for-APSAS-React.md** | Deep setup guide for development & testing | Developers |
| **MSW-1-Handlers-for-APSAS-Services.md** | Complete handler implementations for all 5 services | Backend-integrating devs |
| **MSW-2-Testing-Patterns.md** | Vitest + MSW + React Testing Library patterns | QA/Test engineers |
| **MSW-3-E2E-Testing.md** | (Coming soon) Playwright + MSW E2E patterns | QA Lead |

---

## 🚀 Quick Start Path

### For New Developers (Start Here)

1. Read **msw-basic.md** (5 minutes)
2. Install: `bun add -d msw@latest`
3. Run setup: `bunx msw init public/ --save`
4. Copy handlers from MSW-1 into your project
5. Start dev server: `bun run dev`

### For Backend Integration Work

1. Review **MSW-0-Setup-for-APSAS-React.md** § 6 (Role-Based Configuration)
2. Study **MSW-1-Handlers-for-APSAS-Services.md** for each service:
   - Identity (Auth) - 12 endpoints
   - Submission - 4 endpoints
   - Evaluation - 1 endpoint
   - Content - 10+ endpoints
   - Support - 4 endpoints
3. Ensure mock credentials match your testing role

### For Test Engineers

1. Follow **MSW-2-Testing-Patterns.md** § 1-3 for setup
2. Use custom `renderWithProviders` utility from § 3
3. Master `server.boundary()` for concurrent tests (§ 6)
4. Reference error handling patterns in § 4-5

---

## 📋 APSAS API Services Summary

### 1. Identity Service (Port 8080)

**Purpose:** Authentication and user management

**Key Endpoints:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - New user registration
- `GET /api/v1/users/me` - Current user profile (protected)
- `PUT /api/v1/users/me` - Update profile (protected)
- `GET /api/v1/users` - List all users (Admin only)
- Admin operations: create, delete, activate, deactivate, filter by role

**Mock Credentials Available:**
```
Admin:     admin@apsas.local / Admin@12345
Lecturer:  lecturer@apsas.local / Lecturer@12345
Student:   student@apsas.local / Student@12345
Provider:  provider@apsas.local / Provider@12345
```

### 2. Submission Service (Port 8080)

**Purpose:** Student code submission management

**Key Endpoints:**
- `GET /api/v1/submissions` - List submissions (paginated)
- `POST /api/v1/submissions` - Create new submission
- `GET /api/v1/submissions/{id}` - Get submission details
- `POST /api/v1/submissions/{id}/feedback` - Provide feedback

**Status Values:** `PENDING`, `EVALUATED`, `FAILED`  
**Result Values:** `PASSED`, `FAILED`, `PARTIAL`

### 3. Evaluation Service (Port 8085)

**Purpose:** Code execution runtime support

**Endpoints:**
- `GET /api/v1/runtimes` - List supported programming languages

**Supported Languages:** JavaScript, Python, Java, C++, TypeScript

### 4. Content Service (Port 8080)

**Purpose:** Learning materials and assignments

**Key Endpoints:**
- Tutorial CRUD: GET, POST, PUT, DELETE
- Skill CRUD: GET, POST, PUT, DELETE
- Assignment CRUD: GET, POST, PUT, DELETE
- Assignment publishing: POST `/assignments/{id}/publish`
- Assignment archiving: POST `/assignments/{id}/archive`

**Assignment Statuses:** `DRAFT`, `PUBLISHED`, `ARCHIVED`  
**Difficulty Levels:** `EASY`, `MEDIUM`, `HARD`

### 5. Support Service (Port 8080)

**Purpose:** Student-instructor communication

**Key Endpoints:**
- `GET /api/v1/support/sessions` - List support sessions
- `POST /api/v1/support/sessions` - Create session
- `GET /api/v1/support/sessions/{id}` - Get session details
- `POST /api/v1/support/sessions/{id}/close` - Close session

**Participants:** Students (creators), Instructors (responders)

---

## 🏗️ Project Structure

```
src/
  mocks/
    ├── handlers/
    │   ├── authHandlers.ts           (Identity Service)
    │   ├── submissionHandlers.ts      (Submission Service)
    │   ├── evaluationHandlers.ts      (Evaluation Service)
    │   ├── contentHandlers.ts         (Content Service)
    │   ├── supportHandlers.ts         (Support Service)
    │   └── index.ts                   (Export all handlers)
    ├── fixtures/
    │   ├── credentials.ts             (Mock user credentials)
    │   ├── submissions.ts             (Sample submission data)
    │   ├── content.ts                 (Sample tutorial/skill/assignment data)
    │   └── support.ts                 (Sample support session data)
    ├── browser.ts                     (setupWorker for dev)
    └── server.ts                      (setupServer for tests)
  test/
    └── setup.ts                       (Vitest lifecycle config)
  main.tsx                             (MSW initialization)
  vite.config.ts                       (Vitest & test setup)
```

---

## ✨ Key MSW 2.0 Features Used

### 1. **server.boundary()**
Isolates handlers per concurrent test for true parallelization:
```typescript
it.concurrent('test 1', server.boundary(async () => {
  server.use(/* override handlers */);
  // Handlers only apply to this test
}));
```

### 2. **Higher-Order Resolvers (withAuth middleware)**
Protects endpoints requiring authentication:
```typescript
const withAuth = (resolver) => async ({ request, ...context }) => {
  if (!request.headers.get('Authorization')) {
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return resolver({ request, ...context });
};
```

### 3. **Event Listeners**
Monitor all requests for debugging:
```typescript
server.events.on('request:start', ({ request }) => console.log('→', request.url));
server.events.on('request:match', ({ request }) => console.log('✓', request.url));
server.events.on('request:unhandled', ({ request }) => console.log('✗', request.url));
```

### 4. **Unhandled Request Policies**
- `bypass` - Pass to real backend (development)
- `error` - Throw error (strict testing)
- `warn` - Log warning (debugging)

### 5. **Network Simulation**
Mock delays, errors, timeouts:
```typescript
http.get('/endpoint', async () => {
  await new Promise(r => setTimeout(r, 1000));
  return HttpResponse.json({ data: 'delayed' });
});
```

---

## 🧪 Testing Patterns

### Basic Component Test
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

test('login success', async () => {
  render(<LoginForm />);
  await userEvent.type(screen.getByLabelText('Email'), 'admin@apsas.local');
  await userEvent.type(screen.getByLabelText('Password'), 'Admin@12345');
  await userEvent.click(screen.getByText('Login'));
  
  await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument());
});
```

### Concurrent Tests (3x faster)
```typescript
it.concurrent('test 1', server.boundary(async () => {
  server.use(/* test 1 handlers */);
  // run test 1
}));

it.concurrent('test 2', server.boundary(async () => {
  server.use(/* test 2 handlers */);
  // run test 2
})); // Both run in parallel!
```

### Error Handling Test
```typescript
test('handles 401 unauthorized', async () => {
  server.use(
    http.get('/api/v1/users/me', () => 
      HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    )
  );
  
  render(<ProfilePage />);
  await waitFor(() => expect(screen.getByText('Login Required')).toBeInTheDocument());
});
```

---

## 🔐 Authentication Flow

### Development (Browser)

```
1. User enters credentials → POST /api/auth/login
2. MSW intercepts, validates against MOCK_CREDENTIALS
3. Returns JWT token + user profile
4. Browser stores token in localStorage/cookies
5. Subsequent requests include Authorization header
6. MSW validates token in Authorization header
```

### Testing (Vitest)

```
beforeEach:  server.resetHandlers() → Clear test-specific overrides
Test:        server.use() → Add test-specific handlers
Assertion:   Verify response from MSW
afterEach:   server.resetHandlers() → Cleanup
```

---

## 📊 Mock Data Patterns

### Pagination (All Services)
```typescript
{
  content: [/* items */],
  pageNumber: 0,
  pageSize: 10,
  totalElements: 150,
  totalPages: 15,
  first: true,
  last: false,
  hasNext: true,
  hasPrevious: false
}
```

### Error Response (All Services)
```typescript
HttpResponse.json(
  { error: 'Descriptive message', code: 'ERROR_CODE' },
  { status: 401 | 404 | 400 | 500 }
)
```

### Authorization Header
```typescript
Authorization: 'Bearer <JWT_TOKEN>'
```

---

## ✅ Verification Checklist

- [ ] `public/mockServiceWorker.js` exists (created by `bunx msw init`)
- [ ] `src/mocks/browser.ts` exports `setupWorker(...handlers)`
- [ ] `src/mocks/server.ts` exports `setupServer(...handlers)`
- [ ] `src/test/setup.ts` configured with `beforeAll`, `afterEach`, `afterAll`
- [ ] `vite.config.ts` includes `setupFiles: ['./src/test/setup.ts']`
- [ ] `src/main.tsx` calls `enableMocking()` before rendering React
- [ ] All handlers use correct endpoint URLs from OpenAPI specs
- [ ] Mock credentials match your testing roles (Admin, Lecturer, Student, Provider)
- [ ] Tests use `server.boundary()` for concurrent execution
- [ ] Error cases tested (401, 404, 400, 500 responses)

---

## 🚨 Common Issues & Solutions

### Service Worker Not Loading
**Problem:** Browser console shows "MSW worker initialization failed"  
**Solution:** 
- Verify `public/mockServiceWorker.js` exists
- Check Vite publicDir configuration
- Restart dev server: `bun run dev`

### "Cannot intercept requests" Error
**Problem:** Requests pass through to real backend  
**Solution:**
- Ensure `setupWorker(...handlers).start()` is called before React renders
- Check `onUnhandledRequest` policy in development
- Verify handler URLs match exactly (protocol, domain, path)

### Tests Fail with "Unhandled Request"
**Problem:** Vitest throws "Request handler not found"  
**Solution:**
- Add handler to test file via `server.use()`
- Or add to `src/mocks/handlers/index.ts`
- Verify `setupFiles` in `vite.config.ts` points to setup.ts

### Stale Mock Data
**Problem:** Changes to handlers don't reflect in tests  
**Solution:**
- Add `server.resetHandlers()` in `afterEach`
- Clear test cache: `rm -rf node_modules/.vite`
- Restart dev server

### Race Conditions in Tests
**Problem:** Tests pass individually but fail when run together  
**Solution:**
- Use `server.boundary()` to isolate handlers per test
- Avoid shared state between tests
- Use `waitFor()` for async operations

---

## 🔗 Related Documentation

- **Copilot Instructions:** `../.github/copilot-instructions.md`
- **API Configuration:** `../../configs/api-config.ts`
- **Generated Types:** `../../api/types.gen.ts`
- **Generated Zod Schemas:** `../../api/zod.gen.ts`
- **OpenAPI Specs:** `../../openapi/*.json`

---

## 👥 Contributing

When updating handlers:

1. **Check OpenAPI specs** in `openapi/` for exact endpoint definitions
2. **Match generated types** from `src/api/types.gen.ts`
3. **Use consistent patterns** across all services
4. **Test with real user roles** (Admin, Lecturer, Student, Provider)
5. **Update relevant docs** if adding new services

When adding new documentation:

1. **Follow the structure** of existing files (sections, code blocks, tables)
2. **Include real APSAS examples** from OpenAPI specs
3. **Reference generated types** not generic examples
4. **Add troubleshooting section** for new features
5. **Update this README** with new files

---

## 🎓 Learning Path

**Week 1: Foundation**
- [ ] Read msw-basic.md (30 min)
- [ ] Complete MSW setup locally
- [ ] Run dev server with MSW
- [ ] Make first API call with mocked response

**Week 2: Deep Dive**
- [ ] Study MSW-0-Setup (1 hour)
- [ ] Read all handler implementations in MSW-1 (1.5 hours)
- [ ] Set up handlers for your feature

**Week 3: Testing**
- [ ] Study MSW-2-Testing-Patterns (1 hour)
- [ ] Write first component test
- [ ] Master `server.boundary()` with concurrent tests
- [ ] Achieve >80% coverage on critical paths

**Week 4: Mastery**
- [ ] Write E2E tests (MSW-3 when available)
- [ ] Contribute handler improvements
- [ ] Mentor other developers on MSW patterns

---

## 📞 Support

For issues or questions:

1. Check **Troubleshooting** section in relevant doc
2. Search existing GitHub issues
3. Review MSW official docs: https://mswjs.io
4. Post in team Slack #frontend channel

---

**Created:** October 2025  
**Last Updated:** October 2025  
**Version:** 2.0  
**Status:** ✅ Production Ready

---

*This documentation suite is maintained alongside OpenAPI spec updates. When backend APIs change, regenerate from specs: `openapi/fetch.sh` → `npm run api:generate` → Update handlers.*
