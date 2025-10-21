# MSW Quick Start - APSAS Edition

**Phiên bản:** MSW 2.0 | **Cập nhật:** Tháng 10, 2025
**Đối tượng:** React 19+, Vite, Bun.js, TypeScript

---

##  Giới thiệu nhanh

Hướng dẫn thiết lập **Mock Service Worker (MSW)** cho dự án APSAS trong 5 phút. MSW giúp mock toàn bộ 5 API services (Identity, Submission, Evaluation, Content, Support) mà không cần backend chạy.

---

##  Thiết lập nhanh (5 phút)

### 1. Cài đặt & Khởi tạo

`ash
# Cài đặt MSW
bun add -d msw@latest

# Tạo Service Worker
bunx msw init public/ --save
`

### 2. Tạo Handlers cơ bản

**`src/mocks/handlers/index.ts`:**

`	ypescript
import { http, HttpResponse } from 'msw';

// Mock credentials cho các role APSAS
const MOCK_USERS = {
  admin: { id: '1', email: 'admin@apsas.local', role: 'ADMIN' },
  lecturer: { id: '2', email: 'lecturer@apsas.local', role: 'INSTRUCTOR' },
  student: { id: '3', email: 'student@apsas.local', role: 'STUDENT' },
  provider: { id: '4', email: 'provider@apsas.local', role: 'CONTENT_PROVIDER' },
};

export const handlers = [
  // Login
  http.post('http://localhost:3000/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as any;

    if (email === 'admin@apsas.local' && password === 'Admin@12345') {
      return HttpResponse.json({
        token: 'mock-token-admin',
        user: MOCK_USERS.admin,
      });
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  // Get current user
  http.get('http://localhost:3000/api/v1/users/me', ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = auth.includes('admin') ? 'admin' : 'student';
    return HttpResponse.json(MOCK_USERS[role]);
  }),

  // Submissions
  http.get('http://localhost:3000/api/v1/submissions', ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return HttpResponse.json({
      content: [{
        id: 'sub-001',
        assignmentId: 'assign-001',
        status: 'EVALUATED',
        result: 'PASSED',
        score: 95,
        submittedAt: new Date().toISOString(),
      }],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    });
  }),

  // Create submission
  http.post('http://localhost:3000/api/v1/submissions', async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { assignmentId, code, language } = await request.json() as any;
    return HttpResponse.json({
      id: crypto.randomUUID(),
      assignmentId,
      code,
      language,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    });
  }),
];
`

### 3. Thiết lập Browser Worker

**`src/mocks/browser.ts`:**

`	ypescript
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
`

### 4. Thiết lập Server cho Testing

**`src/mocks/server.ts`:**

`	ypescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
`

### 5. Kích hoạt trong main.tsx

**`src/main.tsx`:**

`	ypescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

async function enableMocking() {
  if (import.meta.env.MODE !== 'development') return;

  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
`

---

##  Thiết lập Testing

**`src/test/setup.ts`:**

`	ypescript
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
`

**`vite.config.ts`:**

`	ypescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
`

---

##  Tính năng MSW 2.0 chính

### Override Handlers trong Test

`	ypescript
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

// Override handler cho test cụ thể
server.use(
  http.get('/api/users/me', () =>
    HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
  )
);
`

### Test song song với server.boundary()

`	ypescript
it.concurrent('test 1', server.boundary(async () => {
  server.use(/* test 1 handlers */);
  // Test 1 chạy độc lập
}));

it.concurrent('test 2', server.boundary(async () => {
  server.use(/* test 2 handlers */);
  // Test 2 chạy song song
}));
`

### Event Listeners

`	ypescript
server.events.on('request:start', ({ request }) =>
  console.log('', request.method, request.url)
);

server.events.on('request:match', ({ request }) =>
  console.log(' Matched:', request.url)
);

server.events.on('request:unhandled', ({ request }) =>
  console.log(' Unhandled:', request.url)
);
`

---

##  Mock Credentials APSAS

`	ypescript
// Admin
Email: admin@apsas.local
Password: Admin@12345
Token: mock-token-admin-uuid-1234567890

// Lecturer/Instructor
Email: lecturer@apsas.local
Password: Lecturer@12345
Token: mock-token-lecturer-uuid-0987654321

// Student
Email: student@apsas.local
Password: Student@12345
Token: mock-token-student-uuid-5555555555

// Provider
Email: provider@apsas.local
Password: Provider@12345
Token: mock-token-provider-uuid-6666666666
`

---

##  API Endpoints chính

### Identity Service (Auth)
- POST /api/auth/login - Đăng nhập
- POST /api/auth/register - Đăng ký
- GET /api/v1/users/me - Thông tin user hiện tại
- PUT /api/v1/users/me - Cập nhật profile

### Submission Service
- GET /api/v1/submissions - Danh sách submissions
- POST /api/v1/submissions - Tạo submission mới
- GET /api/v1/submissions/{id} - Chi tiết submission
- POST /api/v1/submissions/{id}/feedback - Gửi feedback

### Evaluation Service
- GET /api/v1/runtimes - Danh sách ngôn ngữ hỗ trợ

### Content Service
- GET /api/v1/tutorials - Danh sách tutorials
- POST /api/v1/tutorials - Tạo tutorial
- GET /api/v1/skills - Danh sách skills
- POST /api/v1/skills - Tạo skill
- GET /api/v1/assignments - Danh sách assignments
- POST /api/v1/assignments - Tạo assignment

### Support Service
- GET /api/v1/support/sessions - Danh sách sessions
- POST /api/v1/support/sessions - Tạo session
- GET /api/v1/support/sessions/{id} - Chi tiết session
- POST /api/v1/support/sessions/{id}/close - Đóng session

---

##  Troubleshooting

| Vấn đề | Giải pháp |
|---------|-----------|
| Service Worker không load | Kiểm tra public/mockServiceWorker.js tồn tại |
| \"Cannot intercept requests\" | Restart dev server: un run dev |
| Test fail với \"unhandled request\" | Thêm handler hoặc dùng server.use() |
| Handlers không áp dụng trong test | Verify setup.ts trong setupFiles |
| Cache cũ | Clear browser cache hoặc restart dev server |

---

##  Các bước tiếp theo

1. **Đọc setup chi tiết:** MSW-0-Setup-for-APSAS-React.md
2. **Xem tất cả handlers:** MSW-1-Handlers-for-APSAS-Services.md
3. **Học testing patterns:** MSW-2-Testing-Patterns.md
4. **E2E testing:** MSW-3-E2E-Testing.md (sắp có)

---

##  Tài liệu tham khảo

- **MSW Official:** https://mswjs.io
- **MSW Best Practices:** https://mswjs.io/docs/best-practices
- **React Testing Library:** https://testing-library.com
- **Vitest:** https://vitest.dev

---

**Cập nhật cuối:** Tháng 10, 2025
**Phiên bản:** 2.0
**Trạng thái:** Sẵn sàng Production
