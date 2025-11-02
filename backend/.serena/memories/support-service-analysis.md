# Support Service Analysis

## Architecture Overview

The Support Service manages student-instructor communication via support sessions and messages.

### Key Components

#### 1. SupportController
- **Package**: `apsas.support.controller.SupportController`
- **Endpoints**:
  - `GET /api/v1/support/sessions` - List sessions (paginated)
    - Students see their own, Instructors see all
  - `GET /api/v1/support/sessions/{id}` - Get session by ID
  - `POST /api/v1/support/sessions` - Create new session (STUDENT only)
  - `POST /api/v1/support/sessions/{id}/close` - Close session (STUDENT only)

#### 2. SupportService
- **Transactional operations**:
  - `createSession(UUID studentId, String studentEmail, String studentName, String initialMessage)`
    - Publishes `SupportRequestedEvent`
  - `getSessionById(UUID sessionId)` - Throws `NotFoundException`
  - `getSessionsForStudent(UUID studentId, Pageable pageable)` - Paginated
  - `getAllSessions(Pageable pageable)` - All sessions (Instructor only)
  - `closeSession(UUID sessionId, UUID userId)` 
    - Throws `BadRequestException` if already closed
    - Throws `ForbiddenException` if not the student
  - `sendMessage(UUID sessionId, UUID senderId, String content, boolean isInstructor)`
    - Assigns instructor if first message from instructor
  - `markMessagesAsRead(UUID sessionId, UUID userId)`
  - `validateUserAccess(SupportSession session, UUID userId, String userRole)`

#### 3. Data Models

**SupportSession Entity**:
- `id` (UUID) - Primary key
- `studentId` (UUID) - Non-nullable
- `instructorId` (UUID) - Nullable
- `isClosed` (Boolean) - Default false
- `createdAt` (LocalDateTime) - Auto-set @PrePersist
- `closedAt` (LocalDateTime) - Set on close
- `messages` (List<SupportMessage>) - OneToMany with cascade

**SupportMessage Entity**:
- `senderId` (UUID)
- `content` (String)
- `isInstructor` (Boolean)
- `isRead` (Boolean)
- `session` (SupportSession) - ManyToOne

**DTOs**:
- `CreateSupportSessionRequest` - Contains initialMessage
- `SupportSessionDto` - DTO of SupportSession
- `SupportMessageDto` - DTO of SupportMessage

#### 4. Repositories
- `SupportSessionRepository` - Extends JpaRepository<SupportSession, UUID>
  - Method: `findByStudentIdOrderByCreatedAtDesc(UUID studentId, Pageable)`
- `SupportMessageRepository` - Extends JpaRepository<SupportMessage, UUID>

### Security
- Uses `@PreAuthorize` annotations
- `UserPrincipal` from shared security module
- Roles: STUDENT, INSTRUCTOR
- WebSocket support configured (WebSocketConfig.java)

### Event Publishing
- Uses `EventPublisher` from shared messaging
- Event: `SupportRequestedEvent(sessionId, studentId, email, name, initialMessage)`
- Routing key: `RabbitMqConfig.SUPPORT_REQUESTED_ROUTING_KEY`

### Module Dependencies
- `shared/security` - Authentication
- `shared/exception` - Exception classes
- `shared/models` - Pagination models
- `shared/messaging` - Event publishing
- Spring Boot WebSocket support
- MapStruct for DTO mapping

## Testing Patterns

### Base Test Class
- Extends `IntegrationSpec` from `shared/test`
- Located in `shared/test/src/apsas/shared/test/`
- Uses `@SpringBootTest` with random port
- Uses TestContainers for Postgres and RabbitMQ
- Uses Kotlin with `WebTestClient` for assertions

### Test Principals
- `P_STUDENT` - Default student
- `P_INSTRUCTOR` - Default instructor
- `P_OTHER_STUDENT` / `P_OTHER_INSTRUCTOR` - Alternative users
- Helper: `withPrincipal(principal)` extension on WebTestClient

### Existing Integration Tests
- Located in `sources/services/{service}/test/apsas/{service}/controller/`
- Pattern: `{Service}ControllerIntegrationTest.kt`
- Use Nested inner classes with `@DisplayName`
- Use `TestDataHelper` for creating test data
- Use `@AfterTest` for cleanup

### Test Data Management
- Each service has `helper/TestDataHelper` class
- Each service has `helper/TestDataFactory` for request objects
- Helper provides factory methods like `createPublishedAssignment()`
