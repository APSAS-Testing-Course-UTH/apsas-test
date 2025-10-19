# APSAS Authentication API Reference & Integration Guide

**Version**: 2.0  
**Last Updated**: October 19, 2025  
**API Base URL**: `http://localhost:8080` (development) | `https://api.apsas.edu.vn` (production)

---

## 📑 Table of Contents

1. [Quick Overview](#quick-overview)
2. [Authentication Endpoints](#authentication-endpoints)
3. [User Management Endpoints](#user-management-endpoints)
4. [Authentication Flows](#authentication-flows)
5. [Request/Response Examples](#requestresponse-examples)
6. [Data Types & Schemas](#data-types--schemas)
7. [Error Handling](#error-handling)
8. [Security Configuration](#security-configuration)
9. [CORS & Headers](#cors--headers)
10. [Rate Limiting](#rate-limiting)
11. [Integration Checklist](#integration-checklist)

---

## 🎯 Quick Overview

### What is APSAS Authentication?

APSAS uses **JWT (JSON Web Tokens)** for stateless authentication with:
- User registration with email/password validation
- Login with JWT token generation
- Token refresh for long sessions
- User profile management with role-based access
- Password reset and email verification
- Role-based permissions system

### Tech Stack

| Component | Tech | Version |
|-----------|------|---------|
| Token Type | JWT | HS256/RS256 |
| Backend | Node.js + Express | 18.x |
| Auth | JWT | jsonwebtoken 9.x |
| Password | bcrypt | 5.x |
| Database | PostgreSQL | 15.x |
| Frontend | React 19 + Zustand | 19.0.0 |

### Key Concepts

| Term | Meaning |
|------|---------|
| **JWT** | JSON Web Token - digitally signed token containing user data |
| **Access Token** | Short-lived token for API calls (15min - 1 hour) |
| **Refresh Token** | Long-lived token to get new access token (7 days) |
| **Bearer Token** | Token included in Authorization header: `Bearer <token>` |
| **Payload** | Decoded token data: `{ userId, email, role, exp }` |

---

## 🔐 Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request**:
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "SecurePass123",
  "firstName": "Nguyễn",
  "lastName": "Văn A"
}
```

**Validation Rules**:
- Email: Valid format, unique (not already registered)
- Password: Minimum 8 characters, mix of uppercase/lowercase/numbers recommended
- Names: At least 1 character, maximum 100 characters

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "userId": "user_123456",
    "email": "student@example.com",
    "firstName": "Nguyễn",
    "lastName": "Văn A",
    "role": "STUDENT",
    "isEmailVerified": false,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input data or validation failed
- `409 Conflict` - Email already registered
- `422 Unprocessable Entity` - Business logic validation failed

**Example Error**:
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Dữ liệu không hợp lệ",
  "details": {
    "email": "Email này đã được sử dụng",
    "password": "Mật khẩu phải có ít nhất 8 ký tự"
  }
}
```

---

### POST /api/auth/login

Authenticate user and return JWT tokens.

**Request**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "user_123456",
      "email": "student@example.com",
      "firstName": "Nguyễn",
      "lastName": "Văn A",
      "role": "STUDENT",
      "permissions": ["VIEW_ASSIGNMENTS", "SUBMIT_WORK"],
      "isEmailVerified": true,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid email/password format
- `401 Unauthorized` - Invalid credentials
- `422 Unprocessable Entity` - Account not verified or inactive
- `429 Too Many Requests` - Rate limited (too many login attempts)

**Token Details**:
- Both access and refresh tokens returned
- Store access token for API calls (expires in 24-48 hours)
- Store refresh token separately for token renewal (expires in 7 days)
- New registrations may return `isEmailVerified: false` - require email verification

---

### POST /api/auth/refresh

Get new access token using refresh token.

**Request**:
```http
POST /api/auth/refresh
Authorization: Bearer <refreshToken>
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Token đã được cập nhật",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Usage**:
- Call when access token is about to expire
- Or when API returns 401 (token expired)
- Get new access token without re-login
- Recommended refresh ~5 minutes before expiration

---

### POST /api/auth/logout

Logout user and invalidate tokens.

**Request**:
```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Đã đăng xuất"
}
```

**Effects**:
- Current session invalidated
- Refresh token no longer valid
- All tokens blacklisted (backend cached)
- User must login again

---

### GET /api/auth/me

Get current authenticated user profile.

**Request**:
```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "user_123456",
    "email": "student@example.com",
    "firstName": "Nguyễn",
    "lastName": "Văn A",
    "role": "STUDENT",
    "permissions": ["VIEW_ASSIGNMENTS", "SUBMIT_WORK"],
    "isEmailVerified": true,
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - User not found (deleted from backend)

---

### POST /api/auth/verify-email

Verify user email with verification token from email.

**Request**:
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "email_verification_token_from_email"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Email đã được xác thực"
}
```

**Error Responses**:
- `400 Bad Request` - Invalid token format
- `401 Unauthorized` - Invalid or expired token
- `409 Conflict` - Email already verified

---

### POST /api/auth/resend-verification

Resend email verification link to email.

**Request**:
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "student@example.com"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Email xác thực đã được gửi lại"
}
```

**Error Responses**:
- `400 Bad Request` - Invalid email format
- `404 Not Found` - Email not found or already verified
- `429 Too Many Requests` - Rate limited

---

### POST /api/auth/forgot-password

Request password reset email.

**Request**:
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "student@example.com"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Link đặt lại mật khẩu đã được gửi"
}
```

**Notes**:
- Email sent to provided address
- For security: endpoint returns success even if email not found
- Link valid for 24-48 hours
- User doesn't know if email is registered

---

### POST /api/auth/reset-password

Reset password using token from email.

**Request**:
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "NewPassword123"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Mật khẩu đã được đặt lại thành công"
}
```

**Error Responses**:
- `400 Bad Request` - Invalid token or password format
- `401 Unauthorized` - Invalid or expired token
- `422 Unprocessable Entity` - Password validation failed

---

### POST /api/auth/change-password

Change password for authenticated user.

**Request**:
```http
POST /api/auth/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Mật khẩu đã được thay đổi"
}
```

**Error Responses**:
- `400 Bad Request` - Invalid input or same as current password
- `401 Unauthorized` - Invalid current password or token
- `422 Unprocessable Entity` - New password validation failed

---

## 👤 User Management Endpoints

### GET /api/v1/users/me

Get current user profile (same as GET /api/auth/me).

**Headers**: `Authorization: Bearer <accessToken>`

**Response**: UserResponse object (see [Data Types](#data-types--schemas))

---

### PUT /api/v1/users/me

Update current user profile.

**Request**:
```http
PUT /api/v1/users/me
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "firstName": "Updated Name",
  "lastName": "Updated Last"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Hồ sơ đã được cập nhật",
  "data": {
    "userId": "user_123456",
    "email": "student@example.com",
    "firstName": "Updated Name",
    "lastName": "Updated Last",
    "role": "STUDENT",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

---

### POST /api/v1/users/me/change-password

Change password (same as POST /api/auth/change-password).

---

### GET /api/v1/users

Get all users with pagination (Admin only).

**Request**:
```http
GET /api/v1/users?page=0&size=10&sort=email,asc
Authorization: Bearer <accessToken>
```

**Query Parameters**:
- `page` - Page number (0-indexed), default: 0
- `size` - Items per page (1-100), default: 10
- `sort` - Sort criteria: `field,direction;field,direction`
- `role` - Filter by role (optional)
- `search` - Search by email or name (optional)

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "userId": "user_123456",
        "email": "student1@example.com",
        "firstName": "Nguyễn",
        "lastName": "Văn A",
        "role": "STUDENT",
        "isActive": true,
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ],
    "pageNumber": 0,
    "pageSize": 10,
    "totalElements": 150,
    "totalPages": 15,
    "first": true,
    "last": false,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Permissions**: Requires ADMIN role

---

### GET /api/v1/users/role/{role}

Get users filtered by role (Admin/Instructor only).

**Request**:
```http
GET /api/v1/users/role/STUDENT?page=0&size=20
Authorization: Bearer <accessToken>
```

**Path Parameters**:
- `role` - User role: STUDENT, INSTRUCTOR, CONTENT_PROVIDER, ADMIN

**Response**: Same as GET /api/v1/users

---

### GET /api/v1/users/{userId}

Get user details by ID (Admin/Instructor only).

**Request**:
```http
GET /api/v1/users/user_123456
Authorization: Bearer <accessToken>
```

**Success Response (200)**: UserResponse object

---

### POST /api/v1/users

Create new user (Admin only).

**Request**:
```http
POST /api/v1/users
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT",
  "isActive": true,
  "isEmailVerified": false
}
```

**Permissions**: Requires ADMIN role

---

### PUT /api/v1/users/{userId}/activate

Activate user account (Admin only).

**Request**:
```http
PUT /api/v1/users/user_123456/activate
Authorization: Bearer <accessToken>
```

---

### PUT /api/v1/users/{userId}/deactivate

Deactivate user account (Admin only).

**Request**:
```http
PUT /api/v1/users/user_123456/deactivate
Authorization: Bearer <accessToken>
```

---

### DELETE /api/v1/users/{userId}

Delete user account (Admin only).

**Request**:
```http
DELETE /api/v1/users/user_123456
Authorization: Bearer <accessToken>
```

---

## 🔄 Authentication Flows

### Standard Login Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant DB as Database
    
    U->>FE: Enter email & password
    FE->>BE: POST /api/auth/login
    BE->>DB: Check user exists
    DB-->>BE: User found
    BE->>BE: Hash & verify password
    
    alt Valid Credentials
        BE->>BE: Generate JWT tokens
        BE-->>FE: Return tokens + user data
        FE->>FE: Store tokens (localStorage/cookies)
        FE->>FE: Set user in Zustand store
        FE->>U: Redirect to dashboard
    else Invalid Credentials
        BE-->>FE: Return 401 error
        FE->>U: Show error message
    end
```

**Step-by-Step**:
1. User submits email & password via login form
2. Frontend sends `POST /api/auth/login` request
3. Backend validates credentials against database
4. Backend hashes password and compares
5. If valid: Generate JWT access token + refresh token
6. If invalid: Return 401 INVALID_CREDENTIALS error
7. Frontend stores tokens in secure location
8. Frontend stores user info in Zustand auth store
9. Frontend redirects to dashboard based on user role

---

### Token Refresh Flow

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant BE as Backend
    participant DB as Database
    
    FE->>BE: API call with accessToken
    BE->>BE: Validate token signature
    BE->>BE: Check token expiration
    
    alt Token Valid
        BE-->>FE: Return requested data
    else Token Expired
        BE-->>FE: Return 401 AUTH_EXPIRED
        FE->>FE: Detect 401 in axios interceptor
        FE->>BE: POST /api/auth/refresh
        BE->>DB: Validate refreshToken
        
        alt RefreshToken Valid
            BE->>BE: Generate new accessToken
            BE-->>FE: Return new tokens
            FE->>BE: Retry original request
            BE-->>FE: Return requested data
        else RefreshToken Invalid
            BE-->>FE: Return 401
            FE->>FE: Clear auth store
            FE->>U: Redirect to /login
        end
    end
```

**Key Points**:
- Access token expires faster (configurable: 30min - 1hour)
- Refresh token expires slower (7 days)
- Frontend should refresh ~5 minutes before expiration
- Axios interceptor automatically handles 401 refresh
- Failed refresh redirects to login page

---

### Logout Flow

```
┌──────────────────┐
│ User clicks      │
│ logout button    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ Frontend:                    │
│ POST /api/auth/logout        │
│ with accessToken             │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Backend:                     │
│ - Validate token             │
│ - Blacklist tokens           │
│ - Clear session cache        │
│ - Invalidate refresh token   │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Return 200 success           │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Frontend:                    │
│ - Clear localStorage/cookies │
│ - Clear Zustand auth store   │
│ - Clear axios auth header    │
│ - Redirect to /login         │
└──────────────────────────────┘
```

---

## 💬 Request/Response Examples

### Example 1: Complete Registration & Login

**Register User**:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123",
    "firstName": "Nguyễn",
    "lastName": "Văn A"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "user_abc123",
    "email": "student@example.com",
    "role": "STUDENT",
    "isEmailVerified": false
  }
}
```

**Login User**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "user_abc123",
      "email": "student@example.com",
      "role": "STUDENT",
      "permissions": ["VIEW_ASSIGNMENTS", "SUBMIT_WORK"]
    }
  }
}
```

---

### Example 2: Authenticated API Request

**Get Current User Profile**:
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "user_abc123",
    "email": "student@example.com",
    "firstName": "Nguyễn",
    "lastName": "Văn A",
    "role": "STUDENT",
    "isEmailVerified": false,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

---

### Example 3: Handling Token Expiration

**API Returns 401**:
```json
{
  "success": false,
  "code": "AUTH_EXPIRED",
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

**Frontend Detects 401 & Refreshes**:
```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Authorization: Bearer <refreshToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Example 4: Using with React Hooks

```typescript
import { useLogin } from '@/api/@tanstack/react-query.gen'

function LoginPage() {
  const loginMutation = useLogin()

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation.mutateAsync({
        email,
        password
      })
      
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      
      // Update Zustand store
      useAuthStore.setState({
        user: data.user,
        token: data.accessToken,
        isLoading: false
      })
      
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      // Handle error...
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleLogin(email, password)
    }}>
      {/* Form fields */}
    </form>
  )
}
```

---

## 📊 Data Types & Schemas

### UserResponse

```typescript
interface UserResponse {
  userId: string              // UUID v4
  email: string               // Email address
  firstName: string           // First name (max 100)
  lastName: string            // Last name (max 100)
  role: 'STUDENT' | 'INSTRUCTOR' | 'CONTENT_PROVIDER' | 'ADMIN'
  permissions: string[]       // Array of permission strings
  isActive: boolean           // Account active status
  isEmailVerified: boolean    // Email verification status
  createdAt: string           // ISO 8601 timestamp
  updatedAt: string           // ISO 8601 timestamp
}
```

### AuthResponse

```typescript
interface AuthResponse {
  accessToken: string         // JWT access token (short-lived)
  refreshToken: string        // JWT refresh token (long-lived)
  user: UserResponse          // User information
}
```

### ErrorResponse

```typescript
interface ErrorResponse {
  success: false
  code: string                // Error code (e.g., INVALID_CREDENTIALS)
  message: string             // Human-readable message
  details?: Record<string, string>  // Field-specific errors
}
```

### PageResponse<T>

```typescript
interface PageResponse<T> {
  content: T[]                // Array of items
  pageNumber: number          // Current page (0-indexed)
  pageSize: number            // Items per page
  totalElements: number       // Total items across all pages
  totalPages: number          // Total number of pages
  first: boolean              // Is first page
  last: boolean               // Is last page
  hasNext: boolean            // Has next page
  hasPrevious: boolean        // Has previous page
}
```

---

## 🚨 Error Handling

### Standard Error Format

All errors follow this structure:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Human-readable message",
  "details": {
    "field": "Field-specific error"
  }
}
```

### HTTP Status Codes & Error Codes

| HTTP | Code | Meaning | Solution |
|------|------|---------|----------|
| 400 | VALIDATION_ERROR | Invalid input data | Check `details` field |
| 401 | INVALID_CREDENTIALS | Wrong email/password | Verify credentials |
| 401 | AUTH_EXPIRED | Token expired/invalid | Refresh token or login |
| 401 | UNAUTHORIZED | No auth token | Include Authorization header |
| 403 | FORBIDDEN | No permission for action | Check user role |
| 404 | NOT_FOUND | Resource doesn't exist | Verify resource ID |
| 409 | CONFLICT | Resource already exists | Email already registered |
| 422 | UNPROCESSABLE_ENTITY | Business logic failed | Check validation rules |
| 429 | RATE_LIMITED | Too many requests | Wait and retry |
| 500 | SERVER_ERROR | Server error | Retry or contact support |

### Frontend Error Handler

```typescript
async function handleApiError(error: AxiosError) {
  const status = error.response?.status
  const data = error.response?.data as ErrorResponse
  
  switch (status) {
    case 401:
      if (data?.code === 'AUTH_EXPIRED') {
        // Try refresh token
        await refreshAccessToken()
      } else {
        // Redirect to login
        navigate('/login')
      }
      break
      
    case 400:
      if (data?.code === 'VALIDATION_ERROR') {
        // Show field errors
        data.details && Object.entries(data.details).forEach(([field, msg]) => {
          setFieldError(field, msg)
        })
      }
      break
      
    case 403:
      // Show permission error
      showError('Bạn không có quyền truy cập tài nguyên này')
      break
      
    case 429:
      // Show rate limit error
      showError(`Quá nhiều yêu cầu. Vui lòng chờ ${data?.details?.retryAfter} giây`)
      break
      
    default:
      // Generic error
      showError(data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
  }
}
```

---

## 🔒 Security Configuration

### 1. Token Storage (Best Practices)

**Recommended Approaches**:

```typescript
// Option 1: HTTP-only Cookies (Most Secure)
// Backend sets: Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Strict
// Frontend: Automatically included in requests

// Option 2: LocalStorage with Encryption (Good)
import { encrypt, decrypt } from 'crypto-js'
const encryptedToken = encrypt(token, process.env.REACT_APP_SECRET)
localStorage.setItem('token', encryptedToken)

// Option 3: Memory + Refresh (Session-based)
let accessToken = null  // Cleared on page reload
localStorage.setItem('refreshToken', refreshToken)
```

**Never Do**:
```typescript
// ❌ AVOID
localStorage.setItem('password', password)  // Never store password!
localStorage.setItem('token', unencryptedToken)  // Plain text vulnerable to XSS
```

### 2. Password Security

**Requirements**:
- Minimum 8 characters (enforced by backend)
- Mix of uppercase, lowercase, numbers recommended
- Avoid dictionary words
- Never reuse old passwords

**Backend Handling**:
```typescript
import bcrypt from 'bcrypt'

// Hash password with salt
const hashedPassword = await bcrypt.hash(password, 10)

// Verify password
const isValid = await bcrypt.compare(inputPassword, hashedPassword)
```

### 3. HTTPS Requirement

**Production**:
- ✅ ALWAYS use HTTPS (not HTTP)
- ✅ Redirect HTTP → HTTPS
- ✅ Set HSTS header: `Strict-Transport-Security: max-age=31536000`

**Development (localhost)**:
- OK to use HTTP for testing
- HTTPS optional for localhost:8080

### 4. Secure Cookie Flags

```http
Set-Cookie: accessToken=...; 
  HttpOnly;           // Not accessible via JavaScript
  Secure;             // Only HTTPS
  SameSite=Strict;    // CSRF protection
  Path=/api;          // Scope
  Max-Age=3600;       // 1 hour
```

### 5. XSS Prevention

```typescript
// ✅ SAFE (React auto-escapes)
<div>{user.email}</div>

// ❌ VULNERABLE
<div dangerouslySetInnerHTML={{__html: user.bio}} />

// ✅ SAFE (with sanitization)
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(user.bio)}} />
```

### 6. CSRF Protection

```typescript
// Include CSRF token in POST requests
const response = await api.post('/api/auth/login', credentials, {
  headers: {
    'X-CSRF-Token': csrfToken
  }
})
```

---

## 🔗 CORS & Headers

### Required Headers

```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
Accept: application/json
X-Requested-With: XMLHttpRequest
X-CSRF-Token: {csrf_token}
```

### CORS Configuration

**Development**:
```typescript
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-RateLimit-Remaining'],
  maxAge: 86400
}
```

**Production**:
```typescript
const corsOptions = {
  origin: ['https://apsas.example.com', 'https://staging.apsas.example.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400
}
```

### Content Security Policy

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https://fonts.googleapis.com;
  connect-src 'self' https://api.apsas.edu.vn;
  frame-ancestors 'none';
```

---

## ⏱️ Rate Limiting

### Rate Limit Policies

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| POST /api/auth/login | 5 attempts | 15 min | per IP + email |
| POST /api/auth/register | 3 attempts | 1 hour | per IP |
| POST /api/auth/forgot-password | 3 attempts | 1 hour | per IP + email |
| POST /api/auth/reset-password | 5 attempts | 1 hour | per IP + email |
| Other /api/auth/* | 10 attempts | 1 hour | per IP + email |
| All /api/v1/users/* | 100 requests | 1 minute | per user |

### Rate Limit Headers

```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 900
```

### Rate Limit Error Response

```json
{
  "success": false,
  "code": "RATE_LIMITED",
  "message": "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
  "details": {
    "retryAfter": 900,
    "resetTime": "2025-01-15T10:45:00Z"
  }
}
```

### Frontend Handling

```typescript
if (error.response?.status === 429) {
  const retryAfter = error.response?.data?.details?.retryAfter
  showError(`Quá nhiều lần thử. Vui lòng chờ ${retryAfter} giây`)
  disableFormForSeconds(retryAfter)
}
```

---

## ✅ Integration Checklist

### Pre-Integration

- [ ] Backend API endpoints implemented and tested
- [ ] Database schema created (users, tokens, sessions)
- [ ] Email service configured (SendGrid, AWS SES)
- [ ] JWT secret key generated and stored in env
- [ ] Password hashing with bcrypt configured
- [ ] CORS enabled for frontend origin
- [ ] Rate limiting middleware configured
- [ ] HTTPS enabled (staging/production)
- [ ] Database migrations applied
- [ ] Email templates created

### Frontend Integration

- [ ] Axios configured with interceptors
- [ ] Token storage method implemented
- [ ] Refresh token logic working
- [ ] Error handling setup (axios interceptor)
- [ ] Auth store (Zustand) created and working
- [ ] Route guards implemented (ProtectedRoute)
- [ ] 401 error handling working
- [ ] Role-based redirect working
- [ ] Login page created
- [ ] Register page created

### Testing Phase

- [ ] Login flow tested (happy path)
- [ ] Token refresh tested
- [ ] Logout tested
- [ ] Role-based access tested
- [ ] Email verification tested
- [ ] Password reset tested
- [ ] Error scenarios tested:
  - [ ] Invalid credentials (401)
  - [ ] Token expired (401 → refresh)
  - [ ] No token (401)
  - [ ] Invalid permissions (403)
  - [ ] User not found (404)
  - [ ] Rate limited (429)
  - [ ] Server error (500)

### Security Validation

- [ ] HTTPS enabled
- [ ] CSRF tokens working
- [ ] XSS prevention verified
- [ ] Passwords hashed with bcrypt
- [ ] Rate limiting working
- [ ] Token expiration enforced
- [ ] Secure cookie flags set
- [ ] Input validation on backend
- [ ] Output encoding on frontend
- [ ] No sensitive data in localStorage

### Deployment

- [ ] Environment variables configured (JWT_SECRET, DB_URL)
- [ ] CORS origins set correctly
- [ ] Database migrations run
- [ ] Email service tested
- [ ] Error logging setup
- [ ] Monitoring configured
- [ ] Backup strategy planned
- [ ] Documentation updated
- [ ] Team trained on system

---

## 📚 Additional Resources

- **OpenAPI Spec**: See `openapi/identity-service.json`
- **Implementation Guide**: See `02-COMPLETE-IMPLEMENTATION-GUIDE.md`
- **Troubleshooting**: See `04-TROUBLESHOOTING-RUNBOOK.md`
- **Quick Start**: See `01-QUICK-START.md`

**Contact**:
- Backend Support: backend-team@apsas.local
- Security Issues: security@apsas.local
- Documentation: docs@apsas.local

---

**Document Status**: Production Ready ✅  
**Last Updated**: October 19, 2025  
**Version**: 2.0  
**Maintained By**: APSAS Frontend & Backend Team