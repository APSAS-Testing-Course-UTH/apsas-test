---
applyTo: src/**/*.tsx
---

# React Component Best Practices for APSAS

## Component Structure Template

Use this as a reference when creating new components:

```typescript
import { useMemo, useCallback } from 'react';
import type { ComponentProps } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

// 1. Import types
import type { User } from '@/api/types.gen';
import type { ApiError } from '@/types';

// 2. Define prop interface
interface MyComponentProps {
  userId: string;
  onSuccess?: () => void;
  className?: string;
}

/**
 * MyComponent - Brief description
 * 
 * Longer description explaining what this component does,
 * when to use it, and any important behaviors.
 * 
 * @example
 * ```tsx
 * <MyComponent userId="123" onSuccess={() => console.log('done')} />
 * ```
 */
export function MyComponent({ userId, onSuccess, className }: MyComponentProps) {
  // 3. Queries and mutations
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await API.users.getById(userId);
      return response.data;
    },
  });

  // 4. Local state (minimize this)
  const [isEditing, setIsEditing] = useState(false);

  // 5. Memoized values
  const processedData = useMemo(() => {
    if (!user) return null;
    return {
      displayName: `${user.firstName} ${user.lastName}`,
      initials: `${user.firstName[0]}${user.lastName[0]}`,
    };
  }, [user]);

  // 6. Callbacks
  const handleSave = useCallback(async (data: unknown) => {
    // implementation
    onSuccess?.();
  }, [onSuccess]);

  // 7. Conditional rendering
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorBoundary error={error} />;
  if (!user) return null;

  // 8. Render
  return (
    <div className={className}>
      {/* JSX content */}
    </div>
  );
}

// 9. Export memoized version if component receives object props
export const MemoizedMyComponent = memo(MyComponent);
```

## Hooks Usage Guide

### Custom Hooks Pattern
```typescript
// src/features/auth/hooks/useRequireAuth.ts
import { useContext, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AuthContext } from '@/features/auth/context';

export function useRequireAuth(requiredRoles?: string[]) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }

    if (requiredRoles && !requiredRoles.includes(user?.role)) {
      navigate({ to: '/unauthorized' });
    }
  }, [isAuthenticated, user, navigate, requiredRoles]);

  return { user, isAuthenticated };
}
```

### TanStack Query Patterns
```typescript
// Pattern 1: Simple query
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: async () => {
    const res = await API.resources.getById(id);
    return res.data;
  },
});

// Pattern 2: Query with dependent queries
const { data: user } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => API.users.getById(userId),
});

const { data: posts } = useQuery({
  queryKey: ['posts', user?.id],
  queryFn: () => API.posts.getUserPosts(user!.id),
  enabled: !!user, // Only run when user is loaded
});

// Pattern 3: Mutation with optimistic update
const mutation = useMutation({
  mutationFn: (data: UpdateUserInput) => API.users.update(data),
  onMutate: async (newData) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ['users'] });

    // Snapshot previous state
    const previousUsers = queryClient.getQueryData(['users']);

    // Update cache optimistically
    queryClient.setQueryData(['users'], (old: User[]) => [
      ...old.filter(u => u.id !== newData.id),
      newData,
    ]);

    return { previousUsers };
  },
  onError: (_, __, context) => {
    // Revert on error
    if (context?.previousUsers) {
      queryClient.setQueryData(['users'], context.previousUsers);
    }
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

## Component Patterns

### Form Components
```typescript
import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => API.auth.login(data),
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        disabled={mutation.isPending}
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        disabled={mutation.isPending}
      />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Logging in...' : 'Login'}
      </button>
      {mutation.error && <p className="error">{mutation.error.message}</p>}
    </form>
  );
}
```

### List Components
```typescript
import { useQuery } from '@tanstack/react-query';

interface ListProps {
  limit?: number;
  offset?: number;
}

export function UserList({ limit = 10, offset = 0 }: ListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', { limit, offset }],
    queryFn: async () => {
      const res = await API.users.list({ limit, offset });
      return res.data;
    },
  });

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users</div>;
  if (!data?.items.length) return <div>No users found</div>;

  return (
    <ul>
      {data.items.map((user) => (
        <UserListItem key={user.id} user={user} />
      ))}
    </ul>
  );
}
```

### Modal/Dialog Components
```typescript
import { useCallback } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  const handleConfirm = useCallback(async () => {
    await onConfirm();
    onCancel();
  }, [onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Error Handling Patterns

### API Error Handler
```typescript
import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export function handleApiError(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse;

    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
      return 'Your session has expired. Please log in again.';
    }

    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }

    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }

    if (error.response?.status === 422) {
      // Validation error - extract field errors
      if (data.details) {
        return Object.values(data.details).flat().join(', ');
      }
    }

    if (error.response?.status >= 500) {
      return 'A server error occurred. Please try again later.';
    }

    return data?.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}
```

### Error Boundary
```typescript
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-container">
            <h1>Something went wrong</h1>
            <p>{this.state.error?.message}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

## Testing Patterns

### Component Test
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should render loading state initially', () => {
    render(<MyComponent userId="123" />, { wrapper });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display user data after loading', async () => {
    render(<MyComponent userId="123" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should call onSuccess callback', async () => {
    const onSuccess = vi.fn();
    render(<MyComponent userId="123" onSuccess={onSuccess} />, { wrapper });

    const saveButton = await screen.findByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

### Hook Test
```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRequireAuth } from './useRequireAuth';

describe('useRequireAuth', () => {
  it('should return authenticated user', async () => {
    const { result } = renderHook(() => useRequireAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should redirect when not authenticated', async () => {
    const { result } = renderHook(() => useRequireAuth());

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });
});
```

## TypeScript Patterns

### Proper Type Inference
```typescript
// Good: Let TypeScript infer types
const response = await API.users.getById('123');
type UserResponse = typeof response; // Inferred

// Good: Use satisfies for validation
const config = {
  api: 'https://api.example.com',
  timeout: 5000,
} satisfies ApiConfig;

// Avoid: Using 'any'
const data: any = response; // ❌

// Avoid: Unnecessary explicit types
const count: number = 0; // ✅ Number is inferred
const users: User[] = []; // ✅ Array type is clear
```

### Generic Utilities
```typescript
// Reusable type-safe API handler
async function fetchData<T>(
  queryKey: string[],
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(queryKey);
  if (cached) return cached;

  const data = await fetcher();
  cache.set(queryKey, data);
  return data;
}

// Usage
const user = await fetchData(['user', userId], () =>
  API.users.getById(userId)
);
```

---

**Last Updated:** October 19, 2025
