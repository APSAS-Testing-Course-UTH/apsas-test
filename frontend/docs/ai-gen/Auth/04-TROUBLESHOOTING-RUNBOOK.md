# APSAS Authentication Troubleshooting & Debug Runbook

**Version**: 2.0  
**Last Updated**: October 19, 2025  
**Audience**: Developers & Support Staff  
**Emergency Hotline**: Contact backend-team@apsas.local

---

## 🆘 Table of Contents

1. [Quick Symptom Diagnosis](#quick-symptom-diagnosis)
2. [Login Issues (10 scenarios)](#login-issues)
3. [Registration Issues (5 scenarios)](#registration-issues)
4. [Token & Session Issues (8 scenarios)](#token--session-issues)
5. [Permission & Access Issues (6 scenarios)](#permission--access-issues)
6. [Network & API Issues (7 scenarios)](#network--api-issues)
7. [Email & Verification Issues (4 scenarios)](#email--verification-issues)
8. [Debugging Tools & Techniques](#debugging-tools--techniques)
9. [Emergency Procedures](#emergency-procedures)
10. [FAQ & Common Solutions](#faq--common-solutions)

---

## 🔍 Quick Symptom Diagnosis

Use this table to quickly identify your issue:

| Symptom | Likely Cause | Go To Section |
|---------|--------------|---------------|
| "Invalid credentials" for correct password | Account locked or email not verified | [Login Issues](#login-issues) |
| Infinite loading spinner on login | Backend timeout or network issue | [Network Issues](#network--api-issues) |
| Logged in but user data missing | Zustand store not updated | [Session Issues](#token--session-issues) |
| Token refresh keeps failing | Refresh token expired or invalid | [Token Issues](#token--session-issues) |
| 403 Forbidden error | User role doesn't have permission | [Permission Issues](#permission--access-issues) |
| Email verification link doesn't work | Link expired or corrupted | [Email Issues](#email--verification-issues) |
| CORS error in browser console | Backend not allowing frontend origin | [Network Issues](#network--api-issues) |
| Registration fails at email step | Email service down or misconfigured | [Registration Issues](#registration-issues) |

---

## 🔐 Login Issues

### Issue 1: "Invalid credentials" with correct password

**Symptoms**:
- User enters correct email & password
- Gets "Invalid credentials" error (401)
- Works with other accounts

**Root Causes**:
1. Email not verified (new account)
2. Account locked due to failed attempts
3. Password case sensitivity issue
4. Whitespace in password input
5. User account deactivated

**Diagnostic Steps**:

```bash
# 1. Check database for user account status
psql apsas_db -c "SELECT id, email, is_active, email_verified, locked_until FROM users WHERE email='user@example.com';"

# Output should show:
# - is_active: true (if false, account deactivated)
# - email_verified: true (if false, email not verified)
# - locked_until: null (if has timestamp, account locked)
```

**Solutions**:

```typescript
// Frontend: Strip whitespace from password
const handleLogin = (email: string, password: string) => {
  // Email trim
  const cleanEmail = email.trim().toLowerCase()
  
  // Password: DO NOT trim (spaces can be part of password)
  const cleanPassword = password
  
  loginMutation.mutateAsync({ email: cleanEmail, password: cleanPassword })
}

// Frontend: Show specific error messages
if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
  showError('Vui lòng xác nhận email trước khi đăng nhập')
} else if (error.response?.data?.code === 'ACCOUNT_LOCKED') {
  showError('Tài khoản đã bị khóa tạm thời vì quá nhiều lần đăng nhập không thành công')
} else if (error.response?.data?.code === 'ACCOUNT_INACTIVE') {
  showError('Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên')
}
```

**Permanent Fix**:
```bash
# Unlock account in database (Admin only)
psql apsas_db -c "UPDATE users SET locked_until = NULL WHERE email='user@example.com';"

# Mark email as verified (if needed)
psql apsas_db -c "UPDATE users SET email_verified = true WHERE email='user@example.com';"

# Reactivate account (if needed)
psql apsas_db -c "UPDATE users SET is_active = true WHERE email='user@example.com';"
```

---

### Issue 2: Infinite loading spinner on login

**Symptoms**:
- Form shows loading spinner indefinitely
- No error message
- Network tab shows pending/hanging request
- Page becomes unresponsive

**Root Causes**:
1. Backend service not responding (~5sec+)
2. Network timeout configured too high
3. CORS preflight request stuck
4. Database connection timeout
5. Email service blocking (if sending verification)

**Diagnostic Steps**:

```typescript
// Frontend: Check axios timeout
console.log('Axios timeout:', api.defaults.timeout) // Should be 10000-30000ms

// Check network tab:
// 1. Open DevTools → Network tab
// 2. Try to login
// 3. Look for: POST /api/auth/login request
// 4. Check: Request time (should be <5s), Status code, Response
```

```bash
# Backend: Check service health
curl -i http://localhost:8080/api/auth/login

# Response should be quick (<1s)
# If hangs, backend is down or stuck

# Check backend logs
docker logs apsas-backend 2>&1 | tail -100

# Check database connection
psql -h localhost apsas_db -c "SELECT 1"

# If fails, database is down
```

**Solutions**:

```typescript
// Frontend: Add timeout handling
const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  timeout: 10000  // 10 seconds
})

// Add request timeout interceptor
api.interceptors.request.use(
  config => {
    config.timeout = 10000
    return config
  }
)

// Frontend: Show timeout error
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      showError('Yêu cầu vượt quá thời gian chờ. Backend không phản hồi.')
      // Redirect to error page or allow retry
    }
    return Promise.reject(error)
  }
)
```

**Backend Fix**:
```bash
# Restart backend service
docker restart apsas-backend

# Check database connection pool
# In backend logs, look for: "Connection pool exhausted"
# If found, increase pool size in .env

# Check for hanging requests
# In backend, look for: slow query logs or stuck requests
```

---

### Issue 3: Login succeeds but user not logged in (no token stored)

**Symptoms**:
- Login succeeds (no error)
- Page redirects
- User still not authenticated
- Dashboard shows "Not logged in"

**Root Causes**:
1. Token not saved to localStorage
2. Zustand store not updated
3. localStorage cleared by browser
4. Private browsing mode (localStorage not persistent)

**Diagnostic Steps**:

```typescript
// Frontend: Check localStorage
console.log(localStorage.getItem('accessToken'))  // Should show token
console.log(localStorage.getItem('refreshToken')) // Should show refresh token

// Check Zustand store
console.log(useAuthStore.getState())  // Should have user data

// Check response from login API
// Add debug in loginMutation success handler
console.log('Login response:', response)
```

**Solutions**:

```typescript
// Frontend: Store token properly
const handleLoginSuccess = (data: AuthResponse) => {
  // 1. Store tokens in localStorage
  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)
  
  // 2. Set axios default header
  axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
  
  // 3. Update Zustand store
  useAuthStore.setState({
    user: data.user,
    token: data.accessToken,
    isLoading: false
  })
  
  // 4. Redirect to dashboard
  setTimeout(() => navigate('/dashboard'), 100)
}

// Check if localStorage works (private browsing issue)
try {
  localStorage.setItem('test', 'test')
  localStorage.removeItem('test')
} catch (e) {
  console.warn('localStorage not available (private browsing?)')
  // Use alternative storage
}
```

---

### Issue 4: CORS error on login request

**Symptoms**:
- Browser console shows CORS error
- Error: "Access-Control-Allow-Origin header missing"
- Network tab shows 200 response but request fails
- Frontend can't read response

**Root Causes**:
1. Backend CORS not configured for frontend origin
2. Credentials not included in request
3. Custom headers not allowed
4. Backend running on different port

**Diagnostic Steps**:

```javascript
// Frontend: Check CORS headers in Network tab
// DevTools → Network → Click login request → Response Headers
// Look for: Access-Control-Allow-Origin: http://localhost:5173

// Check if credentials sent
console.log('Axios withCredentials:', api.defaults.withCredentials)

// Check browser console for CORS error
// Error message will show what's missing
```

```bash
# Backend: Check CORS configuration
# In your backend code, find CORS setup
# Should have: origins array includes frontend URL

# Example in Express:
const corsOptions = {
  origin: [
    'http://localhost:5173',      // Frontend dev
    'https://apsas.example.com'   // Production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

**Solutions**:

```typescript
// Frontend: Ensure credentials included
const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  withCredentials: true  // Important for cookie-based auth
})

// Backend: Fix CORS configuration
// Update env variable or hardcode for testing
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000'
]

const corsOptions = {
  origin: CORS_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
```

---

### Issue 5: "Email not verified" during login

**Symptoms**:
- Login succeeds for unverified accounts
- Then shows "Email not verified" error
- User redirected to email verification page
- Can't access dashboard

**Root Causes**:
1. Backend enforces email verification
2. Verification email not sent during registration
3. User missed verification email

**Solutions**:

```typescript
// Frontend: Handle email verification required
const handleLoginError = (error: AxiosError) => {
  if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
    // Show verification required page
    navigate('/verify-email-required', {
      state: { email: loginForm.email }
    })
  }
}

// Resend verification email
const handleResendVerification = async (email: string) => {
  try {
    await api.post('/api/auth/resend-verification', { email })
    showSuccess('Email xác thực đã được gửi lại')
  } catch (error) {
    showError('Không thể gửi lại email xác thực')
  }
}
```

---

### Issue 6: Account locked after multiple failed attempts

**Symptoms**:
- Multiple failed login attempts
- Account becomes locked
- "Account locked" error
- Can't login even with correct password

**Root Causes**:
1. Too many failed login attempts (typically 5+ in 15 min)
2. Account manually locked by admin
3. Security policy triggered

**Diagnostic Steps**:

```bash
# Check account lock status
psql apsas_db -c "SELECT email, locked_until FROM users WHERE email='user@example.com';"

# Check failed login attempts in logs
grep "FAILED_LOGIN" backend-logs.txt | grep "user@example.com" | tail -10
```

**Solutions**:

```bash
# Unlock account (Admin only)
psql apsas_db -c "UPDATE users SET locked_until = NULL WHERE email='user@example.com';"

# Reset failed attempts counter
psql apsas_db -c "UPDATE users SET failed_login_attempts = 0 WHERE email='user@example.com';"
```

```typescript
// Frontend: Inform user and suggest password reset
if (error.response?.data?.code === 'ACCOUNT_LOCKED') {
  showError('Tài khoản đã bị khóa tạm thời vì quá nhiều lần đăng nhập không thành công')
  showInfo('Vui lòng chờ 15 phút hoặc sử dụng "Quên mật khẩu"')
}
```

---

### Issue 7: Token rejected with "Invalid signature"

**Symptoms**:
- Login successful but API calls fail
- Error: "Invalid token" or "Invalid signature"
- 401 Unauthorized on every request

**Root Causes**:
1. JWT secret key changed on backend
2. Token corrupted in transit
3. Token tampered with on frontend
4. Backend and frontend using different secret keys

**Diagnostic Steps**:

```bash
# Verify JWT secret is same everywhere
echo $JWT_SECRET

# Decode token (don't verify signature)
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | jwt decode

# Check backend JWT config
grep -r "JWT_SECRET" backend/
grep -r "sign\|verify" backend/auth/
```

**Solutions**:

```bash
# Ensure same JWT secret in all instances
# .env file:
JWT_SECRET=your_long_random_secret_key_min_32_chars

# Frontend doesn't need JWT_SECRET (only backend)
# Frontend just stores and sends the token

# Restart backend to pick up new JWT_SECRET
docker restart apsas-backend
```

---

### Issue 8: Session conflicts (logged in as two users)

**Symptoms**:
- Multiple browser tabs/windows
- Different users logged in on each
- Switching tabs shows wrong user
- User data inconsistent

**Root Causes**:
1. localStorage shared across all tabs (normal)
2. Zustand store not in sync
3. Token from one user overwrites another

**Solutions**:

```typescript
// Frontend: Use useEffect to sync auth across tabs
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'accessToken') {
      // Token changed in another tab
      // Refresh auth store
      useAuthStore.setState({
        token: e.newValue || null,
        user: null  // Force reload on next request
      })
    }
  }
  
  window.addEventListener('storage', handleStorageChange)
  return () => window.removeEventListener('storage', handleStorageChange)
}, [])

// Or: Navigate to re-init auth
window.addEventListener('storage', () => {
  window.location.reload()  // Simple but effective
})
```

---

### Issue 9: Wrong user data after login

**Symptoms**:
- Login succeeds
- User dashboard shows wrong person's data
- User name and permissions are incorrect
- Profile email doesn't match

**Root Causes**:
1. API returning cached user data
2. Zustand store updated with stale data
3. Multiple users logged in (see Issue 8)
4. Frontend bug in response handling

**Diagnostic Steps**:

```typescript
// Frontend: Log the response data
const handleLogin = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials)
  console.log('Raw response:', response.data)  // Check what API returned
  console.log('Expected user:', credentials.email)
  console.log('Actual user:', response.data.user.email)
}
```

```bash
# Backend: Clear cache
redis-cli FLUSHDB  # If using Redis for caching

# Or restart backend
docker restart apsas-backend
```

**Solutions**:

```typescript
// Frontend: Validate response data
const handleLoginSuccess = (response: AuthResponse) => {
  // Verify response contains expected user
  if (!response.data?.user?.userId) {
    throw new Error('Invalid login response: no user data')
  }
  
  if (response.data.user.email !== loginForm.email) {
    console.warn('Email mismatch in response!')
    // Don't proceed
    throw new Error('Response email mismatch')
  }
  
  // Proceed with storing token
  storeAuthData(response.data)
}
```

---

### Issue 10: Mobile app login not working

**Symptoms**:
- Login works on web
- Login fails on mobile app
- Mobile app shows different error
- Network looks fine in mobile app logs

**Root Causes**:
1. Different API base URL on mobile
2. Certificate pinning rejecting localhost
3. Mobile device time sync issue (JWT validation)
4. Different CORS headers on mobile requests

**Diagnostic Steps**:

```typescript
// Mobile: Check API URL
console.log('API Base URL:', environment.apiBaseUrl)

// Check system time (critical for JWT)
Date.now()  // Should match server time roughly

// Check HTTPS certificate (if applicable)
// In Xcode/Android Studio, check certificate validation
```

**Solutions**:

```typescript
// Mobile: Use correct API URL
const API_BASE_URL = __DEV__
  ? 'http://192.168.1.100:8080'  // Local network IP
  : 'https://api.apsas.edu.vn'   // Production

// Disable certificate pinning in development
if (__DEV__) {
  // Allow self-signed certificates
  fetch.disableAllSecurity()  // Development only!
}

// Sync device time
// Android: Settings → Date & time → Automatic
// iOS: Settings → General → Date & Time → Set Automatically
```

---

## 📝 Registration Issues

### Issue 1: "Email already exists" for new email

**Symptoms**:
- User tries to register with new email
- Gets "Email already exists" error
- Email address is definitely not used before

**Root Causes**:
1. Email actually registered (user forgot)
2. Duplicate account created accidentally
3. Database uniqueness constraint violated
4. Race condition (two simultaneous registrations)

**Solutions**:

```bash
# Check if email exists in database
psql apsas_db -c "SELECT id, email, created_at FROM users WHERE email='user@example.com';"

# If found: User already has account
# Suggest "Forgot Password" instead of register

# If not found: Database constraint issue
# Check for non-unique indexes
psql apsas_db -c "SELECT * FROM pg_indexes WHERE tablename='users' AND indexname LIKE '%email%';"
```

---

### Issue 2: Registration succeeds but no user created

**Symptoms**:
- Registration form submits successfully
- No error message
- But user not created in database
- Frontend redirects to login

**Root Causes**:
1. Email service fails silently
2. Database transaction rolled back
3. Validation error in backend
4. Backend logs the error but frontend doesn't see it

**Solutions**:

```bash
# Check backend logs
docker logs apsas-backend | grep "register\|email" | tail -20

# Check database
psql apsas_db -c "SELECT * FROM users ORDER BY created_at DESC LIMIT 5;"

# Check email service status
# Depends on your email provider (SendGrid, AWS SES, etc.)
```

---

### Issue 3: Verification email not received

**Symptoms**:
- Registration succeeds
- "Check your email" message shown
- Email never arrives
- No email in spam folder

**Root Causes**:
1. Email service down
2. Email configuration incorrect
3. Email address typo during registration
4. Email provider rejecting mail

**Solutions**:

```bash
# Check email service status
# SendGrid: https://status.sendgrid.com
# AWS SES: https://status.aws.amazon.com

# Check email configuration
# Backend .env should have:
EMAIL_SERVICE=sendgrid  # or aws-ses, smtp, etc.
EMAIL_FROM=noreply@apsas.edu.vn
SENDGRID_API_KEY=...

# Test email service
curl -X POST http://localhost:8080/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Resend verification email (user-facing)
POST /api/auth/resend-verification
Content-Type: application/json
{ "email": "user@example.com" }
```

---

### Issue 4: Password validation too strict

**Symptoms**:
- User tries to set password
- "Password validation failed" error
- User doesn't know password requirements

**Solutions**:

```typescript
// Frontend: Show clear password requirements
const PasswordRequirements = () => (
  <ul>
    <li>Tối thiểu 8 ký tự</li>
    <li>Ít nhất một chữ hoa (A-Z)</li>
    <li>Ít nhất một chữ thường (a-z)</li>
    <li>Ít nhất một số (0-9)</li>
    <li>Không được chứa email hoặc tên người dùng</li>
  </ul>
)

// Show real-time feedback
const validatePassword = (password: string): PasswordFeedback => {
  return {
    isValid: password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password),
    feedback: [
      { met: password.length >= 8, text: '8+ ký tự' },
      { met: /[A-Z]/.test(password), text: 'Chữ hoa' },
      { met: /[a-z]/.test(password), text: 'Chữ thường' },
      { met: /\d/.test(password), text: 'Số' }
    ]
  }
}
```

---

### Issue 5: Agreement/Terms checkbox issues

**Symptoms**:
- User checks terms checkbox
- Still can't submit form
- Or: Checkbox state not saved

**Solutions**:

```typescript
// Frontend: Ensure checkbox state managed
const [agreeToTerms, setAgreeToTerms] = useState(false)

const handleSubmit = (e) => {
  e.preventDefault()
  
  if (!agreeToTerms) {
    showError('Vui lòng chấp nhận điều khoản dịch vụ')
    return
  }
  
  registerMutation.mutateAsync({
    email, password, firstName, lastName,
    agreeToTerms: true  // Send explicitly
  })
}

// Form checkbox
<label>
  <input
    type="checkbox"
    checked={agreeToTerms}
    onChange={(e) => setAgreeToTerms(e.target.checked)}
  />
  Tôi đồng ý với <a href="/terms">Điều khoản dịch vụ</a>
</label>
```

---

## 🔑 Token & Session Issues

### Issue 1: Token expires immediately

**Symptoms**:
- Just logged in
- Try to access dashboard
- Immediately get "Token expired" error
- Have to login again

**Root Causes**:
1. Token expiration time set very short (0-60 seconds)
2. Server time and client time out of sync
3. Token validation checking wrong clock

**Diagnostic Steps**:

```typescript
// Frontend: Decode token and check expiration
import jwtDecode from 'jwt-decode'

const token = localStorage.getItem('accessToken')
const decoded = jwtDecode(token)

console.log('Token expires at:', new Date(decoded.exp * 1000))
console.log('Current time:', new Date())
console.log('Time until expiration:', decoded.exp * 1000 - Date.now(), 'ms')
```

```bash
# Backend: Check token expiration configuration
grep -r "TOKEN_EXPIRATION\|EXPIRES_IN\|expiresIn" backend/

# Example:
# Should see: expiresIn: '24h' or similar

# Check backend logs for token generation
docker logs apsas-backend | grep "token\|JWT" | head -20
```

**Solutions**:

```bash
# Backend: Fix token expiration time
# .env file:
JWT_EXPIRATION=24h  # 24 hours is reasonable
REFRESH_TOKEN_EXPIRATION=7d  # 7 days

# Restart backend
docker restart apsas-backend
```

```typescript
// Frontend: Implement smart token refresh
// Refresh token when 5 minutes left before expiration
const scheduleTokenRefresh = (token: string) => {
  const decoded = jwtDecode(token)
  const expiresIn = decoded.exp * 1000 - Date.now()
  const refreshIn = expiresIn - (5 * 60 * 1000)  // Refresh 5 min early
  
  setTimeout(() => {
    refreshAccessToken()
  }, Math.max(refreshIn, 0))
}
```

---

### Issue 2: Refresh token not working

**Symptoms**:
- Access token expires
- Refresh token call fails
- User forced back to login
- Even though refresh token looks valid

**Root Causes**:
1. Refresh token also expired
2. Refresh endpoint not implemented
3. Refresh token sent incorrectly in request

**Diagnostic Steps**:

```typescript
// Frontend: Check refresh token
const refreshToken = localStorage.getItem('refreshToken')
const decoded = jwtDecode(refreshToken)
console.log('Refresh token expires:', new Date(decoded.exp * 1000))

// Check if still valid
if (decoded.exp * 1000 < Date.now()) {
  console.log('Refresh token is expired!')
  // Need to login again
}
```

```bash
# Backend: Verify refresh endpoint exists
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "..."}'

# Should return new access token, not 404
```

**Solutions**:

```typescript
// Frontend: Implement refresh with proper error handling
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (!refreshToken) {
      throw new Error('No refresh token found')
    }
    
    const response = await api.post('/api/auth/refresh', {
      refreshToken
    })
    
    const { accessToken, refreshToken: newRefreshToken } = response.data.data
    
    // Store new tokens
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', newRefreshToken)
    
    // Update axios header
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    
    return accessToken
  } catch (error) {
    // Refresh failed - user must login again
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    navigate('/login')
    throw error
  }
}
```

---

### Issue 3: Logout fails silently

**Symptoms**:
- User clicks logout
- Page looks like nothing happened
- User still logged in (token still in localStorage)
- No error message

**Root Causes**:
1. Logout API endpoint not implemented
2. Frontend not clearing localStorage after logout
3. Network request failed silently

**Solutions**:

```typescript
// Frontend: Implement proper logout
const handleLogout = async () => {
  try {
    // Call logout endpoint
    await api.post('/api/auth/logout')
  } catch (error) {
    console.warn('Logout API call failed:', error)
    // Continue with local cleanup anyway
  } finally {
    // Always clear local state
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    
    // Clear Zustand store
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false
    })
    
    // Clear axios headers
    delete api.defaults.headers.common['Authorization']
    
    // Redirect to login
    navigate('/login', { replace: true })
  }
}
```

---

### Issue 4: Token not included in requests

**Symptoms**:
- Logged in but API calls return 401
- Network tab shows request without Authorization header
- API works with manually added token in header

**Root Causes**:
1. Axios interceptor not adding token
2. Token not in localStorage
3. axios instance not configured

**Diagnostic Steps**:

```typescript
// Frontend: Check if token exists
console.log('Access token:', localStorage.getItem('accessToken'))
console.log('Axios default headers:', api.defaults.headers)

// Check interceptor
api.interceptors.request.handlers  // Check if interceptor registered
```

**Solutions**:

```typescript
// Frontend: Setup axios token interceptor
const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL
})

// Add request interceptor to inject token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Use this api instance for all requests
export default api
```

---

### Issue 5: 403 Forbidden (Insufficient permissions)

**Symptoms**:
- User is logged in
- Token is valid
- But API returns 403 Forbidden
- User doesn't have permission for endpoint

**Root Causes**:
1. User role doesn't allow access (e.g., STUDENT accessing ADMIN endpoint)
2. Permission check too strict on backend
3. User role not updated after promotion

**Diagnostic Steps**:

```typescript
// Frontend: Check user permissions
const user = useAuthStore(state => state.user)
console.log('User role:', user?.role)
console.log('User permissions:', user?.permissions)

// Verify endpoint requires this role
// Check API documentation or backend code
```

**Solutions**:

```typescript
// Frontend: Check permissions before calling API
const canAccessAdminPanel = (user) => {
  return ['ADMIN', 'INSTRUCTOR'].includes(user?.role)
}

if (!canAccessAdminPanel(user)) {
  showError('Bạn không có quyền truy cập tài nguyên này')
  navigate('/dashboard')  // Redirect to allowed area
  return
}

// Call admin API
fetchAdminData()
```

```bash
# Backend: Verify user role in database
psql apsas_db -c "SELECT email, role FROM users WHERE email='user@example.com';"

# If role is wrong, update it (admin only)
psql apsas_db -c "UPDATE users SET role='INSTRUCTOR' WHERE email='user@example.com';"
```

---

### Issue 6: Multiple simultaneous token refreshes

**Symptoms**:
- Several 401 errors trigger simultaneously
- Multiple refresh requests sent
- Race condition causing issues
- User gets logged out unexpectedly

**Solutions**:

```typescript
// Frontend: Queue token refreshes (only refresh once)
let refreshPromise: Promise<string> | null = null

const getAccessToken = async (): Promise<string> => {
  const token = localStorage.getItem('accessToken')
  
  if (isTokenValid(token)) {
    return token
  }
  
  // If already refreshing, wait for it
  if (refreshPromise) {
    return refreshPromise
  }
  
  // Start refresh
  refreshPromise = refreshAccessToken().finally(() => {
    refreshPromise = null
  })
  
  return refreshPromise
}

// Axios interceptor using getAccessToken
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken()
  config.headers.Authorization = `Bearer ${token}`
  return config
})
```

---

### Issue 7: Token persists after logout

**Symptoms**:
- User logs out
- Closes browser
- Reopens browser
- User is logged back in with old token
- Security issue!

**Root Causes**:
1. Logout doesn't blacklist token on backend
2. Frontend clears localStorage but token cached elsewhere
3. Token stored in multiple locations

**Solutions**:

```typescript
// Frontend: Clear all storage locations on logout
const handleLogout = async () => {
  try {
    await api.post('/api/auth/logout')
  } finally {
    // Clear localStorage
    localStorage.clear()
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Clear cookies (if used)
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })
    
    // Clear Zustand
    useAuthStore.setState({ user: null, token: null })
    
    // Navigate
    navigate('/login')
  }
}

// Backend: Blacklist token on logout
// Use Redis or database to store invalid tokens
// Check on every request if token is blacklisted
```

---

### Issue 8: JWT decode fails or shows wrong data

**Symptoms**:
- jwt_decode() throws error
- Decoded token shows strange data
- Token looks corrupted

**Solutions**:

```typescript
// Frontend: Safe JWT decode
const safeDecodeToken = (token: string) => {
  try {
    return jwtDecode(token)
  } catch (error) {
    console.error('Failed to decode token:', error)
    // Token is malformed
    localStorage.removeItem('accessToken')
    return null
  }
}

// Validate token format before decoding
const isValidTokenFormat = (token: string): boolean => {
  // JWT has 3 parts separated by dots
  const parts = token.split('.')
  return parts.length === 3
}

// Use it
if (isValidTokenFormat(token)) {
  const decoded = jwtDecode(token)
  console.log('Token valid:', decoded)
}
```

---

## 🔒 Permission & Access Issues

### Issue 1: User can't access their own profile

**Symptoms**:
- Logged in user
- Try to access GET /api/v1/users/me
- Returns 403 Forbidden
- Or shows someone else's profile

**Root Causes**:
1. /me endpoint not implemented
2. User ID mismatch
3. Permission check broken

**Solutions**:

```typescript
// Frontend: Always use /api/auth/me or /api/v1/users/me
const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/v1/users/me')
    return response.data.data
  } catch (error) {
    // Not authenticated
    navigate('/login')
  }
}

// Backend: Implement /me endpoint
app.get('/api/v1/users/me', authenticateToken, (req, res) => {
  // req.user is set by authenticateToken middleware
  const user = req.user
  res.json({
    success: true,
    data: {
      userId: user.id,
      email: user.email,
      // ... other fields
    }
  })
})
```

---

### Issue 2: Admin endpoints returning 403

**Symptoms**:
- Admin user trying to access /api/v1/users
- Returns 403 Forbidden
- But user's role shows ADMIN

**Root Causes**:
1. User role in token doesn't match database
2. Token generated before role change
3. Permission check using wrong field

**Solutions**:

```bash
# Backend: Check permission implementation
# Should check: user.role === 'ADMIN' or user.roles.includes('ADMIN')

# Admin user should re-login to get new token with updated role
# Or manually clear and regenerate token
```

```typescript
// Frontend: Force re-login after role change
// When user is promoted to admin
const handleRoleChange = () => {
  showInfo('Role updated. Please login again for changes to take effect.')
  
  // Force logout and re-login
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  navigate('/login')
}
```

---

### Issue 3: Role-based route guards not working

**Symptoms**:
- STUDENT user accesses /admin panel
- Should be redirected but isn't
- /admin page loads (security issue!)

**Solutions**:

```typescript
// Frontend: Implement ProtectedRoute guard
const ProtectedRoute = ({ 
  element, 
  requiredRoles 
}: {
  element: ReactNode
  requiredRoles: string[]
}) => {
  const user = useAuthStore(state => state.user)
  
  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  // Wrong role
  if (!requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  // Correct role
  return element
}

// Usage in router
const router = createBrowserRouter([
  {
    path: '/admin',
    element: (
      <ProtectedRoute 
        element={<AdminPanel />}
        requiredRoles={['ADMIN']}
      />
    )
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute 
        element={<Dashboard />}
        requiredRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}
      />
    )
  }
])
```

---

### Issue 4: Permission check in backend not enforcing

**Symptoms**:
- Endpoint should require ADMIN
- Any logged-in user can call it
- Security vulnerability!

**Solutions**:

```typescript
// Backend: Implement permission middleware
const requireRole = (roles: string[]) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' })
  }
  
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' })
  }
  
  next()
}

// Usage
app.get('/api/v1/users', requireRole(['ADMIN']), getAllUsers)
app.post('/api/v1/users', requireRole(['ADMIN']), createUser)
```

---

### Issue 5: Permission denied after permission grant

**Symptoms**:
- Admin gives user new permission
- User still can't access resource
- Old permission check still cached

**Solutions**:

```typescript
// Frontend: Refresh permissions after update
const handlePermissionChange = async (userId: string) => {
  // Wait for backend to process
  await new Promise(r => setTimeout(r, 500))
  
  // If updated current user, re-fetch
  if (userId === useAuthStore.getState().user?.userId) {
    const user = await getCurrentUser()
    useAuthStore.setState({ user })
  }
}

// Or: Force re-login for permission refresh
// Most reliable way
```

```bash
# Backend: Clear permission cache
redis-cli DEL "permissions:*"  # If using Redis
```

---

### Issue 6: API version mismatch (v1 vs no version)

**Symptoms**:
- Some endpoints work
- Others return 404
- Different endpoint paths used

**Solutions**:

```typescript
// Frontend: Use consistent API paths
// Use one version consistently
const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/v1/users/me',           // Uses v1
  ALL_USERS: '/api/v1/users',       // Uses v1
  UPDATE_PROFILE: '/api/v1/users/me', // Uses v1
} as const

// Backend: Version all endpoints consistently
// Option 1: All v1
app.post('/api/v1/auth/login', handleLogin)
app.get('/api/v1/users/me', getMe)

// Option 2: Auth unversioned, others v1
app.post('/api/auth/login', handleLogin)
app.get('/api/v1/users/me', getMe)

// Document which version is used where
```

---

## 🌐 Network & API Issues

### Issue 1: CORS error: "No 'Access-Control-Allow-Origin' header"

**Symptoms**:
- Browser console error
- "Access-Control-Allow-Origin header is missing"
- Frontend can't read response
- Status code shows 200 but request fails

**Root Causes**:
1. Backend CORS not configured
2. CORS doesn't include frontend origin
3. Credentials not sent/allowed

**Solutions** (see [CORS Configuration](#cors--headers) earlier)

---

### Issue 2: 504 Gateway Timeout

**Symptoms**:
- API returns 504 Gateway Timeout
- Request hangs for 60+ seconds
- Then fails

**Root Causes**:
1. Backend service crashed
2. Database connection pool exhausted
3. Slow query taking too long
4. Network proxy timeout

**Solutions**:

```bash
# Check backend service
curl -i http://localhost:8080/api/auth/me

# If no response, backend is down
docker ps | grep apsas-backend
docker logs apsas-backend

# Restart backend
docker restart apsas-backend

# Check database
psql -h localhost apsas_db -c "SELECT 1"

# Check for slow queries
docker logs apsas-backend | grep "slow\|duration"
```

---

### Issue 3: Connection refused on localhost

**Symptoms**:
- Frontend tries to reach localhost:8080
- "Connection refused"
- Backend not running

**Solutions**:

```bash
# Start backend service
docker-compose up apsas-backend

# Or if not using Docker
npm run start:backend

# Verify it's running
curl http://localhost:8080/api/auth/health

# Should return 200
```

---

### Issue 4: Mixed HTTP/HTTPS content warning

**Symptoms**:
- Frontend loaded over HTTPS
- Tries to call backend over HTTP
- Browser blocks request
- "Mixed content" warning

**Solutions**:

```typescript
// Frontend: Always use HTTPS in production
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.apsas.edu.vn'  // HTTPS
  : 'http://localhost:8080'      // HTTP for dev

// Or use protocol-relative URLs
const API_BASE_URL = '//api.apsas.edu.vn/api'  // Uses page protocol
```

```bash
# Backend: Enforce HTTPS
# Set in .env or .htaccess
FORCE_HTTPS=true
```

---

### Issue 5: API responds with HTML instead of JSON

**Symptoms**:
- API returns 200 but response is HTML
- JSON.parse fails on HTML
- Network tab shows response is HTML error page

**Root Causes**:
1. Wrong endpoint URL (hitting static file or 404 page)
2. Backend error page returned instead of JSON
3. Request routed to wrong service

**Diagnostic Steps**:

```javascript
// Frontend: Check response in network tab
// Should see: Content-Type: application/json
// Not: Content-Type: text/html

// If HTML returned:
console.log('Response:', response.text())  // View HTML
```

**Solutions**:

```bash
# Verify correct API endpoint
curl -i http://localhost:8080/api/auth/login

# Should return JSON, not HTML

# Check backend routing
# Make sure endpoint is registered correctly
```

---

### Issue 6: Rate limit hit (429 Too Many Requests)

**Symptoms**:
- API returns 429 Too Many Requests
- "Rate limited" error
- Multiple requests sent in short time

**Diagnostic Steps**:

```javascript
// Check rate limit headers
console.log(response.headers['X-RateLimit-Remaining'])
console.log(response.headers['X-RateLimit-Reset'])
```

**Solutions**:

```typescript
// Frontend: Implement exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = parseInt(
          error.response.headers['X-RateLimit-Retry-After'] || '60'
        )
        
        if (attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, retryAfter * 1000))
        }
      } else {
        throw error
      }
    }
  }
}

// Use it
retryWithBackoff(() => api.post('/api/auth/login', credentials))
```

---

### Issue 7: Network request timing out randomly

**Symptoms**:
- Sometimes requests work fine
- Sometimes timeout after 10-30 seconds
- Inconsistent behavior
- Works on different machine/network

**Root Causes**:
1. Unstable network connection
2. Proxy/firewall dropping connections
3. Too many concurrent requests
4. Memory leak causing slowness

**Solutions**:

```typescript
// Frontend: Implement retry with exponential backoff
const createAxiosInstance = () => {
  const api = axios.create({
    timeout: 15000,  // 15 seconds
    timeoutErrorMessage: 'Yêu cầu vượt quá thời gian chờ'
  })
  
  // Retry on timeout
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.code === 'ECONNABORTED') {
        // Timeout - retry once
        return api.request(error.config)
      }
      return Promise.reject(error)
    }
  )
  
  return api
}
```

---

## ✉️ Email & Verification Issues

### Issue 1: Verification email not received

**Symptoms**:
- Registration completes
- "Check your email" message shown
- Email never arrives

(See [Registration Issues](#registration-issues) Issue 3 for full details)

---

### Issue 2: Verification link doesn't work

**Symptoms**:
- Email received with link
- Click link → shows error
- "Invalid token" or "Token expired"

**Root Causes**:
1. Link has typo or corrupted
2. Token in database doesn't match token in link
3. Token expired (usually 24-48 hours)

**Solutions**:

```typescript
// Frontend: Handle verification errors
const handleVerifyEmail = async (token: string) => {
  try {
    await api.post('/api/auth/verify-email', { token })
    showSuccess('Email xác thực thành công!')
    navigate('/login')
  } catch (error) {
    if (error.response?.data?.code === 'INVALID_TOKEN') {
      showError('Liên kết xác thực không hợp lệ hoặc đã hết hạn')
      showAction('Yêu cầu link mới:', () => {
        navigate('/resend-verification', { state: { email: userEmail } })
      })
    }
  }
}

// Resend verification
const handleResendVerification = async (email: string) => {
  await api.post('/api/auth/resend-verification', { email })
  showSuccess('Link xác thực mới đã được gửi')
}
```

---

### Issue 3: Password reset email not working

**Symptoms**:
- Click "Forgot Password"
- Enter email
- No email received
- Or email has invalid link

(Similar to verification email issues - see [Registration Issues](#registration-issues))

---

### Issue 4: Email verification required but user wants to skip

**Symptoms**:
- User doesn't want to verify email
- Wants to use account immediately
- Shows error "Email not verified"

**Backend Policy Decision**:

```typescript
// Backend: Decide if email verification is mandatory
// Option 1: Mandatory (current policy)
if (!user.emailVerified) {
  return res.status(422).json({
    code: 'EMAIL_NOT_VERIFIED',
    message: 'Please verify your email first'
  })
}

// Option 2: Optional (allow without verification)
// Remove the check above - user can login immediately

// Option 3: Lazy verification (allow but remind)
// User can use account but show banner to verify
```

---

## 🔧 Debugging Tools & Techniques

### 1. Browser DevTools Inspection

```javascript
// Console tab
// Check stored data
localStorage.getItem('accessToken')
localStorage.getItem('user')

// Check Zustand store
import { useAuthStore } from '@/stores/auth'
useAuthStore.getState()

// Decode token
import jwtDecode from 'jwt-decode'
const token = localStorage.getItem('accessToken')
jwtDecode(token)

// Check current user
fetch('/api/v1/users/me', {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json()).then(console.log)
```

```javascript
// Network tab
// Look for failed requests
// Right-click → Copy as cURL to replay

// Check headers
// Authorization: Bearer <token>
// Content-Type: application/json
```

### 2. Backend Logging

```bash
# Check logs
docker logs apsas-backend -f

# Filter for errors
docker logs apsas-backend | grep -i error

# Check specific user
docker logs apsas-backend | grep "user@example.com"
```

### 3. Database Inspection

```bash
# Check user in database
psql apsas_db -c "SELECT id, email, role, is_active, email_verified FROM users WHERE email='user@example.com';"

# Check login history
psql apsas_db -c "SELECT * FROM login_history WHERE user_id='...' ORDER BY created_at DESC LIMIT 10;"

# Check for locks
psql apsas_db -c "SELECT * FROM users WHERE locked_until > NOW();"
```

### 4. cURL Testing

```bash
# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# Test with token
TOKEN="eyJ..."
curl -X GET http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"

# Save response to file
curl -X GET http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -o response.json
```

---

## 🚨 Emergency Procedures

### Emergency 1: All users locked out

**Situation**: Every user getting "Account locked" error

**Quick Fix**:
```bash
# Unlock all accounts
psql apsas_db -c "UPDATE users SET locked_until = NULL, failed_login_attempts = 0;"

# Restart backend to clear cache
docker restart apsas-backend
```

### Emergency 2: Backend not responding

**Situation**: API completely down, users can't login

**Quick Fix**:
```bash
# Check if service running
docker ps | grep apsas-backend

# If not, start it
docker-compose up apsas-backend -d

# If running but not responding
docker logs apsas-backend  # Check logs for errors
docker restart apsas-backend

# If still not working, rollback to previous version
docker-compose down
git checkout previous-commit
docker-compose up -d
```

### Emergency 3: Security breach (tokens compromised)

**Situation**: Suspect tokens have been exposed

**Quick Fix**:
```bash
# Invalidate all tokens
redis-cli FLUSHDB  # Clear token cache

# Change JWT secret (this will force re-login for all)
# Update .env
JWT_SECRET=new_long_random_secret_key

# Restart backend
docker restart apsas-backend

# All users must login again
```

### Emergency 4: Database connection lost

**Situation**: Database down, users can't login

**Quick Fix**:
```bash
# Check database
docker ps | grep postgres

# If not running, start it
docker-compose up postgres -d

# If running, check logs
docker logs apsas-postgres

# Connect and verify
psql -h localhost apsas_db -c "SELECT 1"

# If connection pool exhausted, restart backend
docker restart apsas-backend
```

---

## ❓ FAQ & Common Solutions

### Q: How long do JWT tokens last?

**A**: Configured by backend (typically 24 hours for access token, 7 days for refresh token). Check backend `.env` for `JWT_EXPIRATION`.

### Q: Can I use the same account on multiple devices?

**A**: Yes, token is independent of device. But other users can't use same account simultaneously (only one token valid at a time unless backend allows multiple).

### Q: What happens if I lose my refresh token?

**A**: You'll be logged out automatically when access token expires. You'll need to login again.

### Q: Can passwords be reset without email?

**A**: No, security feature. If you can't access email, contact support (admin can reset manually).

### Q: Why does my session keep ending?

**A**: Access token expired and refresh failed. Refresh token might also be expired. Login again.

### Q: Can I change my email address?

**A**: Not standard feature. Contact admin to change email in database (admin access needed).

### Q: What's the difference between "403 Forbidden" and "401 Unauthorized"?

**A**: 
- **401**: You're not authenticated (no token or token invalid) - go to login
- **403**: You're authenticated but don't have permission - insufficient access level

### Q: How do I know if my account is locked?

**A**: You'll see "Account locked" error when trying to login. Contact admin to unlock or try after 15 minutes.

### Q: Can I use the API with username instead of email?

**A**: No, API only supports email/password login. Email is primary identifier.

### Q: What happens after I logout?

**A**: Your token is blacklisted (can't be used anymore). You're redirected to login page. All local data cleared.

---

**Last Updated**: October 19, 2025  
**Version**: 2.0  
**Maintained By**: APSAS Support & Engineering Team  
**For Critical Issues**: backend-team@apsas.local