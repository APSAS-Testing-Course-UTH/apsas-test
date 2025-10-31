# Copilot Instructions

## Technology Stack

- Language: Java 21
- Framework: Spring Boot 3.5.6
- Build Tool: Amper Build Tool
- Database: PostgreSQL
- Messaging: RabbitMQ
- API Documentation: Swagger/OpenAPI

## Microservices Architecture

The project follows a microservices architecture, where each service is responsible for a specific domain of the application. Requests are routed through an API Gateway (RESTful) to the appropriate microservice. Each microservice has its own database schema to ensure data isolation and integrity. Services communicate asynchronously using RabbitMQ for event-driven interactions.

## Module Overview

This project is a microservices-based application built using Java and Spring Boot. It consists of multiple modules, each responsible for a specific functionality. The main modules are:

- `service-registry`(`sources/service-registry`): Manages service discovery and registration.
- `config-server`(`sources/config-server`): Centralized configuration management for all services.
- `gateway`(`sources/gateway`): API Gateway for routing requests to appropriate services.
- `shared/security`(`sources/shared/security`): Shared security utilities and configurations.
- `shared/messaging`(`sources/shared/messaging`): Shared messaging utilities for RabbitMQ.
- `identity`(`sources/services/identity`): Manages user and authentication.
- `content`(`sources/services/content`): Manages assignments and educational resources.
- `submission`(`sources/services/submission`): Handles code submissions and evaluations.
- `notification`(`sources/services/notification`): Handles email notifications.
- `support`(`sources/services/support`): Manages student support requests.
- `evaluation`(`sources/services/evaluation`): Evaluates code submissions using the Piston API.

### Module Folder Structure

This project uses Amper Build Tool folder structure. Each module contains this structure:

- `src`: Source code files (no `main/java` folder)
- `resources`: Resource files (no `main/resources` folder)
- `test`: Test code files (no `test/java` folder)
- `testResources`: Test resource files (no `test/resources` folder)
- `module.yaml`: Module dependencies and configuration

Each service module has its own `application.yaml` file in the `resources` folder for service-specific configurations. `sources/services/service.module-template.yaml` is a template configuration that each service module is applied.

## Service Implementation

Each microservice is implemented as a Spring Boot application following layered architecture principles. The main layers include:

- **Controllers**: Handle incoming HTTP requests and route them to appropriate services.
- **Services**: Contain business logic and interact with repositories.
- **Repositories**: Manage data access and persistence using Spring Data JPA.
- **Models**: Define Data Transfer Objects (DTOs) and entities, use mappers for conversion.
- **Events**: Manage event publishing and handling for asynchronous communication.

Consider to move common functionalities to the shared modules to promote code reuse. Examples include:

- Common exception handling
- Utility classes
- Common response structures
- Common DTOs and mappers
- Messages exchange models

## API Documentation

- Use Swagger/OpenAPI for API documentation. (`springdoc-openapi-starter-webmvc-ui`)
- Use annotations to document endpoints, request/response models, and error codes.
- Ensure API documentation is up-to-date with code changes.

## Configuration Management

- Centralized configuration using `config-server`.
- Config repository: `config` at the root of the project.
- Configuration name for each service: `<application-name>.yaml`, `<application-name>-<profile>.yaml`
- Import configuration fragments from `config/fragments`.

## Database Management

- Schema: located in `resources/schema.sql`
- Migrations: no migration tool
- Each service has its own schema in the PostgreSQL database to ensure data isolation.

## Coding Standards

- Use Google Java Style Guide for code formatting and conventions.
- Ensure code is modular, maintainable, and follows SOLID principles.
- Write unit tests for critical components and services.

## Implementation Guidelines

- Follow best practices for RESTful API design.
- Use dependency injection for better testability and maintainability.
- Implement error handling and logging for better debugging and monitoring.
- Write clear and concise code documentation and comments where necessary. Avoid over-commenting.
- Ensure services are stateless to facilitate scalability.
- Use RabbitMQ for asynchronous communication between services.
- After implementing, build project using Amper Build Tool to check for errors.

## Dependency Management

- `gradle/libs.versions.toml`: Centralized dependency versions (use Gradle Version Catalog Syntax)
- Use in `dependencies` block in `module.yaml` files to include dependencies. E.g.:
  ```yaml
  dependencies:
    - $spring.boot.starter.web # Predefined Spring Boot starter by Amper
    - $libs.springdoc.openapi.starter.webmvc.ui # Dependency from libs.versions.toml
  ```

## Amper Build Tool Commands

- `./amper build -m <module-name>`: Build a specific module.
- `./amper build`: Build the entire project.
- `./amper test -m <module-name>`: Run tests for a specific module.
- `./amper test`: Run tests for the entire project.
