# APSAS - Automated Programming Skills Assessment System

An integrated platform for automated assessment and evaluation of programming assignments with real-time feedback and
comprehensive student analytics.

## Overview

APSAS is a microservices-based system designed for educational institutions to automate the evaluation of coding
assignments. It provides instant feedback to students, automatic code execution and validation, and supports multiple
programming languages through the Piston API.

## Architecture

The system consists of 8 microservices communicating via RabbitMQ event-driven messaging:

| Service                              | Purpose                                    |
|--------------------------------------|--------------------------------------------|
| **API Gateway**                      | Single entry point with JWT authentication |
| **Identity Service**                 | User authentication and management         |
| **Content Service**                  | Assignment and course management           |
| **Submission Service**               | Code submission tracking                   |
| **Evaluation Service**               | Code execution and results                 |
| **Notification Service**             | Email and push notifications               |
| **Support Service**                  | Real-time chat support                     |
| **Service Registry & Config Server** | Infrastructure services                    |

## Tech Stack

**Backend**

- Java 21 with virtual threads
- Spring Boot 3.5+ & Spring Cloud 2025.0.0
- PostgreSQL 17 (schema-per-service)
- RabbitMQ 4.1 (event messaging)
- Redis (caching)

**Frontend**

- React 19 with TypeScript
- Vite (build tool)
- React Query (data fetching)

**External Services**

- Piston API (code execution)
- Firebase Cloud Messaging (push notifications)

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Java 21
- Node.js 18+

### Backend Setup

```bash
cd backend
./gradlew build
docker-compose -f docker-compose.dev.yaml up
```

### Frontend Setup

```bash
cd frontend
bun install
bun run dev
```

Access the application at `http://localhost:5173`

## Project Structure

```
├── backend/             # Microservices implementation
├── frontend/            # React application
```

## Documentation

- [Backend Overview](backend/docs/system-overview.md)
- [Backend Agents Guide](backend/AGENTS.md)
- [Frontend Agents Guide](frontend/AGENTS.md)
