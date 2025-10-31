# Submission Service

The Submission Service is a core component of the Automated Programming Skills Assessment System (APSAS) that handles
student code submissions, manages evaluation results, and provides role-based access to submission data.

## Overview

This microservice manages the complete lifecycle of programming assignment submissions, from initial submission to
evaluation results. It integrates with the Content Service for assignment details and communicates asynchronously with
the Evaluation Service for code assessment.

## Features

- **Student Submissions**: Accept and store programming assignment submissions
- **Role-Based Access Control**: Different permissions for students and instructors
- **Real-time Evaluation**: Asynchronous communication with evaluation service
- **Instructor Feedback**: Instructors can provide personalized feedback on submissions
- **Comprehensive Filtering**: Advanced filtering options for instructors
- **Event-Driven Architecture**: RabbitMQ integration for inter-service communication
- **RESTful API**: Well-documented endpoints with OpenAPI/Swagger
- **Database Isolation**: Dedicated PostgreSQL schema for data integrity

## Architecture

### Technology Stack

- **Language**: Java 21
- **Framework**: Spring Boot 3.5.6
- **Build Tool**: Amper Build Tool
- **Database**: PostgreSQL (dedicated `submission` schema)
- **Messaging**: RabbitMQ
- **Security**: JWT-based authentication with Spring Security
- **API Documentation**: OpenAPI/Swagger

### Microservices Integration

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Content       │    │   Submission    │    │   Evaluation    │
│   Service       │◄──►│   Service       │◄──►│   Service       │
│                 │    │                 │    │                 │
│ • Assignments   │    │ • Submissions  │    │ • Code          │
│ • Test Cases    │    │ • Results       │    │   Execution     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## API Endpoints

### Base URL

```
http://localhost:8083/api/v1
```

### Authentication

All endpoints require JWT authentication via Bearer token.

### Endpoints

#### Get All Submissions

```http
GET /api/v1/submissions
```

**Query Parameters:**

- `assignmentId` (UUID, optional) - Filter by assignment ID (instructors only)
- `studentId` (UUID, optional) - Filter by student ID (instructors only)
- `status` (enum: PENDING, EVALUATED, FAILED, optional) - Filter by submission status

**Authorization:**

- Students: View only their own submissions
- Instructors: View all submissions with filtering capabilities

**Response:**

```json
[
  {
    "id": "uuid",
    "assignmentId": "uuid",
    "studentId": "uuid",
    "submittedAt": "2025-10-10T10:00:00",
    "status": "PENDING",
    "code": "public class Solution { ... }",
    "language": "Java",
    "result": null,
    "score": null,
    "testCaseResults": null,
    "evaluatedAt": null,
    "feedback": null
  }
]
```

#### Get Submission by ID

```http
GET /api/v1/submissions/{id}
```

**Path Parameters:**

- `id` (UUID) - Submission ID

**Authorization:**

- Students: Can only view their own submissions
- Instructors: Can view any submission

**Response:** Single submission object (same format as above)

#### Create Submission

```http
POST /api/v1/submissions
```

**Authorization:** Students only

**Request Body:**

```json
{
  "assignmentId": "uuid",
  "code": "public class Solution { ... }",
  "language": "Java"
}
```

**Response:** Created submission object with HTTP 201

#### Provide Feedback
```http
POST /api/v1/submissions/{id}/feedback
```

**Path Parameters:**
- `id` (UUID) - Submission ID

**Authorization:** Instructors only

**Request Body:**
```json
{
  "feedback": "Great work! Your implementation is efficient and well-structured. Consider adding more edge case handling."
}
```

**Response:** Updated submission object with feedback included

## Database Schema

### Submissions Table

```sql
CREATE TABLE submission.submissions
(
    id                UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    assignment_id     UUID         NOT NULL,
    student_id        UUID         NOT NULL,
    submitted_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status            VARCHAR(50)  NOT NULL CHECK (status IN ('PENDING', 'EVALUATED', 'FAILED')),
    code              TEXT         NOT NULL,
    language          VARCHAR(100) NOT NULL,
    result            VARCHAR(50) CHECK (result IN ('PASSED', 'FAILED', 'PARTIAL')),
    score             DECIMAL(5, 2),
    test_case_results JSONB,
    evaluated_at      TIMESTAMP,
    feedback          TEXT
);
```

### Indexes

- `idx_submissions_assignment_id` - Assignment-based queries
- `idx_submissions_student_id` - Student-based queries
- `idx_submissions_status` - Status-based filtering
- `idx_submissions_submitted_at` - Time-based sorting
- `idx_submissions_assignment_student` - Composite index for common queries

## Event Messaging

### RabbitMQ Configuration

**Exchange:** `apsas.exchange`

**Queues:**

- `submission.created.queue` - For new submissions
- `submission.evaluated.queue` - For evaluation results

### Events

#### SubmissionCreatedEvent

Published when a student creates a new submission.

```json
{
  "submissionId": "uuid",
  "assignmentId": "uuid",
  "studentId": "uuid",
  "code": "source code here",
  "language": "Java"
}
```

#### SubmissionEvaluatedEvent

Consumed when evaluation is complete.

```json
{
  "submissionId": "uuid",
  "status": "EVALUATED",
  "result": "PASSED",
  "score": 95.50,
  "testCaseResults": [
    ...
  ],
  "evaluatedAt": "2025-10-10T10:05:00"
}
```

## Security

### Authentication

- JWT-based authentication via shared security module
- Header-based token validation

### Authorization

- **Students**: Can create submissions and view their own data
- **Instructors**: Can view all submissions with advanced filtering

### Permissions Matrix

| Operation            | Students | Instructors |
|----------------------|----------|-------------|
| Create Submission    | ✅        | ❌           |
| View Own Submissions | ✅        | ✅           |
| View All Submissions | ❌        | ✅           |
| Filter by Assignment | ❌        | ✅           |
| Filter by Student    | ❌        | ✅           |
| Provide Feedback     | ❌        | ✅           |

## Configuration

### Application Properties

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DATABASE_HOST:localhost}:${DATABASE_PORT:5432}/${DATABASE_NAME:apsas}
    username: ${DATABASE_USERNAME:postgres}
    password: ${DATABASE_PASSWORD:postgres}

  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABBITMQ_USERNAME:guest}
    password: ${RABBITMQ_PASSWORD:guest}

server:
  port: 8083

eureka:
  client:
    service-url:
      defaultZone: ${EUREKA_SERVER_URL:http://localhost:8761/eureka/}
```

### Environment Variables

| Variable            | Default                       | Description       |
|---------------------|-------------------------------|-------------------|
| `DATABASE_HOST`     | localhost                     | PostgreSQL host   |
| `DATABASE_PORT`     | 5432                          | PostgreSQL port   |
| `DATABASE_NAME`     | apsas                         | Database name     |
| `DATABASE_USERNAME` | postgres                      | Database username |
| `DATABASE_PASSWORD` | postgres                      | Database password |
| `RABBITMQ_HOST`     | localhost                     | RabbitMQ host     |
| `RABBITMQ_PORT`     | 5672                          | RabbitMQ port     |
| `RABBITMQ_USERNAME` | guest                         | RabbitMQ username |
| `RABBITMQ_PASSWORD` | guest                         | RabbitMQ password |
| `EUREKA_SERVER_URL` | http://localhost:8761/eureka/ | Eureka server URL |

## Development

### Prerequisites

- Java 21
- PostgreSQL
- RabbitMQ
- Amper Build Tool

### Building

```bash
# Build the entire project
./amper build

# Build only submission service
./amper build -m submission
```

### Running

```bash
# Run the service
./amper run -m submission
```

### Testing

```bash
# Run tests for submission service
./amper test -m submission
```

### API Documentation

When running, access Swagger UI at:

```
http://localhost:8083/swagger-ui.html
```

OpenAPI specification at:

```
http://localhost:8083/api-docs
```

## Project Structure

```
sources/services/submission/
├── src/vn/id/tozydev/apsas/submission/
│   ├── config/
│   │   ├── OpenApiConfig.java
│   │   ├── RabbitMQConfig.java
│   │   └── SecurityConfig.java
│   ├── controller/
│   │   └── SubmissionController.java
│   ├── event/
│   │   ├── EventListener.java
│   │   ├── EventPublisher.java
│   │   ├── SubmissionCreatedEvent.java
│   │   └── SubmissionEvaluatedEvent.java
│   ├── exception/
│   │   ├── BadRequestException.java
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ResourceNotFoundException.java
│   │   └── UnauthorizedException.java
│   ├── mapper/
│   │   └── SubmissionMapper.java
│   ├── model/
│   │   ├── dto/
│   │   │   ├── CreateSubmissionRequest.java
│   │   │   ├── SubmissionFeedbackRequest.java
│   │   │   ├── SubmissionResponse.java
│   │   │   └── TestCaseResultResponse.java
│   │   └── entity/
│   │       ├── Submission.java
│   │       ├── SubmissionResult.java
│   │       ├── SubmissionStatus.java
│   │       └── TestCaseResult.java
│   ├── repository/
│   │   └── SubmissionRepository.java
│   └── service/
│       └── SubmissionService.java
├── resources/
│   ├── application.yaml
│   └── schema.sql
├── module.yaml
└── README.md
```

## Error Handling

The service provides comprehensive error handling with appropriate HTTP status codes:

- `400 Bad Request` - Validation errors or invalid data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Unexpected errors

## Monitoring

### Health Checks

Access actuator endpoints at `/actuator/health` for service health status.

### Metrics

Spring Boot Actuator provides metrics and monitoring capabilities.

## Contributing

1. Follow the project's coding standards (Google Java Style Guide)
2. Write unit tests for new functionality
3. Update API documentation for endpoint changes
4. Ensure all builds pass before submitting PR

## License

This project is part of the APSAS system. See the main project license for details.
