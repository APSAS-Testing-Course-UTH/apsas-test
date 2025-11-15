# APSAS Backend Project Overview

## Project Purpose
Automated Programming Skills Assessment System (APSAS) - A microservices-based platform that automates code evaluation, skill assessment, and personalized feedback for programming assignments.

## Tech Stack
- **Language**: Java 21 with virtual threads enabled
- **Framework**: Spring Boot 3.5.6, Spring Cloud 2025.0.0
- **Build Tool**: Gradle
- **Database**: PostgreSQL 17
- **Messaging**: RabbitMQ 4.1 with topic exchange pattern
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway (WebFlux)
- **Config**: Spring Cloud Config Server
- **Documentation**: SpringDoc OpenAPI

## Architecture
Microservices architecture with the following services:
- **API Gateway** (port 8080) - Routes requests, validates JWT
- **Identity Service** (port 8081) - Auth, user management
- **Content Service** (port 8082) - Assignments, resources
- **Submission Service** - Code submission handling
- **Evaluation Service** - Piston API integration for code execution
- **Notification Service** - Email/push notifications
- **Support Service** - WebSocket-based chat
- **Service Registry** - Netflix Eureka
- **Config Server** - Centralized configuration

## Project Structure
```
sources/
├── gateway/
├── service-registry/
├── config-server/
└── services/
    ├── identity/
    ├── content/
    ├── submission/
    ├── evaluation/
    ├── notification/
    └── support/
config/          # Config repository (NOT in classpath)
```

## Code Conventions
- MapStruct for entity ↔DTO mapping
- Global exception handler with RFC 9457 ProblemDetail format
- Pagination with PageRequestParams and PageResponse<T>
- Swagger annotations on all controllers
- Event-driven messaging with RabbitMQ
- Schema-per-service database isolation
