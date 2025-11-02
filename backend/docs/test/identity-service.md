# Identity Service Integration Tests

## Overview

The Identity Service contains comprehensive integration tests covering both authentication and user
management endpoints. All 35 tests pass successfully with a real PostgreSQL database (via
Testcontainers) and real HTTP server using `WebTestClient`.

### Quick Summary

| Metric         | Value                        |
|----------------|------------------------------|
| Total Tests    | 35                           |
| Auth Endpoints | 6                            |
| User Endpoints | 10                           |
| Pass Rate      | **100%** ✅                   |
| Test Framework | JUnit 5 + Kotlin             |
| Database       | Testcontainers PostgreSQL 17 |
| Messaging      | Testcontainers RabbitMQ 4.1  |
| Test Duration  | ~37-46 seconds               |

### Test Breakdown

| Category               | Endpoints                                         | Tests        | Status     |
|------------------------|---------------------------------------------------|--------------|------------|
| **Authentication**     | POST /auth/* (6 endpoints)                        | 15           | ✅ All Pass |
| **Profile Management** | GET/PUT /users/me, POST /users/me/* (3 endpoints) | 6            | ✅ All Pass |
| **User Management**    | GET/POST/PUT/DELETE /users* (7 endpoints)         | 14           | ✅ All Pass |
| **TOTAL**              | **16 Endpoints**                                  | **35 Tests** | **✅ 100%** |

---

## Testing Approach

All 35 tests run against a **real live environment** including:

- **Actual database** - PostgreSQL validates data is stored correctly
- **Real message broker** - RabbitMQ confirms notifications are triggered
- **Live HTTP server** - Verifies endpoints route requests properly

This ensures tests validate the system exactly as it runs in production.

---

## Authentication Controller Tests

### POST /api/auth/register

| Test Case                      | Input                                                          | Expected Output                                                 | Notes                                                      |
|--------------------------------|----------------------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------|
| Register new user successfully | Valid email (`newuser@example.com`), password (`Password123!`) | **201 Created** - JWT token, user with `isEmailVerified: false` | Verification email sent via RabbitMQ event                 |
| Reject - duplicate email       | Email that already exists in database                          | **400 Bad Request**                                             | Unique email constraint                                    |
| Reject - invalid email format  | Malformed email (`invalid-email`)                              | **400 Bad Request**                                             | Spring `@Email` validator enforces RFC 5322                |
| Reject - weak password         | Password not meeting requirements (`weak`)                     | **400 Bad Request**                                             | Min 8 chars, uppercase + lowercase + number + special char |

---

### POST /api/auth/login

| Test Case                    | Setup                                    | Input                                        | Expected Output                   | Notes                                        |
|------------------------------|------------------------------------------|----------------------------------------------|-----------------------------------|----------------------------------------------|
| Login with valid credentials | Create verified user                     | Email + correct password                     | **200 OK** - JWT token, user data | Token usable for authenticated endpoints     |
| Login with unverified email  | Create unverified user                   | Email + correct password                     | **200 OK** - JWT token            | Email verification optional for login        |
| Reject - invalid credentials | Create user with password `Password123!` | Email + wrong password (`WrongPassword123!`) | **401 Unauthorized**              | Generic message for security                 |
| Reject - non-existent email  | No user created                          | Non-existent email + any password            | **401 Unauthorized**              | Generic message to prevent email enumeration |

---

### POST /api/auth/verify-email

| Test Case                     | Setup                  | Input                    | Expected Output                            | Notes                                         |
|-------------------------------|------------------------|--------------------------|--------------------------------------------|-----------------------------------------------|
| Verify email with valid token | Create unverified user | Valid verification token | **200 OK** - `"message": "...verified..."` | Database: `isEmailVerified` changes to `true` |
| Reject - invalid token        | No user setup          | Invalid/expired token    | **400 Bad Request**                        | Token validation on backend                   |

---

### POST /api/auth/resend-verification

| Test Case                  | Setup                                                  | Input         | Expected Output                        | Notes                            |
|----------------------------|--------------------------------------------------------|---------------|----------------------------------------|----------------------------------|
| Resend for unverified user | Create unverified user with email `resend@example.com` | Email address | **200 OK** - `"message": "...sent..."` | New verification token generated |
| Reject - already verified  | Create verified user with email `verified@example.com` | Email address | **400 Bad Request**                    | User already verified            |

---

### POST /api/auth/forgot-password

| Test Case                   | Setup                                               | Input              | Expected Output                        | Notes                                    |
|-----------------------------|-----------------------------------------------------|--------------------|----------------------------------------|------------------------------------------|
| Request password reset      | Create verified user with email `reset@example.com` | Email address      | **200 OK** - `"message": "...sent..."` | Reset token sent via email               |
| Reject - non-existent email | No user setup                                       | Non-existent email | **404 Not Found**                      | Reveals email doesn't exist in this test |

---

### POST /api/auth/reset-password

| Test Case                       | Setup                | Process                                                                                              | Input                                | Expected Output                            | Notes                                                    |
|---------------------------------|----------------------|------------------------------------------------------------------------------------------------------|--------------------------------------|--------------------------------------------|----------------------------------------------------------|
| Reset password with valid token | Create verified user | 1. Request reset (generates token)<br>2. Use token to set new password<br>3. Login with new password | Valid reset token + new password     | **200 OK** on reset<br>**200 OK** on login | Multi-step validation: password reset + successful login |
| Reject - invalid token          | Create verified user | Request reset to get valid token, then provide different token                                       | Invalid/expired token + new password | **400 Bad Request**                        | Token validation before password update                  |

---

## User Controller Tests

### GET /api/v1/users/me

| Test Case                     | Setup                                        | Authentication             | Expected Output                                     | Verification                     |
|-------------------------------|----------------------------------------------|----------------------------|-----------------------------------------------------|----------------------------------|
| Get current user profile      | Create user with email `student@example.com` | Principal with user's UUID | **200 OK** - User data (email, firstName, lastName) | Response contains matching email |
| Reject without authentication | No user created                              | No Authorization header    | **403 Forbidden**                                   | No user data in response         |

---

### PUT /api/v1/users/me

| Test Case                     | Setup                                               | Input                                                      | Authentication             | Expected Output                | Verification                                 |
|-------------------------------|-----------------------------------------------------|------------------------------------------------------------|----------------------------|--------------------------------|----------------------------------------------|
| Update current user profile   | Create user with firstName: `Old`, lastName: `Name` | firstName: `UpdatedFirstName`, lastName: `UpdatedLastName` | Principal with user's UUID | **200 OK** - Updated user data | Response contains new firstName and lastName |
| Reject without authentication | No setup                                            | Update request body                                        | No Authorization header    | **403 Forbidden**              | No data modified                             |

---

### POST /api/v1/users/me/change-password

| Test Case                              | Setup                                           | Input                                                                | Authentication             | Expected Output                                | Verification                     |
|----------------------------------------|-------------------------------------------------|----------------------------------------------------------------------|----------------------------|------------------------------------------------|----------------------------------|
| Change password with correct current   | Create user with password `OldPassword123!`     | currentPassword: `OldPassword123!`, newPassword: `NewPassword123!`   | Principal with user's UUID | **200 OK** - `"message": "...successfully..."` | User can login with new password |
| Reject with incorrect current password | Create user with password `CorrectPassword123!` | currentPassword: `WrongPassword123!`, newPassword: `NewPassword123!` | Principal with user's UUID | **401 Unauthorized**                           | Password unchanged in database   |

---

### GET /api/v1/users/{id}

| Test Case               | Setup                        | User Role | Target User | Expected Output   | Response Body                                            |
|-------------------------|------------------------------|-----------|-------------|-------------------|----------------------------------------------------------|
| Get user by ID as admin | Create admin + target user   | ADMIN     | Any user    | **200 OK**        | User full details (id, email, firstName, lastName, role) |
| Reject as non-admin     | Create student + target user | STUDENT   | Any user    | **403 Forbidden** | Empty/error only                                         |

---

### GET /api/v1/users

| Test Case              | Setup                                    | User Role | Query Params     | Expected Output   | Response Body                                                          |
|------------------------|------------------------------------------|-----------|------------------|-------------------|------------------------------------------------------------------------|
| Get all users as admin | Create admin + 2 regular users (3 total) | ADMIN     | `page=0&size=10` | **200 OK**        | PageResponse: content array (3 users), totalElements: 3, totalPages: 1 |
| Reject as non-admin    | Create student                           | STUDENT   | (any)            | **403 Forbidden** | Error response                                                         |

---

### GET /api/v1/users/role/{role}

| Test Case         | Setup                                                    | User Role  | Query Params                  | Filter  | Expected Output   | Response Body                                              |
|-------------------|----------------------------------------------------------|------------|-------------------------------|---------|-------------------|------------------------------------------------------------|
| Get users by role | Create instructor + 2 students + 2 instructors (5 total) | INSTRUCTOR | `role=STUDENT&page=0&size=10` | STUDENT | **200 OK**        | PageResponse: content array (2 students), totalElements: 2 |
| Reject as student | Create student                                           | STUDENT    | (any)                         | (any)   | **403 Forbidden** | Error response                                             |

---

### POST /api/v1/users

| Test Case            | Setup                  | User Role  | Input                                            | Expected Output   | Response Body                                                       |
|----------------------|------------------------|------------|--------------------------------------------------|-------------------|---------------------------------------------------------------------|
| Create user as admin | Create admin user      | ADMIN      | email: `newuser@example.com`, role: `INSTRUCTOR` | **201 Created**   | New user data (id, email, role: INSTRUCTOR, isEmailVerified: false) |
| Reject as non-admin  | Create instructor user | INSTRUCTOR | User creation request                            | **403 Forbidden** | Error response                                                      |

---

### PUT /api/v1/users/{id}/deactivate

| Test Case                | Setup                           | User Role  | Target User  | Expected Output   | Database Verification             |
|--------------------------|---------------------------------|------------|--------------|-------------------|-----------------------------------|
| Deactivate user as admin | Create admin + target user      | ADMIN      | Regular user | **200 OK**        | Target user: `isActive = false`   |
| Reject as non-admin      | Create instructor + target user | INSTRUCTOR | Regular user | **403 Forbidden** | Target user: `isActive` unchanged |

---

### PUT /api/v1/users/{id}/activate

| Test Case                 | Setup                                             | User Role | Target User Initial State | Expected Output | Database Verification          |
|---------------------------|---------------------------------------------------|-----------|---------------------------|-----------------|--------------------------------|
| Activate deactivated user | Create admin + deactivated user (isActive: false) | ADMIN     | Deactivated user          | **200 OK**      | Target user: `isActive = true` |

---

### DELETE /api/v1/users/{id}

| Test Case            | Setup                           | User Role  | Target User  | Expected Output   | Database Verification                  |
|----------------------|---------------------------------|------------|--------------|-------------------|----------------------------------------|
| Delete user as admin | Create admin + target user      | ADMIN      | Regular user | **200 OK**        | Target user deleted (not exists in DB) |
| Reject as non-admin  | Create instructor + target user | INSTRUCTOR | Regular user | **403 Forbidden** | Target user still exists in DB         |

---

## Role-Based Access Control Matrix

### Access Control Summary

| Endpoint                  | Method | Anonymous | Student | Instructor | Admin | Notes                        |
|---------------------------|--------|-----------|---------|------------|-------|------------------------------|
| /auth/register            | POST   | ✅         | ✅       | ✅          | ✅     | Public endpoint              |
| /auth/login               | POST   | ✅         | ✅       | ✅          | ✅     | Public endpoint              |
| /auth/verify-email        | POST   | ✅         | ✅       | ✅          | ✅     | Public endpoint              |
| /auth/resend-verification | POST   | ✅         | ✅       | ✅          | ✅     | Public endpoint              |
| /auth/forgot-password     | POST   | ✅         | ✅       | ✅          | ✅     | Public endpoint              |
| /auth/reset-password      | POST   | ✅         | ✅       | ✅          | ✅     | Public endpoint              |
| /users/me                 | GET    | ❌         | ✅       | ✅          | ✅     | Requires authentication      |
| /users/me                 | PUT    | ❌         | ✅       | ✅          | ✅     | Can only update own profile  |
| /users/me/change-password | POST   | ❌         | ✅       | ✅          | ✅     | Can only change own password |
| /users/{id}               | GET    | ❌         | ❌       | ❌          | ✅     | Admin only                   |
| /users                    | GET    | ❌         | ❌       | ❌          | ✅     | Admin only                   |
| /users/role/{role}        | GET    | ❌         | ❌       | ✅          | ✅     | Instructor+ can query roles  |
| /users                    | POST   | ❌         | ❌       | ❌          | ✅     | Admin only                   |
| /users/{id}/deactivate    | PUT    | ❌         | ❌       | ❌          | ✅     | Admin only                   |
| /users/{id}/activate      | PUT    | ❌         | ❌       | ❌          | ✅     | Admin only                   |
| /users/{id}               | DELETE | ❌         | ❌       | ❌          | ✅     | Admin only                   |

---

### Test Count by Category

| Category                | Endpoint Count   | Test Count   | Pass Rate  |
|-------------------------|------------------|--------------|------------|
| Authentication          | 6 endpoints      | 15 tests     | ✅ 100%     |
| Profile Management      | 3 endpoints      | 6 tests      | ✅ 100%     |
| User Management (Admin) | 7 endpoints      | 14 tests     | ✅ 100%     |
| **Total**               | **16 endpoints** | **35 tests** | **✅ 100%** |

---

## What Tests Validate

The 35 tests verify:

- ✅ **Registration & Login** - Users can create accounts and authenticate
- ✅ **Email Workflows** - Verification emails sent and verified correctly
- ✅ **Password Reset** - Users can recover accounts via email token
- ✅ **Profile Management** - Users can view and update their information
- ✅ **User Administration** - Admins can manage user accounts and roles
- ✅ **Access Control** - Role-based permissions properly enforced
- ✅ **Data Persistence** - Changes are saved to the database
- ✅ **Event Publishing** - Notifications triggered for user actions

---

## Error Response Format

All errors follow RFC 9457 Problem Detail format (configured in `GlobalExceptionHandler`):

```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Invalid email format",
  "instance": "/api/auth/register"
}
```

---

## Running the Tests

### Commands

| Task                   | Command                                                                                                              | Expected Result                 |
|------------------------|----------------------------------------------------------------------------------------------------------------------|---------------------------------|
| **Run all tests**      | `./amper test -m identity`                                                                                           | 35 tests pass in ~37-46 seconds |
| **Run specific class** | `./amper test -m identity --test-class UserControllerIntegrationTest`                                                | 20 user tests pass              |
| **Run specific test**  | `./amper test -m identity --test-class UserControllerIntegrationTest --test-method "should get user by id as admin"` | Single test passes              |

### Test Output Format

```
Test run finished after 37701 ms
[        21 containers found      ]
[         0 containers skipped    ]
[        21 containers started    ]
[        35 tests found           ]
[        35 tests started         ]
[        35 tests successful      ]  ✅ All PASS
[         0 tests failed          ]
```

---

## Test Infrastructure

### Testcontainers Services

| Service           | Image                  | Port   | Purpose                            | Auto-Cleanup      |
|-------------------|------------------------|--------|------------------------------------|-------------------|
| **PostgreSQL**    | postgres:17-alpine     | 5432   | Real database for data persistence | ✅ Each test class |
| **RabbitMQ**      | rabbitmq:4.1-alpine    | 5672   | Message broker for RabbitMQ events | ✅ Each test class |
| **Tomcat Server** | Embedded (Spring Boot) | Random | Real servlet container for HTTP    | ✅ Each test class |

### Cleanup Strategy

Each test automatically cleans up after execution:

```kotlin
@AfterTest
fun cleanup() {
    emailVerificationTokenRepository.deleteAll()
    passwordResetTokenRepository.deleteAll()
    testDataHelper.cleanupAll()  // Clears all test users
}
```

Benefits:

- ✅ Test isolation (no side effects between tests)
- ✅ Fresh database state for each test
- ✅ Reliable and repeatable results
- ✅ Prevents UUID/email conflicts in subsequent tests

---

## Troubleshooting

| Issue                    | Solution                                                      |
|--------------------------|---------------------------------------------------------------|
| Tests fail to start      | Ensure Docker Desktop is running                              |
| Tests timeout            | Database/message broker may be slow; retry typically succeeds |
| Unexpected test failures | Verify Docker containers are healthy                          |

---

## Error Response Codes

| HTTP Status | Meaning               | Example                                       |
|-------------|-----------------------|-----------------------------------------------|
| **200**     | Success               | Login successful, profile updated             |
| **201**     | Created               | User registered successfully                  |
| **400**     | Validation failed     | Invalid email, weak password, duplicate email |
| **401**     | Authentication failed | Wrong password, invalid token                 |
| **403**     | Not authorized        | Student trying to access admin endpoint       |
| **404**     | Not found             | User ID doesn't exist                         |

---

## Test Data

Tests use realistic scenarios including:

- ✅ Valid email addresses and strong passwords
- ✅ Different user roles (Student, Instructor, Admin)
- ✅ Invalid data (malformed emails, weak passwords) to verify error handling
- ✅ Edge cases (duplicate emails, non-existent users)

---

## Adding New Tests

When new endpoints are added, tests should follow this approach:

1. **Create test data** - Set up a test user with appropriate role
2. **Make HTTP request** - Call the endpoint with proper authentication
3. **Verify response** - Confirm correct HTTP status and data returned
4. **Verify side effects** - Ensure changes are saved to the database
5. **Test access control** - Verify only authorized roles can access

Tests should cover both success scenarios and error cases (invalid input, permission denied, etc.)

---

## Summary

✅ **35 Integration Tests** covering authentication (6 endpoints) and user management (10 endpoints)

✅ **100% Pass Rate** with comprehensive error scenarios and role-based access control

✅ **Real Infrastructure** - Tests run against live database and message broker (not mocked)

✅ **Role-Based Access Control** validated across all 16 endpoints

✅ **Production-Ready** validation of authentication flows, user management, and data persistence
