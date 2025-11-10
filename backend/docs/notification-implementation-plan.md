# Notification Service Implementation Plan

## Overview

The Notification Service handles email notifications and web push notifications via Firebase Cloud Messaging (FCM). It consumes events from RabbitMQ and delivers notifications through appropriate channels.

## Architecture

- **Email Notifications**: SMTP-based email delivery using Spring Mail
- **Push Notifications**: Firebase Cloud Messaging (FCM) for web push
- **Event-Driven**: Consumes RabbitMQ events from other services
- **Configuration**: Centralized via Config Server
- **Rate Limiting**: Simple rate limiting implementation

## Technology Stack

- **Spring Boot 3.5.6**: Core framework
- **Spring Mail**: SMTP email delivery
- **Firebase Admin SDK**: FCM push notifications
- **Spring AMQP**: RabbitMQ message consumption
- **Spring Data JPA**: Device token and preferences persistence
- **PostgreSQL**: Database for tokens and preferences
- **Thymeleaf**: Email template engine

## Implementation Steps

### 1. Configure Dependencies and Messaging

#### 1.1 Update `sources/services/notification/module.yaml`

Add dependencies:
```yaml
dependencies:
  - ../../shared/messaging
  - ../../shared/common
  - $spring.boot.starter.web
  - $spring.boot.starter.data.jpa
  - $spring.boot.starter.mail
  - $spring.boot.starter.thymeleaf
  - $spring.boot.starter.validation
  - $spring.boot.starter.amqp
  - $"org.postgresql:postgresql"
  - $libs.springdoc.openapi.starter.webmvc.api
```

Add Firebase Admin SDK to `libs.versions.toml`:
```toml
[versions]
firebase-admin = "9.7.0"

[libraries]
firebase-admin = { module = "com.google.firebase:firebase-admin", version.ref = "firebase-admin" }
```

#### 1.2 Create Messaging Configuration

**File**: `sources/services/notification/src/apsas/notification/config/MessagingConfig.java`

Configure RabbitMQ queues and bindings:
- `notification.user.registered` → binds to `user.registered`
- `notification.password.reset` → binds to `password.reset`
- `notification.assignment.published` → binds to `assignment.published`
- `notification.assignment.schedule.updated` → binds to `assignment.schedule.updated`
- `notification.submission.evaluated` → binds to `submission.evaluated`

### 2. Implement Email Notification Service

#### 2.1 Email Service Layer

**File**: `sources/services/notification/src/apsas/notification/service/EmailService.java`

Features:
- Send HTML emails using JavaMailSender
- Template rendering with Thymeleaf
- Async email sending
- Error handling and logging

#### 2.2 Email Templates

Create Thymeleaf templates in `sources/services/notification/resources/templates/email/`:
- `verification-email.html` - Email verification with token link
- `password-reset-email.html` - Password reset link
- `assignment-published.html` - New assignment notification
- `assignment-reminder.html` - Assignment deadline reminder
- `submission-evaluated.html` - Evaluation results notification

Template variables:
- User name (firstName, lastName)
- Action link (verification URL, reset URL)
- Assignment details (title, deadline, description)
- Submission results (score, status, feedback)

#### 2.3 SMTP Configuration

**File**: `config/notification-service.yaml`

```yaml
spring:
  mail:
    host: ${SMTP_HOST:smtp.gmail.com}
    port: ${SMTP_PORT:587}
    username: ${SMTP_USERNAME}
    password: ${SMTP_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
        transport:
          protocol: smtp
    default-encoding: UTF-8

notification:
  email:
    from: ${EMAIL_FROM:noreply@apsas.edu.vn}
    from-name: ${EMAIL_FROM_NAME:APSAS System}
    verification-url: ${VERIFICATION_BASE_URL:http://localhost:3000}/verify-email
    reset-password-url: ${RESET_PASSWORD_BASE_URL:http://localhost:3000}/reset-password
```

### 3. Implement FCM Push Notification Service

#### 3.1 FCM Service Layer

**File**: `sources/services/notification/src/apsas/notification/service/FcmService.java`

Features:
- Initialize Firebase Admin SDK
- Send push notifications to device tokens
- Send to multiple devices (multicast)
- Handle invalid/expired tokens
- Error handling and retry logic

#### 3.2 Device Token Management

**Entity**: `sources/services/notification/src/apsas/notification/model/entity/DeviceToken.java`

Fields:
- `id` (UUID)
- `userId` (UUID) - foreign key to identity service
- `token` (String) - FCM device token
- `deviceType` (String) - WEB, ANDROID, IOS
- `userAgent` (String) - browser/device info
- `isActive` (Boolean)
- `createdAt`, `updatedAt` (LocalDateTime)

**Repository**: `sources/services/notification/src/apsas/notification/repository/DeviceTokenRepository.java`

**Service**: `sources/services/notification/src/apsas/notification/service/DeviceTokenService.java`

Methods:
- `registerToken(userId, token, deviceType, userAgent)`
- `deactivateToken(token)`
- `getActiveTokensByUserId(userId)`
- `removeExpiredTokens()`

#### 3.3 REST API for Device Registration

**Controller**: `sources/services/notification/src/apsas/notification/controller/DeviceTokenController.java`

Endpoints:
- `POST /api/v1/devices/register` - Register FCM token
- `DELETE /api/v1/devices/{token}` - Remove token
- `GET /api/v1/devices` - List user's registered devices

#### 3.4 Firebase Configuration

**File**: `sources/services/notification/src/apsas/notification/config/FirebaseConfig.java`

Initialize Firebase Admin SDK with credentials from Config Server.

**File**: `config/notification-service.yaml`

```yaml
firebase:
  credentials:
    type: ${FIREBASE_CREDENTIALS_TYPE:service_account}
    project-id: ${FIREBASE_PROJECT_ID}
    private-key-id: ${FIREBASE_PRIVATE_KEY_ID}
    private-key: ${FIREBASE_PRIVATE_KEY}
    client-email: ${FIREBASE_CLIENT_EMAIL}
    client-id: ${FIREBASE_CLIENT_ID}
```

### 4. Create Event Listeners

#### 4.1 User Event Listener

**File**: `sources/services/notification/src/apsas/notification/listener/UserEventListener.java`

Methods:
- `handleUserRegistered(UserRegisteredEvent)` - Send verification email
- `handlePasswordResetRequested(PasswordResetRequestedEvent)` - Send reset email

#### 4.2 Assignment Event Listener

**File**: `sources/services/notification/src/apsas/notification/listener/AssignmentEventListener.java`

Methods:
- `handleAssignmentPublished(AssignmentPublishedEvent)` - Send email + push to students
- `handleAssignmentScheduleUpdated(AssignmentScheduleUpdatedEvent)` - Send updates

#### 4.3 Submission Event Listener

**File**: `sources/services/notification/src/apsas/notification/listener/SubmissionEventListener.java`

Methods:
- `handleSubmissionEvaluated(SubmissionEvaluatedEvent)` - Send results to student

Each listener:
- Consumes from appropriate RabbitMQ queue
- Checks user notification preferences
- Applies rate limiting
- Sends notifications via email and/or push
- Logs success/failure

### 5. Database Schema and Configuration

#### 5.1 Database Schema

**File**: `sources/services/notification/resources/schema.sql`

Tables:
```sql
CREATE SCHEMA IF NOT EXISTS notification;

-- Device tokens for push notifications
CREATE TABLE notification.device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    device_type VARCHAR(20) NOT NULL,
    user_agent VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_device_tokens_user_id ON notification.device_tokens(user_id);
CREATE INDEX idx_device_tokens_active ON notification.device_tokens(is_active);

-- Notification preferences
CREATE TABLE notification.preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    
    -- Email preferences by type
    email_verification BOOLEAN DEFAULT true,
    email_password_reset BOOLEAN DEFAULT true,
    email_assignment_published BOOLEAN DEFAULT true,
    email_assignment_reminder BOOLEAN DEFAULT true,
    email_submission_evaluated BOOLEAN DEFAULT true,
    
    -- Push preferences by type
    push_assignment_published BOOLEAN DEFAULT true,
    push_assignment_reminder BOOLEAN DEFAULT true,
    push_submission_evaluated BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_preferences_user_id ON notification.preferences(user_id);

-- Rate limiting tracking (simple implementation)
CREATE TABLE notification.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    sent_count INTEGER DEFAULT 0,
    window_start TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, notification_type, window_start)
);

CREATE INDEX idx_rate_limits_user_window ON notification.rate_limits(user_id, window_start);
```

#### 5.2 Database Configuration

**File**: `config/notification-service.yaml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:apsas}?currentSchema=notification
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  sql:
    init:
      mode: always
      schema-locations: classpath:schema.sql
```

#### 5.3 Application Configuration

**File**: `sources/services/notification/resources/application.yaml`

```yaml
spring:
  application:
    name: notification-service
```

### 6. Implement Notification Preferences

#### 6.1 Preferences Entity and Repository

**Entity**: `sources/services/notification/src/apsas/notification/model/entity/NotificationPreferences.java`

**Repository**: `sources/services/notification/src/apsas/notification/repository/NotificationPreferencesRepository.java`

#### 6.2 Preferences Service

**File**: `sources/services/notification/src/apsas/notification/service/NotificationPreferencesService.java`

Methods:
- `getPreferences(userId)` - Get user preferences (create default if not exists)
- `updatePreferences(userId, preferences)` - Update preferences
- `isNotificationEnabled(userId, notificationType, channel)` - Check if enabled

#### 6.3 REST API for Preferences

**Controller**: `sources/services/notification/src/apsas/notification/controller/NotificationPreferencesController.java`

Endpoints:
- `GET /api/v1/preferences` - Get current user's preferences
- `PUT /api/v1/preferences` - Update preferences

### 7. Implement Simple Rate Limiting

#### 7.1 Rate Limit Service

**File**: `sources/services/notification/src/apsas/notification/service/RateLimitService.java`

Strategy:
- Fixed window rate limiting
- Per user, per notification type
- Configurable limits (e.g., max 5 emails per hour per type)
- Automatic window reset
- Simple database tracking

Methods:
- `checkRateLimit(userId, notificationType)` - Returns true if allowed
- `incrementCounter(userId, notificationType)` - Increment sent count
- `resetExpiredWindows()` - Cleanup old entries

#### 7.2 Rate Limit Configuration

**File**: `config/notification-service.yaml`

```yaml
notification:
  rate-limit:
    enabled: true
    window-minutes: 60
    limits:
      email-verification: 3
      password-reset: 3
      assignment-published: 10
      assignment-reminder: 10
      submission-evaluated: 20
```

#### 7.3 Integration with Listeners

Each event listener checks rate limits before sending:
```java
if (!rateLimitService.checkRateLimit(userId, notificationType)) {
    logger.warn("Rate limit exceeded for user: {}, type: {}", userId, notificationType);
    return;
}
```

### 8. Error Handling and Logging

#### 8.1 Exception Handling

**File**: `sources/services/notification/src/apsas/notification/exception/NotificationException.java`

Custom exceptions:
- `EmailSendException`
- `FcmSendException`
- `RateLimitExceededException`

**File**: `sources/services/notification/src/apsas/notification/exception/GlobalExceptionHandler.java`

Handle exceptions and return appropriate responses.

#### 8.2 Logging Strategy

- INFO: Successful notification sends
- WARN: Rate limits, invalid tokens, disabled preferences
- ERROR: Email/FCM failures, configuration issues
- Use SLF4J with structured logging

## DTOs and Models

### Request/Response DTOs

**Package**: `sources/services/notification/src/apsas/notification/model/dto/`

Classes:
- `RegisterDeviceRequest` - Register FCM token
- `DeviceTokenResponse` - Device token info
- `NotificationPreferencesRequest` - Update preferences
- `NotificationPreferencesResponse` - Preferences data
- `SendEmailRequest` - Manual email send (admin)
- `SendPushRequest` - Manual push send (admin)

## Testing Strategy

### Unit Tests

- Email template rendering
- FCM message building
- Rate limit logic
- Preference checking

### Integration Tests

- RabbitMQ event consumption
- Database operations
- Email sending (with mock SMTP)
- FCM sending (with mock Firebase)

### Manual Testing

- Register user → verify email received
- Reset password → verify reset email
- Publish assignment → verify notifications
- Submit code → verify evaluation notification
- Register device token → verify push notification

## Security Considerations

1. **Email Security**
   - Use TLS/STARTTLS for SMTP
   - Validate email addresses
   - Prevent email injection

2. **FCM Security**
   - Secure Firebase credentials in Config Server
   - Validate device tokens
   - Token rotation

3. **API Security**
   - JWT authentication for all endpoints
   - User can only manage their own devices/preferences
   - Admin endpoints for manual notifications

4. **Rate Limiting**
   - Prevent notification spam
   - Per-user limits
   - Monitor and alert on abuse

## Deployment Considerations

1. **Environment Variables** (via Config Server)
   - SMTP credentials
   - Firebase credentials
   - Database connection
   - Base URLs for links

2. **Scaling**
   - Stateless service (can scale horizontally)
   - Async email sending
   - Connection pooling for SMTP
   - RabbitMQ consumer concurrency

3. **Monitoring**
   - Email send success/failure rates
   - FCM delivery rates
   - Queue depth and processing time
   - Rate limit violations

4. **Graceful Degradation**
   - Continue if email fails (log and alert)
   - Continue if push fails (log and alert)
   - Fallback to email if push unavailable

## Future Enhancements

1. **Notification History**
   - Store sent notifications
   - Retry failed notifications
   - User notification inbox

2. **Advanced Templates**
   - Multi-language support
   - Rich push notifications
   - Custom branding

3. **Analytics**
   - Open rates (email)
   - Click rates
   - Delivery metrics
   - User engagement

4. **Additional Channels**
   - SMS notifications
   - In-app notifications
   - Slack/Discord webhooks

## Dependencies Summary

### New Libraries to Add

1. **Firebase Admin SDK** - `com.google.firebase:firebase-admin:9.4.2`
2. **Spring Boot Mail** - Already available as Spring Boot starter
3. **Thymeleaf** - Already available as Spring Boot starter

### Existing Dependencies

- Spring Boot Web
- Spring Boot Data JPA
- Spring Boot AMQP
- PostgreSQL Driver
- Shared Messaging module
- Shared Common module

## Configuration Files Summary

### Files to Create/Modify

1. `sources/services/notification/module.yaml` - Add dependencies
2. `libs.versions.toml` - Add Firebase version
3. `config/notification-service.yaml` - Service configuration
4. `sources/services/notification/resources/application.yaml` - Update app name
5. `sources/services/notification/resources/schema.sql` - Database schema
6. Email templates in `resources/templates/email/`

## Implementation Timeline Estimate

- **Step 1**: Dependencies & Messaging - 2 hours
- **Step 2**: Email Service - 4 hours
- **Step 3**: FCM Service - 4 hours
- **Step 4**: Event Listeners - 3 hours
- **Step 5**: Database & Config - 2 hours
- **Step 6**: Preferences - 3 hours
- **Step 7**: Rate Limiting - 2 hours
- **Step 8**: Error Handling & Testing - 4 hours

**Total**: ~24 hours (3 days)

## Success Criteria

- [ ] Email notifications sent for all user events
- [ ] Push notifications delivered to registered devices
- [ ] User preferences respected
- [ ] Rate limiting prevents spam
- [ ] All events consumed from RabbitMQ
- [ ] API endpoints secured with JWT
- [ ] Database schema created and migrations run
- [ ] Configuration externalized to Config Server
- [ ] Error handling and logging implemented
- [ ] Integration tests passing
- [ ] Service registered with Eureka
- [ ] API documented with Swagger/OpenAPI
