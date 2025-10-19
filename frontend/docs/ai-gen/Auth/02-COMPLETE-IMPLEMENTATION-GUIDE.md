# 📘 APSAS Authentication - Complete Implementation Guide

**Version**: 2.0 (Consolidated & Modern)  
**Updated**: October 19, 2025  
**React**: 19.0.0  
**TypeScript**: 5.9.3  
**Status**: Production Ready (Phase 9 Grade: A+)  

**Merged from**: auth-system-overview.md + auth-implementation.md + AUTH_IMPLEMENTATION_GUIDE.md + FORM_VALIDATION_GUIDE.md

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication Flows](#authentication-flows)
4. [Roles & Permissions System](#roles--permissions-system)
5. [State Management with Zustand](#state-management-with-zustand)
6. [Form Validation Patterns](#form-validation-patterns)
7. [API Integration](#api-integration)
8. [Error Handling](#error-handling)
9. [Implementation Patterns](#implementation-patterns)
10. [Security Best Practices](#security-best-practices)
11. [Testing Strategies](#testing-strategies)

---

## Overview

### System Architecture

APSAS uses a **JWT-based stateless authentication** system with modern React patterns:

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React 19 + TypeScript 5.9)                        │
├─────────────────────────────────────────────────────────────┤
│ • React Components (LoginForm, RegisterForm, etc.)          │
│ • React Hook Form for form state management                 │
│ • Zod for runtime validation                                │
│ • TanStack Query for API state                              │
│ • Zustand for auth client state                             │
├─────────────────────────────────────────────────────────────┤
│ HTTP Layer (Axios + Interceptors)                           │
│ • Request: Attach JWT token automatically                   │
│ • Response: Handle 401 → logout → redirect                  │
├─────────────────────────────────────────────────────────────┤
│ TanStack Router (File-based routing)                        │
│ • Route guards based on roles                               │
│ • Automatic redirects                                       │
│ • Nested route support                                      │
├─────────────────────────────────────────────────────────────┤
│ Backend (Spring Boot + PostgreSQL)                          │
│ • JWT generation & validation                               │
│ • User CRUD operations                                      │
│ • Role management                                           │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

✅ **Stateless JWT Authentication** - No refresh tokens, instant logout  
✅ **Role-Based Access Control** - 4 roles, hierarchical permissions  
✅ **Automatic Dashboards** - Role-specific redirects on login  
✅ **Type-Safe** - 100% TypeScript strict mode, zero any types  
✅ **Form Validation** - Client-side + server-side validation  
✅ **Error Handling** - Comprehensive error mapping  
✅ **Secure Token Storage** - localStorage with helpers  
✅ **Modern Patterns** - React 19 hooks, Zustand slices, TanStack ecosystem  

### Technology Stack

```
State Management:      Zustand v5.0 (simple, no boilerplate)
HTTP Client:           Axios v1.12 (interceptors support)
Form State:            React Hook Form v7.65 (performant)
Validation:            Zod v4.1 (runtime type-safe)
UI Components:         Mantine UI v8.3 (accessible, polished)
Routing:               TanStack Router v1.132 (type-safe)
Server State:          TanStack Query v5.90 (caching, sync)
JWT Decoding:          jwt-decode v4.0 (token inspection)
```

---

## Architecture

### Layer 1: Presentation (React Components)

**Location**: `src/features/auth/components/`

Components handle **only rendering & event handling**:

```typescript
// LoginForm.tsx - ONLY handles form UI + validation
export function LoginForm({ onSubmit }: Props) {
  const form = useForm({ resolver: zodResolver(loginSchema) })
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <TextInput {...form.register('email')} />
      <PasswordInput {...form.register('password')} />
      <Button type="submit">Sign In</Button>
    </form>
  )
}
```

Components never:
- Call API directly (use hooks instead)
- Access localStorage (use Zustand instead)
- Store logic (use custom hooks instead)

### Layer 2: Hooks (Business Logic)

**Location**: `src/features/auth/hooks/`

Hooks handle **API calls & mutations**:

```typescript
// useLogin.ts - Handles login mutation
export function useLogin() {
  const { setUser, setToken } = useAuthStore()
  const navigate = useNavigate()
  
  return useMutation({
    mutationFn: (data: LoginRequest) => api.post('/auth/login', data),
    onSuccess: (response) => {
      setToken(response.token)
      setUser(response.user)
      navigate({ to: `/dashboard/${response.user.role.toLowerCase()}` })
    },
    onError: (error) => {
      // Error handling via interceptor
    }
  })
}
```

All hooks use **TanStack Query** for:
- Automatic caching
- Request deduplication
- Background refetching
- Error handling

### Layer 3: Store (State Management)

**Location**: `src/features/auth/stores/useAuthStore.ts`

```typescript
// Zustand store with persist middleware
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      
      // Actions
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      login: (credentials) => { /* ... */ },
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth', storage: localStorage }
  )
)
```

**State managed**:
- `user` - Current user object
- `token` - JWT token string
- `isLoading` - Loading states
- `error` - Error messages

### Layer 4: API Integration

**Location**: `src/api/` (generated) + `src/lib/`

Auto-generated from OpenAPI specs using `@hey-api/openapi-ts`:

```typescript
// Auto-generated SDK function
export const identityServiceLogin = (options: Options) => {
  return client.post('/api/auth/login', options)
}

// Our wrapper hook
export function useLogin() {
  return useMutation({
    mutationFn: (data) => identityServiceLogin({ body: data }),
    onSuccess: (response) => useAuthStore.setState(response),
  })
}
```

**Axios Interceptors** (`src/lib/axios-config.ts`):
- Request: Attach JWT token
- Response: Handle 401 errors

### Layer 5: Database (Backend)

Backend manages:
- JWT token generation
- User CRUD
- Role assignment
- Password hashing
- Email verification

---

## Authentication Flows

### Flow 1: Login (Happy Path)

```
1. User opens LoginPage
   └─ useAuthStore initializes from localStorage
   └─ If token exists, redirect to dashboard

2. User enters email + password
   └─ React Hook Form validates client-side with Zod schema

3. User clicks "Sign In"
   └─ loginSchema validates form data (email format, password length)

4. useLogin mutation fires
   └─ POST /api/auth/login { email, password }
   └─ Axios adds Authorization header (if token exists)

5. Backend responds
   ✅ 200 OK: { token, user, type }
   └─ useAuthStore.setToken(token)
   └─ useAuthStore.setUser(user)
   └─ localStorage persists automatically

6. useRoleRedirect hook fires
   └─ Reads user.role
   └─ Navigates to /dashboard/student (or instructor/admin/etc)

7. Route guard checks role
   ✅ ProtectedRoute allows access
   └─ Dashboard renders
```

### Flow 2: Logout

```
1. User clicks Logout button
   └─ logout() action called

2. Zustand store clears
   └─ user = null
   └─ token = null
   └─ Persists to localStorage automatically

3. Router navigates
   └─ Go to /login

4. Axios interceptor notices no token
   └─ All subsequent requests don't include Authorization header
```

### Flow 3: Token Expiration (401 Handling)

```
1. User has logged-in token (valid)
2. Makes API request
   └─ Axios sends Authorization: Bearer token

3. Time passes, token expires (backend timestamp check)
4. User makes another API request
   └─ Backend: 401 Unauthorized

5. Axios response interceptor catches 401
   └─ Call logout() action
   └─ Zustand clears store
   └─ Redirect to /login

6. User logs in again
   └─ Repeat Flow 1
```

### Flow 4: Registration

```
1. User goes to /register
2. RegisterForm renders with form fields
   └─ Fields: email, password, confirmPassword, firstName, lastName, agreeToTerms

3. registerSchema validates
   ✅ email: valid format, unique check on blur
   ✅ password: min 8 chars, uppercase, lowercase, number
   ✅ confirmPassword: must match password
   ✅ firstName/lastName: 1-50 chars
   ✅ agreeToTerms: checkbox must be checked

4. User submits
   └─ POST /api/auth/register { email, password, firstName, lastName }
   └─ Backend creates user, sends verification email

5. Response handling
   ✅ 200 OK: { message: "Check your email" }
   └─ Show success message
   └─ Redirect to verify-email page (optional)

   ❌ 400 Bad Request: { error: "Email already exists" }
   └─ Show validation error message

6. User must verify email
   └─ Receives link in email
   └─ Clicks link with token
   └─ POST /api/auth/verify-email { token }
   └─ Account activated, can login
```

### Flow 5: Password Reset

```
1. User clicks "Forgot Password"
   └─ Goes to /forgot-password

2. Enters email
   └─ POST /api/auth/forgot-password { email }

3. Backend
   └─ Finds user by email
   └─ Generates reset token
   └─ Sends email with reset link

4. User receives email
   └─ Clicks link: /reset-password?token=xxx

5. ResetPasswordForm renders
   └─ Fields: newPassword, confirmPassword
   └─ resetPasswordSchema validates

6. User submits
   └─ POST /api/auth/reset-password { token, newPassword }
   └─ Backend validates token, updates password
   └─ Redirect to /login

7. User logs in with new password
```

---

## Roles & Permissions System

### Role Hierarchy

```
ADMIN (Level 4)
  ├─ All permissions
  ├─ Manage users
  ├─ Manage roles
  └─ System administration
  
INSTRUCTOR (Level 3)
  ├─ Create content (assignments, skills)
  ├─ View students
  ├─ Grade submissions
  └─ Provide feedback

CONTENT_PROVIDER (Level 2)
  ├─ Create tutorials
  ├─ Create skills
  └─ Publish content

STUDENT (Level 1)
  ├─ View assignments
  ├─ Submit code
  ├─ View grades
  └─ Request support
```

### Permission Matrix

| Permission | ADMIN | INSTRUCTOR | CONTENT_PROVIDER | STUDENT |
|-----------|-------|-----------|-----------------|---------|
| CREATE_ASSIGNMENT | ✅ | ✅ | ❌ | ❌ |
| GRADE_SUBMISSIONS | ✅ | ✅ | ❌ | ❌ |
| CREATE_CONTENT | ✅ | ✅ | ✅ | ❌ |
| VIEW_SUBMISSIONS | ✅ | ✅ | ❌ | ❌ |
| MANAGE_USERS | ✅ | ❌ | ❌ | ❌ |
| CHANGE_ROLE | ✅ | ❌ | ❌ | ❌ |
| SUBMIT_ASSIGNMENT | ✅ | ❌ | ❌ | ✅ |
| VIEW_GRADES | ✅ | ✅ | ❌ | ✅ |

### Checking Permissions in Code

**File**: `src/constants/roles.ts`

```typescript
// Check if user has permission
if (hasPermission(user.role, 'CREATE_ASSIGNMENT')) {
  return <CreateAssignmentButton />
}

// Check if user has role
if (hasRoleLevel(user.role, 'INSTRUCTOR')) {
  return <InstructorPanel />
}

// Can user access route?
if (!canAccessRoute(user.role, '/admin/users')) {
  return <div>Unauthorized</div>
}
```

---

## State Management with Zustand

### Store Structure

**File**: `src/features/auth/stores/useAuthStore.ts`

```typescript
// State interface
interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

// Actions interface
interface AuthActions {
  setUser: (user: User) => void
  setToken: (token: string) => void
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  clearError: () => void
  setError: (error: string) => void
}

// Create store with Zustand
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      
      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', credentials)
          set({ user: response.user, token: response.token })
          localStorage.setItem('auth_token', response.token)
        } catch (error) {
          set({ error: error.message })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      
      logout: () => {
        set({ user: null, token: null })
        localStorage.removeItem('auth_token')
      },
      
      clearError: () => set({ error: null }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'auth',
      storage: localStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        // Don't persist loading/error states
      }),
    }
  )
)
```

### Using the Store in Components

```typescript
// Read state
const user = useAuthStore((state) => state.user)
const isLoading = useAuthStore((state) => state.isLoading)

// Call actions
const { logout } = useAuthStore()

// Subscribe to changes (rarely needed)
const unsubscribe = useAuthStore.subscribe(
  (state) => state.user,
  (user) => console.log('User changed:', user)
)
```

### Helper Functions

```typescript
// Get entire state
const state = getAuthState()

// Initialize from localStorage
initializeAuth()

// Reset store to initial state
resetAuthStore()

// Subscribe to auth changes
subscribeToAuth((state) => {
  console.log('Auth updated:', state)
})
```

---

## Form Validation Patterns

### Pattern 1: Login Form

**File**: `src/features/auth/schemas/loginSchema.ts`

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  password: z.string()
    .min(1, 'Password is required')
})

export type LoginFormData = z.infer<typeof loginSchema>
```

**Component**: `src/features/auth/components/LoginForm.tsx`

```typescript
export function LoginForm() {
  const { mutate: login } = useLogin()
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validate on blur, not onChange
    defaultValues: { email: '', password: '' }
  })

  const onSubmit = async (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        // Auto-redirect via useRoleRedirect
      },
      onError: (error) => {
        // Show error message
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <TextInput
        {...form.register('email')}
        error={form.formState.errors.email?.message}
        label="Email"
        type="email"
      />
      
      <PasswordInput
        {...form.register('password')}
        error={form.formState.errors.password?.message}
        label="Password"
      />
      
      <Button type="submit" loading={form.formState.isSubmitting}>
        Sign In
      </Button>
    </form>
  )
}
```

### Pattern 2: Registration Form

```typescript
export const registerSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long'),
  agreeToTerms: z.boolean()
    .refine((val) => val === true, 'Must agree to terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>
```

### Pattern 3: Custom Validator

```typescript
const emailValidator = z.string()
  .email()
  .refine(
    async (email) => {
      // Check if email is available
      const response = await api.get(`/api/v1/users/check-email?email=${email}`)
      return response.available
    },
    { message: 'Email already in use' }
  )
```

### Validation Modes Comparison

| Mode | When Validates | Use Case |
|------|---|---|
| `onBlur` | After field loses focus | Better UX, fewer errors shown |
| `onChange` | After every keystroke | Real-time validation |
| `onSubmit` | Only when form submitted | Performance-focused |
| `onTouched` | Only after field was touched | Hybrid approach |
| `all` | Every possible moment | Strict validation |

**Recommendation**: Use `onBlur` for most forms (good balance of UX and feedback).

---

## API Integration

### Generated API Client

**File**: `src/api/sdk.gen.ts` (auto-generated)

```typescript
// Auto-generated function signature
export const identityServiceLogin = <ThrowOnError extends boolean = false>(
  options: Options<IdentityServiceLoginData, ThrowOnError>,
) => {
  return client.post<IdentityServiceLoginResponses, unknown, ThrowOnError>({
    requestValidator: async (data) => {
      return await zIdentityServiceLoginData.parseAsync(data)
    },
    url: "/api/auth/login",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })
}
```

### Using in React Hooks

```typescript
// src/features/auth/hooks/useLogin.ts

import { useMutation } from '@tanstack/react-query'
import { identityServiceLogin } from '@/api'
import { useAuthStore } from '../stores/useAuthStore'

export function useLogin() {
  const { setUser, setToken } = useAuthStore()
  const navigate = useNavigate()
  
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await identityServiceLogin({
        body: data,
        throwOnError: true,
      })
      return response.data
    },
    onSuccess: (data) => {
      setToken(data.token)
      setUser(data.user)
      navigate({ to: `/dashboard/${data.user.role.toLowerCase()}` })
    },
    onError: (error) => {
      // Error handling
      const message = mapApiError(error)
      showNotification({ title: 'Login Failed', message, color: 'red' })
    },
  })
}
```

### All Authentication Endpoints

```typescript
// Register
identityServiceRegister({ body: { email, password, firstName, lastName } })

// Login
identityServiceLogin({ body: { email, password } })

// Get current user
identityServiceGetCurrentUser()

// Logout (backend)
identityServiceLogout()

// Verify email
identityServiceVerifyEmail({ body: { token } })

// Forgot password
identityServiceRequestPasswordReset({ body: { email } })

// Reset password
identityServiceResetPassword({ body: { token, newPassword } })

// Change password
identityServiceChangePassword({ body: { currentPassword, newPassword } })

// For Admins:
identityServiceGetAllUsers({ query: { page: 0, size: 10 } })
identityServiceGetUsersByRole({ path: { role: 'INSTRUCTOR' } })
identityServiceCreateUser({ body: { email, password, firstName, lastName, role } })
```

For full API reference, see `03-API-REFERENCE.md`.

---

## Error Handling

### Error Handling Flow

```
API Request
    ↓
[200 OK] → Data returned, onSuccess callback
    ↓
[400 Bad Request] → Validation error → User sees field errors
    ↓
[401 Unauthorized] → Interceptor catches → logout() → redirect /login
    ↓
[403 Forbidden] → Permission denied → Show "Not authorized" message
    ↓
[404 Not Found] → Resource not found → Show "Not found" message
    ↓
[500 Server Error] → Backend crashed → Show "Server error" message
    ↓
[Network Error] → No connection → Show "Network error" message
```

### Error Mapping

**File**: `src/lib/api-error-handler.ts`

```typescript
export function mapApiError(error: unknown): string {
  // Network error
  if (!window.navigator.onLine) {
    return 'No internet connection'
  }
  
  // Axios error
  if (isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data as Record<string, unknown> | undefined
    
    switch (status) {
      case 400:
        return data?.message || 'Invalid input'
      case 401:
        return data?.message || 'Invalid credentials'
      case 403:
        return data?.message || 'You do not have permission'
      case 404:
        return data?.message || 'Resource not found'
      case 500:
        return data?.message || 'Server error'
      default:
        return error.message || 'Unknown error'
    }
  }
  
  return 'An unexpected error occurred'
}
```

### Using Error Handling

```typescript
const { mutate: login, error } = useLogin()

if (error) {
  const message = mapApiError(error)
  return <Alert>{message}</Alert>
}
```

---

## Implementation Patterns

### Pattern 1: Protected Route Component

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!user) {
      navigate({ to: '/login' })
    } else if (requiredRole && user.role !== requiredRole) {
      navigate({ to: '/' })
    }
  }, [user, requiredRole, navigate])
  
  if (!user) return <LoadingSpinner />
  if (requiredRole && user.role !== requiredRole) return <UnauthorizedPage />
  
  return <>{children}</>
}
```

### Pattern 2: Role-Based Conditional Rendering

```typescript
export function FeaturePanel() {
  const { user } = useAuthStore()
  
  if (!user) return null
  
  return (
    <>
      {hasPermission(user.role, 'CREATE_ASSIGNMENT') && (
        <CreateAssignmentButton />
      )}
      
      {hasPermission(user.role, 'GRADE_SUBMISSIONS') && (
        <GradePanel />
      )}
      
      {user.role === 'ADMIN' && (
        <AdminPanel />
      )}
    </>
  )
}
```

### Pattern 3: Mutation with Optimistic Updates

```typescript
const { mutate: updateProfile } = useMutation({
  mutationFn: (data) => identityServiceUpdateCurrentUserProfile({ body: data }),
  onMutate: async (newData) => {
    // Optimistically update local state
    const previousUser = getAuthState().user
    useAuthStore.setState({ user: { ...previousUser, ...newData } })
    
    return { previousUser }
  },
  onError: (error, variables, context) => {
    // Rollback on error
    if (context?.previousUser) {
      useAuthStore.setState({ user: context.previousUser })
    }
    
    const message = mapApiError(error)
    showNotification({ title: 'Update Failed', message, color: 'red' })
  },
  onSuccess: () => {
    showNotification({ title: 'Profile Updated', color: 'green' })
  },
})
```

---

## Security Best Practices

### 1. Token Security

✅ **DO**:
- Store token in `localStorage` (ok for SPAs)
- Include `Authorization: Bearer token` header
- Clear token on logout
- Regenerate token on password change
- Use HTTPS in production

❌ **DON'T**:
- Store token in cookies (unless httpOnly flag set)
- Log token to console in production
- Send token in URL parameters
- Store token in global JavaScript variables (gets lost on refresh)

### 2. Password Security

✅ **DO**:
- Enforce minimum 8 characters
- Require mix of uppercase, lowercase, numbers
- Hash passwords on backend (bcrypt, Argon2)
- Never store plain passwords

❌ **DON'T**:
- Send password over HTTP
- Display password in logs
- Use weak hashing algorithms
- Allow passwords like "password123"

### 3. CORS & CSP

**CORS Configuration** (backend):
```
Allow-Origin: http://localhost:5173 (dev)
Allow-Methods: GET, POST, PUT, DELETE
Allow-Headers: Authorization, Content-Type
```

**Content-Security-Policy** (frontend headers):
```
default-src 'self';
script-src 'self' 'unsafe-inline' (dev only);
connect-src 'self' http://localhost:8080;
```

### 4. XSS Prevention

✅ **React prevents XSS by default** (escapes all values)

⚠️ **But watch out for**:
```typescript
// ❌ UNSAFE - Don't do this
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE - React escapes by default
<div>{userInput}</div>
```

### 5. Input Validation

✅ **Validate everywhere**:
- Client-side (UX, fast feedback)
- Server-side (security, ALWAYS)
- API schemas (Zod)

❌ **Never trust client-side validation alone**

---

## Testing Strategies

### Unit Tests for Hooks

```typescript
// src/features/auth/hooks/useLogin.test.ts

import { renderHook, act, waitFor } from '@testing-library/react'
import { useLogin } from './useLogin'

describe('useLogin', () => {
  it('should login user successfully', async () => {
    const { result } = renderHook(() => useLogin())
    
    act(() => {
      result.current.mutate({
        email: 'test@example.com',
        password: 'password123',
      })
    })
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })
})
```

### Component Tests

```typescript
// src/features/auth/components/LoginForm.test.tsx

import { render, screen, userEvent } from '@testing-library/react'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('Email')
    await user.type(emailInput, 'invalid-email')
    await user.tab()
    
    expect(screen.getByText('Invalid email format')).toBeInTheDocument()
  })
})
```

### Integration Tests

```typescript
// Test entire auth flow
test('User can login and access dashboard', async () => {
  // 1. Navigate to login
  // 2. Fill form
  // 3. Submit
  // 4. Verify redirect to dashboard
  // 5. Check user info is displayed
})
```

---

## Common Implementation Questions

### Q: How do I add a new login field?

**A**: 
1. Update `loginSchema.ts` with new field validation
2. Add field to `LoginForm.tsx`
3. Backend will reject invalid requests

```typescript
// loginSchema.ts
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(), // NEW
})
```

### Q: How do I check if user has permission?

**A**:
```typescript
import { hasPermission } from '@/constants/roles'

if (hasPermission(user.role, 'CREATE_ASSIGNMENT')) {
  // Show button
}
```

### Q: How do I handle API errors specifically?

**A**:
```typescript
const { mutate: login } = useLogin()

login(credentials, {
  onError: (error) => {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Handle invalid credentials
      } else if (error.response?.status === 400) {
        // Handle validation error
      }
    }
  },
})
```

### Q: How do I add a role?

**A**: Update 3 files:
1. `src/constants/roles.ts` - Add to ROLE_PERMISSIONS
2. `src/api/types.gen.ts` - Backend regenerates this
3. Routes/components - Add conditional rendering

---

## Next Steps

1. **Read API Reference**: See `03-API-REFERENCE.md` for all endpoints
2. **Debug Issues**: Check `04-TROUBLESHOOTING-RUNBOOK.md` if stuck
3. **See Examples**: Check `src/features/auth/` for real implementation
4. **Run Tests**: `npm run test` to see patterns in action

---

**Questions?** → Check [04-TROUBLESHOOTING-RUNBOOK.md](./04-TROUBLESHOOTING-RUNBOOK.md)  
**Need API details?** → Check [03-API-REFERENCE.md](./03-API-REFERENCE.md)
