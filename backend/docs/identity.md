# Identity Service

The Identity Service handles user authentication, authorization, and user management for the APSAS platform.

## Features

- User registration and authentication
- JWT-based token authentication
- Email verification
- Password reset functionality
- User profile management
- Role-based access control (RBAC)
- Integration with RabbitMQ for event-driven notifications

## Technologies

- Java 21
- Spring Boot 3.5.6
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT (JSON Web Token)
- RabbitMQ
- Swagger/OpenAPI

## User Roles

- `STUDENT`: Regular student users
- `INSTRUCTOR`: Instructors who can view user information
- `CONTENT_PROVIDER`: Content creators
- `ADMIN`: System administrators with full access

## API Endpoints

### Authentication Endpoints (Public)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Management Endpoints (Protected)

- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `POST /api/v1/users/me/change-password` - Change password
- `GET /api/v1/users/{userId}` - Get user by ID (Admin/Instructor)
- `GET /api/v1/users` - Get all users (Admin only)
- `GET /api/v1/users/role/{role}` - Get users by role (Admin/Instructor)
- `POST /api/v1/users` - Create new user (Admin only)
- `PUT /api/v1/users/{userId}/deactivate` - Deactivate user (Admin only)
- `PUT /api/v1/users/{userId}/activate` - Activate user (Admin only)
- `DELETE /api/v1/users/{userId}` - Delete user (Admin only)

## Environment Variables

The service can be configured using the following environment variables:

### Database Configuration

- `DB_HOST` - PostgreSQL host (default: localhost)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name (default: apsas)
- `DB_USERNAME` - Database username (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)

### RabbitMQ Configuration

- `RABBITMQ_HOST` - RabbitMQ host (default: localhost)
- `RABBITMQ_PORT` - RabbitMQ port (default: 5672)
- `RABBITMQ_USERNAME` - RabbitMQ username (default: guest)
- `RABBITMQ_PASSWORD` - RabbitMQ password (default: guest)

### JWT Configuration

- `JWT_SECRET` - JWT secret key (minimum 256 bits, **must be changed in production**)
- `JWT_EXPIRATION` - JWT token expiration time in milliseconds (default: 86400000 = 24 hours)
- `JWT_REFRESH_EXPIRATION` - Refresh token expiration in milliseconds (default: 604800000 = 7 days)

### Verification Configuration

- `EMAIL_TOKEN_EXPIRATION` - Email verification token expiration in seconds (default: 86400 = 24 hours)
- `PASSWORD_RESET_TOKEN_EXPIRATION` - Password reset token expiration in seconds (default: 3600 = 1 hour)

### Server Configuration

- `SERVER_PORT` - Service port (default: 8081)
- `JPA_SHOW_SQL` - Show SQL queries in logs (default: false)

## Database Schema

The service uses the `identity` schema in PostgreSQL with the following tables:

### users

- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique, Not Null)
- `password_hash` (VARCHAR, Not Null)
- `first_name` (VARCHAR(100), Not Null)
- `last_name` (VARCHAR(100), Not Null)
- `role` (VARCHAR(50), Not Null)
- `is_active` (BOOLEAN, Default: true)
- `is_email_verified` (BOOLEAN, Default: false)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### email_verification_tokens

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `token` (VARCHAR, Unique, Not Null)
- `expires_at` (TIMESTAMP, Not Null)
- `created_at` (TIMESTAMP)

### password_reset_tokens

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `token` (VARCHAR, Unique, Not Null)
- `expires_at` (TIMESTAMP, Not Null)
- `created_at` (TIMESTAMP)

## RabbitMQ Events

The service publishes the following events:

### UserRegisteredEvent

- **Exchange**: `apsas.exchange`
- **Routing Key**: `user.registered`
- **Queue**: `user.registered.queue`
- **Payload**:
  ```json
  {
    "userId": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "verificationToken": "string",
    "timestamp": "datetime"
  }
  ```

### PasswordResetRequestedEvent

- **Exchange**: `apsas.exchange`
- **Routing Key**: `password.reset`
- **Queue**: `password.reset.queue`
- **Payload**:
  ```json
  {
    "email": "string",
    "firstName": "string",
    "resetToken": "string",
    "timestamp": "datetime"
  }
  ```

## Running the Service

### Prerequisites

1. PostgreSQL database running and accessible
2. RabbitMQ server running
3. Database schema initialized (run `schema.sql`)

### Build

```bash
amper build -m identity
```

### Run

```bash
java -jar build/tasks/identity/executableJarJvm/identity.jar
```

## API Documentation

Once the service is running, you can access the Swagger UI at:

- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **OpenAPI Docs**: http://localhost:8081/api-docs

## Security

- All passwords are hashed using BCrypt
- JWT tokens are used for authentication
- Tokens expire after 24 hours (configurable)
- Email verification required for new accounts (optional enforcement)
- Password reset tokens expire after 1 hour
- Role-based access control using Spring Security

## Best Practices

1. **Change JWT Secret**: Always use a strong, random secret key in production (minimum 256 bits)
2. **HTTPS**: Use HTTPS in production to protect JWT tokens in transit
3. **Token Storage**: Store JWT tokens securely on the client side (e.g., httpOnly cookies)
4. **Password Policy**: Minimum 8 characters (can be extended with more validation)
5. **Rate Limiting**: Consider implementing rate limiting for authentication endpoints
6. **Audit Logging**: Consider adding audit logs for sensitive operations

## Integration with Other Services

The Identity Service integrates with the Notification Service through RabbitMQ events to:

- Send email verification links to new users
- Send password reset emails

Ensure the Notification Service is listening to the appropriate queues to handle these events.
