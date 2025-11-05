# APSAS Frontend - GitHub Copilot Custom Instructions

**Phiên bản**: 2.0 | **Cập nhật**: October 23, 2025 | **Ngôn ngữ**: Tiếng Việt (Comments) + English (Keywords)

---

## 📋 Tổng Quan Dự Án

**APSAS** (Academic Performance Student Assessment System) là ứng dụng frontend React toàn diện cho đánh giá hiệu suất học tập và theo dõi hiệu năng của sinh viên. Hệ thống cho phép giáo viên và quản trị viên quản lý bài nộp của sinh viên, đánh giá kết quả và phân tích hiệu suất với sự tập trung vào kiểm soát truy cập dựa trên vai trò và quản lý dữ liệu thời gian thực.

**Đối tượng**: Giáo viên, Quản trị viên, Sinh viên, Nhà cung cấp dịch vụ

**Tính năng chính**:
- Xác thực và phân quyền dựa trên vai trò (Admin, Lecturer, Student, Provider)
- Quản lý bài nộp và đánh giá của sinh viên
- Phân tích hiệu suất và báo cáo
- Quản lý nội dung và phân phối
- Thông báo và cập nhật thời gian thực
- Hệ thống hỗ trợ và quản lý ticket

---

## 🏗️ Tech Stack

### Core Framework & Build Tools
- **React 19+** - Thư viện UI cho xây dựng component tương tác
- **TypeScript** - Kiểm tra kiểu tĩnh và hỗ trợ IDE tốt hơn
- **Vite** - Build tool nhanh và dev server tối ưu
- **TanStack Router** - Routing type-safe với tự động tạo route tree
- **TanStack Query** - Quản lý server state, caching, và đồng bộ hóa
- **React Hook Form** - Quản lý form state và validation
- **Zustand** - State management lightweight cho local/global state

### Styling & UI
- **Mantine UI** - Component library cho xây dựng UI responsive
- **PostCSS** - CSS transformation và optimization
- **CSS Modules** - Component-scoped styling

### API & Data Management
- **Axios** - HTTP client cho communication API
- **OpenAPI TypeScript Generator** - Auto-generated type-safe API clients
  - Identity Service
  - Submission Service
  - Evaluation Service
  - Content Service
  - Support Service
- **Zod** - TypeScript-first schema validation

### Authentication & Authorization
- **Custom Auth Module** - Xác thực tùy chỉnh
- **Role-based Access Control (RBAC)** - Bảo vệ routes theo vai trò
$1### 🎯 Generated API Files - DO NOT EDIT (CRITICAL)

The following files are **auto-generated from OpenAPI specs**. Never manually edit them:

```
❌ DO NOT manually edit:
- src/api/client.gen.ts
- src/api/types.gen.ts
- src/api/zod.gen.ts
- src/api/sdk.gen.ts
- src/api/@tanstack/react-query.gen.ts
- src/api/client/*.gen.ts
- src/api/core/*.gen.ts
```

**When to Regenerate:**
1. Backend OpenAPI specs change
2. New endpoints added
3. Type definitions updated
4. Run: `npm run api:generate`

### ✅ Using Generated Types (MANDATORY)

**Always prefer generated types over custom types:**

```typescript
// ✅ GOOD: Use generated types from @/api/types.gen
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'
const assignment: ContentServiceAssignmentResponse = { ... }

// ❌ BAD: Don't create custom duplicate types
interface MyAssignment { ... }  // ← Why duplicate what's already generated?
```

### ✅ Using Generated SDK Client (MANDATORY)

**Always use SDK functions instead of manual Fetch/Axios:**

```typescript
// ✅ GOOD: Use generated SDK client
import { contentServiceGetAllAssignments } from '@/api/sdk.gen'
const assignments = await contentServiceGetAllAssignments({
  query: { page: '0', size: '10' }
})

// ❌ BAD: Manual Fetch without validation
const assignments = await fetch('/api/v1/assignments')
  .then(r => r.json())  // ← No validation, no transformation
```

**Benefits of Generated SDK:**
- ✅ Type-safe request/response
- ✅ Zod validation built-in
- ✅ Automatic Date/BigInt transformers
- ✅ Centralized error handling
- ✅ Built-in auth interceptors

### ✅ Zod Validation (RECOMMENDED)

**Use generated Zod schemas for runtime validation:**

```typescript
// ✅ GOOD: Runtime validation with Zod
import { zContentServiceAssignmentResponse } from '@/api/zod.gen'
const validated = await zContentServiceAssignmentResponse.parseAsync(data)

// ❌ BAD: No validation
const data = await response.json()  // ← Could be any shape
```

### 📋 API Integration Checklist

Before creating components that use APIs:

- [ ] Check generated types in `src/api/types.gen.ts`
- [ ] Import types from `@/api/types.gen`
- [ ] Use SDK functions from `@/api/sdk.gen`
- [ ] Use Zod schemas from `@/api/zod.gen` (optional but recommended)
- [ ] Test with MSW handlers
- [ ] Verify types match MSW mock data
- [ ] NO custom duplicate types
- [ ] All features covered by tests (≥90% coverage)

### 🔗 Pattern: Generated APIs Flow

```
Types ← src/api/types.gen.ts
  ↓
SDK Functions ← src/api/sdk.gen.ts
  ↓
Zod Schemas ← src/api/zod.gen.ts (for validation)
  ↓
Custom Hooks ← src/features/myfeature/api/hooks.ts
  ↓
React Components ← src/features/myfeature/components/*
  ↓
Tests ← src/features/myfeature/components/*.test.tsx (with MSW)
```

$2
- **Vitest** - Unit testing framework nhanh
- **@testing-library/react** - React component testing utilities
- **MSW** - API mocking cho test và development
- **ESLint** - Kiểm tra chất lượng code
- **TypeScript strict mode** - Bắt buộc type safety

---

## 📂 Cấu Trúc Folder

```
frontend/
├── .github/
│   └── copilot-instructions.md      # Instructions này
├── src/
│   ├── app.tsx                      # Root App component với providers
│   ├── main.tsx                     # Entry point
│   ├── router.ts                    # TanStack Router config
│   ├── routeTree.gen.ts             # Auto-generated (DO NOT EDIT)
│   ├── query-client.ts              # TanStack Query setup
│   ├── test-utils.tsx               # Testing utilities
│   │
│   ├── api/                         # API & data management
│   │   ├── client/                  # API client logic
│   │   │   ├── client.gen.ts        # Generated (DO NOT EDIT)
│   │   │   ├── index.ts
│   │   │   ├── types.gen.ts         # Generated (DO NOT EDIT)
│   │   │   └── utils.gen.ts         # Generated (DO NOT EDIT)
│   │   ├── core/                    # Core API utilities
│   │   ├── @tanstack/
│   │   │   └── react-query.gen.ts   # TanStack Query integration
│   │   ├── index.ts
│   │   ├── sdk.gen.ts               # Generated SDK (DO NOT EDIT)
│   │   ├── transformers.gen.ts      # Data transformers
│   │   ├── types.gen.ts             # Generated types (DO NOT EDIT)
│   │   └── zod.gen.ts               # Zod schemas (DO NOT EDIT)
│   │
│   ├── configs/                     # Configuration files
│   │   ├── api-config.ts            # API endpoints
│   │   ├── api-error-handler.ts     # Centralized error handling
│   │   ├── axios-config.ts          # Axios instance config
│   │   └── env.ts                   # Environment variables
│   │
│   ├── constants/                   # Application constants
│   │   └── roles.ts                 # RBAC role definitions
│   │
│   ├── features/                    # Feature modules (domain-driven)
│   │   ├── auth/                    # Authentication feature
│   │   │   ├── api/                 # Auth API calls
│   │   │   ├── components/          # Auth components
│   │   │   ├── hooks/               # Custom auth hooks
│   │   │   ├── types/               # Auth types
│   │   │   ├── utils/               # Auth utilities
│   │   │   ├── store/               # Auth state management
│   │   │   └── index.ts             # Public exports
│   │   ├── submission/              # Submission feature
│   │   ├── evaluation/              # Evaluation feature
│   │   └── [other-features]/
│   │
│   ├── routes/                      # Page components & route definitions
│   │   ├── __root.tsx               # Root layout wrapper
│   │   ├── _authenticated.tsx       # Protected routes layout
│   │   ├── index.tsx                # Home page
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── admin/
│   │   ├── lecturer/
│   │   ├── provider/
│   │   └── student/
│   │
│   ├── types/                       # Global TypeScript types
│   │   └── *.types.ts
│   │
│   ├── utils/                       # Utility functions
│   │   ├── notifications.tsx        # Toast utilities
│   │   ├── helpers.ts               # Helper functions
│   │   └── validators.ts            # Validation helpers
│   │
│   ├── components/                  # Shared components (không feature-specific)
│   │   ├── Layout/
│   │   ├── Form/
│   │   └── ...
│   │
│   ├── styles.css                   # Global styles
│   └── vite-env.d.ts                # Vite environment types
│
├── test/                            # Testing configuration
│   └── setup.ts                     # Vitest setup & mocks
├── openapi/                         # OpenAPI specifications
│   ├── content-service.json
│   ├── evaluation-service.json
│   ├── identity-service.json
│   ├── submission-service.json
│   ├── support-service.json
│   └── fetch.sh
├── docs/                            # Documentation
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
└── package.json
```

---

## �🇳 Vietnamese UI/UX Requirement (MANDATORY)

### Overview

**ALL user-facing UI elements MUST be in Vietnamese.** This webapp is built for Vietnamese users, and language is a **core requirement**, not optional.

### Enforcement Rules

#### ✅ MANDATORY Vietnamese Text (All Must Be Vietnamese)

- ✅ **Button labels**: "Đăng nhập", "Nộp bài", "Hủy", etc.
- ✅ **Form labels**: "Email", "Mật khẩu", "Họ và tên", etc.
- ✅ **Placeholder text**: "Nhập email của bạn...", "Chọn ngôn ngữ...", etc.
- ✅ **Error messages**: "Email không hợp lệ", "Mật khẩu bắt buộc", etc.
- ✅ **Notification toasts**: "Bài nộp thành công!", "Lỗi: Kiểm tra lại kết nối"
- ✅ **Page titles**: "Danh sách bài tập", "Kết quả kiểm tra", "Bảng điều khiển"
- ✅ **Navigation menu items**: "Bài tập", "Bài nộp", "Hiệu suất", "Cài đặt"
- ✅ **Table headers**: "Tiêu đề", "Tác giả", "Ngày tạo", "Trạng thái"
- ✅ **Field validation errors**: "Trường này bắt buộc", "Email không hợp lệ"
- ✅ **Tooltip text**: All helper text, hints, and tooltips
- ✅ **Status badges**: "Đã nộp", "Chưa làm", "Quá hạn", "Đạt", "Không đạt"

#### ❌ EXCEPTIONS (Only these can be non-Vietnamese)

- ❌ Code syntax keywords: `if`, `else`, `function`, `return`, `const`, etc.
- ❌ Programming language names: `Python`, `Java`, `C++`, `JavaScript`
- ❌ Technical error codes: `501 Internal Server Error`, `TimeoutException`
- ❌ URLs and API endpoints: `https://api.example.com/submissions`
- ❌ Developer/system logs: `console.log`, `error.stack`
- ❌ English comments in code: `// Calculate Fibonacci number`

### ✅ Vietnamese UI Implementation Examples

#### Button Labels
```typescript
// ✅ GOOD: Vietnamese buttons
<Button>Đăng nhập</Button>          // Login
<Button>Đăng ký</Button>            // Register
<Button>Nộp bài</Button>            // Submit code
<Button>Lưu bản nháp</Button>       // Save draft
<Button>Xóa</Button>                // Delete
<Button>Hủy</Button>                // Cancel
<Button>Tìm kiếm</Button>           // Search
<Button>Lọc</Button>                // Filter
<Button>Xuất</Button>               // Export
<Button>Tải xuống</Button>          // Download

// ❌ BAD: English buttons
<Button>Login</Button>
<Button>Submit Code</Button>
<Button>Save Draft</Button>
```

#### Form Labels & Placeholders
```typescript
// ✅ GOOD: Vietnamese form with Vietnamese labels and placeholders
<TextInput 
  label="Email hoặc Tên đăng nhập"
  placeholder="Nhập email của bạn..." 
/>

<PasswordInput 
  label="Mật khẩu"
  placeholder="Nhập mật khẩu của bạn..."
/>

<Select 
  label="Ngôn ngữ lập trình"
  placeholder="Chọn ngôn ngữ..."
  data={['Python', 'Java', 'C++']}
/>

<Textarea 
  label="Mô tả"
  placeholder="Viết mô tả của bạn ở đây..."
/>

<Checkbox label="Tôi đồng ý với điều khoản dịch vụ" />

// ❌ BAD: English form elements
<TextInput label="Email" placeholder="Enter your email..." />
<PasswordInput label="Password" placeholder="Enter password..." />
```

#### Error Messages (Critical!)
```typescript
// ✅ GOOD: Vietnamese error messages
const validateEmail = (email: string): string | undefined => {
  if (!email) return "Email là bắt buộc";
  if (!isValidEmail(email)) return "Email không hợp lệ";
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) return "Mật khẩu là bắt buộc";
  if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
  return undefined;
};

// ❌ BAD: English error messages
const validateEmail = (email: string): string | undefined => {
  if (!email) return "Email is required";
  if (!isValidEmail(email)) return "Invalid email format";
  return undefined;
};
```

#### Notification Toasts
```typescript
// ✅ GOOD: Vietnamese notifications
showNotification({
  type: 'success',
  message: 'Bài nộp thành công!',
  description: 'Mã của bạn đang được kiểm tra...',
  autoClose: 3000
});

showNotification({
  type: 'error',
  message: 'Lỗi: Kiểm tra kết nối mạng',
  description: 'Vui lòng thử lại sau',
  autoClose: 5000
});

// ❌ BAD: English notifications
showNotification({
  type: 'success',
  message: 'Submission successful!',
  description: 'Your code is being evaluated...',
});
```

#### Table Headers
```typescript
// ✅ GOOD: Vietnamese table headers
<Table>
  <thead>
    <tr>
      <th>Tiêu đề</th>           // Title
      <th>Tác giả</th>           // Author
      <th>Ngày tạo</th>          // Created date
      <th>Ngày cập nhật</th>     // Updated date
      <th>Trạng thái</th>        // Status
      <th>Hành động</th>         // Actions
    </tr>
  </thead>
</Table>

// ❌ BAD: English table headers
<Table>
  <thead>
    <tr>
      <th>Title</th>
      <th>Author</th>
      <th>Created</th>
      <th>Updated</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
</Table>
```

#### Status Labels & Badges
```typescript
// ✅ GOOD: Vietnamese status labels
const statusLabels = {
  PENDING: 'Chưa làm',           // Not started
  IN_PROGRESS: 'Đang làm',       // In progress
  SUBMITTED: 'Đã nộp',           // Submitted
  EVALUATED: 'Đã chấm',          // Evaluated
  PASSED: 'Đạt',                 // Passed
  FAILED: 'Không đạt',           // Failed
  OVERDUE: 'Quá hạn',            // Overdue
  DRAFT: 'Bản nháp',             // Draft
  ARCHIVED: 'Đã lưu trữ',        // Archived
};

<Badge color="green">{statusLabels.PASSED}</Badge>    // Green "Đạt"
<Badge color="red">{statusLabels.FAILED}</Badge>      // Red "Không đạt"
<Badge color="gray">{statusLabels.OVERDUE}</Badge>    // Gray "Quá hạn"

// ❌ BAD: English status labels
<Badge color="green">Passed</Badge>
<Badge color="red">Failed</Badge>
```

#### Page Titles
```typescript
// ✅ GOOD: Vietnamese page titles
const pageTitle = {
  dashboard: 'Bảng điều khiển',           // Dashboard
  assignments: 'Danh sách bài tập',       // Assignments
  submissions: 'Bài nộp',                 // Submissions
  performance: 'Hiệu suất',               // Performance
  settings: 'Cài đặt',                    // Settings
  support: 'Hỗ trợ',                      // Support
  results: 'Kết quả kiểm tra',            // Evaluation results
  feedback: 'Phản hồi từ giáo viên',      // Instructor feedback
};

export function DashboardPage() {
  return (
    <div>
      <h1>{pageTitle.dashboard}</h1>  // "Bảng điều khiển"
    </div>
  );
}

// ❌ BAD: English page titles
const pageTitle = {
  dashboard: 'Dashboard',
  assignments: 'Assignments',
  submissions: 'My Submissions',
};
```

#### Navigation Menu Items
```typescript
// ✅ GOOD: Vietnamese navigation
const navigationItems = [
  { label: 'Bảng điều khiển', href: '/student/dashboard' },
  { label: 'Bài tập', href: '/student/assignments' },
  { label: 'Bài nộp', href: '/student/submissions' },
  { label: 'Hiệu suất', href: '/student/performance' },
  { label: 'Hỗ trợ', href: '/student/support' },
  { label: 'Cài đặt', href: '/student/settings' },
];

// ❌ BAD: English navigation
const navigationItems = [
  { label: 'Dashboard', href: '/student' },
  { label: 'Assignments', href: '/student/assignments' },
  { label: 'Submissions', href: '/student/submissions' },
];
```

#### Validation Error Messages with Zod
```typescript
// ✅ GOOD: Vietnamese Zod error messages
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

const registerSchema = z.object({
  firstName: z.string().min(1, 'Họ là bắt buộc'),
  lastName: z.string().min(1, 'Tên là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, 
    { message: 'Bạn phải đồng ý với điều khoản' }
  ),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu không trùng khớp',
  path: ['confirmPassword'],
});

// ❌ BAD: English error messages
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});
```

### 🧪 Testing Vietnamese UI

#### Test User-Facing Text
```typescript
// ✅ GOOD: Test Vietnamese text
import { render, screen } from '@testing-library/react';

describe('LoginForm', () => {
  it('should display Vietnamese labels', () => {
    render(<LoginForm />);
    
    expect(screen.getByText('Email hoặc Tên đăng nhập')).toBeInTheDocument();
    expect(screen.getByText('Mật khẩu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
  });

  it('should show Vietnamese error message on invalid email', async () => {
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: 'Đăng nhập' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email không hợp lệ')).toBeInTheDocument();
    });
  });
});

// ❌ BAD: Test for English text (won't pass!)
expect(screen.getByText('Email or Username')).toBeInTheDocument();
expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
```

### 📋 Vietnamese UI Implementation Checklist

Before submitting a PR, verify:

- [ ] All button labels are Vietnamese
- [ ] All form labels are Vietnamese
- [ ] All placeholder text is Vietnamese
- [ ] All error messages are Vietnamese
- [ ] All notification messages are Vietnamese
- [ ] All page titles are Vietnamese
- [ ] All navigation menu items are Vietnamese
- [ ] All table headers are Vietnamese
- [ ] All status badges are Vietnamese
- [ ] All tooltip/help text is Vietnamese
- [ ] All validation error messages are Vietnamese
- [ ] Code comments can be English, but NOT UI labels
- [ ] Tests check for Vietnamese text

### 🔍 Code Review Checklist for Vietnamese UI

**Reviewer responsibility**: Check every PR for Vietnamese UI compliance.

- [ ] Search PR for English text in UI components
- [ ] Verify button labels are Vietnamese
- [ ] Verify form labels are Vietnamese
- [ ] Verify error messages are Vietnamese
- [ ] Check for hardcoded English strings in JSX
- [ ] Verify status labels are Vietnamese
- [ ] Check navigation labels are Vietnamese
- [ ] Confirm placeholder text is Vietnamese

### 🚀 Why Vietnamese UI Matters

1. **User Experience**: Users expect their language
2. **Accessibility**: Vietnamese speakers need Vietnamese UI
3. **Professional**: A truly localized app shows quality
4. **Requirements**: This is a **CORE REQUIREMENT**, not optional
5. **Consistency**: All users see same Vietnamese experience

---

## �🎯 React Patterns & Best Practices

### 1️⃣ Component Patterns

#### Functional Components (Bắt buộc)
```typescript
// ✅ GOOD: Functional component với named export
export function UserCard({ user, onSelect }: UserCardProps) {
  // Component logic ở đây
  return (
    <div onClick={() => onSelect(user.id)}>
      {user.name}
    </div>
  );
}

// ❌ BAD: Class component hoặc default export
class UserCard extends React.Component { }
export default UserCard;
```

#### Props Interface (Type-safe)
```typescript
// ✅ GOOD: Props định nghĩa rõ ràng
interface UserCardProps {
  user: User;           // Kiểu từ API
  onSelect: (userId: string) => void;
  isLoading?: boolean;  // Optional prop
  className?: string;
}

export function UserCard({ user, onSelect, isLoading }: UserCardProps) {
  return <div>{/* render */}</div>;
}

// ❌ BAD: Không type hoặc dùng any
export function UserCard(props: any) { }
export function UserCard({ user, onSelect }: Record<string, any>) { }
```

#### Component Composition (Tách nhỏ)
```typescript
// ✅ GOOD: Component nhỏ, dễ test & reuse
export function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </ul>
  );
}

export function UserCard({ user }: { user: User }) {
  return <li>{user.name}</li>;
}

// ❌ BAD: Component quá lớn, logic lẫn lộn
export function UserManagement() {
  // ... 500 dòng code trong 1 component
}
```

#### Memoization (Khi cần thiết)
```typescript
// ✅ GOOD: Memoize nếu component nhận object props thường xuyên
const UserCard = React.memo(function UserCard({ user }: { user: User }) {
  return <div>{user.name}</div>;
});

// ✅ GOOD: Sử dụng useCallback cho event handlers
export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  
  const handleSelect = useCallback((userId: string) => {
    // Xử lý lựa chọn
  }, []);
  
  return users.map((user) => (
    <UserCard key={user.id} user={user} onSelect={handleSelect} />
  ));
}

// ❌ BAD: Memoize toàn bộ component không cần thiết
const Page = React.memo(function Page() {
  // Không nhận object props nào => không cần memo
  return <div>Content</div>;
});
```

### 2️⃣ Hooks Patterns

#### Rules of Hooks (Bắt buộc)
```typescript
// ✅ GOOD: Hook ở top level
export function MyComponent() {
  const [count, setCount] = useState(0);           // Top level
  const data = useQuery({ ... });                  // Top level
  
  return <div>{count}</div>;
}

// ❌ BAD: Hook trong condition
export function MyComponent({ flag }: { flag: boolean }) {
  if (flag) {
    const [count, setCount] = useState(0);         // ❌ KHÔNG
  }
}

// ❌ BAD: Hook trong loop
export function MyComponent({ items }: { items: Item[] }) {
  for (let item of items) {
    const [state, setState] = useState(0);         // ❌ KHÔNG
  }
}

// ❌ BAD: Hook sau return
export function MyComponent() {
  if (someCondition) return <div>Error</div>;
  const [count, setCount] = useState(0);           // ❌ KHÔNG
}
```

#### Custom Hooks (Tái sử dụng logic)
```typescript
// ✅ GOOD: Custom hook để tái sử dụng logic
export function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);
  
  return { user, error, loading };
}

// Sử dụng trong component
export function UserProfile({ userId }: { userId: string }) {
  const { user, error, loading } = useUserData(userId);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{user?.name}</div>;
}

// ❌ BAD: Logic lặp lại trong component
export function UserProfile1({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { fetchUser(userId).then(setUser); }, [userId]);
  return <div>{user?.name}</div>;
}

export function UserDetail({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { fetchUser(userId).then(setUser); }, [userId]);
  return <div>{user?.email}</div>;
}
```

#### useCallback & useMemo (Khi cần thiết)
```typescript
// ✅ GOOD: useCallback cho event handler được truyền xuống
export function UserList() {
  const handleSelect = useCallback((userId: string) => {
    console.log('Người dùng được chọn:', userId);
  }, []);
  
  return <UserCard onSelect={handleSelect} />;
}

// ✅ GOOD: useMemo cho tính toán nặng
export function Dashboard() {
  const { data: users } = useQuery({ ... });
  
  const activeUsers = useMemo(
    () => users?.filter((u) => u.isActive) ?? [],
    [users]
  );
  
  return <div>{activeUsers.length} users active</div>;
}

// ❌ BAD: useCallback không cần thiết
export function SimpleButton() {
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);  // ❌ Không cần memo cho event handler đơn giản
  
  return <button onClick={handleClick}>Click</button>;
}
```

### 3️⃣ State Management

#### Local State (useState)
```typescript
// ✅ GOOD: Dùng useState cho UI state đơn giản
export function SearchBox() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Close' : 'Open'}
      </button>
    </div>
  );
}

// ✅ GOOD: useReducer cho state phức tạp
type FormState = {
  name: string;
  email: string;
  errors: Record<string, string>;
};

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };
    default:
      return state;
  }
}

export function ComplexForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  
  return <form>{/* render */}</form>;
}
```

#### Server State (TanStack Query)
```typescript
// ✅ GOOD: Dùng TanStack Query cho server state
import { useQuery, useMutation } from '@tanstack/react-query';

export function UsersList() {
  // Fetch data từ server
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await API.users.list();
      return response.data;
    },
  });
  
  if (isLoading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>Lỗi: {error.message}</div>;
  
  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// ✅ GOOD: useMutation cho thay đổi dữ liệu
export function CreateUserForm() {
  const createUser = useMutation({
    mutationFn: (data: CreateUserInput) => API.users.create(data),
    onSuccess: (newUser) => {
      // Cập nhật cache
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showNotification('Người dùng được tạo thành công');
    },
    onError: (error) => {
      showNotification(`Lỗi: ${error.message}`, 'error');
    },
  });
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      createUser.mutate(formData);
    }}>
      {/* form fields */}
    </form>
  );
}

// ❌ BAD: Dùng useState cho server state
export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    fetchUsers().then(setUsers);  // ❌ Không có caching, re-fetch mỗi lần
  }, []);
  
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

#### Global State (Context API / Zustand)
```typescript
// ✅ GOOD: Zustand cho global state nhẹ
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (credentials) => {
    const response = await API.auth.login(credentials);
    set({ user: response.user, isAuthenticated: true });
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));

// Sử dụng
export function Profile() {
  const { user, logout } = useAuthStore();
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={logout}>Đăng xuất</button>
    </div>
  );
}

// ✅ GOOD: Context API cho theme (ít thay đổi)
const ThemeContext = createContext<Theme | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme phải trong ThemeProvider');
  return context;
}

// ❌ BAD: Không dùng Redux (quá phức tạp cho project này)
```

### 4️⃣ Data Fetching & Error Handling

#### API Integration
```typescript
// ✅ GOOD: Type-safe API calls
import { useQuery, useMutation } from '@tanstack/react-query';
import { API } from '@/api';
import type { User } from '@/api/types.gen';

export function UserDetail({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => API.users.getById(userId),
  });
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorBoundary error={error} />;
  
  return <div>{user?.name}</div>;
}

// ✅ GOOD: Error handling centralized
export function updateUser(id: string, data: UpdateUserInput) {
  return useMutation({
    mutationFn: () => API.users.update(id, data),
    onError: (error) => {
      const message = handleApiError(error);
      showNotification(message, 'error');
    },
  });
}

// ✅ GOOD: Retry logic
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  retry: 3,                          // Retry 3 lần
  retryDelay: (attemptIndex) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),  // Exponential backoff
});

// ❌ BAD: Không type-safe, no error handling
const [data, setData] = useState<any>(null);
useEffect(() => {
  fetch('/api/users')
    .then((res) => res.json())
    .then(setData);
    // ❌ Không handle error, không retry, không type
}, []);
```

#### Error Handling
```typescript
// ✅ GOOD: Centralized error handler
// configs/api-error-handler.ts
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as any;
    
    switch (status) {
      case 400:
        return data.message || 'Dữ liệu không hợp lệ';
      case 401:
        return 'Vui lòng đăng nhập lại';
      case 403:
        return 'Bạn không có quyền truy cập';
      case 404:
        return 'Không tìm thấy tài nguyên';
      case 500:
        return 'Lỗi server. Vui lòng thử lại sau';
      default:
        return 'Có lỗi xảy ra. Vui lòng thử lại';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Có lỗi không xác định xảy ra';
}

// ✅ GOOD: Error Boundary để catch lỗi render
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error) {
    console.error('Error caught:', error);
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Có lỗi xảy ra: {this.state.error?.message}</div>;
    }
    
    return this.props.children;
  }
}

// ❌ BAD: Không handle error hoặc expose nội bộ error
try {
  const data = await fetchData();
  showNotification(data.error);  // ❌ Expose nội bộ error message
} catch (err) {
  console.log(err);  // ❌ Chỉ log, không xử lý
}
```

### 5️⃣ Validation

#### Zod Schemas
```typescript
// ✅ GOOD: Dùng Zod để validate dữ liệu
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Tên không được trống'),
  email: z.string().email('Email không hợp lệ'),
  role: z.enum(['admin', 'lecturer', 'student']),
  createdAt: z.date().optional(),
});

type User = z.infer<typeof UserSchema>;

export function createUser(data: unknown) {
  const validated = UserSchema.parse(data);  // Throw nếu invalid
  return API.users.create(validated);
}

// ✅ GOOD: Safe parsing với fallback
export function getUserData(data: unknown) {
  const result = UserSchema.safeParse(data);
  
  if (!result.success) {
    console.error('Validation errors:', result.error.errors);
    return null;
  }
  
  return result.data;
}

// ❌ BAD: Không validate hoặc validate không đủ
export function createUser(data: any) {
  return API.users.create(data);  // ❌ Không validate input
}
```

### 6️⃣ Async & Data Fetching

#### Suspense & Async Components
```typescript
// ✅ GOOD: Sử dụng Suspense cho better UX
export function UsersList() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <UsersListContent />
    </Suspense>
  );
}

function UsersListContent() {
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => API.users.list(),
    suspense: true,  // Throw promise cho Suspense
  });
  
  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// ✅ GOOD: Loading state management
export function UserDetail({ userId }: { userId: string }) {
  const {
    data: user,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => API.users.getById(userId),
  });
  
  if (isLoading) return <SkeletonLoader />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {isFetching && <div className="spinner">Updating...</div>}
      <div>{user?.name}</div>
    </div>
  );
}

// ❌ BAD: No loading state
export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    API.users.list().then(setUsers);  // ❌ Không loading state
  }, []);
  
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

---

## 🧹 Clean Code Principles

### 1️⃣ Naming Conventions (Quy tắc đặt tên)

```typescript
// ✅ GOOD: Tên rõ ràng, mô tả chức năng
const MAX_RETRY_ATTEMPTS = 3;
const API_TIMEOUT_MS = 5000;

function getUserById(userId: string): Promise<User> { }
function fetchUserData(id: string) { }
function handleFormSubmit(event: React.FormEvent) { }
function isUserAuthenticated(): boolean { }
function validateEmail(email: string): boolean { }

// Component names (PascalCase)
function UserCard() { }
function SubmissionList() { }
function AdminDashboard() { }

// File names matching exports
// UserCard.tsx → export function UserCard() { }
// hooks/useUserData.ts → export function useUserData() { }

// ❌ BAD: Tên không rõ ràng
const x = 3;
const temp = getData();
const func = () => { };
const u = userData;
function process() { }
function do_something() { }
function getUserData_v2() { }
```

### 2️⃣ Function Size (Kích thước hàm)

```typescript
// ✅ GOOD: Hàm nhỏ, dễ test và hiểu
function validateUserInput(user: User): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!user.name || user.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Tên bắt buộc' });
  }
  
  if (!isValidEmail(user.email)) {
    errors.push({ field: 'email', message: 'Email không hợp lệ' });
  }
  
  return errors;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ GOOD: Tách concerns, mỗi hàm một việc
function processUserSubmission(userId: string, submission: Submission) {
  validateSubmission(submission);
  saveSubmission(userId, submission);
  notifyTeacher(userId, submission);
}

// ❌ BAD: Hàm quá lớn, làm nhiều việc
function handleUserRegistration(formData: any) {
  // 50 dòng validation
  // 50 dòng API call
  // 50 dòng state update
  // 50 dòng error handling
  // ... tổng 200+ dòng
}
```

### 3️⃣ DRY Principle (Don't Repeat Yourself)

```typescript
// ✅ GOOD: Tách logic chung vào helper function
function getInitialFormData(): FormData {
  return {
    name: '',
    email: '',
    role: 'student',
    status: 'active',
  };
}

export function CreateUserForm() {
  const form = useForm({ defaultValues: getInitialFormData() });
  return <form>{/* ... */}</form>;
}

export function EditUserForm() {
  const form = useForm({ defaultValues: getInitialFormData() });
  return <form>{/* ... */}</form>;
}

// ✅ GOOD: Custom hook để reuse logic
export function useUserForm(userId?: string) {
  const form = useForm({
    defaultValues: userId ? fetchUserData(userId) : getInitialFormData(),
  });
  
  return form;
}

// ❌ BAD: Logic lặp lại
export function CreateUserForm() {
  const form = useForm({
    defaultValues: { name: '', email: '', role: 'student', status: 'active' },
  });
  return <form>{/* ... */}</form>;
}

export function EditUserForm() {
  const form = useForm({
    defaultValues: { name: '', email: '', role: 'student', status: 'active' },
  });
  return <form>{/* ... */}</form>;
}
```

### 4️⃣ Comments (Ghi chú)

```typescript
// ✅ GOOD: Ghi chú giải thích LÀM SAO & TẠI SAO, không phải CÁI GÌ
export function calculateUserScore(submission: Submission): number {
  // Cộng điểm từ mỗi bài test được pass
  // Công thức: (passed_tests / total_tests) * 100
  const testScore = (submission.passedTests / submission.totalTests) * 100;
  
  // Áp dụng multiplier nếu nộp sớm (để khuyến khích)
  const multiplier = submission.submittedEarly ? 1.1 : 1.0;
  
  return Math.min(testScore * multiplier, 100);
}

// ✅ GOOD: JSDoc cho public APIs
/**
 * Lấy danh sách người dùng theo vai trò
 * @param role - Vai trò cần lọc (admin, lecturer, student)
 * @param limit - Số lượng tối đa (default: 10)
 * @returns Promise chứa danh sách người dùng
 * @throws {Error} Nếu role không hợp lệ
 */
export async function getUsersByRole(
  role: UserRole,
  limit: number = 10
): Promise<User[]> {
  if (!['admin', 'lecturer', 'student'].includes(role)) {
    throw new Error(`Vai trò không hợp lệ: ${role}`);
  }
  
  return API.users.list({ role, limit });
}

// ✅ GOOD: TODO cho future improvements
// TODO: Optimize query performance khi có 10k+ users
// TODO: Add pagination support
export async function listAllUsers(): Promise<User[]> {
  return API.users.list();
}

// ❌ BAD: Ghi chú thừa, không giúp
// Đặt role = admin
const role = 'admin';  // ❌ Rõ ràng rồi

// Tăng count lên 1
count = count + 1;  // ❌ Code nói rõ rồi

// ❌ BAD: Ghi chú sai lệch hoặc cũ
// Lấy danh sách các lecturer
const students = API.students.list();  // ❌ Comment sai, code lấy students
```

### 5️⃣ SOLID Principles

```typescript
// ✅ GOOD: Single Responsibility Principle
// Component chỉ handle rendering
export function UserCard({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// Hook handle logic fetch data
export function useUserData(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => API.users.getById(userId),
  });
}

// Utility handle business logic
export function calculateUserScore(submission: Submission): number {
  return (submission.passedTests / submission.totalTests) * 100;
}

// ✅ GOOD: Dependency Injection (dependency params)
export function validateSubmission(
  submission: Submission,
  validator: SubmissionValidator = defaultValidator
): ValidationError[] {
  return validator.validate(submission);
}

// ❌ BAD: Multiple Responsibilities
export function UserCard() {
  // Render, fetch data, validate, calculate score tất cả trong 1 component
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    API.users.getById(id)
      .then((u) => {
        const score = (u.passedTests / u.totalTests) * 100;
        // ... validate logic
        // ... business logic
        setUser(u);
      });
  }, [id]);
  
  return <div>{/* render 200+ dòng */}</div>;
}
```

---

## 🐛 Debugging & Error Handling

### 1️⃣ Debugging Techniques

```typescript
// ✅ GOOD: Debug log có context
function processUserData(user: User) {
  console.log('[UserProcessor] Processing user:', { id: user.id, email: user.email });
  
  try {
    validateUser(user);
    console.log('[UserProcessor] Validation passed');
  } catch (error) {
    console.error('[UserProcessor] Validation failed:', error);
    throw error;
  }
}

// ✅ GOOD: Use React DevTools
// Chrome DevTools → React DevTools extension → Inspect component props/state

// ✅ GOOD: Use TanStack Query DevTools
import { TanStackQueryDevtools } from '@tanstack/react-query-devtools';

export function App() {
  return (
    <>
      {/* Components */}
      <TanStackQueryDevtools initialIsOpen={false} />
    </>
  );
}

// ✅ GOOD: Logging API calls
// configs/axios-config.ts
axiosInstance.interceptors.request.use((config) => {
  console.log('[API Request]', config.method?.toUpperCase(), config.url);
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[API Error]', error.response?.status, error.config.url);
    return Promise.reject(error);
  }
);

// ❌ BAD: Random console.log không có context
console.log(user);          // ❌ Không biết từ đâu
console.log('data:', data); // ❌ Không có thông tin về data
```

### 2️⃣ Common Errors & Solutions

```typescript
// ❌ Error: "Cannot read property 'xxx' of undefined"
// Solution: Thêm null check hoặc optional chaining
export function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useQuery({ ... });
  
  // ❌ BAD: Crash nếu user undefined
  return <div>{user.name}</div>;
  
  // ✅ GOOD: Optional chaining
  return <div>{user?.name}</div>;
  
  // ✅ GOOD: Null check
  if (!user) return <div>Loading...</div>;
  return <div>{user.name}</div>;
}

// ❌ Error: "Rules of Hooks violated"
// Solution: Move hook to top level
export function MyComponent({ flag }: { flag: boolean }) {
  // ❌ BAD: Hook in condition
  if (flag) {
    const [count, setCount] = useState(0);
  }
  
  // ✅ GOOD: Hook at top level
  const [count, setCount] = useState(0);
  return flag ? <div>{count}</div> : null;
}

// ❌ Error: "Missing key prop in list"
// Solution: Add unique key
// ❌ BAD
{users.map((user, index) => <UserCard key={index} user={user} />)}

// ✅ GOOD
{users.map((user) => <UserCard key={user.id} user={user} />)}

// ❌ Error: "Memory leak warning"
// Solution: Clean up effects & unsubscribe
// ❌ BAD
export function Component() {
  useEffect(() => {
    const timer = setTimeout(() => { }, 1000);
    // ❌ Không clear timer khi unmount
  }, []);
}

// ✅ GOOD
export function Component() {
  useEffect(() => {
    const timer = setTimeout(() => { }, 1000);
    
    return () => clearTimeout(timer);  // Cleanup
  }, []);
}
```

---

## ✅ TypeScript Best Practices

```typescript
// ✅ GOOD: Type-safe API responses
import type { User } from '@/api/types.gen';

export function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: () => API.users.getById(userId),
  });
  
  return <div>{user?.name}</div>;
}

// ✅ GOOD: Union types để handle multiple states
type LoadingState = { status: 'loading' };
type ErrorState = { status: 'error'; error: Error };
type SuccessState = { status: 'success'; data: User };
type QueryState = LoadingState | ErrorState | SuccessState;

function renderState(state: QueryState) {
  switch (state.status) {
    case 'loading':
      return <div>Loading...</div>;
    case 'error':
      return <div>Error: {state.error.message}</div>;
    case 'success':
      return <div>{state.data.name}</div>;
  }
}

// ✅ GOOD: Discriminated unions
type Action =
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_USER' };

function handleAction(action: Action) {
  switch (action.type) {
    case 'SET_USER':
      // TypeScript knows payload is User
      console.log(action.payload.name);
      break;
    case 'CLEAR_USER':
      // No payload here
      console.log('User cleared');
      break;
  }
}

// ✅ GOOD: keyof typeof for type-safe constants
const ROLES = {
  ADMIN: 'admin',
  LECTURER: 'lecturer',
  STUDENT: 'student',
} as const;

type RoleType = (typeof ROLES)[keyof typeof ROLES];

// ❌ BAD: Dùng string literals everywhere
const role: string = 'admin';  // ❌ Không type-safe
```

---

## 🧪 Testing

```typescript
// ✅ GOOD: Test hooks
import { renderHook, waitFor } from '@testing-library/react';
import { useUserData } from '@/features/auth/hooks';

describe('useUserData', () => {
  it('should fetch user data', async () => {
    const { result } = renderHook(() => useUserData('123'));
    
    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });
    
    expect(result.current.user?.id).toBe('123');
  });
});

// ✅ GOOD: Test components
import { render, screen } from '@testing-library/react';
import { UserCard } from '@/components/UserCard';

describe('UserCard', () => {
  it('should render user name', () => {
    const user = { id: '1', name: 'John', email: 'john@example.com' };
    render(<UserCard user={user} onSelect={vi.fn()} />);
    
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});

// ✅ GOOD: Mock API calls
import { setupServer } from 'msw/node';
import { http } from 'msw';

const server = setupServer(
  http.get('/api/users/:id', ({ params }) => {
    return new Response(
      JSON.stringify({ id: params.id, name: 'Mocked User' }),
      { status: 200 }
    );
  })
);

describe('User API', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  
  it('should fetch user', async () => {
    const user = await API.users.getById('1');
    expect(user.name).toBe('Mocked User');
  });
});
```

---

## 📋 Folder Structure Best Practices

```
src/
├── features/
│   ├── auth/
│   │   ├── index.ts                 # Re-export public API
│   │   ├── api/
│   │   │   ├── index.ts
│   │   │   └── auth.api.ts          # API calls only
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts           # Custom auth hook
│   │   │   ├── useLogin.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   ├── helpers.ts
│   │   │   └── index.ts
│   │   └── store/
│   │       ├── authStore.ts         # Zustand store
│   │       └── index.ts
│   │
│   ├── submission/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── index.ts
│   │
│   └── [other-features]/
│
├── components/                       # Shared components
│   ├── Layout/
│   ├── Form/
│   ├── Modal/
│   └── index.ts
│
├── utils/                            # Shared utilities
│   ├── formatters.ts
│   ├── validators.ts
│   ├── helpers.ts
│   └── index.ts
│
├── types/                            # Shared types
│   ├── common.types.ts
│   └── index.ts
│
└── styles/                           # Global styles
    ├── variables.css
    ├── globals.css
    └── index.css
```

---

## 🚀 Performance Optimization

```typescript
// ✅ GOOD: Code splitting với lazy loading
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('@/routes/admin'));
const StudentDashboard = lazy(() => import('@/routes/student'));

export function Dashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {isAdmin ? <AdminDashboard /> : <StudentDashboard />}
    </Suspense>
  );
}

// ✅ GOOD: Prefetch data when likely to be used
export function UserCard({ user }: { user: User }) {
  return (
    <div
      onMouseEnter={() => {
        // Prefetch user details khi hover
        queryClient.prefetchQuery({
          queryKey: ['user', user.id],
          queryFn: () => API.users.getById(user.id),
        });
      }}
    >
      {user.name}
    </div>
  );
}

// ✅ GOOD: Batch updates
export function BulkUserUpdate() {
  const updateUsers = useMutation({
    mutationFn: (userIds: string[]) =>
      Promise.all(userIds.map((id) => API.users.update(id, {...}))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
  
  return <button onClick={() => updateUsers.mutate(selectedIds)}>Update</button>;
}
```

---

## 🔐 Security

```typescript
// ✅ GOOD: Sanitize user input
import DOMPurify from 'dompurify';

export function UserBio({ bio }: { bio: string }) {
  const safeBio = DOMPurify.sanitize(bio);
  return <div dangerouslySetInnerHTML={{ __html: safeBio }} />;
}

// ✅ GOOD: CSRF protection (TanStack Query handles automatically)
// Axios interceptor adds CSRF token
axiosInstance.interceptors.request.use((config) => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (token) {
    config.headers['X-CSRF-Token'] = token;
  }
  return config;
});

// ✅ GOOD: XSS prevention with React's JSX
// React automatically escapes content
const userInput = '<script>alert("XSS")</script>';
return <div>{userInput}</div>;  // ✅ Rendered as text, not executed

// ❌ BAD: dangerouslySetInnerHTML without sanitization
return <div dangerouslySetInnerHTML={{ __html: userInput }} />;  // ❌ XSS vulnerability
```

---

## 📚 Git & Commit

```
Quy tắc commit: type(scope): description

Types:
  feat    - Tính năng mới
  fix     - Sửa lỗi
  refactor- Sắp xếp lại code
  docs    - Thêm/cập nhật docs
  test    - Thêm/cập nhật tests
  perf    - Tối ưu hiệu năng
  style   - Format code
  chore   - Config, dependencies

Scope: Feature name, module (auth, submission, etc.)

Ví dụ:
  feat(auth): thêm role-based route protection
  fix(submission): xử lý empty file uploads
  refactor(api): consolidate error handling
  test(auth): thêm unit tests cho useAuth hook
  docs: cập nhật README với setup instructions
```

---

## 🛠️ Development Workflow

### 1️⃣ Bắt đầu Feature Mới

```bash
# 1. Checkout branch
git checkout -b feature/APSAS-123-feature-name

# 2. Cập nhật API specs nếu cần
./openapi/fetch.sh
npm run api:generate

# 3. Tạo folder structure
src/features/my-feature/
├── api/
├── components/
├── hooks/
├── types/
├── utils/
└── index.ts

# 4. Implement feature
# - Viết type definitions trước
# - Implement hooks
# - Implement components
# - Viết tests

# 5. Test & validate
npm run test
npm run type-check
npm run lint
```

### 2️⃣ Updating API Integration

```bash
# 1. Fetch latest specs
./openapi/fetch.sh

# 2. Regenerate client
npm run api:generate

# 3. Review changes
git diff src/api/

# 4. Update components to use new API

# 5. Run tests
npm run test

# 6. Commit changes
git add .
git commit -m "feat(api): cập nhật API client từ OpenAPI specs"
```

### 3️⃣ Debugging

```bash
# Browser DevTools
# - Network tab: Kiểm tra API calls
# - Console: Xem logs & errors
# - React DevTools: Inspect component tree

# Start dev server
bun run dev

# Run tests in watch mode
bun run test -- --watch

# Type checking
bun run type-check

# Linting
bun run lint
```

---

## 🌟 Quick Reference

| Task | Command |
|------|---------|
| Start dev | `bun run dev` |
| Build prod | `bun run build` |
| Run tests | `bun run test` |
| Test watch | `bun run test -- --watch` |
| Type check | `bun run type-check` |
| Lint code | `bun run lint` |
| Generate API | `bun run api:generate` |
| Fetch API specs | `./openapi/fetch.sh` |

---

## 📖 Resources

- [React Docs](https://react.dev)
- [React Hooks Rules](https://react.dev/reference/rules/rules-of-hooks)
- [TanStack Query](https://tanstack.com/query)
- [TanStack Router](https://tanstack.com/router)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vitest](https://vitest.dev)
- [MSW](https://mswjs.io)
- [Mantine UI](https://mantine.dev)

---

**Last Updated**: October 23, 2025  
**Version**: 2.0  
**Maintained by**: Development Team

