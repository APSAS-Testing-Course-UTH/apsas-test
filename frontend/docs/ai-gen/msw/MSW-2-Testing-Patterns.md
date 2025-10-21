# MSW-2: Testing Patterns với Vitest + MSW + React

**Version:** MSW 2.0 | **Target:** React 18+, Vite, Bun.js, TypeScript, Vitest  
**Status:** Production-Ready | **Last Updated:** October 2025

---

## 📌 Giới Thiệu

Tài liệu này hướng dẫn **testing patterns** cho APSAS React components sử dụng:
- ✅ **Vitest** - Unit/Integration testing framework
- ✅ **MSW** - Mock Service Worker cho HTTP interception
- ✅ **React Testing Library** - Component testing utilities
- ✅ **TanStack Query** - Server state management

### Testing Strategy

| Layer | Tool | Purpose |
|-------|------|---------|
| **API Mocking** | MSW | Intercept HTTP requests |
| **Component Rendering** | React Testing Library | Render & test components |
| **State Management** | TanStack Query + Vitest | Test queries, mutations |
| **User Interactions** | Testing Library + Vitest | Test click, form input, etc |
| **Async Flows** | Vitest + waitFor | Test loading/error states |

---

## 🔧 Step 1: Setup Vitest với MSW

### 1.1 Test Setup File — `src/test/setup.ts`

```typescript
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { server } from '@/mocks/server';
import '@testing-library/jest-dom';

/**
 * Initialize MSW server for all tests
 * This runs once before all tests start
 */
beforeAll(() => {
  // Start MSW server with strict mode:
  // any unhandled request will cause test to fail
  server.listen({
    onUnhandledRequest: 'error',
  });

  // Mock window.matchMedia for responsive components
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

/**
 * Reset handlers after each test
 * Ensures test isolation - handlers defined in one test
 * don't affect other tests
 */
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

/**
 * Close server after all tests complete
 * Prevents port conflicts and resource leaks
 */
afterAll(() => {
  server.close();
});
```

### 1.2 Vitest Configuration — `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  test: {
    // Enable globals: describe, it, expect without imports
    globals: true,

    // Use jsdom or happy-dom for DOM simulation
    environment: 'jsdom',

    // Setup files run before tests
    setupFiles: ['./src/test/setup.ts'],

    // CSS handling
    css: true,

    // Test include patterns
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/api/**/*.gen.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
    },

    // Disable network access during tests
    environmentOptions: {
      jsdom: {
        // Useful for testing network errors
        customExceptionHandler: (e: Error) => {
          // Prevent spurious errors
          console.error(e);
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

### 1.3 Test Utils — `src/test-utils.tsx`

```typescript
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function that wraps components with required providers
 * Use this instead of RTL's render() for consistent test setup
 */

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialRoute?: string;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    queryClient = createTestQueryClient(),
    initialRoute = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {}
) => {
  window.history.pushState({}, 'Test page', initialRoute);

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
};

export * from '@testing-library/react';
export { renderWithProviders as render };
```

---

## 🧪 Step 2: Basic Component Testing

### 2.1 Test Successful Data Fetch

```typescript
// src/features/dashboard/Dashboard.test.tsx
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@/test-utils';
import { render } from '@/test-utils';
import { Dashboard } from './Dashboard';

/**
 * SCENARIO: Component successfully fetches and displays user data
 *
 * FLOW:
 * 1. Component mounts
 * 2. Shows loading state
 * 3. MSW intercepts GET /api/v1/users/me
 * 4. Handler returns mock user data
 * 5. Component displays user info
 */
describe('Dashboard Component', () => {
  it('should display user profile after successful fetch', async () => {
    render(<Dashboard />);

    // Initially shows loading
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify loaded data is displayed
    expect(screen.getByText(/Student User/)).toBeInTheDocument();
    expect(screen.getByText(/student@apsas.local/)).toBeInTheDocument();
  });

  it('should render user role badge', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('STUDENT')).toBeInTheDocument();
    });
  });
});
```

### 2.2 Test Error Handling

```typescript
// src/features/dashboard/Dashboard.error.test.tsx
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@/test-utils';
import { render } from '@/test-utils';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import { Dashboard } from './Dashboard';

describe('Dashboard Error Handling', () => {
  it('should display error message on failed request', async () => {
    // Override default handler to return error
    server.use(
      http.get('http://localhost:3000/api/v1/users/me', () => {
        return HttpResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      })
    );

    render(<Dashboard />);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/unauthorized/i);
    });

    // Verify retry button exists
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should display network error when server is down', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/users/me', () => {
        return HttpResponse.error();
      })
    );

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/network error|connection failed/i)).toBeInTheDocument();
    });
  });
});
```

### 2.3 Test Loading States

```typescript
// src/features/submission/SubmissionList.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@/test-utils';
import { render } from '@/test-utils';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import { SubmissionList } from './SubmissionList';
import { delay } from '@/mocks/middleware/delay';

describe('SubmissionList Loading States', () => {
  it('should show skeleton loader while fetching', async () => {
    // Add delay to handler to simulate slow network
    server.use(
      http.get('http://localhost:3000/api/v1/submissions', async () => {
        await delay(1000); // 1 second delay
        return HttpResponse.json({
          content: [],
          pageNumber: 0,
          pageSize: 10,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
          hasNext: false,
          hasPrevious: false,
        });
      })
    );

    render(<SubmissionList />);

    // Verify skeleton is shown
    expect(screen.getAllByTestId('submission-skeleton')).toHaveLength(5);

    // Wait for real data
    await waitFor(
      () => {
        expect(screen.queryByTestId('submission-skeleton')).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
```

---

## 🎯 Step 3: Form Testing

### 3.1 Login Form Test

```typescript
// src/features/auth/LoginForm.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@/test-utils';
import { render } from '@/test-utils';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import { LoginForm } from './LoginForm';
import { MOCK_CREDENTIALS } from '@/mocks/fixtures/credentials';

describe('LoginForm', () => {
  beforeEach(() => {
    // Clear any previous login state
    localStorage.clear();
  });

  it('should successfully login with valid credentials', async () => {
    render(<LoginForm />, { initialRoute: '/login' });

    // Fill in credentials
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: MOCK_CREDENTIALS.student.email },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: MOCK_CREDENTIALS.student.password },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for success
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });

    // Verify token is stored
    expect(localStorage.getItem('authToken')).toBeDefined();
  });

  it('should show error on invalid credentials', async () => {
    render(<LoginForm />, { initialRoute: '/login' });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@email.com' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid email or password/i);
    });

    // Token should not be stored
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  it('should validate email format before submit', () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'not-an-email' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Error should appear
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });

  it('should show loading state during submission', async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: MOCK_CREDENTIALS.student.email },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: MOCK_CREDENTIALS.student.password },
    });

    // Click submit button
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    // Button should show loading state
    expect(submitButton).toHaveAttribute('disabled');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for request to complete
    await waitFor(() => {
      expect(submitButton).not.toHaveAttribute('disabled');
    });
  });
});
```

### 3.2 Submission Form Test

```typescript
// src/features/submission/SubmissionForm.test.tsx
import { describe, it, expect } from 'vitest';
import { screen, fireEvent, waitFor } from '@/test-utils';
import { render } from '@/test-utils';
import { SubmissionForm } from './SubmissionForm';

describe('SubmissionForm', () => {
  it('should submit code successfully', async () => {
    const mockAssignmentId = 'assign-001';
    render(<SubmissionForm assignmentId={mockAssignmentId} />);

    // Select language
    fireEvent.change(screen.getByLabelText(/language/i), {
      target: { value: 'javascript' },
    });

    // Enter code in editor
    const codeEditor = screen.getByRole('textbox');
    fireEvent.change(codeEditor, {
      target: { value: 'console.log("Hello");' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for success notification
    await waitFor(() => {
      expect(screen.getByText(/submitted successfully/i)).toBeInTheDocument();
    });

    // Verify form is cleared
    expect(codeEditor).toHaveValue('');
  });
});
```

---

## 🔄 Step 4: Testing Async Flows & State

### 4.1 TanStack Query Integration

```typescript
// src/features/user/UserProfile.test.tsx
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@/test-utils';
import { render } from '@/test-utils';
import { UserProfile } from './UserProfile';

describe('UserProfile with TanStack Query', () => {
  it('should fetch and display user profile using useQuery', async () => {
    render(<UserProfile userId="00000000-0000-0000-0000-000000000003" />);

    // Wait for query to complete
    await waitFor(() => {
      expect(screen.getByText(/Student User/)).toBeInTheDocument();
    });

    // Verify cached data
    expect(screen.getByText(/student@apsas.local/)).toBeInTheDocument();
  });

  it('should handle query error gracefully', async () => {
    render(<UserProfile userId="invalid-id" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/not found/i);
    });
  });

  it('should refetch data on demand', async () => {
    render(<UserProfile userId="00000000-0000-0000-0000-000000000003" />);

    await waitFor(() => {
      expect(screen.getByText(/Student User/)).toBeInTheDocument();
    });

    // Click refetch button
    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));

    // Should still show data
    expect(screen.getByText(/Student User/)).toBeInTheDocument();
  });
});
```

### 4.2 Testing Mutations

```typescript
// src/features/submission/CreateSubmission.test.tsx
import { describe, it, expect } from 'vitest';
import { screen, fireEvent, waitFor } from '@/test-utils';
import { render } from '@/test-utils';
import { CreateSubmission } from './CreateSubmission';

describe('CreateSubmission Mutation', () => {
  it('should create submission successfully', async () => {
    const mockOnSuccess = vi.fn();
    render(<CreateSubmission onSuccess={mockOnSuccess} />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/code/i), {
      target: { value: 'console.log("test");' },
    });

    fireEvent.change(screen.getByLabelText(/language/i), {
      target: { value: 'javascript' },
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for mutation to complete
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    // Verify success message
    expect(screen.getByText(/created successfully/i)).toBeInTheDocument();
  });

  it('should handle mutation error', async () => {
    server.use(
      http.post(
        'http://localhost:3000/api/v1/submissions',
        () => HttpResponse.json(
          { error: 'Invalid submission' },
          { status: 400 }
        )
      )
    );

    render(<CreateSubmission />);

    fireEvent.change(screen.getByLabelText(/code/i), {
      target: { value: '' }, // Invalid: empty code
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid submission/i);
    });
  });
});
```

---

## ⚡ Step 5: Concurrent Tests with `server.boundary()`

MSW 2.0 introduces `server.boundary()` for test isolation in concurrent tests:

### 5.1 Concurrent Test Setup

```typescript
// src/features/submission/concurrent.test.tsx
import { describe, it, expect } from 'vitest';
import { screen, render, waitFor } from '@/test-utils';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import { SubmissionDetail } from './SubmissionDetail';

describe('SubmissionDetail - Concurrent Tests', () => {
  /**
   * it.concurrent: Run tests in parallel
   * server.boundary(): Isolate handler overrides to specific test
   *
   * Benefits:
   * - Tests run faster (parallel execution)
   * - Handler overrides don't affect other tests
   * - No need for resetHandlers() between tests
   */

  it.concurrent(
    'should display successful submission',
    server.boundary(async () => {
      const { getByText } = render(
        <SubmissionDetail submissionId="sub-001" />
      );

      await waitFor(() => {
        expect(getByText(/PASSED/)).toBeInTheDocument();
      });
    })
  );

  it.concurrent(
    'should display failed submission with error',
    server.boundary(async () => {
      // Override handler for this test only
      server.use(
        http.get('http://localhost:3000/api/v1/submissions/sub-002', () => {
          return HttpResponse.json({
            id: 'sub-002',
            result: 'FAILED',
            score: 0,
            feedback: 'Code does not compile',
            status: 'EVALUATED',
          });
        })
      );

      const { getByText } = render(
        <SubmissionDetail submissionId="sub-002" />
      );

      await waitFor(() => {
        expect(getByText(/FAILED/)).toBeInTheDocument();
        expect(getByText(/does not compile/)).toBeInTheDocument();
      });
    })
  );

  it.concurrent(
    'should handle pending submission',
    server.boundary(async () => {
      server.use(
        http.get('http://localhost:3000/api/v1/submissions/sub-003', () => {
          return HttpResponse.json({
            id: 'sub-003',
            status: 'PENDING',
            result: null,
            score: null,
          });
        })
      );

      const { getByText } = render(
        <SubmissionDetail submissionId="sub-003" />
      );

      await waitFor(() => {
        expect(getByText(/evaluating/i)).toBeInTheDocument();
      });
    })
  );

  it.concurrent(
    'should display network error',
    server.boundary(async () => {
      server.use(
        http.get('http://localhost:3000/api/v1/submissions/sub-004', () => {
          return HttpResponse.error();
        })
      );

      const { getByRole } = render(
        <SubmissionDetail submissionId="sub-004" />
      );

      await waitFor(() => {
        expect(getByRole('alert')).toHaveTextContent(/network error/i);
      });
    })
  );
});
```

### 5.2 Advantages of Concurrent Testing

```typescript
// Before: Sequential tests (slower)
describe('Sequential Tests', () => {
  it('test 1', () => { /* ~500ms */ });
  it('test 2', () => { /* ~500ms */ });
  it('test 3', () => { /* ~500ms */ });
  // Total: ~1500ms
});

// After: Concurrent tests with server.boundary() (faster)
describe('Concurrent Tests', () => {
  it.concurrent('test 1', server.boundary(async () => { /* ~500ms */ }));
  it.concurrent('test 2', server.boundary(async () => { /* ~500ms */ }));
  it.concurrent('test 3', server.boundary(async () => { /* ~500ms */ }));
  // Total: ~500ms (3x faster!)
});
```

---

## 📊 Step 6: Test Coverage & Best Practices

### 6.1 Calculate Coverage

```bash
# Run tests with coverage
bun run test --coverage

# Generated files:
# coverage/index.html - Visual coverage report
# coverage/coverage-final.json - Coverage data
```

### 6.2 Coverage Goals

| Category | Target | Status |
|----------|--------|--------|
| Statements | 80%+ | ✅ |
| Branches | 75%+ | ✅ |
| Functions | 80%+ | ✅ |
| Lines | 80%+ | ✅ |

### 6.3 Best Practices Checklist

- [ ] **Test behavior, not implementation** - Test what user sees, not internal state
- [ ] **Use semantic queries** - `getByRole`, `getByLabelText`, not `getByTestId`
- [ ] **Avoid testing library internals** - Test exposed APIs only
- [ ] **Keep tests focused** - One concept per test
- [ ] **Use descriptive names** - Test names should explain what they test
- [ ] **Mock external dependencies** - Use MSW for API mocking
- [ ] **Test error cases** - Don't just test happy path
- [ ] **Avoid test flakiness** - Use `waitFor`, avoid `setTimeout`
- [ ] **Isolate tests** - Use `server.resetHandlers()` or `server.boundary()`
- [ ] **Test accessibility** - Use a11y queries from Testing Library

---

## 🎬 Example: Full Feature Test

```typescript
// src/features/assignment/AssignmentWorkflow.test.tsx
/**
 * COMPLETE WORKFLOW TEST
 * - List assignments
 * - View assignment details
 * - Create submission
 * - View submission feedback
 */

import { describe, it, expect } from 'vitest';
import { screen, fireEvent, waitFor } from '@/test-utils';
import { render } from '@/test-utils';
import { AssignmentApp } from './AssignmentApp';
import { MOCK_CREDENTIALS } from '@/mocks/fixtures/credentials';

describe('Assignment Workflow - End-to-End Feature Test', () => {
  it('should complete full assignment workflow as student', async () => {
    // 1. Login as student
    render(<AssignmentApp />, { initialRoute: '/login' });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: MOCK_CREDENTIALS.student.email },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: MOCK_CREDENTIALS.student.password },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // 2. Wait for assignments list
    await waitFor(() => {
      expect(screen.getByText(/assignments/i)).toBeInTheDocument();
    });

    // 3. Click on first assignment
    const assignments = screen.getAllByRole('link', { name: /assignment/i });
    fireEvent.click(assignments[0]);

    // 4. View assignment details
    await waitFor(() => {
      expect(screen.getByText(/assignment description/i)).toBeInTheDocument();
    });

    // 5. Submit code
    fireEvent.change(screen.getByLabelText(/code/i), {
      target: { value: 'function solution() { return 42; }' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // 6. View submission result
    await waitFor(() => {
      expect(screen.getByText(/submitted successfully/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/PASSED/)).toBeInTheDocument();
  });
});
```

---

## 🚨 Troubleshooting Tests

| Issue | Solution |
|-------|----------|
| "Cannot find handler for request" | Add handler in `src/mocks/handlers/` or use `server.use()` |
| "waitFor timeout" | Increase timeout: `waitFor(() => {}, { timeout: 5000 })` |
| "Element not found" | Verify MSW is intercepting correctly, check `screen.debug()` |
| "Test flakiness" | Replace `setTimeout` with `waitFor`, use proper query selectors |
| "State persists between tests" | Call `server.resetHandlers()` in `afterEach` or use `server.boundary()` |

---

## ✅ Verification Checklist

- [ ] Vitest configured with MSW setup
- [ ] `renderWithProviders` working with all providers
- [ ] Basic component tests passing
- [ ] Error handling tests passing
- [ ] Form submission tests passing
- [ ] Concurrent tests with `server.boundary()` working
- [ ] Coverage reports generated
- [ ] All async flows tested with `waitFor`
- [ ] Test helper utilities created

---

## 🔗 Related Resources

- **Vitest Docs**: https://vitest.dev
- **React Testing Library**: https://testing-library.com/react
- **MSW Testing Guide**: https://mswjs.io/docs/best-practices
- **TanStack Query Testing**: https://tanstack.com/query/latest/docs/framework/react/testing
- **APSAS Copilot**: `.github/copilot-instructions.md`

---

## 📚 Next Steps

1. **Run tests**: `bun run test`
2. **Watch mode**: `bun run test --watch`
3. **Coverage**: `bun run test --coverage`
4. **E2E tests**: Check `MSW-3-E2E-Testing.md`

---

**Created:** October 2025  
**Maintainer:** APSAS Development Team  
**Version:** 1.0
