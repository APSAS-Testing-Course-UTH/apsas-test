# Identity Service Instructions

Identity Service is a microservice responsible for managing user identities, authentication, and authorization within the APSAS platform. It handles user registration, login, profile management, and role-based access control.

## Authentication

The Identity Service uses JWT (JSON Web Tokens) for authentication. JWT stores user information and roles, allowing for secure and stateless authentication across services.

API Gateway verifies JWT tokens included in the request headers to authenticate users. It checks the token's validity and extracts user roles to enforce access control based on predefined policies.

## User Model

- `id`: Unique identifier for the user (UUID).
- `email`: Unique email address for the user.
- `password_hash`: Hashed password for secure storage.
- `first_name`: User's first name.
- `last_name`: User's last name.
- `role`: User role (Student, Instructor, Content Provider, Admin).
- `is_active`: Boolean indicating if the user account is active.
- `is_email_verified`: Boolean indicating if the user's email is verified.

_Note: Passwords are hashed using bcrypt before storage. Role hierarchy is not enforced; roles are independent._

## Integration

- **Notification Service**: Sends verification emails and password reset links.

## API Endpoints (outdated)

| Method | Endpoint                | Description            | Role              |
| ------ | ----------------------- | ---------------------- | ----------------- |
| POST   | /api/v1/register        | Register a new user    | Public            |
| POST   | /api/v1/login           | User login             | Public            |
| POST   | /api/v1/email/verify    | Verify email           | Public            |
| POST   | /api/v1/password/forgot | Request password reset | Public            |
| POST   | /api/v1/password/reset  | Reset password         | Public            |
| GET    | /api/v1/profile         | Get user profile       | Authenticated     |
| PATCH  | /api/v1/profile         | Update user profile    | Authenticated     |
| PATCH  | /api/v1/change-password | Change password        | Authenticated     |
| GET    | /api/v1/users           | List all users         | Admin             |
| GET    | /api/v1/users/{id}      | Get user by ID         | Admin, Instructor |
| POST   | /api/v1/users           | Create a new user      | Admin             |
| PATCH  | /api/v1/users/{id}      | Update user info       | Admin             |
| PATCH  | /api/v1/users/{id}/role | Update user role       | Admin             |
| PATCH  | /api/v1/users/{id}/lock | Lock/Unlock user       | Admin             |
| DELETE | /api/v1/users/{id}      | Delete a user          | Admin             |
