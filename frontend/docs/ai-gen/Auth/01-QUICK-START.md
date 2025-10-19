# 🚀 APSAS Authentication - Quick Start Guide

**Version**: 2.0 (Consolidated)  
**Updated**: October 19, 2025  
**Target**: Developers new to the project  
**Time**: ~15 minutes to read  

---

## 📖 Welcome to APSAS Auth Documentation

This directory contains **4 consolidated guides** instead of 19 scattered files. Each is self-contained but cross-referenced.

### Which guide should I read?

```
Are you...                              → Read this
────────────────────────────────────────┼──────────────────────────────────
New to the project?                     → 01-QUICK-START.md (this file)
Building auth features?                 → 02-COMPLETE-IMPLEMENTATION-GUIDE.md
Integrating API endpoints?              → 03-API-REFERENCE.md
Debugging auth issues?                  → 04-TROUBLESHOOTING-RUNBOOK.md
```

---

## ⚡ 5-Minute Overview

APSAS uses **JWT-based stateless authentication** with React 19, TypeScript, and Zustand.

### Authentication Flow (Simplified)

```
┌─ User enters email + password in LoginForm
│
├─ React Hook Form validates with Zod schema
│
├─ TanStack Query mutation calls → `/api/auth/login`
│
├─ Backend returns { token, user, type }
│
├─ useAuthStore saves token + user to localStorage & Zustand
│
├─ Axios interceptor attaches token to all requests
│
└─ TanStack Router redirects to role-based dashboard
```

### Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **useAuthStore** | Global auth state (Zustand) | `src/features/auth/stores/` |
| **useLogin** | Login mutation hook | `src/features/auth/hooks/` |
| **LoginForm** | Form component (React Hook Form) | `src/features/auth/components/` |
| **ProtectedRoute** | Route guard component | `src/features/auth/components/` |
| **Axios Interceptor** | Automatic token attachment | `src/lib/axios-config.ts` |

---

## 🏗️ Project Structure

```
src/
├── features/auth/                    # All auth-related code
│   ├── components/                   # Form components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   ├── VerifyEmailForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── hooks/                        # Custom hooks
│   │   ├── useLogin.ts
│   │   ├── useRegister.ts
│   │   ├── useCurrentUser.ts
│   │   ├── useForgotPassword.ts
│   │   ├── useResetPassword.ts
│   │   ├── useVerifyEmail.ts
│   │   └── useRoleRedirect.ts
│   ├── stores/                       # Zustand store
│   │   └── useAuthStore.ts
│   ├── schemas/                      # Zod validation schemas
│   │   ├── loginSchema.ts
│   │   ├── registerSchema.ts
│   │   ├── forgotPasswordSchema.ts
│   │   ├── resetPasswordSchema.ts
│   │   ├── verifyEmailSchema.ts
│   │   └── changePasswordSchema.ts
│   ├── pages/                        # Page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   └── VerifyEmailPage.tsx
│   ├── api/                          # API service layer
│   │   └── authService.ts
│   └── utils/                        # Utilities
│       └── roleGuards.ts
│
├── configs/
│   ├── axios-config.ts               # Axios setup & interceptors
│   └── api-error-handler.ts          # Error mapping
│
├── api/ (generated)
│   ├── client.gen.ts                 # HTTP client
│   ├── sdk.gen.ts                    # API functions
│   ├── types.gen.ts                  # TypeScript types
│   ├── zod.gen.ts                    # Zod schemas
│   └── @tanstack/react-query.gen.ts  # Query hooks
│
└── constants/
    └── roles.ts                      # Roles & permissions
```

---

## 🔐 Authentication Concepts

### Roles (4 types)

| Role | Purpose | Access |
|------|---------|--------|
| **STUDENT** | Learning users | View assignments, submit code |
| **INSTRUCTOR** | Teachers | Create content, grade submissions |
| **CONTENT_PROVIDER** | Content creators | Create tutorials & skills |
| **ADMIN** | System administrators | Full system access |

For detailed role permissions, see **02-COMPLETE-IMPLEMENTATION-GUIDE.md → Section: Role & Permissions System**.

### JWT Token

```
Header:    { alg: "HS256", type: "JWT" }
Payload:   { userId, email, role, exp, iat }
Signature: HMAC_SHA256(header + payload, secret)
```

- **Stored in**: `localStorage` (key: `auth_token`)
- **Attached via**: Axios request interceptor (Authorization header)
- **Expires**: Configured on backend (typically 24 hours)
- **Refresh**: None - user logs out on 401, then login again

For details, see **02-COMPLETE-IMPLEMENTATION-GUIDE.md → Section: Token Management**.

### State Management (Zustand)

```typescript
// Access in any component
const { user, isAuthenticated, token } = useAuthStore()

// Call actions
const { login, logout, setUser } = useAuthStore()

// Persist automatically
// Token stored in localStorage under "auth"
```

For Zustand patterns, see **02-COMPLETE-IMPLEMENTATION-GUIDE.md → Section: Zustand Store Patterns**.

---

## ✅ Setup Checklist

### Prerequisites
- Node.js 22+
- npm or bun
- Backend services running (localhost:8080)

### 1. Install Dependencies
```bash
npm install
# or
bun install
```

### 2. Environment Variables
Create `.env.local`:
```
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=APSAS
VITE_API_TIMEOUT=10000
```

### 3. Start Development Server
```bash
npm run dev
# or
bun run dev
```

**App will be at**: http://localhost:5173

### 4. Test Authentication
1. Go to: `http://localhost:5173/login`
2. Enter credentials from backend
3. Should redirect to role-based dashboard

### 5. Verify Installation
Check browser console - you should see:
```
✓ Auth store initialized
✓ API client ready
✓ Interceptors active
```

---

## 🎯 Next Steps

### For New Developers
1. **Understand architecture** → Read **02-COMPLETE-IMPLEMENTATION-GUIDE.md** (Section: Architecture)
2. **See real code** → Check `src/features/auth/hooks/useLogin.ts` (detailed implementation)
3. **Try modifying** → Add a new login field to `src/features/auth/schemas/loginSchema.ts`
4. **Run tests** → `npm run test` to see auth tests pass

### For Feature Implementation
1. **Adding new API endpoint?** → See **03-API-REFERENCE.md**
2. **Adding new form?** → See **02-COMPLETE-IMPLEMENTATION-GUIDE.md → Section: Form Patterns**
3. **Adding new role?** → See **02-COMPLETE-IMPLEMENTATION-GUIDE.md → Section: Roles System**

### For Troubleshooting
1. **Things not working?** → Check **04-TROUBLESHOOTING-RUNBOOK.md**
2. **Specific error?** → Search the error message in runbook
3. **Still stuck?** → Check browser Network tab and console

---

## 🛠️ Common Tasks

### Login User

```typescript
import { useLogin } from '@/features/auth/hooks'

export function LoginPage() {
  const { mutate: login } = useLogin()
  
  const handleSubmit = (email: string, password: string) => {
    login({ email, password })
    // Auto-redirects on success via useRoleRedirect
  }
}
```

### Check Current User

```typescript
import { useCurrentUser } from '@/features/auth/hooks'

export function Profile() {
  const { data: user, isLoading } = useCurrentUser()
  
  if (isLoading) return <div>Loading...</div>
  return <h1>Hello {user?.firstName}!</h1>
}
```

### Check User Role

```typescript
import { useAuthStore } from '@/features/auth/stores'

export function AdminPanel() {
  const { user } = useAuthStore()
  
  if (user?.role !== 'ADMIN') {
    return <div>Not authorized</div>
  }
  
  return <div>Admin Dashboard</div>
}
```

### Protect a Route

```typescript
import { ProtectedRoute } from '@/features/auth/components'

// In your router
export const adminRoute = {
  path: '/admin',
  element: <ProtectedRoute requiredRole="ADMIN"><AdminPage /></ProtectedRoute>
}
```

### Logout User

```typescript
import { useAuthStore } from '@/features/auth/stores'

export function LogoutButton() {
  const { logout } = useAuthStore()
  
  return <button onClick={logout}>Logout</button>
}
```

---

## 📱 Modern React 19 + TypeScript 5.9 Patterns Used

### Hooks Best Practices
✅ Proper dependency arrays  
✅ Cleanup functions in useEffect  
✅ No useCallback over-optimization  
✅ Direct state updates (no reducers needed with Zustand)

### TypeScript Patterns
✅ Zero `any` types (strict mode enabled)  
✅ Discriminated unions for errors  
✅ Generic constraints where needed  
✅ TSDoc comments on all exports

### State Management
✅ Zustand for simplicity  
✅ Persist middleware for localStorage  
✅ TanStack Query for server state  
✅ React Hook Form for form state

### Validation
✅ Zod for runtime type checking  
✅ Client-side validation with React Hook Form  
✅ Server-side validation with API  
✅ Custom validators for business logic

---

## 🔗 Full Documentation

| Document | Purpose | Size |
|----------|---------|------|
| **02-COMPLETE-IMPLEMENTATION-GUIDE.md** | Deep dive into architecture & implementation | 2000 lines |
| **03-API-REFERENCE.md** | All API endpoints with examples | 1500 lines |
| **04-TROUBLESHOOTING-RUNBOOK.md** | Debug guide for common issues | 1200 lines |
| **auth-checklist.md** | Phase-by-phase implementation checklist | Reference |
| **README.md** | Updated doc index | Overview |

---

## 💡 Pro Tips

1. **Use browser DevTools for React debugging**
   - Install React DevTools extension
   - Check component state in Real-time

2. **Use TanStack Query DevTools**
   - Already built-in
   - Shows API calls, caching, errors
   - Toggle visibility: `Ctrl+Shift+Q`

3. **Check localStorage for auth state**
   - Open DevTools → Application → localStorage
   - Key: `"auth"` contains Zustand store
   - Key: `"auth_token"` contains JWT token

4. **Use Network tab to debug API calls**
   - Watch `POST /api/auth/login` requests
   - Check Authorization header
   - Verify token format: `Bearer eyJhbGc...`

5. **Keep error messages descriptive**
   - Each error maps to Vietnamese message
   - Check `src/lib/api-error-handler.ts` for mapping
   - Add new error codes there

---

## ❓ FAQ

### Q: Do I need to manually attach tokens to API calls?
**A**: No! Axios interceptor does it automatically. All requests will include the JWT token.

### Q: What happens when token expires?
**A**: Backend returns 401. Interceptor catches it and logs user out. User is redirected to login.

### Q: Can I test authentication without backend?
**A**: Not easily - backend Identity Service is required. Use local backend setup or docker-compose.

### Q: How do I add a new role?
**A**: See **02-COMPLETE-IMPLEMENTATION-GUIDE.md → Section: Adding New Roles**.

### Q: What's the difference between useAuthStore and TanStack Query hooks?
**A**: 
- `useAuthStore` = Client state (who is logged in, token)
- `useLogin`, `useRegister` = Server mutations (API calls)
- Both work together seamlessly

---

## 🚨 Need Help?

1. **Read** the specific guide (Quick Start → Implementation → API Reference → Troubleshooting)
2. **Search** the error message in **04-TROUBLESHOOTING-RUNBOOK.md**
3. **Check** source code in `src/features/auth/` - it's well-commented
4. **Run** tests: `npm run test` to see patterns in action

---

## 📊 Quick Reference

### File Locations
- **Hooks**: `src/features/auth/hooks/`
- **Store**: `src/features/auth/stores/useAuthStore.ts`
- **Schemas**: `src/features/auth/schemas/`
- **Components**: `src/features/auth/components/`
- **Interceptor**: `src/lib/axios-config.ts`
- **Roles**: `src/constants/roles.ts`

### Environment
- **Dev Server**: `npm run dev` → http://localhost:5173
- **Build**: `npm run build`
- **Tests**: `npm run test`
- **Lint**: `npm run lint`

### API Base
- **Local**: `http://localhost:8080` (check .env.local)
- **Endpoints**: `POST /api/auth/login`, `POST /api/auth/register`, etc.
- **Full list**: See **03-API-REFERENCE.md**

---

**Ready to build? → Read [02-COMPLETE-IMPLEMENTATION-GUIDE.md](./02-COMPLETE-IMPLEMENTATION-GUIDE.md) next!**
