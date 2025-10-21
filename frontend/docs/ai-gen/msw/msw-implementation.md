# MSW Mock Server Implementation with @mswjs/data

## Overview

The MSW (Mock Service Worker) mock server has been completely refactored to use `@mswjs/data` for persistent data management across handler calls. This replaces the previous singleton pattern and global object approaches that failed to persist data between different API calls.

## Architecture

### Database Schema

```typescript
const db = factory({
  user: {
    id: primaryKey(String),
    email: String,
    password: String,
    role: String,
    isVerified: Boolean,
    resetToken: String,
    resetTokenExpiry: Number,
    createdAt: Number,
    updatedAt: Number,
  },
})
```

### Persistence Mechanism

Data is persisted using `localStorage` with the key `'msw-data'`. The persistence functions handle serialization/deserialization:

```typescript
const persistDatabase = () => {
  const data = { user: db.user.findMany({}) }
  localStorage.setItem('msw-data', JSON.stringify(data))
}
```

### Initialization

On module load, the database is initialized with default users or loaded from persisted data:

```typescript
const initializeDatabase = () => {
  const persistedData = localStorage.getItem('msw-data')
  if (!persistedData) {
    // Create default users
    defaultUsers.forEach(user => db.user.create(user))
    persistDatabase()
  } else {
    // Load persisted data
    const data = JSON.parse(persistedData)
    if (data.user) {
      data.user.forEach((user: any) => db.user.create(user))
    }
  }
}
```

## Handlers Implementation

### Login Handler
- Queries database by email and password
- Returns appropriate JWT token based on user role
- Logs authentication attempts for debugging

### Forgot Password Handler
- Validates user existence
- Generates unique reset token with 24-hour expiry
- Updates user record with reset token
- Persists changes to localStorage

### Reset Password Handler
- Validates reset token existence and expiry
- Updates user password
- Clears reset token and expiry
- Persists changes to localStorage

### Change Password Handler
- Verifies current password against database
- Updates password with new value
- Persists changes to localStorage

## Default Users

The system initializes with four default users:

| Email | Password | Role |
|-------|----------|------|
| admin@apsas.edu.vn | Admin@123 | admin |
| instructor@apsas.edu.vn | Instructor@123 | instructor |
| student@apsas.edu.vn | Student@123 | student |
| provider@apsas.edu.vn | Provider@123 | provider |

## Testing Results

### Password Reset Flow ✅
1. **Forgot Password**: Successfully generates reset token
2. **Reset Password**: Validates token and updates password
3. **Login with New Password**: Authentication succeeds with updated credentials

### Data Persistence ✅
- Password changes persist across handler calls
- Reset tokens are properly managed
- Data survives page reloads via localStorage

### Multi-User Support ✅
- All user roles (admin, instructor, student, provider) work correctly
- Independent credential management per user
- Role-based token generation

## Benefits of @mswjs/data

1. **Type Safety**: Full TypeScript support with schema validation
2. **Persistence**: Built-in support for data persistence patterns
3. **Query API**: Rich query interface for finding and updating records
4. **Isolation**: Clean separation between mock data and application logic
5. **Scalability**: Easy to extend with additional models and relationships

## Usage in Tests

The mock server can be imported and used in Vitest tests:

```typescript
import { server } from '@/mocks/server'

// Start server before tests
beforeAll(() => server.listen())

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Close server after tests
afterAll(() => server.close())
```

## Future Enhancements

1. **Additional Models**: Extend database with submission, evaluation, content models
2. **Relationships**: Add foreign key relationships between models
3. **Advanced Queries**: Implement complex filtering and sorting
4. **Data Validation**: Add Zod schema validation for API payloads
5. **Bulk Operations**: Support for bulk user creation/updates