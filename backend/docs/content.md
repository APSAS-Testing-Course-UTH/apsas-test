# Content Service

Content Service is a microservice responsible for managing programming assignments, educational resources, and course content within the APSAS platform. It allows instructors and content providers to create, update, and delete programming challenges and tutorials.

## Features

- **Assignment Management**: Create, update, publish, archive, and delete programming assignments
- **Skill Management**: Define and manage programming skills associated with assignments
- **Tutorial Management**: Create and manage educational tutorials and resources
- **Schedule Management**: Instructors can update assignment schedules (start and due dates)
- **Event Publishing**: Publishes events for assignment publications and schedule updates to notify other services

## Permissions

- **Student**: Read-only access to view assignments and tutorials
- **Instructor**: Update assignment schedules
- **Content Provider**: Create, update, and delete assignments, skills, and tutorials

## Models

### Assignment
- Contains programming challenges with test cases
- Supports multiple programming languages
- Can be associated with skills and tutorials
- Has three statuses: DRAFT, PUBLISHED, ARCHIVED
- Includes difficulty levels: EASY, MEDIUM, HARD

### Skill
- Represents programming skills (e.g., "Recursion", "Dynamic Programming")
- Can be associated with multiple assignments

### Tutorial
- Educational content in Markdown or HTML format
- Tagged for easy discovery
- Can be associated with assignments

## API Endpoints

### Assignments
- `GET /api/v1/assignments` - List all assignments
- `GET /api/v1/assignments/{id}` - Get assignment by ID
- `POST /api/v1/assignments` - Create new assignment (Content Provider)
- `PATCH /api/v1/assignments/{id}` - Update assignment (Content Provider)
- `PATCH /api/v1/assignments/{id}/schedule` - Update schedule (Instructor)
- `DELETE /api/v1/assignments/{id}` - Delete assignment (Content Provider)
- `POST /api/v1/assignments/{id}/publish` - Publish assignment (Content Provider)
- `POST /api/v1/assignments/{id}/archive` - Archive assignment (Content Provider)

### Skills
- `GET /api/v1/skills` - List all skills
- `GET /api/v1/skills/{id}` - Get skill by ID
- `POST /api/v1/skills` - Create new skill (Content Provider)
- `PATCH /api/v1/skills/{id}` - Update skill (Content Provider)
- `DELETE /api/v1/skills/{id}` - Delete skill (Content Provider)

### Tutorials
- `GET /api/v1/tutorials` - List all tutorials
- `GET /api/v1/tutorials/{id}` - Get tutorial by ID
- `POST /api/v1/tutorials` - Create new tutorial (Content Provider)
- `PATCH /api/v1/tutorials/{id}` - Update tutorial (Content Provider)
- `DELETE /api/v1/tutorials/{id}` - Delete tutorial (Content Provider)

## Database Schema

The service uses PostgreSQL with the following main tables:
- `content.assignments` - Programming assignments with test cases (JSONB)
- `content.skills` - Programming skills
- `content.tutorials` - Educational tutorials with tags (JSONB)
- `content.assignment_skills` - Many-to-many relationship
- `content.assignment_tutorials` - Many-to-many relationship

## Event Publishing

The service publishes the following events via RabbitMQ:
- `assignment.published` - When an assignment is published
- `assignment.schedule.updated` - When assignment schedule is updated

These events are consumed by the Notification Service to send notifications to students and instructors.

## Configuration

The service requires the following configuration:
- PostgreSQL database connection
- RabbitMQ connection for event publishing
- Eureka service registry for service discovery
- JWT secret for authentication (shared via config server)

## Running the Service

### Prerequisites
- Java 21
- PostgreSQL database
- RabbitMQ server
- Config Server running
- Service Registry (Eureka) running

### Build
```bash
amper build -m content
```

### Run
```bash
java -jar build/content/executableJarJvm/content.jar
```

The service will start on port 8083 by default.

## API Documentation

Once the service is running, API documentation is available at:
- Swagger UI: http://localhost:8083/swagger-ui.html
- OpenAPI JSON: http://localhost:8083/api-docs

## Security

The service uses JWT-based authentication with role-based access control:
- All endpoints require authentication except API documentation
- Role-specific endpoints are protected with `@PreAuthorize` annotations
- Supports roles: STUDENT, INSTRUCTOR, CONTENT_PROVIDER, ADMIN
