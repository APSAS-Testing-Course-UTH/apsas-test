# APSAS Frontend Development Troubleshooting Guide

**Document**: Common Issues, Errors & Solutions for Frontend Development  
**Last Updated**: October 19, 2025  
**Audience**: Frontend Developers, New Team Members  
**Purpose**: Quick reference for debugging and problem-solving

---

## 🆘 Table of Contents

1. [TanStack Router Issues](#tanstack-router-issues)
2. [React & Hooks Issues](#react--hooks-issues)
3. [API Integration Issues](#api-integration-issues)
4. [State Management Issues](#state-management-issues)
5. [Build & Compilation Issues](#build--compilation-issues)
6. [Debugging Workflow](#debugging-workflow)

---

## 🧭 TanStack Router Issues

### Issue 1: Routes generating wrong URL paths

**Symptoms**:
- Expected: `/login`
- Actual: `/auth/login`
- Directory structure doesn't match URL

**Root Cause**:
In TanStack Router v1, **directory structure DIRECTLY maps to URL paths**.

```
File Location: src/routes/auth/login.tsx
Generated URL: /auth/login  ← Directory becomes URL segment!
```

**Solution**:
```typescript
// Option 1: Use flat structure (RECOMMENDED)
src/routes/
├── login.tsx          → /login ✅
├── register.tsx       → /register ✅
└── forgot-password.tsx → /forgot-password ✅

// Option 2: Use pathless layout
src/routes/
├── _auth.tsx          → (no URL - pathless)
└── _auth/
    ├── login.tsx      → /login ✅
    ├── register.tsx   → /register ✅
```

**Key Principle**:
- Regular file/directory names = URL segments
- Names starting with `_` (underscore) = pathless (no URL segment)
- `/` in path = URL parameter

---

### Issue 2: Dynamic routes not working (params undefined)

**Symptoms**:
- Route created at `$postId.tsx`
- Navigate to `/posts/123`
- `params.postId` is undefined

**Root Cause**:
Parent route doesn't expose params, or parameter naming mismatch.

**Solution**:

```typescript
// ✅ CORRECT: Parent route layout
// src/routes/_app.tsx (pathless layout)
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app')(({
  component: () => <Outlet />,  // Allows children
}))

// Child route with parameter
// src/routes/_app/posts/$postId.tsx
export const Route = createFileRoute('/_app/posts/$postId')({
  component: PostDetail,
  loader: ({ params }) => {
    console.log(params.postId)  // ✅ Now works!
    return fetchPost(params.postId)
  }
})

// Usage:
import { useParams } from '@tanstack/react-router'

function PostDetail() {
  const { postId } = useParams({ from: '/_app/posts/$postId' })
  return <div>Post: {postId}</div>
}
```

---

### Issue 3: Search params not persisting

**Symptoms**:
- Set search params: `?page=2&filter=active`
- Navigate to another route
- Go back → search params lost

**Solution**:

```typescript
// ✅ CORRECT: Save search params
import { useSearch, useNavigate } from '@tanstack/react-router'

function PostsList() {
  const { page = '1', filter = 'all' } = useSearch({ from: '/posts' })
  const navigate = useNavigate()
  
  return (
    <div>
      <select value={filter} onChange={(e) => {
        navigate({
          to: '/posts',
          search: { page: '1', filter: e.target.value }  // Update search
        })
      }}>
        <option value="all">All</option>
        <option value="active">Active</option>
      </select>
    </div>
  )
}

// Route definition with search params
export const Route = createFileRoute('/posts')({
  validateSearch: (search) => ({
    page: (search.page as string) || '1',
    filter: (search.filter as string) || 'all'
  }),
  component: PostsList
})
```

---

### Issue 4: Page not updating when route changes

**Symptoms**:
- Navigate from `/posts/1` to `/posts/2`
- Component doesn't re-render
- Still showing data from `/posts/1`

**Root Cause**:
Component using stale params or loader not re-running.

**Solution**:

```typescript
// ❌ WRONG: Not re-running loader
export const Route = createFileRoute('/posts/$postId')({
  component: PostDetail,
  loader: ({ params }) => {
    return fetchPost(params.postId)
  }
})

// ✅ CORRECT: Use useLoaderData hook
import { useLoaderData } from '@tanstack/react-router'

function PostDetail() {
  const data = useLoaderData({ from: '/posts/$postId' })
  const { postId } = useParams({ from: '/posts/$postId' })
  
  // Component re-renders when params change
  return <div>{data.title}</div>
}
```

---

### Issue 5: Error boundary not catching route errors

**Symptoms**:
- Error thrown in route loader
- Not caught by error boundary
- Page crashes

**Solution**:

```typescript
// ✅ Define errorComponent
export const Route = createFileRoute('/posts/$postId')({
  component: PostDetail,
  errorComponent: ErrorPage,  // ← Important!
  loader: async ({ params }) => {
    const response = await fetch(`/api/posts/${params.postId}`)
    if (!response.ok) throw new Error('Post not found')
    return response.json()
  }
})

// Error component
function ErrorPage() {
  const error = useRouteContext()
  return (
    <div>
      <h1>Error</h1>
      <p>{error.message}</p>
    </div>
  )
}
```

---

## ⚛️ React & Hooks Issues

### Issue 1: useEffect running too many times

**Symptoms**:
- Effect runs on every render
- API calls repeated unnecessarily
- Performance degradation

**Root Cause**:
Missing or incorrect dependency array.

**Solution**:

```typescript
// ❌ WRONG: No dependency array (runs on every render)
useEffect(() => {
  fetchData()
})

// ✅ CORRECT: Empty array (runs once on mount)
useEffect(() => {
  fetchData()
}, [])

// ✅ CORRECT: With dependencies (runs when deps change)
useEffect(() => {
  fetchData(userId)
}, [userId])  // Re-run when userId changes

// ✅ CORRECT: Clean up effect
useEffect(() => {
  const subscription = dataService.subscribe(handleData)
  return () => subscription.unsubscribe()  // Cleanup
}, [])
```

---

### Issue 2: Infinite loop in useEffect

**Symptoms**:
- Component constantly re-rendering
- Network requests never stop
- CPU usage high

**Root Cause**:
Dependency in effect that keeps changing.

**Solution**:

```typescript
// ❌ WRONG: Object as dependency (new object on every render)
const config = { page: 1 }
useEffect(() => {
  fetchData(config)
}, [config])  // ← Infinite loop!

// ✅ CORRECT: Use primitive value
useEffect(() => {
  fetchData(1)
}, [])  // ← No dependencies

// ✅ CORRECT: Memoize object dependency
const config = useMemo(() => ({ page: 1 }), [])
useEffect(() => {
  fetchData(config)
}, [config])
```

---

### Issue 3: State not updating

**Symptoms**:
- Set state but component doesn't re-render
- New state value not visible
- State update "doesn't work"

**Root Cause**:
Mutating state directly instead of creating new object.

**Solution**:

```typescript
// ❌ WRONG: Mutating state directly
const [user, setUser] = useState({ name: 'John' })
user.name = 'Jane'  // Direct mutation - React won't detect!
setUser(user)       // React doesn't re-render

// ✅ CORRECT: Create new object
setUser({ ...user, name: 'Jane' })

// ✅ CORRECT: Use callback form
setUser(prevUser => ({ ...prevUser, name: 'Jane' }))

// For arrays:
// ❌ WRONG
items.push(newItem)
setItems(items)

// ✅ CORRECT
setItems([...items, newItem])
```

---

### Issue 4: Stale closures in event handlers

**Symptoms**:
- Event handler using old state/props
- Old values captured in closure
- Can't access latest state

**Solution**:

```typescript
// ❌ WRONG: Closure captures old counter
function Counter() {
  const [count, setCount] = useState(0)
  
  const handleClick = () => {
    setTimeout(() => {
      console.log(count)  // ← Stale closure!
    }, 1000)
  }
  
  return <button onClick={handleClick}>Count: {count}</button>
}

// ✅ CORRECT: Use callback form or ref
function Counter() {
  const [count, setCount] = useState(0)
  
  const handleClick = () => {
    setCount(c => {  // ← Use callback
      setTimeout(() => {
        console.log(c)  // ← Latest value
      }, 1000)
      return c + 1
    })
  }
  
  return <button onClick={handleClick}>Count: {count}</button>
}
```

---

### Issue 5: Component re-renders excessively

**Symptoms**:
- Component renders unnecessarily
- React DevTools shows many renders
- Performance issue

**Solution**:

```typescript
// ✅ Use React.memo for component optimization
const UserCard = React.memo(function UserCard({ user }) {
  return <div>{user.name}</div>
}, (prevProps, nextProps) => {
  // Return true to skip re-render
  return prevProps.user.id === nextProps.user.id
})

// ✅ Use useCallback to stabilize function references
function Parent() {
  const [count, setCount] = useState(0)
  
  const handleClick = useCallback(() => {
    setCount(c => c + 1)
  }, [])  // ← Empty deps = stable reference
  
  return <Child onClick={handleClick} />  // ← Child won't re-render
}

// ✅ Use useMemo to memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])  // ← Recompute only when data changes
```

---

## 🔌 API Integration Issues

### Issue 1: CORS error on API calls

**Symptoms**:
- Browser console: "Access-Control-Allow-Origin header missing"
- Network tab: 200 status but request fails
- Frontend can't read response

(See [Network Issues](#network--api-issues) in Troubleshooting Runbook)

---

### Issue 2: API response not updating component

**Symptoms**:
- API call succeeds
- Data fetched but component doesn't update
- Still showing old data

**Solution**:

```typescript
// ✅ Using TanStack Query
import { useQuery } from '@tanstack/react-query'

function UserProfile() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],  // ← Unique key
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000  // ← Cache 5 min
  })
  
  if (isLoading) return <div>Loading...</div>
  return <div>{user?.name}</div>
}

// ✅ Invalidate cache on mutation
function UpdateUser() {
  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })  // ← Refetch!
    }
  })
  
  return <button onClick={() => mutation.mutate({ name: 'New' })}>Update</button>
}
```

---

### Issue 3: Loading state never resolves

**Symptoms**:
- `isLoading` always true
- Component always shows loading spinner
- API not responding

**Solution**:

```typescript
// Check API status
curl http://localhost:8080/api/health

// Add timeout
const { data, isLoading, error } = useQuery({
  queryKey: ['data'],
  queryFn: () => fetchData(),
  retry: 1,  // ← Retry once on failure
  staleTime: 0,  // ← No stale time
  gcTime: 0  // ← Don't cache (formerly cacheTime)
})

// Show error state
if (error) return <div>Error: {error.message}</div>
```

---

## 🎯 State Management Issues

### Issue 1: Zustand store not updating

**Symptoms**:
- Update store but component doesn't re-render
- New state not visible
- Store mutation not working

**Solution**:

```typescript
// ✅ CORRECT: Return new state object
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),  // ← Returns new object
  updateName: (name) => set((state) => ({
    user: { ...state.user, name }  // ← Immutable update
  }))
}))

// ✅ Use selector for optimization
const user = useStore(state => state.user)  // ← Only re-render when user changes
const setUser = useStore(state => state.setUser)

// ❌ WRONG: Direct mutation
const updateName = (name) => {
  const state = useStore.getState()
  state.user.name = name  // ← Direct mutation!
  set(state)  // ← Won't trigger re-render
}
```

---

### Issue 2: Zustand store not persisting

**Symptoms**:
- Refresh page
- Store state lost (back to initial)
- User logged out

**Solution**:

```typescript
// ✅ Add persist middleware
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user })
    }),
    {
      name: 'app-store',  // ← localStorage key
      partialize: (state) => ({  // ← Choose what to persist
        user: state.user
      })
    }
  )
)

// Retrieve from localStorage on startup
const savedState = localStorage.getItem('app-store')
if (savedState) {
  const parsed = JSON.parse(savedState)
  useStore.setState(parsed.state)
}
```

---

### Issue 3: Multiple store updates not batching

**Symptoms**:
- Multiple setState calls
- Component re-renders multiple times
- Performance issue

**Solution**:

```typescript
// ✅ Batch updates
import { unstable_batchedUpdates } from 'react'

unstable_batchedUpdates(() => {
  setState1(value1)
  setState2(value2)
  setState3(value3)
})  // ← Single re-render

// ✅ In Zustand, use single setState call
useStore.setState({
  user: newUser,
  loading: false,
  error: null
})  // ← Single re-render
```

---

## 🔨 Build & Compilation Issues

### Issue 1: "Cannot find module" error

**Symptoms**:
- Build fails with "Cannot find module '@/components/Button'"
- Import path looks correct
- Works in editor but fails in build

**Root Cause**:
Path alias not configured, or import path wrong.

**Solution**:

```typescript
// ✅ Check vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')  // ← Configure alias
    }
  }
})

// ✅ Check tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]  // ← Add path mapping
    }
  }
}

// ✅ Correct import
import Button from '@/components/Button'  // ✅ Works
```

---

### Issue 2: TypeScript errors in build but not in editor

**Symptoms**:
- VS Code shows no errors
- `npm run build` fails with TypeScript errors
- Type checking inconsistent

**Root Cause**:
VS Code using different TypeScript version or config.

**Solution**:

```bash
# Use project TypeScript version
npx tsc --version

# Run type checking before build
npm run type-check  # Should run: tsc --noEmit

# Fix issues
npm run type-check -- --noEmit

# In tsconfig.json, ensure strict mode
{
  "compilerOptions": {
    "strict": true,  // ← Enable strict mode
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

---

### Issue 3: Build output too large

**Symptoms**:
- Bundle size >100KB gzipped
- Initial load slow
- Memory usage high

**Solution**:

```bash
# Analyze bundle
npm run build -- --analyze

# Enable code splitting
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['@tanstack/react-router'],
          'query': ['@tanstack/react-query']
        }
      }
    }
  }
})

# Enable lazy loading routes
import { lazy } from 'react'
const AdminPanel = lazy(() => import('./AdminPanel'))
```

---

## 🔍 Debugging Workflow

### Step 1: Browser DevTools

```javascript
// Console tab
// Check localStorage
localStorage.getItem('accessToken')
localStorage.getItem('user')

// Check store
import { useAuthStore } from '@/stores'
useAuthStore.getState()

// Check state
const state = useAuthStore((s) => s)
console.log(state)

// Decode JWT
import jwtDecode from 'jwt-decode'
jwtDecode(token)
```

### Step 2: React DevTools Extension

```
1. Install React DevTools browser extension
2. Open Components tab
3. Select component in hierarchy
4. View props/state on right panel
5. Look for: stale state, wrong props, re-renders
```

### Step 3: Network Tab

```
1. Open DevTools → Network tab
2. Perform action (login, submit form, etc.)
3. Look for API requests
4. Check: Status code, Request headers, Response body
5. Verify Authorization header present
```

### Step 4: Console Errors

```javascript
// Common errors to watch for:
// 1. "Cannot read property of undefined"
console.log(obj?.prop)  // Use optional chaining

// 2. "Unexpected token in JSON"
JSON.parse(data)  // Check data is valid JSON

// 3. "Missing dependency in useEffect"
// ESLint should catch these

// 4. "Too many renders"
// Check for infinite loops in effects/setState
```

---

**Last Updated**: October 19, 2025  
**Version**: 2.0  
**Maintained By**: APSAS Frontend Team