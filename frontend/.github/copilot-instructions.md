# APSAS Frontend - GitHub Copilot Custom Instructions

## 📋 Project Overview

**APSAS** (Academic Performance Student Assessment System) is a comprehensive React-based frontend application for student academic assessment and performance tracking. The system enables educators and administrators to manage student submissions, evaluations, and performance analytics with a focus on role-based access control and real-time data management.

**Target Audience:** Educators, Administrators, Students, and Providers
**Key Features:**
- Role-based authentication and authorization (Admin, Lecturer, Student, Provider)
- Student submission and evaluation management
- Performance analytics and reporting
- Content management and distribution
- Real-time notifications and updates
- Support and ticketing system

## 🏗️ Tech Stack in Use

### Core Framework & Build Tools
- **React 19+** - UI library for building interactive components
- **TypeScript** - Static type checking and enhanced IDE support for all frontend code
- **Vite** - Lightning-fast frontend build tool and dev server
- **TanStack Router** - Type-safe routing with automatic route generation (see `routeTree.gen.ts`)
- **TanStack Query (React Query)** - Data fetching, caching, and state management
- **React Hook Form** - Form state management and validation
- **Zustand** - Lightweight state management for local/global state


### Styling & UI
- **Mantine UI** - Component library for building responsive UIs
- **PostCSS** - CSS transformation and optimization
- **CSS Modules** - Component-scoped styling (when needed)

### API & Data Management
- **Axios** - HTTP client for API communication
- **OpenAPI TypeScript Generator** - Auto-generated type-safe API clients from OpenAPI specs
  - Identity Service
  - Submission Service
  - Evaluation Service
  - Content Service
  - Support Service
- **Zod** - TypeScript-first schema validation (generated types)

### Authentication & Authorization
- **Custom Auth Module** (`src/api/core/auth.gen.ts`)
- **Role-based Access Control (RBAC)** - Routes protected by user roles
- **Token Management** - JWT-based authentication with refresh token support

### Testing & Quality
- **Vitest** - Fast unit testing framework
- **@testing-library/react** - React component testing utilities
- **MSW (Mock Service Worker)** - API mocking for tests and development
- **ESLint** - Code linting and quality checks
- **TypeScript strict mode** - Enforced type safety

### Development Tools
- **Vite Environment Variables** (`vite-env.d.ts`) - Type-safe environment access
- **HMR (Hot Module Replacement)** - Instant feedback during development
- **OpenAPI TypeScript** - Code generation from API specifications

## 🎯 Project Structure

```
frontend/
├── .github/
│   └── copilot-instructions.md      # This file
├── src/
│   ├── app.tsx                      # Root App component with providers
│   ├── main.tsx                     # Application entry point
│   ├── router.ts                    # TanStack Router configuration
│   ├── routeTree.gen.ts             # Auto-generated route tree (DO NOT EDIT)
│   ├── query-client.ts              # TanStack Query client setup
│   ├── test-utils.tsx               # Testing utilities and custom renders
│   │
│   ├── api/                         # API communication & data management
│   │   ├── client/                  # Custom API client logic
│   │   │   ├── client.gen.ts        # Generated client (DO NOT EDIT)
│   │   │   ├── index.ts             # Client exports
│   │   │   ├── types.gen.ts         # Generated types (DO NOT EDIT)
│   │   │   └── utils.gen.ts         # Generated utilities (DO NOT EDIT)
│   │   ├── core/                    # Core API utilities
│   │   │   ├── auth.gen.ts          # Authentication handling
│   │   │   ├── bodySerializer.gen.ts
│   │   │   ├── params.gen.ts
│   │   │   ├── pathSerializer.gen.ts
│   │   │   ├── queryKeySerializer.gen.ts
│   │   │   ├── serverSentEvents.gen.ts
│   │   │   ├── types.gen.ts
│   │   │   └── utils.gen.ts
│   │   ├── @tanstack/
│   │   │   └── react-query.gen.ts   # TanStack Query integration
│   │   ├── index.ts                 # API exports
│   │   ├── sdk.gen.ts               # Generated SDK (DO NOT EDIT)
│   │   ├── transformers.gen.ts      # Data transformers
│   │   ├── types.gen.ts             # Generated types (DO NOT EDIT)
│   │   └── zod.gen.ts               # Zod schemas (DO NOT EDIT)
│   │
│   ├── configs/                     # Configuration files
│   │   ├── api-config.ts            # API base URLs and endpoints
│   │   ├── api-error-handler.ts     # Centralized error handling
│   │   ├── axios-config.ts          # Axios instance configuration
│   │   └── env.ts                   # Environment variable parsing
│   │
│   ├── constants/                   # Application constants
│   │   └── roles.ts                 # RBAC role definitions
│   │
│   ├── features/                    # Feature modules (domain-driven)
│   │   └── auth/                    # Authentication feature
│   │       ├── api/                 # Auth-specific API calls
│   │       ├── components/          # Auth-related components
│   │       ├── hooks/               # Custom auth hooks
│   │       ├── types/               # Auth types
│   │       ├── utils/               # Auth utilities
│   │       └── store/               # Auth state management (if applicable)
│   │
│   ├── routes/                      # Page components and route definitions
│   │   ├── __root.tsx               # Root layout wrapper
│   │   ├── _authenticated.tsx       # Protected routes layout
│   │   ├── index.tsx                # Home/landing page
│   │   ├── login.tsx                # Login page
│   │   ├── register.tsx             # Registration page
│   │   ├── forgot-password.tsx       # Password recovery
│   │   ├── reset-password.tsx        # Reset password page
│   │   ├── verify-email.tsx          # Email verification
│   │   ├── admin/                   # Admin dashboard routes
│   │   ├── lecturer/                # Lecturer dashboard routes
│   │   ├── provider/                # Provider dashboard routes
│   │   └── student/                 # Student dashboard routes
│   │
│   ├── types/                       # Global TypeScript types
│   │   └── auth.types.ts            # Authentication types
│   │
│   ├── utils/                       # Utility functions
│   │   └── notifications.tsx         # Toast/notification utilities
│   │
│   ├── constants/                   # Global constants
│   └── styles.css                   # Global styles
│
├── public/                          # Static assets
├── test/                            # Testing configuration
│   └── setup.ts                     # Vitest setup
├── openapi/                         # OpenAPI specifications
│   ├── content-service.json
│   ├── evaluation-service.json
│   ├── identity-service.json
│   ├── submission-service.json
│   ├── support-service.json
│   └── fetch.sh                     # Script to fetch latest specs
│
├── docs/                            # Documentation
├── coverage/                        # Test coverage reports
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript base config
├── tsconfig.app.json                # TypeScript app config
├── tsconfig.node.json               # TypeScript node config
├── eslint.config.js                 # ESLint configuration
├── openapi-ts.config.ts             # OpenAPI TypeScript generation config
├── postcss.config.cjs               # PostCSS configuration
├── package.json                     # Dependencies and scripts
└── README.md                        # Project documentation
```

## 📝 Coding & Project Guidelines

### TypeScript & Type Safety
- ✅ **ALWAYS use TypeScript** for all `.ts` and `.tsx` files - no `any` types without explicit justification
- ✅ **Enable strict mode** - all TypeScript configurations use `strict: true`
- ✅ **Import generated types** from `src/api/types.gen.ts` for API responses
- ✅ **Use Zod schemas** from `src/api/zod.gen.ts` for runtime validation
- ✅ **Define interfaces** for component props in the same file or in dedicated `types` files
- ✅ **Use `keyof typeof`** pattern for type-safe constant references

**Example:**
```typescript
// ✅ Good
import { UserSchema } from '@/api/zod.gen';
import type { User } from '@/api/types.gen';

interface UserCardProps {
  user: User;
  onSelect: (userId: string) => void;
}

export function UserCard({ user, onSelect }: UserCardProps) {
  return <div onClick={() => onSelect(user.id)}>{user.name}</div>;
}

// ❌ Bad
export function UserCard(props: any) {
  return <div>{props.user}</div>;
}
```

### React Component Patterns
- ✅ **Functional Components Only** - use React functional components with hooks
- ✅ **Custom Hooks** - extract logic into custom hooks (place in `hooks/` directory within features)
- ✅ **Memoization** - use `React.memo()` for components that receive object props
- ✅ **Default Exports** - use named exports for flexibility and better refactoring

**Example:**
```typescript
// ✅ Good
export function MyComponent({ data }: Props) {
  const processedData = useProcessData(data);
  return <div>{processedData}</div>;
}

const MemoizedComponent = React.memo(MyComponent);
export { MemoizedComponent };

// ❌ Bad - using class components or export default
class MyComponent extends React.Component { }
export default MyComponent;
```

### State Management
- ✅ **TanStack Query** - for server state, caching, and synchronization (use `useQuery`, `useMutation`)
- ✅ **React Hooks** - for local UI state (`useState`, `useReducer`)
- ✅ **Context API** - sparingly, for global app state (auth, theme, user preferences)
- ✅ **Avoid Redux** - TanStack Query and Context are sufficient for this project

**Example:**
```typescript
// ✅ Good - using TanStack Query for server state
import { useQuery } from '@tanstack/react-query';

export function UsersList() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await API.getUsers();
      return response.data;
    },
  });

  return isLoading ? <Spinner /> : <div>{/* render users */}</div>;
}
```

### API Integration
- ✅ **Use Generated Clients** - import from `src/api/client.gen.ts`
- ✅ **Type-Safe Requests** - leverage generated types for request/response handling
- ✅ **Error Handling** - use centralized error handler from `src/configs/api-error-handler.ts`
- ✅ **Loading States** - manage with TanStack Query's `isLoading`, `isPending` flags
- ✅ **Validation** - validate API responses using Zod schemas from `src/api/zod.gen.ts`

**Example:**
```typescript
import { useMutation } from '@tanstack/react-query';
import { API } from '@/api';
import { UserSchema } from '@/api/zod.gen';

export function CreateUserForm() {
  const mutation = useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const validated = UserSchema.parse(data);
      return API.users.create(validated);
    },
    onSuccess: () => {
      // Handle success
    },
  });

  return <form onSubmit={(e) => {
    e.preventDefault();
    mutation.mutate(formData);
  }} />;
}
```

### Routing & Navigation
- ✅ **Use TanStack Router** - leverage auto-generated type-safe routing
- ✅ **Route Protection** - implement role-based route guards in `_authenticated.tsx`
- ✅ **Nested Routes** - organize by feature (admin, lecturer, student, provider)
- ✅ **Search Params** - use router's built-in search param validation

**Example:**
```typescript
// src/routes/admin.tsx
import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/features/auth/utils';

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    await requireAuth(context, ['admin']);
  },
  component: AdminDashboard,
});
```

### Code Style & Formatting
- ✅ **Semicolons** - REQUIRED for all statements (enforced by ESLint)
- ✅ **Quotes** - use double quotes for strings
- ✅ **Indentation** - 2 spaces (configured in ESLint)
- ✅ **Line Length** - keep lines under 100 characters when reasonable
- ✅ **Naming Conventions:**
  - Components: `PascalCase` (e.g., `UserCard`)
  - Functions/Variables: `camelCase` (e.g., `getUserData`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
  - Files: matching export name or `index.ts` for directories

**Example:**
```typescript
// ✅ Good
const MAX_RETRY_ATTEMPTS = 3;

function getUserProfile(userId: string): Promise<User> {
  // implementation
}

function UserProfile({ userId }: { userId: string }) {
  return <div>{/* content */}</div>;
}

// ❌ Bad
const maxRetry = 3;
function get_user_profile(userId: string) { }
function userProfile() { }
```

### Testing Requirements
- ✅ **Unit Tests** - required for utility functions, hooks, and complex logic
- ✅ **Component Tests** - test user interactions and render output
- ✅ **Integration Tests** - test feature workflows
- ✅ **Test Files** - use `.test.ts` or `.test.tsx` extension
- ✅ **Test Coverage** - aim for >80% coverage on critical paths
- ✅ **Mocking** - mock API calls and external dependencies

**Example:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('should render user name', () => {
    const user = { id: '1', name: 'John' };
    render(<UserCard user={user} onSelect={vi.fn()} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

### Git & Commit Practices
- ✅ **Conventional Commits** - use format: `type(scope): description`
  - Types: `feat`, `fix`, `refactor`, `docs`, `test`, `style`, `perf`, `chore`
  - Scope: feature name or module (e.g., `auth`, `submission`, `api`)
- ✅ **Atomic Commits** - each commit should be a logical unit
- ✅ **Branch Naming** - use `feature/APSAS-{issue-number}-description` format
- ✅ **PR Descriptions** - include what changed, why, and testing notes

**Example:**
```
feat(auth): add role-based route protection
fix(submission): handle empty file uploads
refactor(api): consolidate error handling
```

## 🔐 Security & Best Practices

### Authentication & Authorization
- ✅ **Protect Routes** - all authenticated routes must check user role via `requireAuth()`
- ✅ **Token Management** - tokens stored securely, never in localStorage for sensitive data
- ✅ **CORS Handling** - API requests properly configured for CORS compliance
- ✅ **XSS Prevention** - React's JSX automatically escapes content
- ✅ **CSRF Protection** - implemented at API layer

### Error Handling
- ✅ **Global Error Handler** - use `src/configs/api-error-handler.ts`
- ✅ **User-Friendly Messages** - never expose internal errors to users
- ✅ **Logging** - log errors for debugging without sensitive data
- ✅ **Graceful Degradation** - provide fallback UI for errors

**Example:**
```typescript
const { mutate: submitForm } = useMutation({
  mutationFn: API.submissions.create,
  onError: (error) => {
    const message = handleApiError(error);
    showNotification(message, 'error');
  },
});
```

### Performance Optimization
- ✅ **Lazy Loading** - use `React.lazy()` and `Suspense` for route-level code splitting
- ✅ **Image Optimization** - optimize images before adding to project
- ✅ **Memoization** - use `useMemo`, `useCallback` for expensive operations
- ✅ **Bundle Analysis** - monitor bundle size with Vite plugins

## 📚 Resources & Tools

### Development Scripts
- **`npm run dev`** - Start development server with HMR
- **`npm run build`** - Production build with optimization
- **`npm run preview`** - Preview production build locally
- **`npm run test`** - Run test suite with Vitest
- **`npm run test:ui`** - Interactive test UI
- **`npm run lint`** - Check code quality with ESLint
- **`npm run type-check`** - Validate TypeScript types
- **`npm run api:generate`** - Regenerate API client from OpenAPI specs

### API Documentation
- **OpenAPI Specs Location:** `openapi/` directory
- **Fetch Latest:** Run `openapi/fetch.sh` to update specifications
- **Services:** Identity, Submission, Evaluation, Content, Support
- **Generated Files:** Auto-generated in `src/api/` (DO NOT manually edit `.gen.ts` files)

### Configuration Files
- **Vite Config:** `vite.config.ts` - build settings, aliases, HMR configuration
- **TypeScript Config:** `tsconfig.app.json` - compiler options and path aliases
- **ESLint Config:** `eslint.config.js` - linting rules and ignored patterns
- **OpenAPI Generator:** `openapi-ts.config.ts` - client generation settings

### Key Dependencies & Versions
- `react` - Latest 18.x or 19.x
- `typescript` - 5.x
- `vite` - 5.x
- `@tanstack/react-query` - 5.x
- `@tanstack/react-router` - 1.x
- `axios` - Latest
- `vitest` - Latest
- `@testing-library/react` - 14.x+

## ⚠️ Important Warnings & Anti-Patterns

### DON'T...
- ❌ Edit generated files (`.gen.ts`) - they are auto-generated from OpenAPI specs
- ❌ Use `any` type without explicit reason - always use proper TypeScript types
- ❌ Call hooks conditionally or inside loops - violates Rules of Hooks
- ❌ Implement custom API client - use generated client from `src/api/client.gen.ts`
- ❌ Store sensitive data in localStorage - use secure HttpOnly cookies
- ❌ Bypass authentication checks - always validate user permissions
- ❌ Ignore TypeScript errors - fix them properly, don't suppress
- ❌ Create deeply nested components - keep component tree shallow and maintainable
- ❌ Make API calls in render - use TanStack Query hooks instead
- ❌ Hardcode API URLs - use `src/configs/api-config.ts`

### DO...
- ✅ Regenerate API types when OpenAPI specs change - run `npm run api:generate`
- ✅ Use feature-based folder structure - organize by business logic
- ✅ Keep components focused - one responsibility per component
- ✅ Reuse custom hooks - promote code reusability
- ✅ Test critical paths - especially authentication and data flows
- ✅ Document complex logic - use JSDoc comments
- ✅ Review generated code changes - verify SDK updates don't break functionality
- ✅ Keep types close to where they're used - easier maintenance
- ✅ Use composition over inheritance - leverage React's component model

## 🚀 Workflow & Development Tips

### When Starting a New Feature
1. Check OpenAPI specs in `openapi/` - understand available API endpoints
2. Generate/update API types - run `npm run api:generate`
3. Create feature folder in `src/features/` with structure:
   ```
   features/my-feature/
   ├── api/          # Feature-specific API calls
   ├── components/   # Feature components
   ├── hooks/        # Custom hooks
   ├── types/        # Feature types
   ├── utils/        # Helper functions
   └── index.ts      # Public exports
   ```
4. Add route file in `src/routes/` (follow TanStack Router pattern)
5. Write tests alongside implementation
6. Follow established patterns for similar features

### When Updating API Integration
1. Fetch latest OpenAPI specs: `openapi/fetch.sh`
2. Regenerate client: `npm run api:generate`
3. Review `.gen.ts` file changes - understand what's new/changed
4. Update components to use new types/methods
5. Test API integration with updated client
6. Update tests to match new API contract

### When Encountering TypeScript Errors
1. Read the error message carefully - it's usually specific
2. Check if types are imported correctly from `src/api/types.gen.ts`
3. Validate Zod schemas with runtime data
4. Use TypeScript's `satisfies` keyword for complex type inference
5. Don't use `as any` - use `as unknown as Type` if necessary (rare)

### Debugging Tips
- Use React DevTools browser extension for component inspection
- Use TanStack Query DevTools - built into react-query
- Enable Redux DevTools for better state inspection
- Check network tab in browser DevTools for API calls
- Use console logging judiciously - let testing framework handle validation
- Leverage TypeScript hover tooltips in VS Code for type information

## 🔄 Continuous Improvement

### Known Limitations & Future Improvements
- Consider implementing error boundary components for better error handling
- Evaluate caching strategies as app scales
- Monitor bundle size and optimize large dependencies
- Consider implementing service workers for offline support
- Evaluate accessibility (a11y) compliance - WCAG 2.1 AA target

### When Updating This File
- Keep sync with actual project structure and dependencies
- Update when adding new services/APIs
- Refresh version numbers when upgrading major dependencies
- Document any new patterns adopted by team
- Review quarterly or after major refactors

---

**Last Updated:** October 19, 2025  
**Version:** 1.0  
**Maintainer:** Development Team

For questions or clarifications, refer to:
- [React Official Docs](https://react.dev)
- [TanStack Query Docs](https://tanstack.com/query)
- [TanStack Router Docs](https://tanstack.com/router)
- [React-Hook-Frorm Docs](https://react-hook-form.com/)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [Axios Documentation](https://axios-http.com/docs/api_intro)
- [JWT-Decode](https://github.com/auth0/jwt-decode)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev)
- [MSW Documentation](https://mswjs.io/docs/)
- [Mantine UI Library](https://mantine.dev/)
