# Support Service Instructions

Support service is a microservices responsible for simple realtime chat support system between students and instructors. Students can create chat sessions to ask questions and get help from instructors. Instructors can view and respond to student support requests.

## Port

- **Default**: 8085

## Permissions

- **Student**: Create support requests and view their own support sessions and messages.
- **Instructor**: View all support requests and respond to student messages.

## Models

### SupportSession

- `id`: Unique identifier for the support session (UUID).
- `student_id`: ID of the student who created the support session (UUID).
- `instructor_id`: ID of the instructor assigned to the support session (UUID, optional).
- `created_at`: Timestamp of when the support session was created.
- `messages`: List of messages exchanged in the support session (array of SupportMessage objects).
- `is_closed`: Boolean indicating if the support session is closed.
- `closed_at`: Timestamp of when the support session was closed (optional).

#### SupportMessage

- `sender_id`: ID of the user who sent the message (UUID).
- `content`: Content of the message (string).
- `created_at`: Timestamp of when the message was created.
- `is_instructor`: Boolean indicating if the sender is an instructor.
- `read`: Boolean indicating if the message has been read by the recipient.

## API Endpoints

| Method | Endpoint                            | Description                                                                       | Role                |
| ------ | ----------------------------------- | --------------------------------------------------------------------------------- | ------------------- |
| GET    | /api/v1/support/sessions            | List all support sessions (instructors view all, students view their own)         | Student, Instructor |
| GET    | /api/v1/support/sessions/{id}       | Get support session by ID (instructors can view all, students can view their own) | Student, Instructor |
| POST   | /api/v1/support/sessions            | Create a new support session                                                      | Student             |
| POST   | /api/v1/support/sessions/{id}/close | Close a support session (only the student who created it can close it)            | Student             |

## WebSocket Implementation

Support Service uses **Spring WebSocket with STOMP protocol** for real-time chat functionality:

- Authenticated via JWT token in WebSocket connection handshake
- Real-time bidirectional communication between students and instructors
- Messages are persisted in the database for history

### Configuration

See `sources/services/support/src/apsas/support/config/WebSocketConfig.java` for WebSocket configuration.

## WebSocket Endpoints

| Endpoint    | Description                                   | Role                |
| ----------- | --------------------------------------------- | ------------------- |
| /ws/support | WebSocket endpoint for real-time chat support | Student, Instructor |

### WebSocket Messages

- **Client to Server Messages**:

  - `join`: Join a support session (payload: `{ "sessionId": "UUID" }`).
  - `leave`: Leave a support session (payload: `{ "sessionId": "UUID" }`).
  - `message`: Send a message in a support session (payload: `{ "sessionId": "UUID", "content": "string" }`).

- **Server to Client Messages**:
  - `session_joined`: A user has joined the support session (payload: `{ "sessionId": "UUID", "userId": "UUID" }`).
  - `session_left`: A user has left the support session (payload: `{ "sessionId": "UUID", "userId": "UUID" }`).
  - `new_message`: A new message has been sent in the support session (payload: `{ "sessionId": "UUID", "message": { ... } }`).
