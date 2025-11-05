---
applyTo: src/api/**/*.ts, src/features/**/api/**/*.ts
---

# API Integration Guide for APSAS

## 🚀 Quick Start: Using Generated API

### The Pattern
```
Generated Types → SDK Client → Hooks → Components → Tests
```

### Step 1: Find Generated Types
```typescript
// Check: src/api/types.gen.ts
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'
```

### Step 2: Use SDK Client
```typescript
// Check: src/api/sdk.gen.ts
import { contentServiceGetAllAssignments } from '@/api/sdk.gen'

const response = await contentServiceGetAllAssignments({
  query: { page: '0', size: '10' }
})
```

### Step 3: Wrap in React Query Hook
```typescript
// Create: src/features/myfeature/api/hooks.ts
import { contentServiceGetAllAssignments } from '@/api/sdk.gen'
import type { ContentServicePageResponseAssignmentResponse } from '@/api/types.gen'

export function useAssignments(page: number) {
  return useQuery<ContentServicePageResponseAssignmentResponse>({
    queryKey: ['assignments', page],
    queryFn: () => contentServiceGetAllAssignments({
      query: { page: String(page), size: '10' }
    })
  })
}
```

### Step 4: Use in Component
```typescript
// src/features/myfeature/components/List.tsx
import { useAssignments } from '../api/hooks'

export function AssignmentsList() {
  const { data, isLoading } = useAssignments(0)
  return <div>{data?.content?.map(a => <div key={a.id}>{a.title}</div>)}</div>
}
```

### Step 5: Test with MSW
```typescript
// MSW handlers already exist - they work with generated SDK!
// No changes needed to test setup
```

## ✅ Checklist for Every API Feature
- [ ] Found types in `types.gen.ts`
- [ ] Found SDK function in `sdk.gen.ts`
- [ ] Created custom hook wrapping SDK
- [ ] Wrote tests with MSW handlers
- [ ] Verified tests passing (28+ minimum)
- [ ] Checked for custom duplicate types
- [ ] Updated feature exports
- [ ] All features covered by tests (≥90% coverage)

---

# API Integration Guide for APSAS

## Generated API Client Usage

### Never Edit Generated Files
```
❌ DO NOT manually edit these files:
- src/api/client.gen.ts
- src/api/types.gen.ts
- src/api/zod.gen.ts
- src/api/sdk.gen.ts
- src/api/@tanstack/react-query.gen.ts
- src/api/client/*.gen.ts
- src/api/core/*.gen.ts

✅ DO regenerate when OpenAPI specs change:
npm run api:generate
```

### Import Generated Types
```typescript
// ✅ Good: Import from generated files
import type { User, CreateUserInput } from '@/api/types.gen';
import { UserSchema } from '@/api/zod.gen';
import { API } from '@/api';

// ❌ Bad: Creating manual type definitions
interface User {
  id: string;
  name: string;
}
```

### API Client Initialization
```typescript
// src/api/index.ts - Main API export
import { API } from '@/api/client.gen';
import { handleApiError } from '@/configs/api-error-handler';

// Configure error handling globally
export { API, handleApiError };

// Usage in components
import { API, handleApiError } from '@/api';

const data = await API.users.getById('123');
```

## Query Key Management

### Consistent Query Keys
```typescript
// ✅ Good: Use factory pattern for query keys
import { useQuery } from '@tanstack/react-query';
import type { User } from '@/api/types.gen';

// Query key factory
export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (filters: ListFilters) => [...userKeys.lists(), filters],
  details: () => [...userKeys.all, 'detail'],
  detail: (id: string) => [...userKeys.details(), id],
};

// Usage
const { data } = useQuery({
  queryKey: userKeys.detail(userId),
  queryFn: () => API.users.getById(userId),
});

// Invalidate intelligently
queryClient.invalidateQueries({ queryKey: userKeys.lists() }); // Only list
queryClient.invalidateQueries({ queryKey: userKeys.all }); // All user queries

// ❌ Avoid: Inconsistent key patterns
useQuery({
  queryKey: ['user', userId], // Inconsistent
  queryFn: () => API.users.getById(userId),
});
```

### Pagination Query Keys
```typescript
export const submissionKeys = {
  all: ['submissions'],
  lists: () => [...submissionKeys.all, 'list'],
  list: (params: PaginationParams) => [
    ...submissionKeys.lists(),
    params,
  ],
  details: () => [...submissionKeys.all, 'detail'],
  detail: (id: string) => [...submissionKeys.details(), id],
};

// Use in component
function SubmissionList({ page = 1, limit = 10 }: PaginationParams) {
  const { data, isLoading } = useQuery({
    queryKey: submissionKeys.list({ page, limit }),
    queryFn: () => API.submissions.list({ page, limit }),
  });

  return <div>{/* render */}</div>;
}
```

## Request/Response Patterns

### Simple GET Request
```typescript
// With TanStack Query
const { data: user, isLoading, error } = useQuery({
  queryKey: ['users', userId],
  queryFn: async () => {
    const response = await API.users.getById(userId);
    return response.data; // or response depending on API structure
  },
});
```

### POST Request with Data
```typescript
const mutation = useMutation({
  mutationFn: async (input: CreateUserInput) => {
    // Validate before sending
    const validated = UserSchema.parse(input);
    const response = await API.users.create(validated);
    return response.data;
  },
  onSuccess: (data) => {
    // Handle success - e.g., show toast, redirect
    showNotification('User created successfully', 'success');
    queryClient.invalidateQueries({ queryKey: userKeys.all });
  },
  onError: (error) => {
    const message = handleApiError(error);
    showNotification(message, 'error');
  },
});

// Usage
mutation.mutate({ name: 'John', email: 'john@example.com' });
```

### Batch Requests
```typescript
// Execute multiple queries
const { data: [users, roles] } = useQueries({
  queries: [
    {
      queryKey: ['users'],
      queryFn: () => API.users.list(),
    },
    {
      queryKey: ['roles'],
      queryFn: () => API.roles.list(),
    },
  ],
});

// Wait for all
Promise.all([
  API.users.list(),
  API.roles.list(),
]).then(([usersRes, rolesRes]) => {
  // Handle results
});
```

### Chained Requests
```typescript
// Pattern 1: Dependent queries
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => API.users.getById(userId),
});

const { data: userPosts } = useQuery({
  queryKey: ['posts', user?.id],
  queryFn: () => API.posts.listByUser(user!.id),
  enabled: !!user, // Only run when user is loaded
});

// Pattern 2: Sequential mutations
const createUserMutation = useMutation({
  mutationFn: (input) => API.users.create(input),
});

const assignRoleMutation = useMutation({
  mutationFn: (data: { userId: string; roleId: string }) =>
    API.users.assignRole(data),
});

async function createAndAssignRole(
  userData: CreateUserInput,
  roleId: string
) {
  const { id: userId } = await createUserMutation.mutateAsync(userData);
  await assignRoleMutation.mutateAsync({ userId, roleId });
}
```

## Error Handling

### Global Error Handler
```typescript
// src/configs/api-error-handler.ts
import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export function handleApiError(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse;
    const status = error.response?.status;

    // Handle specific status codes
    if (status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
      return 'Session expired. Please log in again.';
    }

    if (status === 403) {
      return 'You do not have permission to perform this action.';
    }

    if (status === 404) {
      return 'The requested resource was not found.';
    }

    if (status === 422) {
      // Validation errors
      if (data?.details) {
        const errors = Object.entries(data.details)
          .map(([field, message]) => `${field}: ${message}`)
          .join('; ');
        return errors;
      }
    }

    if (status && status >= 500) {
      return 'Server error. Please try again later.';
    }

    return data?.message || error.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}

// Usage
const mutation = useMutation({
  mutationFn: API.users.create,
  onError: (error) => {
    const message = handleApiError(error);
    showNotification(message, 'error');
  },
});
```

### Retry Logic
```typescript
import { useQuery } from '@tanstack/react-query';

// Global retry config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (
          error instanceof AxiosError &&
          error.response?.status &&
          error.response.status < 500
        ) {
          return false;
        }

        // Retry up to 3 times on 5xx errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Component-level override
const { data } = useQuery({
  queryKey: ['critical-data'],
  queryFn: () => API.criticalData.get(),
  retry: 5, // Override to 5 retries
  retryDelay: 1000,
});
```

## Validation Patterns

### Runtime Validation with Zod
```typescript
import { useMutation } from '@tanstack/react-query';
import { UserSchema } from '@/api/zod.gen';
import type { User } from '@/api/types.gen';

const mutation = useMutation({
  mutationFn: async (input: unknown) => {
    // Validate at runtime
    const validated = UserSchema.parse(input);

    // Now we're type-safe
    const response = await API.users.create(validated);
    return response.data;
  },
  onError: (error) => {
    if (error instanceof ZodError) {
      // Handle validation errors
      error.errors.forEach((e) => {
        console.error(`${e.path.join('.')}: ${e.message}`);
      });
    }
  },
});
```

### Safe Type Casting
```typescript
import type { User } from '@/api/types.gen';

// ✅ Good: Use 'satisfies' for type checking
const user = response as satisfies User;

// ❌ Avoid: Using 'as any'
const user = response as any;

// ✅ Good: Parse with Zod for safety
const user = UserSchema.parse(response);

// ✅ Good: Type guard function
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  );
}

if (isUser(data)) {
  console.log(data.name); // Now typed as User
}
```

## Caching Strategies

### Time-Based Cache
```typescript
const { data } = useQuery({
  queryKey: ['statistics'],
  queryFn: () => API.analytics.getStatistics(),
  staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for 5 minutes
  gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache for 30 minutes
});
```

### Infinite Queries
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

function SubmissionsList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['submissions'],
      queryFn: ({ pageParam = 1 }) =>
        API.submissions.list({ page: pageParam, limit: 20 }),
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.items.length < 20) return undefined;
        return pages.length + 1;
      },
    });

  return (
    <>
      {data?.pages.map((page) =>
        page.items.map((submission) => (
          <SubmissionCard key={submission.id} submission={submission} />
        ))
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </>
  );
}
```

## Environment Configuration

### API URL Configuration
```typescript
// src/configs/api-config.ts
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const SERVICES = {
  IDENTITY: `${API_BASE_URL}/identity`,
  SUBMISSION: `${API_BASE_URL}/submission`,
  EVALUATION: `${API_BASE_URL}/evaluation`,
  CONTENT: `${API_BASE_URL}/content`,
  SUPPORT: `${API_BASE_URL}/support`,
};

export { API_BASE_URL, SERVICES };

// .env.development
VITE_API_BASE_URL=http://localhost:3000/api

// .env.production
VITE_API_BASE_URL=https://api.apsas.com
```

## Testing API Integration

### Mock API Calls
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as API from '@/api';

describe('UserList', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    // Mock API
    vi.spyOn(API, 'users').mockReturnValue({
      getById: vi.fn().mockResolvedValue({
        data: { id: '1', name: 'John' },
      }),
      list: vi.fn().mockResolvedValue({
        data: { items: [{ id: '1', name: 'John' }] },
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display users', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <UserList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });
  });
});
```

---

**Last Updated:** October 19, 2025
