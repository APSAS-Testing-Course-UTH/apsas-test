# MSW-0: Setup MSW cho APSAS React Frontend

**Version:** MSW 2.0 | **Target:** React 19+, Vite, Bun.js, TypeScript  
**Status:** Production-Ready | **Last Updated:** October 2025

---

## 📌 Giới Thiệu

Tài liệu này hướng dẫn thiết lập **Mock Service Worker (MSW)** cho dự án APSAS React Frontend. MSW cho phép bạn mock các API calls từ 5 services (Identity, Submission, Evaluation, Content, Support) trong cả development và testing environments.

### Tại sao dùng MSW cho APSAS?

✅ **Development**: Mock tất cả 5 API services mà không cần backend chạy  
✅ **Testing**: Vitest + MSW tạo test environment ổn định và nhanh  
✅ **E2E**: Playwright + MSW cho end-to-end testing với mock API  
✅ **Offline**: Test ứng dụng offline hoặc network error scenarios  
✅ **Role-based**: Mock response khác nhau cho Admin, Lecturer, Student, Provider  

---

## 🚀 Step 1: Installation & Initialization

### 1.1 Cài đặt MSW với Bun.js

```bash
# Cài đặt MSW như dev dependency
bun add -d msw@latest

# Hoặc
bun i -d msw
```

### 1.2 Initialize Service Worker

```bash
# Tạo public/mockServiceWorker.js (auto-updated when MSW upgrades)
bunx msw init public/ --save
```

**Kết quả:**
- File `public/mockServiceWorker.js` được tạo (được MSW quản lý)
- Service Worker sẽ intercept network requests trong development

### 1.3 Verify Installation

Kiểm tra `package.json`:
```json
{
  "devDependencies": {
    "msw": "^2.0.0"
  }
}
```

---

## 📁 Step 2: Project Structure cho APSAS

Tạo cấu trúc thư mục chuẩn:

```
src/
├── mocks/
│   ├── handlers/                    # Handlers cho từng service
│   │   ├── authHandlers.ts          # Identity Service (login, profile, etc)
│   │   ├── submissionHandlers.ts    # Submission Service
│   │   ├── evaluationHandlers.ts    # Evaluation Service
│   │   ├── contentHandlers.ts       # Content Service
│   │   └── supportHandlers.ts       # Support Service
│   ├── middleware/                  # Auth middleware, helpers
│   │   ├── withAuth.ts              # Higher-order resolver for auth checks
│   │   └── delay.ts                 # Simulate network delay
│   ├── browser.ts                   # setupWorker for development (HMR-friendly)
│   ├── server.ts                    # setupServer for testing (Node/Vitest)
│   └── index.ts                     # Export handlers
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── api/
│   ├── submission/
│   ├── evaluation/
│   ├── content/
│   └── support/
├── test/
│   ├── setup.ts                     # Vitest setup with MSW
│   └── fixtures/                    # Test data fixtures
├── App.tsx
├── main.tsx
└── vite.config.ts
```

---

## ⚙️ Step 3: Configure Environment Variables

### 3.1 `.env.development`

```
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_MSW=true
VITE_MSW_ONUNHANDLED=bypass
```

### 3.2 `.env.test` (hoặc .env.local cho test)

```
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_MSW=true
VITE_MSW_ONUNHANDLED=error
```

### 3.3 `.env.production`

```
VITE_API_BASE_URL=https://api.apsas.com
VITE_ENABLE_MSW=false
```

### 3.4 Environment Parser (`src/configs/env.ts`)

```typescript
// src/configs/env.ts
export const env = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_ENABLE_MSW: import.meta.env.VITE_ENABLE_MSW === 'true',
  VITE_MSW_ONUNHANDLED: (import.meta.env.VITE_MSW_ONUNHANDLED ||
    'bypass') as 'bypass' | 'error' | 'warn',
} as const;
```

---

## 🔧 Step 4: Setup Browser Worker (Development)

### 4.1 Basic Setup — `src/mocks/browser.ts`

```typescript
import { setupWorker } from 'msw/browser';
import {
  authHandlers,
  submissionHandlers,
  evaluationHandlers,
  contentHandlers,
  supportHandlers,
} from './handlers';

/**
 * MSW worker for browser development
 * Intercepts HTTP requests and returns mocked responses
 */
export const worker = setupWorker(
  ...authHandlers,
  ...submissionHandlers,
  ...evaluationHandlers,
  ...contentHandlers,
  ...supportHandlers
);
```

### 4.2 Enable Mocking in `main.tsx`

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import { env } from '@/configs/env';

/**
 * Enable MSW only in development mode
 * This async function ensures Service Worker is ready before rendering
 */
async function enableMocking() {
  if (!env.VITE_ENABLE_MSW) {
    return;
  }

  const { worker } = await import('./mocks/browser');

  return worker.start({
    // 'bypass': Pass through unhandled requests to real backend
    // 'error': Throw error on unhandled requests (strict mode)
    // 'warn': Log warning on unhandled requests
    onUnhandledRequest: env.VITE_MSW_ONUNHANDLED,
  });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
```

### 4.3 Why This Approach?

✅ **Async wrapper**: Ensures Service Worker registers before app renders  
✅ **Environment-aware**: Only enables in development  
✅ **Configurable**: Unhandled requests behavior can be changed via env vars  
✅ **Hot Module Replacement (HMR)**: Service Worker restarts automatically during dev  

---

## 🧪 Step 5: Setup Server for Testing

### 5.1 Node Server — `src/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import {
  authHandlers,
  submissionHandlers,
  evaluationHandlers,
  contentHandlers,
  supportHandlers,
} from './handlers';

/**
 * MSW server for Node.js/Vitest environment
 * Used in unit and integration tests
 */
export const server = setupServer(
  ...authHandlers,
  ...submissionHandlers,
  ...evaluationHandlers,
  ...contentHandlers,
  ...supportHandlers
);
```

### 5.2 Vitest Setup — `src/test/setup.ts`

```typescript
// src/test/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../mocks/server';
import '@testing-library/jest-dom';

/**
 * Lifecycle hooks for MSW server in Vitest
 *
 * beforeAll: Start server before all tests
 * afterEach: Reset handlers between tests for isolation
 * afterAll: Close server after all tests
 */

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error', // Strict mode: fail on unhandled requests
  });
});

afterEach(() => {
  server.resetHandlers(); // Reset to initial handlers
});

afterAll(() => {
  server.close(); // Clean up server
});
```

### 5.3 Vitest Config — `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  test: {
    // Enable globals: describe, it, expect, beforeEach, etc.
    globals: true,

    // Use jsdom or happy-dom for DOM simulation
    environment: 'jsdom',

    // Setup file runs before tests
    setupFiles: ['./src/test/setup.ts'],

    // CSS handling
    css: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'dist/',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
    },
  },

  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

---

## 🔐 Step 6: APSAS Role-Based Configuration

### 6.1 Mock Credentials by Role

Create `src/mocks/fixtures/credentials.ts`:

```typescript
// src/mocks/fixtures/credentials.ts
import { IdentityServiceUserResponse } from '@/api/types.gen';

/**
 * Mock credentials for different APSAS roles
 * Use these for testing role-specific features
 */

export const MOCK_CREDENTIALS = {
  admin: {
    email: 'admin@apsas.local',
    password: 'Admin@12345',
    token: 'mock-token-admin-uuid-1234567890',
  },
  lecturer: {
    email: 'lecturer@apsas.local',
    password: 'Lecturer@12345',
    token: 'mock-token-lecturer-uuid-0987654321',
  },
  student: {
    email: 'student@apsas.local',
    password: 'Student@12345',
    token: 'mock-token-student-uuid-5555555555',
  },
  provider: {
    email: 'provider@apsas.local',
    password: 'Provider@12345',
    token: 'mock-token-provider-uuid-6666666666',
  },
} as const;

export const MOCK_USERS: Record<string, IdentityServiceUserResponse> = {
  admin: {
    id: '00000000-0000-0000-0000-000000000001',
    email: MOCK_CREDENTIALS.admin.email,
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  lecturer: {
    id: '00000000-0000-0000-0000-000000000002',
    email: MOCK_CREDENTIALS.lecturer.email,
    firstName: 'Lecturer',
    lastName: 'User',
    role: 'INSTRUCTOR',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  student: {
    id: '00000000-0000-0000-0000-000000000003',
    email: MOCK_CREDENTIALS.student.email,
    firstName: 'Student',
    lastName: 'User',
    role: 'STUDENT',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  provider: {
    id: '00000000-0000-0000-0000-000000000004',
    email: MOCK_CREDENTIALS.provider.email,
    firstName: 'Provider',
    lastName: 'User',
    role: 'CONTENT_PROVIDER',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};
```

---

## 🛠️ Step 7: Auth Middleware Helper

### 7.1 withAuth Higher-Order Resolver

Create `src/mocks/middleware/withAuth.ts`:

```typescript
// src/mocks/middleware/withAuth.ts
import { HttpResponse, ResponseResolver } from 'msw';

/**
 * Higher-order resolver that enforces Authorization header
 * Usage: wrap your handler resolver with withAuth(...)
 *
 * @param resolver - The actual response resolver function
 * @returns Wrapped resolver that checks auth first
 */
export const withAuth =
  (resolver: ResponseResolver): ResponseResolver =>
  async ({ request, ...context }) => {
    const authHeader = request.headers.get('Authorization');

    // Check if Authorization header exists
    if (!authHeader) {
      return HttpResponse.json(
        { error: 'Unauthorized', message: 'Missing Authorization header' },
        { status: 401 }
      );
    }

    // Validate token format (Bearer <token>)
    if (!authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized', message: 'Invalid token format' },
        { status: 401 }
      );
    }

    // Call the actual resolver with auth check passed
    return resolver({ request, ...context });
  };
```

### 7.2 Network Delay Helper

Create `src/mocks/middleware/delay.ts`:

```typescript
// src/mocks/middleware/delay.ts

/**
 * Simulate network delay (useful for testing loading states)
 * Usage: await delay(500) inside handler resolver
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Random delay between min and max milliseconds
 * Usage: await randomDelay(100, 500)
 */
export const randomDelay = (min: number, max: number): Promise<void> => {
  const ms = Math.random() * (max - min) + min;
  return delay(ms);
};
```

---

## ✅ Step 8: Verification Checklist

- [ ] MSW installed: `bun list msw`
- [ ] `public/mockServiceWorker.js` exists
- [ ] `src/mocks/` folder structure created
- [ ] `main.tsx` updated with `enableMocking()`
- [ ] Environment variables configured (`.env.development`)
- [ ] `src/mocks/browser.ts` setup with all handlers
- [ ] `src/mocks/server.ts` created for testing
- [ ] `src/test/setup.ts` created with Vitest hooks
- [ ] `vite.config.ts` updated with test configuration
- [ ] Mock credentials fixture created
- [ ] Auth middleware helpers created

### Verify Development Setup

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Check browser console for:
# "[MSW] Mocking enabled."
```

### Verify Testing Setup

```bash
# Run tests (should start without errors)
bun run test

# Check for MSW setup messages in test output
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Service Worker failed to load" | Check `public/mockServiceWorker.js` exists and Vite is serving public files |
| "[MSW] Mocking not enabled" | Ensure `worker.start()` is called in `main.tsx` before app renders |
| Unhandled requests in dev | Check `VITE_MSW_ONUNHANDLED=bypass` in `.env.development` |
| Tests fail with "unhandled request" | Ensure all handlers defined in `src/mocks/handlers/` and imported in `server.ts` |
| Service Worker not updating | Run `bunx msw init public/ --save` again or clear browser cache |

---

## 📚 Next Steps

1. **Create handlers**: Go to `MSW-1-Handlers-for-APSAS-Services.md`
   - Auth handlers (login, register, profile)
   - Submission handlers (create, list, feedback)
   - Evaluation handlers (get runtimes)
   - Content handlers (tutorials, courses, assignments)
   - Support handlers (sessions, tickets)

2. **Write tests**: Go to `MSW-2-Testing-Patterns.md`
   - Component testing with mocked APIs
   - Error scenarios and edge cases
   - Concurrent tests with `server.boundary()`

3. **E2E testing**: Go to `MSW-3-E2E-Testing.md` (Optional)
   - Playwright + MSW integration
   - Full user workflows

---

## 🔗 Resources

- **MSW Official Docs**: https://mswjs.io/docs
- **MSW Best Practices**: https://mswjs.io/docs/best-practices
- **Vitest + MSW**: https://vitest.dev/guide/mocking/requests
- **APSAS Copilot Instructions**: `.github/copilot-instructions.md`

---

**Created:** October 2025  
**Maintainer:** APSAS Development Team  
**Version:** 1.0
