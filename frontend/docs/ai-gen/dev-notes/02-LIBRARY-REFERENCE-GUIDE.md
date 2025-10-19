# APSAS Frontend Library & Framework Reference

**Document**: Setup, Configuration & Best Practices for Core Libraries  
**Last Updated**: October 19, 2025  
**Libraries**: TanStack Router, TanStack Query, React 19, TypeScript 5.9, Zustand, Zod  
**Audience**: Developers, Architects, New Team Members

---

## 📚 Table of Contents

1. [TanStack Router v1.132](#tanstack-router-v1132)
2. [TanStack React Query v5.90](#tanstack-react-query-v590)
3. [React 19 & TypeScript 5.9](#react-19--typescript-59)
4. [Zustand v5 - State Management](#zustand-v5)
5. [Zod - Validation](#zod---validation)
6. [Library Interaction Patterns](#library-interaction-patterns)

---

## 🧭 TanStack Router v1.132

### Setup & Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts'
    }),
    react()
  ]
})
```

### File-Based Routing Structure

```
src/routes/
├── __root.tsx                  # Root layout (optional)
├── index.tsx                   # / (home)
├── about.tsx                   # /about
├── posts/
│   ├── index.tsx               # /posts (list)
│   └── $postId.tsx             # /posts/:postId (detail)
├── _auth.tsx                   # Pathless layout (no URL segment)
├── _auth/
│   ├── login.tsx               # /login (with _auth layout)
│   └── register.tsx            # /register (with _auth layout)
└── _layout.tsx                 # Global layout wrapper
```

### Key Concepts

| Pattern | Meaning | URL Impact |
|---------|---------|-----------|
| `index.tsx` | Default route for directory | URL path of parent |
| `$param.tsx` | Dynamic parameter | `:param` in URL |
| `_name.tsx` | Pathless route (no URL segment) | Only layout, no URL |
| `_name/` | Directory with pathless parent | Children inherit parent's URL |
| `[param].tsx` | Optional parameter | `:param?` |
| `$.tsx` | Catch-all splat route | `*` match remaining |

### Route Definition

```typescript
// src/routes/posts/$postId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useParams, useLoaderData } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    // Load data on route change
    return await fetchPost(params.postId)
  },
  
  errorComponent: () => <div>Error loading post</div>,
  
  pendingComponent: () => <div>Loading...</div>,
  
  validateSearch: (search) => ({
    view: (search.view as 'detail' | 'edit') || 'detail'
  }),
  
  component: PostDetail
})

function PostDetail() {
  const { postId } = useParams({ from: '/posts/$postId' })
  const post = useLoaderData({ from: '/posts/$postId' })
  const { view } = Route.useSearch()
  
  return <div>{post.title}</div>
}
```

### Navigation & Links

```typescript
import { useNavigate, Link } from '@tanstack/react-router'

// Programmatic navigation
const navigate = useNavigate()

navigate({
  to: '/posts/$postId',
  params: { postId: '123' },
  search: { view: 'detail' },
  replace: false  // Add to history
})

// Link component
<Link to="/posts/$postId" params={{ postId: '123' }}>
  View Post
</Link>

// Active link detection
<Link 
  to="/posts"
  activeProps={{ className: 'active' }}
  inactiveProps={{ className: 'inactive' }}
>
  Posts
</Link>
```

### Common Patterns

```typescript
// Protected route with layout
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    // Protect route - run before loading
    const auth = useAuthStore.getState()
    if (!auth.user) throw redirect({ to: '/login' })
  },
  component: DashboardLayout
})

// Multiple parameters
// URL: /users/123/posts/456
// File: src/routes/users/$userId/posts/$postId.tsx

// Search params with validation
export const Route = createFileRoute('/search')({
  validateSearch: (search) => ({
    q: (search.q as string) || '',
    page: (search.page as string) || '1',
    sort: (search.sort as 'asc' | 'desc') || 'asc'
  }),
  component: SearchPage
})
```

---

## 🔄 TanStack React Query v5.90

### Setup & Configuration

```typescript
// src/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // Data fresh for 5 min
      gcTime: 10 * 60 * 1000,          // Keep in cache for 10 min
      retry: 1,                         // Retry failed requests once
      refetchOnWindowFocus: true,       // Refetch when window focused
    },
    mutations: {
      retry: 1,
    }
  }
})

// App setup
import { QueryClientProvider } from '@tanstack/react-query'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  )
}
```

### useQuery (Data Fetching)

```typescript
import { useQuery } from '@tanstack/react-query'

function UserProfile({ userId }) {
  const { 
    data: user,        // Response data
    isLoading,         // First load
    isFetching,        // Any loading
    isError,           // Has error
    error,             // Error object
    refetch,           // Manual refetch
    status             // 'pending' | 'error' | 'success'
  } = useQuery({
    queryKey: ['users', userId],      // Unique cache key
    queryFn: () => fetchUser(userId), // Fetch function
    staleTime: 5 * 60 * 1000,        // Don't refetch for 5 min
    enabled: !!userId                 // Only fetch if userId exists
  })
  
  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error: {error.message}</div>
  
  return <div>{user?.name}</div>
}
```

### useMutation (Data Changes)

```typescript
import { useMutation } from '@tanstack/react-query'

function UpdateUser() {
  const mutation = useMutation({
    mutationFn: (data) => updateUser(data),
    
    onMutate: async (newData) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['users'] })
      const previous = queryClient.getQueryData(['users'])
      queryClient.setQueryData(['users'], (old) => ({
        ...old,
        ...newData
      }))
      return { previous }
    },
    
    onError: (err, newData, context) => {
      // Revert on error
      queryClient.setQueryData(['users'], context?.previous)
    },
    
    onSuccess: () => {
      // Refetch data
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
  
  return (
    <button 
      onClick={() => mutation.mutate({ name: 'New Name' })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Updating...' : 'Update'}
    </button>
  )
}
```

### Cache Management

```typescript
// Invalidate cache (force refetch)
queryClient.invalidateQueries({ 
  queryKey: ['posts']  // All posts queries
})

queryClient.invalidateQueries({ 
  queryKey: ['posts', userId]  // Only specific user's posts
})

// Set cache directly
queryClient.setQueryData(['user', userId], newUser)

// Get cache data
const user = queryClient.getQueryData(['user', userId])

// Remove from cache
queryClient.removeQueries({ queryKey: ['posts'] })

// Clear all cache
queryClient.clear()
```

---

## ⚛️ React 19 & TypeScript 5.9

### React 19 Features Used

```typescript
// ✅ Concurrent rendering
// Automatic with React 19 - no code changes needed

// ✅ Controlled components
function LoginForm() {
  const [email, setEmail] = useState('')
  
  return (
    <input
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  )
}

// ✅ useTransition for slow updates
function SearchPage() {
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  
  const handleSearch = (q: string) => {
    startTransition(() => {
      setQuery(q)  // Marks as non-urgent
    })
  }
  
  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {isPending && <div>Searching...</div>}
    </div>
  )
}

// ✅ Lazy loading components
import { lazy, Suspense } from 'react'

const AdminPanel = lazy(() => import('./AdminPanel'))

export function App() {
  return (
    <Suspense fallback={<div>Loading admin...</div>}>
      <AdminPanel />
    </Suspense>
  )
}
```

### TypeScript 5.9 Patterns

```typescript
// ✅ Discriminated unions (very powerful!)
type AuthState = 
  | { status: 'idle'; user: null }
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: User }
  | { status: 'error'; user: null; error: string }

function renderAuth(state: AuthState) {
  switch (state.status) {
    case 'idle':
      return <div>Please login</div>
    case 'loading':
      return <div>Logging in...</div>
    case 'authenticated':
      // ✅ TypeScript knows state.user is NOT null here
      return <div>Welcome {state.user.name}</div>
    case 'error':
      return <div>Error: {state.error}</div>
  }
}

// ✅ Const type parameters
interface Box<const T> {
  value: T
}

const stringBox: Box<'hello'> = { value: 'hello' }  // ✅ Type is 'hello', not string

// ✅ Template literal types
type ApiEndpoint = `/${string}`
const endpoint: ApiEndpoint = '/api/users'  // ✅ OK
const bad: ApiEndpoint = 'api/users'        // ❌ Error

// ✅ Strict mode enabled
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

---

## 🎯 Zustand v5

### Store Setup

```typescript
import { create } from 'zustand'
import { persist, devtools, subscribeWithSelector } from 'zustand/middleware'

interface AuthStore {
  // State
  user: User | null
  token: string | null
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        token: null,
        isLoading: false,
        
        // Actions
        setUser: (user) => set({ user }),
        setToken: (token) => set({ token }),
        
        login: async (email, password) => {
          set({ isLoading: true })
          try {
            const response = await api.post('/auth/login', {
              email, password
            })
            set({
              user: response.data.user,
              token: response.data.token,
              isLoading: false
            })
          } catch (error) {
            set({ isLoading: false })
            throw error
          }
        },
        
        logout: () => set({ user: null, token: null })
      }),
      {
        name: 'auth-store',  // localStorage key
        partialize: (state) => ({  // Persist only these fields
          token: state.token,
          user: state.user
        })
      }
    ),
    { name: 'Auth Store' }
  )
)

// Usage
function Component() {
  const user = useAuthStore((state) => state.user)  // ✅ Optimized selector
  const logout = useAuthStore((state) => state.logout)
  
  return <button onClick={logout}>Logout {user?.name}</button>
}
```

### Slice Pattern (Organization)

```typescript
// slices/auth.ts
export interface AuthSlice {
  user: User | null
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
}

export const createAuthSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never]],
  [],
  AuthSlice
> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
  login: async (email, password) => {
    // ...
  }
})

// slices/ui.ts
export interface UISlice {
  isMenuOpen: boolean
  toggleMenu: () => void
}

export const createUISlice: StateCreator<RootStore> = (set) => ({
  isMenuOpen: false,
  toggleMenu: () => set(state => ({ isMenuOpen: !state.isMenuOpen }))
})

// Combined store
type RootStore = AuthSlice & UISlice

const useStore = create<RootStore>()(
  devtools(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createUISlice(...a)
    })
  )
)
```

---

## ✓ Zod - Validation

### Schema Definition

```typescript
import { z } from 'zod'

// Basic types
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters')
})

// With transformations
const userSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase()),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  createdAt: z.string().datetime().transform((d) => new Date(d))
})

// Conditional validation
const updateSchema = z.object({
  password: z.string().min(8).optional(),
  newPassword: z.string().min(8).optional(),
  confirmPassword: z.string().optional()
}).refine(
  (data) => {
    if (data.password && !data.newPassword) return false
    return true
  },
  { message: 'newPassword required with password' }
)

// Enum types
const roleSchema = z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN'])

// Union types
const resultSchema = z.union([
  z.object({ success: z.literal(true), data: z.any() }),
  z.object({ success: z.literal(false), error: z.string() })
])

// Extract TypeScript type from schema
type LoginForm = z.infer<typeof loginSchema>  // { email: string; password: string }
```

### Form Integration with React Hook Form

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function LoginForm() {
  const { register, formState: { errors }, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur'  // Validate on blur
  })
  
  const onSubmit = handleSubmit((data) => {
    console.log('Valid data:', data)
    // Send to API
  })
  
  return (
    <form onSubmit={onSubmit}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Login</button>
    </form>
  )
}
```

---

## 🔗 Library Interaction Patterns

### TanStack Router + Query + Zustand

```typescript
// 1. Route loads data with Query
export const Route = createFileRoute('/dashboard')({
  loader: async () => {
    return await queryClient.ensureQueryData({
      queryKey: ['user'],
      queryFn: fetchCurrentUser
    })
  },
  component: Dashboard
})

// 2. Component uses data from Query cache
function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: fetchCurrentUser
  })
  
  // 3. User data automatically synced to Zustand on login
  useEffect(() => {
    useAuthStore.setState({ user })
  }, [user])
  
  return <div>Welcome {user?.name}</div>
}

// 4. Mutation updates cache and store
function UpdateProfile() {
  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser)
      useAuthStore.setState({ user: updatedUser })
    }
  })
  
  return <button onClick={() => mutation.mutate(newData)}>Update</button>
}
```

---

**Version**: 2.0  
**Last Updated**: October 19, 2025  
**Maintained By**: APSAS Frontend Team