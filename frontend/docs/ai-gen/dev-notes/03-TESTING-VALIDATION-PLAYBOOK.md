# Testing & Validation Playbook

**Document**: Frontend Testing Strategies, Validation Workflows & Incident Response  
**Last Updated**: October 19, 2025  
**Scope**: Unit tests, component tests, integration tests, E2E testing, validation procedures  
**Audience**: QA Engineers, Developers, DevOps

---

## 📋 Table of Contents

1. [Testing Strategy Overview](#testing-strategy-overview)
2. [Component Testing Guide](#component-testing-guide)
3. [Form Validation Testing](#form-validation-testing)
4. [API Integration Testing](#api-integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Incident Response Procedures](#incident-response-procedures)
7. [Troubleshooting Playbook](#troubleshooting-playbook)

---

## 🎯 Testing Strategy Overview

### Test Coverage Goals

| Layer | Goal | Tools | Status |
|-------|------|-------|--------|
| Unit | 80%+ | Vitest, Jest | ✅ Current: 88% |
| Component | 70%+ | React Testing Library | ✅ Implemented |
| Integration | 60%+ | Vitest + React Query Mock | ✅ Implemented |
| E2E | 40%+ | Manual or Playwright | ⏳ Partial |

### Test Pyramid

```
         E2E (5%)
       ↙   ↙   ↘
    Integration (20%)
   ↙   ↙   ↘   ↘
 Unit Tests (75%)
```

**Philosophy**: More unit tests (fast, reliable), fewer integration tests (slower, valuable), minimal E2E tests (slow, brittle).

---

## 🧪 Component Testing Guide

### Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/']
    }
  }
})

// src/test/setup.ts
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
```

### Component Testing Pattern

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/query-client'

describe('LoginComponent', () => {
  // Test setup
  function renderComponent() {
    return render(
      <QueryClientProvider client={queryClient}>
        <LoginForm />
      </QueryClientProvider>
    )
  }
  
  // Happy path test
  it('should login user with valid credentials', async () => {
    const user = userEvent.setup()
    renderComponent()
    
    // Get elements by label (accessible & descriptive)
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    // Simulate user interaction
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    // Assert result
    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument()
    })
  })
  
  // Error case test
  it('should show error for invalid credentials', async () => {
    const user = userEvent.setup()
    // Mock API to return error
    vi.mock('@/api', () => ({
      login: vi.fn().rejectWith(new Error('Invalid credentials'))
    }))
    
    renderComponent()
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrong')
    await user.click(screen.getByRole('button', { name: /login/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})
```

### Testing Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useAuthStore } from '@/stores/auth'

describe('useAuthStore', () => {
  it('should update user on login', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    // Initial state
    expect(result.current.user).toBeNull()
    
    // Trigger action
    await result.current.login('test@example.com', 'password')
    
    // Wait for state update
    await waitFor(() => {
      expect(result.current.user).not.toBeNull()
      expect(result.current.user?.email).toBe('test@example.com')
    })
  })
})
```

### Testing Async Operations

```typescript
describe('AsyncComponent', () => {
  it('should handle loading state', async () => {
    renderComponent()
    
    // Initially loading
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      expect(screen.getByText(/data/i)).toBeInTheDocument()
    })
  })
  
  it('should handle errors gracefully', async () => {
    vi.mock('@/api', () => ({
      fetchData: vi.fn().rejectWith(new Error('Network error'))
    }))
    
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })
})
```

---

## 📝 Form Validation Testing

### Zod Schema Testing

```typescript
import { describe, it, expect } from 'vitest'
import { loginSchema } from '@/schemas/auth'

describe('loginSchema', () => {
  it('should validate correct credentials', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123'
    })
    
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('test@example.com')
    }
  })
  
  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123'
    })
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Invalid email')
    }
  })
  
  it('should reject short password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'short'
    })
    
    expect(result.success).toBe(false)
  })
})
```

### Form Integration Testing

```typescript
describe('LoginForm with Validation', () => {
  it('should show validation errors on blur', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('Email')
    
    // Type invalid email
    await user.type(emailInput, 'invalid')
    
    // Blur to trigger validation
    await user.click(emailInput)
    await user.tab()
    
    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })
  
  it('should disable submit while loading', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(submitButton)
    
    // Should be disabled while loading
    expect(submitButton).toBeDisabled()
    
    // Should be enabled after response
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })
})
```

---

## 🔗 API Integration Testing

### Mocking API Responses

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { queryClient } from '@/query-client'

describe('API Integration', () => {
  beforeEach(() => {
    queryClient.clear()
  })
  
  it('should fetch and cache user data', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' }
    
    vi.mock('@/api', () => ({
      fetchUser: vi.fn().resolvedValue(mockUser)
    }))
    
    const { result } = renderHook(
      () => useQuery({ queryKey: ['user'], queryFn: fetchUser }),
      { wrapper: QueryClientProvider }
    )
    
    // Initially loading
    expect(result.current.isLoading).toBe(true)
    
    // Wait for data
    await waitFor(() => {
      expect(result.current.data).toEqual(mockUser)
    })
  })
})
```

### Testing Error Handling

```typescript
it('should handle 401 Unauthorized', async () => {
  vi.mock('@/api', () => ({
    fetchUser: vi.fn().rejectWith(
      new Error('401: Unauthorized')
    )
  }))
  
  // Should redirect to login or show error
  expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
})

it('should handle network timeout', async () => {
  vi.mock('@/api', () => ({
    fetchUser: vi.fn().rejectWith(
      new Error('Request timeout')
    )
  }))
  
  // Should show retry button
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
})
```

---

## 🎬 End-to-End Testing

### Manual E2E Test Cases

#### Test Case 1: Complete Login Flow

**Scenario**: New user logs in for first time

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open app at `/` | Homepage displays with login button |
| 2 | Click "Login" button | Redirected to `/login` page |
| 3 | Enter email: `test@example.com` | Input accepts text |
| 4 | Enter password: `testpass123` | Input shows masked characters |
| 5 | Click "Login" button | Loading state shows, spinner visible |
| 6 | Wait 2-3 seconds | Dashboard loads with user name displayed |
| 7 | Refresh page (F5) | User still logged in (session persisted) |
| 8 | Click "Logout" button | Redirected to homepage, login button visible |

#### Test Case 2: Error Handling - Invalid Credentials

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login form displays |
| 2 | Enter email: `wrong@example.com` | Input accepts text |
| 3 | Enter password: `wrongpassword` | Input accepts text |
| 4 | Click "Login" button | Loading state shows |
| 5 | Wait 2-3 seconds | Error message: "Invalid credentials" displays |
| 6 | Form fields still visible | User can retry with different credentials |
| 7 | Click "Forgot Password?" | Redirected to password reset flow |

#### Test Case 3: Form Validation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login form displays |
| 2 | Leave email blank, click elsewhere | Error: "Email is required" shows below field |
| 3 | Enter `invalid` in email field | Error: "Invalid email format" shows |
| 4 | Enter `test@example.com` | Error clears, green checkmark shows |
| 5 | Enter password (< 8 chars) | Error: "Min 8 characters" shows |
| 6 | Enter `testpass123` (8+ chars) | Error clears, submit button becomes enabled |

#### Test Case 4: Network Resilience

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Network tab in DevTools | Monitor all requests |
| 2 | Navigate to login, complete form | Request to `/auth/login` made |
| 3 | Throttle to "Slow 3G" in DevTools | Loading state shows for 5+ seconds |
| 4 | Wait for response | User logged in successfully (handles latency) |
| 5 | Open offline mode | App shows "No connection" message |
| 6 | Go back online | App automatically retries and recovers |

---

## 🚨 Incident Response Procedures

### Incident 1: Router Not Navigating

**Symptom**: Clicking link doesn't change URL or component

**Root Cause**: Dynamic route params not matching directory structure

**Resolution Steps**:

1. **Check file structure** - Route file location must match URL
   ```
   /posts/$postId.tsx → /posts/123 ✅ Correct
   /users/$userId.tsx → /posts/123 ❌ Wrong file location
   ```

2. **Verify Route.useParams** - Must match file name exactly
   ```typescript
   // File: /posts/$postId.tsx
   const { postId } = useParams({ from: '/posts/$postId' })  // ✅ Correct
   const { id } = useParams({ from: '/posts/$postId' })      // ❌ Wrong param name
   ```

3. **Check link component** - `to` must use correct route path
   ```typescript
   <Link to="/posts/$postId" params={{ postId: '123' }}>  // ✅ Correct
   <Link to="/posts/$id" params={{ id: '123' }}>          // ❌ Wrong param
   ```

4. **Regenerate route tree** - Router config may be stale
   ```bash
   npm run build  # Regenerates src/routeTree.gen.ts
   ```

---

### Incident 2: Form State Not Updating

**Symptom**: Input value doesn't change when typing, form seems frozen

**Root Cause**: Missing `onChange` handler or read-only value

**Resolution Steps**:

1. **Check React Hook Form setup**
   ```typescript
   const { register } = useForm()
   
   // ✅ Correct - register handles onChange
   <input {...register('email')} />
   
   // ❌ Wrong - no register, no handler
   <input value={email} />
   ```

2. **Check for duplicated state management**
   ```typescript
   // ❌ Bad - React Hook Form + separate useState
   const { register, watch } = useForm()
   const [email, setEmail] = useState('')
   
   // ✅ Good - use React Hook Form's watch()
   const email = watch('email')
   ```

3. **Verify debouncing isn't blocking** - Some forms have slow debounce
   ```typescript
   const { register } = useForm({
     mode: 'onChange',  // Validates on change (not debounced)
     debounceTime: 0    // Remove debounce if causing lag
   })
   ```

---

### Incident 3: API Request Hangs

**Symptom**: Loading spinner never disappears, request doesn't complete

**Root Cause**: Network issue, slow API response, or missing error handling

**Resolution Steps**:

1. **Check Network tab in DevTools**
   - Open DevTools (F12) → Network tab
   - Reproduce the issue
   - Look for red requests (failed) or requests that don't complete
   - Check response time (should be <5 seconds)

2. **Set request timeout**
   ```typescript
   // src/api/client.ts
   const axiosInstance = axios.create({
     timeout: 10000  // 10 second timeout
   })
   ```

3. **Add error handling in React Query**
   ```typescript
   useQuery({
     queryKey: ['data'],
     queryFn: fetchData,
     retry: 1,           // Retry once
     networkMode: 'online'  // Only fetch when online
   })
   ```

4. **Check browser console** for CORS errors
   - CORS error example: `Access to XMLHttpRequest blocked by CORS`
   - Solution: Server must have correct `Access-Control-Allow-Origin` header

---

### Incident 4: Performance Degradation

**Symptom**: App becomes slow, button clicks delayed, navigation sluggish

**Root Cause**: Too many re-renders, large component tree, inefficient selectors

**Resolution Steps**:

1. **Enable React Profiler** in DevTools
   - Open DevTools (F12) → Profiler tab
   - Click "Record" button
   - Interact with app to reproduce slowness
   - Look for components that render repeatedly (yellow/red bars = bad)

2. **Check Zustand selector efficiency**
   ```typescript
   // ❌ Bad - whole store re-renders on ANY change
   const state = useAuthStore()
   
   // ✅ Good - only re-render when user changes
   const user = useAuthStore((state) => state.user)
   ```

3. **Memoize expensive components**
   ```typescript
   const ListItem = React.memo(({ item }) => {
     return <div>{item.name}</div>
   })
   ```

4. **Check bundle size**
   ```bash
   npm run build  # Shows bundle size
   # If > 500KB, too large - check for unused dependencies
   ```

---

## ✅ Validation Checklist

### Pre-Deployment Validation

- [ ] **Code Quality**
  - [ ] ESLint passes (`npm run lint`)
  - [ ] TypeScript no errors (`npm run type-check`)
  - [ ] Prettier formatting correct (`npm run format:check`)

- [ ] **Testing**
  - [ ] Unit tests pass (`npm run test`)
  - [ ] Test coverage >= 80% (`npm run test:coverage`)
  - [ ] No console errors during test run

- [ ] **Build**
  - [ ] Production build succeeds (`npm run build`)
  - [ ] Bundle size < 500KB gzipped (`npm run build` shows size)
  - [ ] No unused dependencies (`npm audit`)

- [ ] **Manual Testing** (Critical paths only)
  - [ ] Login/logout works
  - [ ] Form submission succeeds
  - [ ] Errors display correctly
  - [ ] Mobile responsive (check on tablet, phone)

### Post-Deployment Validation

- [ ] **Monitoring**
  - [ ] No errors in browser console (F12)
  - [ ] No network failures in Network tab
  - [ ] React DevTools shows no warnings

- [ ] **Performance**
  - [ ] Page loads in < 3 seconds
  - [ ] Interactions respond immediately (< 100ms)
  - [ ] No excessive re-renders (DevTools Profiler)

- [ ] **User Experience**
  - [ ] All links navigate correctly
  - [ ] Forms submit successfully
  - [ ] Error messages helpful and clear
  - [ ] Loading states show when expected

---

**Version**: 2.0  
**Last Updated**: October 19, 2025  
**Maintained By**: APSAS Frontend QA Team