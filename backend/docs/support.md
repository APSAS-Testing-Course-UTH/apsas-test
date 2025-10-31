# Support Service

Support service is a microservice responsible for a simple real-time chat support system between students and instructors. Students can create chat sessions to ask questions and get help from instructors. Instructors can view and respond to student support requests.

## Features

- **Real-time chat**: Students and instructors can communicate in real-time using WebSocket connections
- **Session management**: Students can create and close support sessions
- **Access control**: Role-based access control ensures students can only view their own sessions while instructors can view all sessions
- **Message tracking**: Messages are marked as read when users view sessions
- **Automatic instructor assignment**: When an instructor first responds to a session, they are automatically assigned to it

## Permissions

### Student
- Create support sessions
- View their own support sessions and messages
- Send messages in their own sessions
- Close their own sessions

### Instructor
- View all support sessions
- View messages in any session
- Send messages in any session
- Automatically assigned to sessions when they first respond

## API Endpoints

### REST API

| Method | Endpoint                            | Description                                                                       | Role                |
|--------|-------------------------------------|-----------------------------------------------------------------------------------|---------------------|
| GET    | /api/v1/support/sessions            | List all support sessions (instructors view all, students view their own)         | Student, Instructor |
| GET    | /api/v1/support/sessions/{id}       | Get support session by ID (instructors can view all, students can view their own) | Student, Instructor |
| POST   | /api/v1/support/sessions            | Create a new support session                                                      | Student             |
| POST   | /api/v1/support/sessions/{id}/close | Close a support session (only the student who created it can close it)            | Student             |

### WebSocket Endpoints

**Base WebSocket URL**: `/ws/support`

**STOMP Endpoints**:

- **Subscribe to session updates**: `/topic/support/{sessionId}`
  - Receives real-time updates for a specific session
  - Message types: `session_joined`, `session_left`, `new_message`

- **Send message**: `/app/support/sessions/{sessionId}/message`
  - Payload: `{ "sessionId": "UUID", "content": "string" }`
  - Broadcasts message to all session subscribers

- **Leave session**: `/app/support/sessions/{sessionId}/leave`
  - Notifies other users that you've left the session

## WebSocket Message Types

### Client to Server Messages

1. **Send Message**
   ```json
   {
     "sessionId": "uuid",
     "content": "message content"
   }
   ```

### Server to Client Messages

1. **Session Joined**
   ```json
   {
     "type": "session_joined",
     "sessionId": "uuid",
     "userId": "uuid"
   }
   ```

2. **Session Left**
   ```json
   {
     "type": "session_left",
     "sessionId": "uuid",
     "userId": "uuid"
   }
   ```

3. **New Message**
   ```json
   {
     "type": "new_message",
     "sessionId": "uuid",
     "data": {
       "id": "uuid",
       "senderId": "uuid",
       "content": "message content",
       "isInstructor": true/false,
       "isRead": true/false,
       "createdAt": "timestamp"
     }
   }
   ```

## Database Schema

The service uses two main tables in the `support` schema:

### support_sessions
- `id`: Unique session identifier (UUID)
- `student_id`: ID of the student who created the session
- `instructor_id`: ID of the assigned instructor (nullable)
- `is_closed`: Boolean indicating if the session is closed
- `created_at`: Session creation timestamp
- `closed_at`: Session closure timestamp (nullable)

### support_messages
- `id`: Unique message identifier (UUID)
- `session_id`: Reference to the support session
- `sender_id`: ID of the user who sent the message
- `content`: Message content (TEXT)
- `is_instructor`: Boolean indicating if sender is an instructor
- `is_read`: Boolean indicating if message has been read
- `created_at`: Message creation timestamp

## Configuration

The service is configured through `config/support-service.yaml`:

- **Database**: PostgreSQL connection settings
- **Server Port**: Default 8085
- **Eureka**: Service registry configuration
- **JPA**: Hibernate settings with schema initialization

## Dependencies

- Spring Boot Web
- Spring Boot WebSocket
- Spring Boot Data JPA
- Spring Boot Validation
- Spring Security
- PostgreSQL Driver
- SpringDoc OpenAPI
- Shared Security Module

## Running the Service

```bash
# Build the service
./amper build -m support

# Run the service (ensure config-server and service-registry are running)
java -jar build/jars/support.jar
```

## API Documentation

Once the service is running, access the Swagger UI at:
- `http://localhost:8085/swagger-ui.html`

## Security

The service uses JWT-based authentication via the shared security module. All endpoints require authentication, and role-based access control is enforced using Spring Security's `@PreAuthorize` annotations.

WebSocket connections are also secured and require proper authentication. The authentication principal is automatically injected into WebSocket message handlers.
