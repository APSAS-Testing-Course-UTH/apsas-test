# Support Service Integration Tests

## Overview

The Support Service contains comprehensive integration tests covering real-time chat and session
management endpoints. All 25 tests pass successfully with a real PostgreSQL database (via
Testcontainers) and real HTTP server using `WebTestClient`.

### Quick Summary

| Metric         | Value                        |
|----------------|------------------------------|
| Total Tests    | 25                           |
| REST Endpoints | 4                            |
| Test Groups    | 6                            |
| Pass Rate      | **100%** ✅                   |
| Test Framework | JUnit 5 + Kotlin             |
| Database       | Testcontainers PostgreSQL 17 |
| Test Duration  | ~34 seconds                  |

### Test Breakdown

| Category              | Endpoints                                          | Tests        | Status     |
|-----------------------|----------------------------------------------------|--------------|------------|
| **Session Listing**   | GET /support/sessions                              | 4            | ✅ All Pass |
| **Session Retrieval** | GET /support/sessions/{id}                         | 5            | ✅ All Pass |
| **Session Creation**  | POST /support/sessions                             | 5            | ✅ All Pass |
| **Session Closure**   | POST /support/sessions/{id}/close                  | 6            | ✅ All Pass |
| **Access Control**    | Authentication and authorization tests             | 3            | ✅ All Pass |
| **Response Format**   | HTTP status codes and pagination format validation | 2            | ✅ All Pass |
| **TOTAL**             | **4 Endpoints**                                    | **25 Tests** | **✅ 100%** |

---

## Testing Approach

All 25 tests run against a **real live environment** including:

- **Actual database** - PostgreSQL validates session and message data is stored correctly
- **Live HTTP server** - Verifies endpoints route requests properly and return correct responses
- **Real authentication** - JWT and principal context handled authentically

This ensures tests validate the system exactly as it runs in production.

---

## REST API Tests

### GET /api/v1/support/sessions

**Purpose**: List all support sessions with pagination and role-based filtering

| Test Case                            | Setup                                          | User Role  | Query Params    | Expected Output | Response Body                                              |
|--------------------------------------|------------------------------------------------|------------|-----------------|-----------------|------------------------------------------------------------|
| Get paginated sessions as instructor | Create 2 sessions from different students      | INSTRUCTOR | page=0, size=10 | **200 OK**      | PageResponse: 2 sessions, totalElements: 2, totalPages: 1  |
| Get only student's own sessions      | Create 2 sessions (1 for student, 1 for other) | STUDENT    | page=0, size=10 | **200 OK**      | PageResponse: 1 session (only student's), totalElements: 1 |
| Return empty page when no sessions   | No sessions created                            | STUDENT    | page=0, size=10 | **200 OK**      | PageResponse: empty array, totalElements: 0                |
| Support pagination parameters        | Create 15 sessions                             | INSTRUCTOR | page=0, size=5  | **200 OK**      | 5 items per page, totalElements: 15, totalPages: 3         |

---

### GET /api/v1/support/sessions/{id}

**Purpose**: Retrieve a specific support session with all messages and mark messages as read

| Test Case                                | Setup                                       | User Role  | Target Session          | Expected Output   | Verification                                               |
|------------------------------------------|---------------------------------------------|------------|-------------------------|-------------------|------------------------------------------------------------|
| Get session by ID as student owner       | Create session for specific student         | STUDENT    | Student's own session   | **200 OK**        | Session data returned with messages array, isClosed: false |
| Get session by ID as instructor          | Create session from another student         | INSTRUCTOR | Any session             | **200 OK**        | Instructor can view any session                            |
| Return 404 when session not found        | No session created with requested ID        | STUDENT    | Non-existent UUID       | **404 Not Found** | Error response with proper HTTP status                     |
| Return 403 when student accesses others' | Create session for different student        | STUDENT    | Other student's session | **403 Forbidden** | Access denied                                              |
| Mark messages as read when viewing       | Session with unread message from instructor | STUDENT    | Own session             | **200 OK**        | Instructor's message marked as read (isRead: true)         |

---

### POST /api/v1/support/sessions

**Purpose**: Create a new support session with initial message

| Test Case                               | Setup                          | User Role  | Input                                                | Expected Output     | Response Body                                                           |
|-----------------------------------------|--------------------------------|------------|------------------------------------------------------|---------------------|-------------------------------------------------------------------------|
| Create support session as student       | Valid authenticated student    | STUDENT    | initialMessage: "I'm stuck on the algorithm problem" | **201 Created**     | Session with id, studentId, isClosed: false, messages array with 1 item |
| Return 400 when initial message empty   | Valid authenticated student    | STUDENT    | initialMessage: "" (empty string)                    | **400 Bad Request** | Validation error response                                               |
| Return 400 when initial message missing | Valid authenticated student    | STUDENT    | randomField: "value" (missing field)                 | **400 Bad Request** | Validation error response                                               |
| Return 403 when instructor tries create | Valid authenticated instructor | INSTRUCTOR | initialMessage: "valid message"                      | **403 Forbidden**   | Access denied - only students can create                                |
| Create session with long message        | Valid authenticated student    | STUDENT    | initialMessage: 1000 'A' characters                  | **201 Created**     | Session created with full message content                               |

---

### POST /api/v1/support/sessions/{id}/close

**Purpose**: Close an open support session (only by session owner)

| Test Case                                      | Setup                                    | User Role  | Session State   | Expected Output     | Verification                                        |
|------------------------------------------------|------------------------------------------|------------|-----------------|---------------------|-----------------------------------------------------|
| Close session as session owner                 | Create open session for specific student | STUDENT    | isClosed: false | **200 OK**          | Response: isClosed: true, closedAt timestamp exists |
| Return 404 when session not found              | No session with requested ID             | STUDENT    | N/A             | **404 Not Found**   | Error response                                      |
| Return 403 when non-owner tries to close       | Create session for different student     | STUDENT    | Other's session | **403 Forbidden**   | Access denied                                       |
| Return 400 when trying to close already closed | Create closed session (isClosed: true)   | STUDENT    | isClosed: true  | **400 Bad Request** | Validation error - session already closed           |
| Return 403 when instructor tries to close      | Create session for another student       | INSTRUCTOR | isClosed: false | **403 Forbidden**   | Access denied - only students can close             |
| Set closed timestamp when closing session      | Create open session for student          | STUDENT    | isClosed: false | **200 OK**          | closedAt field is null initially, set after close   |

---

## Access Control Tests

### Authentication & Authorization

| Test Case                              | Setup                                      | Expected Behavior                                   |
|----------------------------------------|--------------------------------------------|-----------------------------------------------------|
| Deny access to unauthenticated users   | No authentication provided (no JWT token)  | **403 Forbidden** - Requires authentication         |
| Only instructors view all sessions     | 2 sessions created, accessed by instructor | Instructor sees both sessions (no filtering)        |
| Content provider cannot access support | Valid authenticated content provider       | **403 Forbidden** - Only Student/Instructor allowed |

---

## Response Format Tests

### HTTP Status Codes & Pagination

| Test Case                                 | Setup                             | HTTP Method     | Expected Status             | Verification                                                |
|-------------------------------------------|-----------------------------------|-----------------|-----------------------------|-------------------------------------------------------------|
| Proper pagination response format         | Create 3 sessions, page=0, size=2 | GET             | **200 OK**                  | pageNumber: 0, pageSize: 2, totalElements: 3, totalPages: 2 |
| Correct HTTP status codes for all methods | Single session for all verbs      | POST, GET, POST | **201, 200, 200, 404, 403** | All endpoints return correct status codes                   |

---

## Role-Based Access Control Matrix

### Access Control Summary

| Endpoint                     | Method | Anonymous | Student | Instructor | Notes                                 |
|------------------------------|--------|-----------|---------|------------|---------------------------------------|
| /support/sessions            | GET    | ❌         | ✅       | ✅          | Student sees own, Instructor sees all |
| /support/sessions/{id}       | GET    | ❌         | ✅*      | ✅          | *Student can only see own sessions    |
| /support/sessions            | POST   | ❌         | ✅       | ❌          | Only students can create              |
| /support/sessions/{id}/close | POST   | ❌         | ✅*      | ❌          | *Only session owner can close         |

---

### Test Count by Category

| Category          | Endpoint Count  | Test Count   | Pass Rate  |
|-------------------|-----------------|--------------|------------|
| Session Listing   | 1 endpoint      | 4 tests      | ✅ 100%     |
| Session Retrieval | 1 endpoint      | 5 tests      | ✅ 100%     |
| Session Creation  | 1 endpoint      | 5 tests      | ✅ 100%     |
| Session Closure   | 1 endpoint      | 6 tests      | ✅ 100%     |
| Access Control    | (multi)         | 3 tests      | ✅ 100%     |
| Response Format   | (multi)         | 2 tests      | ✅ 100%     |
| **Total**         | **4 endpoints** | **25 tests** | **✅ 100%** |

---

## What Tests Validate

The 25 tests verify:

- ✅ **Session Management** - Students can create, view, and close their own sessions
- ✅ **Message Tracking** - Initial messages are created with sessions, marked as read when viewed
- ✅ **Pagination** - List endpoints support page/size parameters with correct totals
- ✅ **Access Control** - Role-based permissions properly enforced (Student/Instructor only)
- ✅ **Data Isolation** - Students only see their own sessions, instructors see all
- ✅ **State Management** - Sessions can be opened and closed, with timestamps tracked
- ✅ **Data Persistence** - All changes saved correctly to PostgreSQL database
- ✅ **Error Handling** - Invalid requests return proper 4xx status codes with error details

---

## Error Response Format

All errors follow RFC 9457 Problem Detail format (configured in `GlobalExceptionHandler`):

```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Initial message cannot be empty",
  "instance": "/api/v1/support/sessions"
}
```

---

## Running the Tests

### Commands

| Task                   | Command                                                                                                                             | Expected Result              |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------|------------------------------|
| **Run all tests**      | `./amper test -m support`                                                                                                           | 25 tests pass in ~34 seconds |
| **Run specific class** | `./amper test -m support --test-class SupportControllerIntegrationTest`                                                             | 25 tests in class pass       |
| **Run specific group** | `./amper test -m support --test-class SupportControllerIntegrationTest --test-method "should get paginated sessions as instructor"` | Single test passes           |

### Test Output Format

```
Test run finished after 33975 ms
[        10 containers found      ]
[         0 containers skipped    ]
[        10 containers started    ]
[        25 tests found           ]
[        0 tests skipped         ]
[        25 tests started         ]
[        25 tests successful      ]  ✅ All PASS
[         0 tests failed          ]
```

---

## Test Infrastructure

### Testcontainers Services

| Service           | Image                  | Port   | Purpose                         | Auto-Cleanup      |
|-------------------|------------------------|--------|---------------------------------|-------------------|
| **PostgreSQL**    | postgres:17-alpine     | 5432   | Real database for persistence   | ✅ Each test class |
| **Tomcat Server** | Embedded (Spring Boot) | Random | Real servlet container for HTTP | ✅ Each test class |

### Cleanup Strategy

Each test automatically cleans up after execution:

```kotlin
@AfterTest
fun cleanup() {
    testDataHelper.cleanupAll()  // Clears all test sessions and messages
}
```

Benefits:

- ✅ Test isolation (no side effects between tests)
- ✅ Fresh database state for each test
- ✅ Reliable and repeatable results
- ✅ Prevents UUID/data conflicts in subsequent tests

---

## Troubleshooting

| Issue                    | Solution                                       |
|--------------------------|------------------------------------------------|
| Tests fail to start      | Ensure Docker Desktop is running               |
| Tests timeout            | Database may be slow; retry typically succeeds |
| Unexpected test failures | Verify Docker containers are healthy           |

---

## Error Response Codes

| HTTP Status | Meaning           | Example                                                |
|-------------|-------------------|--------------------------------------------------------|
| **200**     | Success           | Session retrieved, closed successfully                 |
| **201**     | Created           | Session created successfully                           |
| **400**     | Validation failed | Empty message, already closed, invalid data            |
| **403**     | Not authorized    | Non-owner trying to close, Instructor creating session |
| **404**     | Not found         | Session ID doesn't exist                               |

---

## Test Data

Tests use realistic scenarios including:

- ✅ Valid authenticated users with different roles (Student, Instructor)
- ✅ Multiple sessions from different students
- ✅ Long messages and pagination edge cases
- ✅ Invalid data (empty messages, missing fields) to verify error handling
- ✅ Access control scenarios (viewing others' sessions, unauthorized operations)
- ✅ State transitions (open → closed sessions)

---

## Adding New Tests

When new endpoints are added, tests should follow this approach:

1. **Create test data** - Set up sessions and messages with appropriate role/state
2. **Make HTTP request** - Call the endpoint with proper authentication
3. **Verify response** - Confirm correct HTTP status and data returned
4. **Verify side effects** - Ensure changes are saved to the database
5. **Test access control** - Verify only authorized roles can access

Tests should cover both success scenarios and error cases (invalid input, permission denied, etc.)

---

## Summary

✅ **25 Integration Tests** covering session management (4 endpoints) with comprehensive access
control

✅ **100% Pass Rate** with extensive error scenarios and role-based authorization

✅ **Real Infrastructure** - Tests run against live database (not mocked)

✅ **Role-Based Access Control** validated across all 4 endpoints with Student/Instructor
differentiation

✅ **Production-Ready** validation of session lifecycle, data persistence, and access control

✅ **Test Duration** ~34 seconds with reliable Testcontainers isolation
