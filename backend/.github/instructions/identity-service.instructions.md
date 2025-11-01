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

## API Endpoints

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint                  | Description                        | Role   |
|--------|---------------------------|------------------------------------|--------|
| POST   | /api/auth/register        | Register a new user (student role) | Public |
| POST   | /api/auth/login           | User login                         | Public |
| POST   | /api/auth/verify-email    | Verify email with token            | Public |
| POST   | /api/auth/resend-verification | Resend verification email      | Public |
| POST   | /api/auth/forgot-password | Request password reset             | Public |
| POST   | /api/auth/reset-password  | Reset password with token          | Public |

### User Management Endpoints (`/api/v1/users`)

| Method | Endpoint                    | Description                      | Role              |
|--------|-----------------------------|----------------------------------|-------------------|
| GET    | /api/v1/users/me            | Get current user profile         | Authenticated     |
| PUT    | /api/v1/users/me            | Update current user profile      | Authenticated     |
| POST   | /api/v1/users/me/change-password | Change current user password | Authenticated     |
| GET    | /api/v1/users/{userId}      | Get user by ID                   | Admin, Instructor |
| GET    | /api/v1/users               | List all users (paginated)       | Admin             |
| GET    | /api/v1/users/role/{role}   | List users by role (paginated)   | Admin, Instructor |
| POST   | /api/v1/users               | Create a new user                | Admin             |
| PUT    | /api/v1/users/{userId}/activate | Activate user account        | Admin             |
| PUT    | /api/v1/users/{userId}/deactivate | Deactivate user account    | Admin             |
| DELETE | /api/v1/users/{userId}      | Delete a user                    | Admin             |

## Port

- **Default**: 8081

## Events Published

- **UserRegisteredEvent**: Published to `user.registered` routing key when a new user registers
  - Consumed by: Notification Service (sends verification email)
- **PasswordResetRequestedEvent**: Published to `password.reset` routing key when password reset is requested
  - Consumed by: Notification Service (sends reset email)
