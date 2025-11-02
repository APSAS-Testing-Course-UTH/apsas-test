# Content Service Integration Tests

## Overview

The Content Service contains comprehensive integration tests covering assignment management, skill
management, and tutorial management. All 51 tests pass successfully with a real PostgreSQL
database (via Testcontainers) and real HTTP server using `WebTestClient`.

### Quick Summary

| Metric           | Value                        |
|------------------|------------------------------|
| Total Tests      | 51                           |
| Assignment Tests | 24                           |
| Skill Tests      | 18                           |
| Tutorial Tests   | 9                            |
| Pass Rate        | **100%** ✅                   |
| Test Framework   | JUnit 5 + Kotlin             |
| Database         | Testcontainers PostgreSQL 17 |
| Messaging        | Testcontainers RabbitMQ 4.1  |
| Test Duration    | ~36-43 seconds               |

### Test Breakdown

| Category                  | Endpoints                                         | Tests        | Status     |
|---------------------------|---------------------------------------------------|--------------|------------|
| **Assignment Management** | GET/POST/PATCH/DELETE /assignments* (8 endpoints) | 24           | ✅ All Pass |
| **Skill Management**      | GET/POST/PATCH/DELETE /skills* (5 endpoints)      | 18           | ✅ All Pass |
| **Tutorial Management**   | GET/POST/PATCH/DELETE /tutorials* (5 endpoints)   | 9            | ✅ All Pass |
| **TOTAL**                 | **18 Endpoints**                                  | **51 Tests** | **✅ 100%** |

---

## Testing Approach

All 51 tests run against a **real live environment** including:

- **Actual database** - PostgreSQL validates data is stored correctly
- **Real message broker** - RabbitMQ confirms events are published
- **Live HTTP server** - Verifies endpoints route requests properly

This ensures tests validate the system exactly as it runs in production.

---

## Assignment Controller Tests

### GET /api/v1/assignments

| Test Case                      | Setup                  | Authentication | Query Params     | Expected Output   | Response Body                                                                |
|--------------------------------|------------------------|----------------|------------------|-------------------|------------------------------------------------------------------------------|
| Get all assignments paginated  | Create 3 assignments   | P_STUDENT      | `page=0&size=10` | **200 OK**        | PageResponse: content array (3 assignments), totalElements: 3, totalPages: 1 |
| Get empty page when none exist | No assignments created | P_STUDENT      | `page=0&size=10` | **200 OK**        | PageResponse: content array (empty), totalElements: 0, totalPages: 0         |
| Reject without authentication  | Create 1 assignment    | None           | (any)            | **403 Forbidden** | Error response                                                               |

---

### GET /api/v1/assignments/{id}

| Test Case                     | Setup                     | Authentication | Expected Output   | Response Body                                                     |
|-------------------------------|---------------------------|----------------|-------------------|-------------------------------------------------------------------|
| Get assignment by ID          | Create assignment with ID | P_STUDENT      | **200 OK**        | Assignment data (id, title, description, status, creatorId, etc.) |
| Reject - assignment not found | No assignment created     | P_STUDENT      | **404 Not Found** | Error response                                                    |
| Reject without authentication | Create 1 assignment       | None           | **403 Forbidden** | Error response                                                    |

---

### POST /api/v1/assignments

| Test Case                        | Setup                        | User Role             | Input                                            | Expected Output     | Response Body                                                   |
|----------------------------------|------------------------------|-----------------------|--------------------------------------------------|---------------------|-----------------------------------------------------------------|
| Create assignment successfully   | None needed                  | CONTENT_PROVIDER      | title, description, difficulty, languages, tests | **201 Created**     | New assignment data (id, title, status: DRAFT, creatorId: user) |
| Create with skills and tutorials | Create 2 skills, 2 tutorials | CONTENT_PROVIDER      | Assignment request + skillIds, tutorialIds       | **201 Created**     | Assignment with associated skills and tutorials                 |
| Reject - invalid skill IDs       | No skills exist              | CONTENT_PROVIDER      | Assignment request + invalid skillIds            | **400 Bad Request** | Error: "One or more skill IDs are invalid"                      |
| Reject - invalid tutorial IDs    | No tutorials exist           | CONTENT_PROVIDER      | Assignment request + invalid tutorialIds         | **400 Bad Request** | Error: "One or more tutorial IDs are invalid"                   |
| Reject - invalid request         | None needed                  | CONTENT_PROVIDER      | Missing required fields (title, description)     | **400 Bad Request** | Validation error response                                       |
| Reject - not authorized          | None needed                  | STUDENT or INSTRUCTOR | Valid assignment request                         | **403 Forbidden**   | Error response                                                  |

---

### PATCH /api/v1/assignments/{id}

| Test Case                        | Setup                                             | Authentication     | Input                         | Expected Output   | Response Body                        |
|----------------------------------|---------------------------------------------------|--------------------|-------------------------------|-------------------|--------------------------------------|
| Update assignment as creator     | Create assignment by CONTENT_PROVIDER             | P_CONTENT_PROVIDER | title, description updates    | **200 OK**        | Updated assignment data              |
| Update with new skills/tutorials | Create assignment + 2 new skills, 2 new tutorials | P_CONTENT_PROVIDER | skillIds, tutorialIds updated | **200 OK**        | Assignment with new skills/tutorials |
| Reject - not creator             | Create assignment by CONTENT_PROVIDER             | P_OTHER_INSTRUCTOR | Update request                | **403 Forbidden** | Error: "You are not authorized..."   |
| Reject - assignment not found    | No assignment created                             | P_CONTENT_PROVIDER | Update request                | **404 Not Found** | Error: "Assignment not found..."     |

---

### PATCH /api/v1/assignments/{id}/schedule

| Test Case                        | Setup                 | Authentication | Input                                | Expected Output     | Response Body                              |
|----------------------------------|-----------------------|----------------|--------------------------------------|---------------------|--------------------------------------------|
| Update schedule as instructor    | Create assignment     | P_INSTRUCTOR   | startDate (future), dueDate (future) | **200 OK**          | Assignment with updated dates              |
| Validate dates - due after start | Create assignment     | P_INSTRUCTOR   | startDate, dueDate before startDate  | **400 Bad Request** | Error: "Due date must be after start date" |
| Reject - not instructor          | Create assignment     | P_STUDENT      | startDate, dueDate                   | **403 Forbidden**   | Error: "Access denied..."                  |
| Reject - assignment not found    | No assignment created | P_INSTRUCTOR   | startDate, dueDate                   | **404 Not Found**   | Error: "Assignment not found..."           |

---

### DELETE /api/v1/assignments/{id}

| Test Case                     | Setup                                 | Authentication     | Expected Output    | Response Body                      |
|-------------------------------|---------------------------------------|--------------------|--------------------|------------------------------------|
| Delete assignment as creator  | Create assignment by CONTENT_PROVIDER | P_CONTENT_PROVIDER | **204 No Content** | (no body)                          |
| Reject - not creator          | Create assignment by CONTENT_PROVIDER | P_OTHER_INSTRUCTOR | **403 Forbidden**  | Error: "You are not authorized..." |
| Reject - assignment not found | No assignment created                 | P_CONTENT_PROVIDER | **404 Not Found**  | Error: "Assignment not found..."   |

---

### POST /api/v1/assignments/{id}/publish

| Test Case                     | Setup                                       | Authentication     | Expected Output     | Response Body                                    |
|-------------------------------|---------------------------------------------|--------------------|---------------------|--------------------------------------------------|
| Publish draft assignment      | Create DRAFT assignment by CONTENT_PROVIDER | P_CONTENT_PROVIDER | **200 OK**          | Assignment with status: PUBLISHED                |
| Reject - already published    | Create PUBLISHED assignment                 | P_CONTENT_PROVIDER | **400 Bad Request** | Error: "Only draft assignments can be published" |
| Reject - not creator          | Create assignment by CONTENT_PROVIDER       | P_OTHER_INSTRUCTOR | **403 Forbidden**   | Error: "You are not authorized..."               |
| Reject - assignment not found | No assignment created                       | P_CONTENT_PROVIDER | **404 Not Found**   | Error: "Assignment not found..."                 |

**Side Effects**: Publishes `AssignmentPublishedEvent` to RabbitMQ

---

### POST /api/v1/assignments/{id}/archive

| Test Case                     | Setup                                 | Authentication     | Expected Output     | Response Body                           |
|-------------------------------|---------------------------------------|--------------------|---------------------|-----------------------------------------|
| Archive published assignment  | Create PUBLISHED assignment           | P_CONTENT_PROVIDER | **200 OK**          | Assignment with status: ARCHIVED        |
| Archive draft assignment      | Create DRAFT assignment               | P_CONTENT_PROVIDER | **200 OK**          | Assignment with status: ARCHIVED        |
| Reject - already archived     | Create ARCHIVED assignment            | P_CONTENT_PROVIDER | **400 Bad Request** | Error: "Assignment is already archived" |
| Reject - not creator          | Create assignment by CONTENT_PROVIDER | P_OTHER_INSTRUCTOR | **403 Forbidden**   | Error: "You are not authorized..."      |
| Reject - assignment not found | No assignment created                 | P_CONTENT_PROVIDER | **404 Not Found**   | Error: "Assignment not found..."        |

---

## Skill Controller Tests

### GET /api/v1/skills

| Test Case                      | Setup             | Authentication | Query Params     | Expected Output   | Response Body                                            |
|--------------------------------|-------------------|----------------|------------------|-------------------|----------------------------------------------------------|
| Get all skills paginated       | Create 3 skills   | P_STUDENT      | `page=0&size=10` | **200 OK**        | PageResponse: content array (3 skills), totalElements: 3 |
| Get empty page when none exist | No skills created | P_STUDENT      | `page=0&size=10` | **200 OK**        | PageResponse: content array (empty), totalElements: 0    |
| Reject without authentication  | Create 1 skill    | None           | (any)            | **403 Forbidden** | Error response                                           |

---

### GET /api/v1/skills/{id}

| Test Case                | Setup                | Authentication | Expected Output   | Response Body                      |
|--------------------------|----------------------|----------------|-------------------|------------------------------------|
| Get skill by ID          | Create skill with ID | P_STUDENT      | **200 OK**        | Skill data (id, name, description) |
| Reject - skill not found | No skill created     | P_STUDENT      | **404 Not Found** | Error response                     |
| Reject without auth      | Create 1 skill       | None           | **403 Forbidden** | Error response                     |

---

### POST /api/v1/skills

| Test Case                     | Setup                      | User Role        | Input                  | Expected Output     | Response Body                               |
|-------------------------------|----------------------------|------------------|------------------------|---------------------|---------------------------------------------|
| Create skill successfully     | None needed                | CONTENT_PROVIDER | name, description      | **201 Created**     | New skill data (id, name, description)      |
| Reject - duplicate skill name | Create skill with name "X" | CONTENT_PROVIDER | name: "X", description | **400 Bad Request** | Error: "Skill with name ... already exists" |
| Reject - invalid request      | None needed                | CONTENT_PROVIDER | Missing name field     | **400 Bad Request** | Validation error response                   |
| Reject - not authorized       | None needed                | STUDENT          | Valid skill request    | **403 Forbidden**   | Error response                              |

---

### PATCH /api/v1/skills/{id}

| Test Case                     | Setup                          | Authentication     | Input                     | Expected Output     | Response Body                               |
|-------------------------------|--------------------------------|--------------------|---------------------------|---------------------|---------------------------------------------|
| Update skill successfully     | Create skill                   | P_CONTENT_PROVIDER | name, description updates | **200 OK**          | Updated skill data                          |
| Reject - duplicate skill name | Create skill "X" and skill "Y" | P_CONTENT_PROVIDER | Update "Y" to name "X"    | **400 Bad Request** | Error: "Skill with name ... already exists" |
| Reject - skill not found      | No skill created               | P_CONTENT_PROVIDER | Update request            | **404 Not Found**   | Error: "Skill not found..."                 |
| Reject - not authorized       | Create skill                   | P_STUDENT          | Update request            | **403 Forbidden**   | Error: "Access denied..."                   |

---

### DELETE /api/v1/skills/{id}

| Test Case                | Setup            | Authentication     | Expected Output    | Response Body               |
|--------------------------|------------------|--------------------|--------------------|-----------------------------|
| Delete skill             | Create skill     | P_CONTENT_PROVIDER | **204 No Content** | (no body)                   |
| Reject - skill not found | No skill created | P_CONTENT_PROVIDER | **404 Not Found**  | Error: "Skill not found..." |
| Reject - not authorized  | Create skill     | P_STUDENT          | **403 Forbidden**  | Error: "Access denied..."   |

---

## Tutorial Controller Tests

### GET /api/v1/tutorials

| Test Case                      | Setup                | Authentication | Query Params     | Expected Output   | Response Body                                               |
|--------------------------------|----------------------|----------------|------------------|-------------------|-------------------------------------------------------------|
| Get all tutorials paginated    | Create 2 tutorials   | P_STUDENT      | `page=0&size=10` | **200 OK**        | PageResponse: content array (2 tutorials), totalElements: 2 |
| Get empty page when none exist | No tutorials created | P_STUDENT      | `page=0&size=10` | **200 OK**        | PageResponse: content array (empty), totalElements: 0       |
| Reject without authentication  | Create 1 tutorial    | None           | (any)            | **403 Forbidden** | Error response                                              |

---

### GET /api/v1/tutorials/{id}

| Test Case                   | Setup                   | Authentication | Expected Output   | Response Body                                 |
|-----------------------------|-------------------------|----------------|-------------------|-----------------------------------------------|
| Get tutorial by ID          | Create tutorial with ID | P_STUDENT      | **200 OK**        | Tutorial data (id, title, content, creatorId) |
| Reject - tutorial not found | No tutorial created     | P_STUDENT      | **404 Not Found** | Error response                                |
| Reject without auth         | Create 1 tutorial       | None           | **403 Forbidden** | Error response                                |

---

### POST /api/v1/tutorials

| Test Case                    | Setup       | User Role        | Input                    | Expected Output     | Response Body                                     |
|------------------------------|-------------|------------------|--------------------------|---------------------|---------------------------------------------------|
| Create tutorial successfully | None needed | CONTENT_PROVIDER | title, content, tags     | **201 Created**     | New tutorial data (id, title, content, creatorId) |
| Reject - invalid request     | None needed | CONTENT_PROVIDER | Missing title or content | **400 Bad Request** | Validation error response                         |
| Reject - not authorized      | None needed | STUDENT          | Valid tutorial request   | **403 Forbidden**   | Error response                                    |

---

### PATCH /api/v1/tutorials/{id}

| Test Case                   | Setup                               | Authentication     | Input                | Expected Output   | Response Body                      |
|-----------------------------|-------------------------------------|--------------------|----------------------|-------------------|------------------------------------|
| Update tutorial as creator  | Create tutorial by CONTENT_PROVIDER | P_CONTENT_PROVIDER | title, content, tags | **200 OK**        | Updated tutorial data              |
| Reject - not creator        | Create tutorial by CONTENT_PROVIDER | P_OTHER_INSTRUCTOR | Update request       | **403 Forbidden** | Error: "You are not authorized..." |
| Reject - tutorial not found | No tutorial created                 | P_CONTENT_PROVIDER | Update request       | **404 Not Found** | Error: "Tutorial not found..."     |

---

### DELETE /api/v1/tutorials/{id}

| Test Case                   | Setup                               | Authentication     | Expected Output    | Response Body                      |
|-----------------------------|-------------------------------------|--------------------|--------------------|------------------------------------|
| Delete tutorial as creator  | Create tutorial by CONTENT_PROVIDER | P_CONTENT_PROVIDER | **204 No Content** | (no body)                          |
| Reject - not creator        | Create tutorial by CONTENT_PROVIDER | P_OTHER_INSTRUCTOR | **403 Forbidden**  | Error: "You are not authorized..." |
| Reject - tutorial not found | No tutorial created                 | P_CONTENT_PROVIDER | **404 Not Found**  | Error: "Tutorial not found..."     |

---

## Role-Based Access Control Matrix

### Access Control Summary

| Endpoint                   | Method | Student | Instructor | Content Provider | Notes                           |
|----------------------------|--------|---------|------------|------------------|---------------------------------|
| /assignments               | GET    | ✅       | ✅          | ✅                | Read-only, all roles            |
| /assignments/{id}          | GET    | ✅       | ✅          | ✅                | Read-only, all roles            |
| /assignments               | POST   | ❌       | ❌          | ✅                | Create only by Content Provider |
| /assignments/{id}          | PATCH  | ❌       | ❌          | ✅ (creator)      | Update only by creator          |
| /assignments/{id}/schedule | PATCH  | ❌       | ✅          | ❌                | Schedule only by Instructor     |
| /assignments/{id}          | DELETE | ❌       | ❌          | ✅ (creator)      | Delete only by creator          |
| /assignments/{id}/publish  | POST   | ❌       | ❌          | ✅ (creator)      | Publish only by creator         |
| /assignments/{id}/archive  | POST   | ❌       | ❌          | ✅ (creator)      | Archive only by creator         |
| /skills                    | GET    | ✅       | ✅          | ✅                | Read-only, all roles            |
| /skills/{id}               | GET    | ✅       | ✅          | ✅                | Read-only, all roles            |
| /skills                    | POST   | ❌       | ❌          | ✅                | Create only by Content Provider |
| /skills/{id}               | PATCH  | ❌       | ❌          | ✅                | Update only by Content Provider |
| /skills/{id}               | DELETE | ❌       | ❌          | ✅                | Delete only by Content Provider |
| /tutorials                 | GET    | ✅       | ✅          | ✅                | Read-only, all roles            |
| /tutorials/{id}            | GET    | ✅       | ✅          | ✅                | Read-only, all roles            |
| /tutorials                 | POST   | ❌       | ❌          | ✅                | Create only by Content Provider |
| /tutorials/{id}            | PATCH  | ❌       | ❌          | ✅ (creator)      | Update only by creator          |
| /tutorials/{id}            | DELETE | ❌       | ❌          | ✅ (creator)      | Delete only by creator          |

**Key Patterns**:

- ✅ = Allowed
- ❌ = Forbidden (403)
- **(creator)** = Only if user is the creator of the resource
- Read-only endpoints accessible by any authenticated user

---

### Test Count by Category

| Category              | Endpoint Count   | Test Count   | Pass Rate  |
|-----------------------|------------------|--------------|------------|
| Assignment Management | 8 endpoints      | 24 tests     | ✅ 100%     |
| Skill Management      | 5 endpoints      | 18 tests     | ✅ 100%     |
| Tutorial Management   | 5 endpoints      | 9 tests      | ✅ 100%     |
| **Total**             | **18 endpoints** | **51 tests** | **✅ 100%** |

---

## What Tests Validate

The 51 tests verify:

- ✅ **CRUD Operations** - Create, read, update, delete for all resources
- ✅ **Pagination** - Proper page handling with size and sorting
- ✅ **Status Transitions** - Assignments move through DRAFT → PUBLISHED → ARCHIVED
- ✅ **Creator Verification** - Only resource creators can update/delete
- ✅ **Role-Based Access** - Proper enforcement of Content Provider, Instructor, Student roles
- ✅ **Validation** - Date validation (due date after start date), duplicate prevention
- ✅ **Data Persistence** - Changes saved to PostgreSQL database
- ✅ **Event Publishing** - RabbitMQ events triggered for key actions
- ✅ **Error Handling** - Proper HTTP status codes for all failure scenarios
- ✅ **Data Relationships** - Skills and tutorials properly associated with assignments

---

## HTTP Methods Used

| Method | Endpoints                                                | Purpose                    |
|--------|----------------------------------------------------------|----------------------------|
| GET    | /assignments, /skills, /tutorials (and by ID)            | Retrieve data              |
| POST   | /assignments, /skills, /tutorials, /publish, /archive    | Create and trigger actions |
| PATCH  | /assignments, /assignments/schedule, /skills, /tutorials | Update data                |
| DELETE | /assignments, /skills, /tutorials                        | Delete data                |

**Response Status Codes**:

- **200 OK** - Successful update/action
- **201 Created** - Resource successfully created
- **204 No Content** - Successful deletion
- **400 Bad Request** - Validation failed
- **403 Forbidden** - Not authorized
- **404 Not Found** - Resource doesn't exist

---

## Error Response Format

All errors follow RFC 9457 Problem Detail format (configured in `GlobalExceptionHandler`):

```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Due date must be after start date",
  "instance": "/api/v1/assignments"
}
```

---

## Running the Tests

### Commands

| Task                   | Command                                                                                                                       | Expected Result                 |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------|---------------------------------|
| **Run all tests**      | `./amper test -m content`                                                                                                     | 51 tests pass in ~36-43 seconds |
| **Run specific class** | `./amper test -m content --test-class AssignmentControllerIntegrationTest`                                                    | 24 assignment tests pass        |
| **Run specific test**  | `./amper test -m content --test-class SkillControllerIntegrationTest --test-method "should create skill as content provider"` | Single test passes              |

### Test Output Format

```
Test run finished after 38106 ms
[        24 containers found      ]
[         0 containers skipped    ]
[        24 containers started    ]
[        51 tests found           ]
[        51 tests started         ]
[        51 tests successful      ]  ✅ All PASS
[         0 tests failed          ]
```

---

## Test Infrastructure

### Testcontainers Services

| Service           | Image                  | Port   | Purpose                              | Auto-Cleanup      |
|-------------------|------------------------|--------|--------------------------------------|-------------------|
| **PostgreSQL**    | postgres:17-alpine     | 5432   | Real database for data persistence   | ✅ Each test class |
| **RabbitMQ**      | rabbitmq:4.1-alpine    | 5672   | Message broker for publishing events | ✅ Each test class |
| **Tomcat Server** | Embedded (Spring Boot) | Random | Real servlet container for HTTP      | ✅ Each test class |

### Cleanup Strategy

Each test automatically cleans up after execution:

```kotlin
@AfterTest
fun cleanup() {
    testDataHelper.cleanupAll()  // Clears all test data
}
```

Benefits:

- ✅ Test isolation (no side effects between tests)
- ✅ Fresh database state for each test
- ✅ Reliable and repeatable results
- ✅ Prevents UUID/ID conflicts in subsequent tests

---

## Test Data Principals

Tests use predefined authenticated principals with stable UUIDs:

| Principal          | UUID                                 | Role             | Used For                                 |
|--------------------|--------------------------------------|------------------|------------------------------------------|
| P_CONTENT_PROVIDER | 00000000-0000-0000-0000-000000000002 | CONTENT_PROVIDER | Creating/managing assignments and skills |
| P_INSTRUCTOR       | 00000000-0000-0000-0000-000000000003 | INSTRUCTOR       | Updating assignment schedules            |
| P_STUDENT          | 00000000-0000-0000-0000-000000000004 | STUDENT          | Reading assignments (view-only)          |
| P_OTHER_INSTRUCTOR | 00000000-0000-0000-0000-000000000005 | INSTRUCTOR       | Testing authorization failures           |
| P_OTHER_STUDENT    | 00000000-0000-0000-0000-000000000006 | STUDENT          | Testing authorization failures           |

---

## Test Data Factory

The `TestDataFactory` provides methods for creating test DTOs:

```kotlin
// Create request objects
TestDataFactory.createAssignmentRequest(
    title = "Custom Title",
    description = "Custom description",
    difficulty = DifficultyLevel.HARD
)

TestDataFactory.createSkillRequest(
    name = "Advanced Algorithms",
    description = "Study complex algorithms"
)

TestDataFactory.createTutorialRequest(
    title = "Tutorial Title",
    content = "Tutorial content",
    tags = listOf("java", "algorithms")
)
```

---

## Test Data Helper

The `TestDataHelper` component provides database-level creation:

```kotlin
// Create persistent entities
testDataHelper.createAssignment(
    title = "Test Assignment",
    creatorId = principal.userId,
    status = AssignmentStatus.DRAFT
)

testDataHelper.createPublishedAssignment(creatorId = principal.userId)

testDataHelper.createSkill(name = "Test Skill")

testDataHelper.createTutorial(
    title = "Test Tutorial",
    creatorId = principal.userId
)

// Clean up all test data
testDataHelper.cleanupAll()
```

---

## Troubleshooting

| Issue                        | Solution                                                      |
|------------------------------|---------------------------------------------------------------|
| Tests fail to start          | Ensure Docker Desktop is running                              |
| Tests timeout                | Database/message broker may be slow; retry typically succeeds |
| Unexpected test failures     | Verify Docker containers are healthy                          |
| Assignment with skills fails | Ensure skills exist before referencing via skillIds           |

---

## Adding New Tests

When new endpoints are added, tests should follow this approach:

1. **Create test data** - Set up assignments/skills/tutorials with appropriate creator
2. **Make HTTP request** - Call the endpoint with proper authentication
3. **Verify response** - Confirm correct HTTP status and data returned
4. **Verify side effects** - Ensure changes are saved to the database
5. **Test access control** - Verify only authorized roles/creators can access

Tests should cover both success scenarios and error cases:

- ✅ Valid operations (create, read, update, delete)
- ✅ Authorization failures (403 Forbidden)
- ✅ Resource not found (404 Not Found)
- ✅ Validation failures (400 Bad Request)
- ✅ Duplicate prevention (400 Bad Request)
- ✅ State transition validation (e.g., can't publish non-draft)

---

## Key Validation Rules Tested

### Assignment Validation

- ✅ **Required fields** - title, description, difficulty level
- ✅ **Date validation** - Due date must be after start date
- ✅ **Status transitions** - Only draft assignments can be published
- ✅ **Archive idempotency** - Cannot archive already archived assignment
- ✅ **Skill references** - All referenced skill IDs must exist
- ✅ **Tutorial references** - All referenced tutorial IDs must exist

### Skill Validation

- ✅ **Required fields** - name, description
- ✅ **Unique names** - Skill names must be unique across system
- ✅ **Name changes** - Cannot rename skill to an existing name

### Tutorial Validation

- ✅ **Required fields** - title, content
- ✅ **Creator tracking** - creatorId set to authenticated user

---

## Event Publishing

Certain operations trigger RabbitMQ events:

| Operation                  | Event Published                | Routing Key                 | Data                                        |
|----------------------------|--------------------------------|-----------------------------|---------------------------------------------|
| Publish assignment         | AssignmentPublishedEvent       | assignment.published        | assignmentId, title, timestamp              |
| Update assignment schedule | AssignmentScheduleUpdatedEvent | assignment.schedule.updated | assignmentId, startDate, dueDate, timestamp |

---

## Summary

✅ **51 Integration Tests** covering assignment management (8 endpoints), skill management (5
endpoints), and tutorial management (5 endpoints)

✅ **100% Pass Rate** with comprehensive error scenarios and role-based access control

✅ **Real Infrastructure** - Tests run against live database and message broker (not mocked)

✅ **Creator-Based Authorization** - Resources can only be updated/deleted by creators

✅ **Role-Based Access Control** validated across all 18 endpoints

✅ **Production-Ready** validation of CRUD operations, status transitions, data relationships, and
event publishing
