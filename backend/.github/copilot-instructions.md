# Copilot Instructions

## Technology Stack

- **Language**: Java 21 with virtual threads enabled (`spring.threads.virtual.enabled: true`)
- **Framework**: Spring Boot 3.5.6, Spring Cloud 2025.0.0
- **Build Tool**: Amper (not Gradle/Maven) - uses `module.yaml` files
- **Database**: PostgreSQL 17 (single DB, schema-per-service isolation)
- **Messaging**: RabbitMQ 4.1 with topic exchange pattern
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway (WebFlux-based, port 8080)
- **Config**: Spring Cloud Config Server with file-based repository
- **Documentation**: SpringDoc OpenAPI

## Architecture Overview

**APSAS** (Automated Programming Skills Assessment System) evaluates student code submissions automatically using microservices. Key flow:

1. **API Gateway** (`sources/gateway`) routes REST requests to services, validates JWT tokens
2. **Identity Service** (port 8081) handles auth, publishes `UserRegisteredEvent`, `PasswordResetRequestedEvent` 
3. **Content Service** manages assignments, publishes `AssignmentPublishedEvent`
4. **Submission Service** receives code, publishes `SubmissionCreatedEvent` → **Evaluation Service** listens
5. **Evaluation Service** calls Piston API for code execution, publishes `SubmissionEvaluatedEvent` back
6. **Notification Service** listens to all events, sends emails via Mailpit (dev) using templates
7. **Support Service** provides WebSocket-based real-time chat for student help

All services register with **Service Registry** (Eureka) and fetch config from **Config Server**.

## Project Structure (Amper Build System)

**Critical**: This project uses **Amper**, not Gradle/Maven. Key differences:

```
sources/
├── service-registry/          # Netflix Eureka server
├── config-server/             # Centralized configuration
├── gateway/                   # API Gateway (WebFlux)
├── services/
│   ├── identity/              # Auth & user management
│   ├── content/               # Assignments & resources
│   ├── submission/            # Code submission handling
│   ├── evaluation/            # Piston API integration
│   ├── notification/          # Email notifications
│   └── support/               # WebSocket chat support
└── shared/
    ├── common/                # GlobalExceptionHandler, PageResponse, custom exceptions
    ├── messaging/             # RabbitMQConfig, event models (UserRegisteredEvent, etc.)
    └── security/              # JWT utilities, UserPrincipal

config/                        # Config repository (NOT in classpath)
├── application.yaml           # Global config (virtual threads)
├── <service-name>.yaml        # Service-specific config
├── <service-name>-dev.yaml    # Dev profile overrides
└── fragments/                 # Reusable fragments (database.yaml, jwt.yaml, eureka-client.yaml, etc.)
```

### Amper Module Structure

Each module has **NO** `src/main/java` or `src/main/resources`:

```
module/
├── module.yaml                # Dependencies & settings (like build.gradle)
├── src/                       # Java source (directly, e.g., apsas/identity/...)
├── resources/                 # application.yaml, schema.sql
├── test/                      # Test source
└── testResources/             # Test resources
```

### Module Configuration Patterns

**Service modules** (`sources/services/*/module.yaml`):
```yaml
product: jvm/app
apply:
  - ../../jvm.module-template.yaml           # Base JVM settings
  - ../service.module-template.yaml          # Spring Boot + Eureka + Config
  - ../service-test.module-template.yaml     # Test dependencies
settings:
  jvm:
    mainClass: apsas.identity.IdentityServiceApplication
  java:
    annotationProcessing:
      processors:
        - $libs.mapstruct.processor          # MapStruct for DTO mapping
dependencies:
  - ../../shared/security
  - ../../shared/messaging
  - ../../shared/common
  - $spring.boot.starter.web                 # Amper predefined starters
  - $libs.postgresql                         # From libs.versions.toml
```

**Shared library modules** (`sources/shared/*/module.yaml`):
```yaml
product: jvm/lib
apply:
  - ../../jvm.module-template.yaml
  - ../spring-lib.module-template.yaml
dependencies:
  - $spring.boot.starter.amqp: exported      # Export RabbitMQ to consumers
```

## Configuration Management

**Two-stage config loading**:
1. **Bootstrap** (`resources/application.yaml` in each service): Connects to Config Server, sets `spring.application.name`
2. **Remote config** (`config/<service-name>.yaml`): Imported from Config Server, includes fragments

**Service config pattern** (`config/identity-service.yaml`):
```yaml
spring:
  config:
    import:
      - file:./config/fragments/jwt.yaml
      - file:./config/fragments/database.yaml
      - file:./config/fragments/eureka-client.yaml
database:
  schema: identity             # Used in schema.sql: CREATE SCHEMA IF NOT EXISTS identity;
server:
  port: 8081
```

**Fragment reuse** (`config/fragments/database-dev.yaml`):
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/apsas?currentSchema=${database.schema}
```

## Database Conventions

- **Schema isolation**: Each service owns its schema (`identity`, `content`, `submission`, etc.)
- **No migrations**: Manual SQL in `resources/schema.sql` (executed on startup)
- **Schema pattern**:
  ```sql
  CREATE SCHEMA IF NOT EXISTS identity;
  CREATE TABLE IF NOT EXISTS identity.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    ...
  );
  ```
- **JPA entities**: No schema annotation needed if `currentSchema` set in JDBC URL

## Event-Driven Messaging (RabbitMQ)

**Centralized config** in `shared/messaging/src/apsas/messaging/event/RabbitMQConfig.java`:
```java
public static final String EXCHANGE = "apsas.exchange";
public static final String USER_REGISTERED_ROUTING_KEY = "user.registered";
// Topic exchange for flexible routing
```

**Event models** in `shared/messaging/src/apsas/messaging/event/`:
- `UserRegisteredEvent` (userId, email, fullName, verificationToken)
- `PasswordResetRequestedEvent` (userId, email, resetToken, expiresAt)
- `SubmissionCreatedEvent` (submissionId, assignmentId, studentId, code, language)
- `SubmissionEvaluatedEvent` (submissionId, score, testCaseResults[], feedback)

**Publishing pattern** (services define their own publishers, no shared publisher):
```java
// In identity service
rabbitTemplate.convertAndSend(
    RabbitMQConfig.EXCHANGE,
    RabbitMQConfig.USER_REGISTERED_ROUTING_KEY,
    new UserRegisteredEvent(...)
);
```

**Listening pattern** (`@RabbitListener` in service-specific listeners):
```java
@RabbitListener(queues = "submission.evaluated.queue")
public void handleSubmissionEvaluated(SubmissionEvaluatedEvent event) { ... }
```

**Queue binding**: Done in service-specific config classes (see `notification/config/MessagingConfig.java`)

## Code Patterns

### Exception Handling
**Shared handler** in `shared/common/src/apsas/shared/common/exception/GlobalExceptionHandler.java`:
- Extends `ResponseEntityExceptionHandler`
- Returns RFC 9457 `ProblemDetail` format
- Custom exceptions: `BadRequestException`, `NotFoundException`, `UnauthorizedException`, `ForbiddenException`

### DTO Mapping with MapStruct
**Always use MapStruct** for entity ↔DTO conversion:
```java
@Mapper(componentModel = ComponentModel.SPRING, uses = {SupportMessageMapper.class})
public interface SupportSessionMapper {
  SupportSessionDto toDto(SupportSession session);
}
```
- Add `$libs.mapstruct.processor` to `annotationProcessing.processors` in `module.yaml`
- Generated mappers are Spring beans, inject via constructor

### Pagination
**Shared utility** in `shared/common`:
- `PageRequestParams` (page, size, sort) for request params
- `PageResponse<T>` for responses (content, totalPages, totalElements, etc.)

### API Documentation
**Swagger annotations** on all controllers:
```java
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
@Operation(summary = "Register a new user", description = "Register a new user account with student role")
```

## Development Workflow

### Local Setup
```bash
# Start infrastructure
docker compose -f docker-compose.dev.yaml up -d
# postgres:5432, rabbitmq:5672/15672, mailpit:1025/8025

# Build all modules
./amper build

# Build specific service
./amper build -m identity

# Run service (ensure service-registry, config-server running first)
# Services auto-register with Eureka at http://localhost:8761
```

### Service Startup Order
1. **Service Registry** (Eureka) - port 8761
2. **Config Server** - port 8888
3. **API Gateway** - port 8080
4. **Other services** - identity:8081, content:8082, etc.

### Testing
```bash
./amper test              # All tests
./amper test -m identity  # Service-specific tests
```

### Common Pitfalls
- **Amper cache issues**: Delete `build/` folder if dependencies not resolving
- **Config not loading**: Check `spring.application.name` matches config file name
- **Eureka registration fails**: Ensure `eureka.instance.hostname` set (defaults to `localhost`)
- **RabbitMQ not connected**: Check `config/fragments/rabbitmq-dev.yaml` matches Docker Compose

## Service-Specific Guides

Detailed instructions in `.github/instructions/`:
- `identity-service.instructions.md` - JWT auth, email verification flow
- `content-service.instructions.md` - Assignments, tutorials, skills management
- `submission-service.instructions.md` - Code submission handling and evaluation flow
- `evaluation-service.instructions.md` - Piston API integration, retry logic
- `support-service.instructions.md` - WebSocket chat implementation
- `notification-service.instructions.md` - Email/push notifications, FCM integration
- `api-gateway.instructions.md` - Route configuration, JWT validation
- `requirements.instructions.md` - Business requirements, user roles

## Key Files to Reference

- `libs.versions.toml` - Dependency versions (Gradle catalog syntax)
- `project.yaml` - Root module list
- `sources/services/service.module-template.yaml` - Service defaults (Eureka + Config)
- `shared/messaging/src/apsas/messaging/event/RabbitMQConfig.java` - Exchange & routing keys
- `shared/common/src/apsas/shared/common/exception/GlobalExceptionHandler.java` - Error responses
