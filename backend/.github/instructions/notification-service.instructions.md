# Notification Service Instructions

Notification Service is a microservice responsible for managing notifications across the APSAS platform. It handles email notifications, push notifications via Firebase Cloud Messaging (FCM), and user notification preferences.

## Port

- **Default**: 8086

## Permissions

- **Authenticated Users**: Manage their own notification preferences and device tokens

## Models

### NotificationPreferences

- `userId`: ID of the user (UUID)
- `emailEnabled`: Boolean indicating if email notifications are enabled
- `pushEnabled`: Boolean indicating if push notifications are enabled
- `assignmentReminders`: Boolean for assignment deadline reminders
- `submissionUpdates`: Boolean for submission evaluation updates
- `supportMessages`: Boolean for support chat messages

### DeviceToken

- `id`: Unique identifier (UUID)
- `userId`: ID of the user who owns the device (UUID)
- `token`: FCM device token (string)
- `deviceType`: Type of device (ANDROID, IOS, WEB)
- `createdAt`: Timestamp when the token was registered

## Integration

### Email Notifications (Mailpit in Dev)

- **SMTP Server**: Mailpit (localhost:1025 in dev)
- **Web UI**: http://localhost:8025 for viewing sent emails
- **Templates**: Uses Thymeleaf templates for email content

### Push Notifications (Firebase Cloud Messaging)

- **Service Account**: Configured via Firebase Admin SDK
- **Configuration**: See `config/fragments/firebase.yaml` and `firebase-dev.yaml`
- Sends push notifications to registered mobile/web devices

## Events Consumed

The Notification Service listens to various events and sends appropriate notifications:

### User Events

- **UserRegisteredEvent** (from `user.registered.queue`)
  - Sends email verification link to newly registered users
  - Template: `verification-email.html`

- **PasswordResetRequestedEvent** (from `password.reset.queue`)
  - Sends password reset link to users
  - Template: `password-reset-email.html`

### Submission Events

- **SubmissionEvaluatedEvent** (from `submission.evaluated.queue`)
  - Notifies students when their submission has been evaluated
  - Includes score and feedback
  - Template: `submission-evaluated-email.html`

### Assignment Events

- **AssignmentPublishedEvent** (from assignment-related queues)
  - Notifies students when new assignments are published

- **AssignmentScheduleUpdatedEvent**
  - Notifies students of deadline changes

## API Endpoints

### Notification Preferences

| Method | Endpoint               | Description                                    | Role          |
|--------|------------------------|------------------------------------------------|---------------|
| GET    | /api/v1/preferences    | Get current user's notification preferences    | Authenticated |
| PUT    | /api/v1/preferences    | Update current user's notification preferences | Authenticated |

### Device Management (FCM Tokens)

| Method | Endpoint                   | Description                            | Role          |
|--------|----------------------------|----------------------------------------|---------------|
| POST   | /api/v1/devices/register   | Register FCM device token              | Authenticated |
| DELETE | /api/v1/devices/{token}    | Remove registered device token         | Authenticated |
| GET    | /api/v1/devices            | Get all registered devices for user    | Authenticated |

## Message Queue Configuration

Queue bindings are configured in `sources/services/notification/src/apsas/notification/config/MessagingConfig.java`:

- `USER_REGISTERED_QUEUE`: Bound to `user.registered` routing key
- `PASSWORD_RESET_QUEUE`: Bound to `password.reset` routing key
- `SUBMISSION_EVALUATED_QUEUE`: Bound to `submission.evaluated` routing key

## Email Templates

Email templates are located in `sources/services/notification/resources/templates/`:
- `verification-email.html`: Email verification template
- `password-reset-email.html`: Password reset template
- `submission-evaluated-email.html`: Submission results template

Templates use Thymeleaf for dynamic content rendering.

## Implementation Notes

- All notifications respect user preferences before sending
- Failed notification attempts are logged but don't block the application
- Device tokens are automatically removed if FCM reports them as invalid
- Rate limiting is applied to prevent notification spam (see `RateLimit` entity)
