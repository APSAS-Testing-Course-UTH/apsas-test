# Evaluation Service

The Evaluation Service is a microservice responsible for evaluating student code submissions for programming
assignments. It executes submitted code against predefined test cases using the Piston API and returns detailed results
to the Submission Service.

## Features

- **Asynchronous Evaluation**: Processes code submissions asynchronously using worker threads
- **Parallel Test Execution**: Executes multiple test cases concurrently for improved performance
- **Multi-Language Support**: Supports various programming languages through Piston API
- **Automatic Scoring**: Calculates scores based on weighted test case results
- **Retry Logic**: Implements retry mechanisms for handling transient failures with Piston API
- **Event-Driven Communication**: Uses RabbitMQ for asynchronous messaging with other services

## Architecture

### Components

1. **EvaluationController**: REST API endpoints for listing supported runtimes
2. **EvaluationService**: Core business logic for code evaluation and scoring
3. **PistonApiClient**: Client for communicating with Piston API v2 with retry logic
4. **ContentServiceClient**: Feign client for retrieving assignment details from Content Service
5. **SubmissionEventListener**: RabbitMQ listener for submission evaluation requests
6. **MessagingConfig**: RabbitMQ configuration for queues and bindings

### Flow

1. **Submission Created**: Submission Service publishes a `SubmissionCreatedEvent` to RabbitMQ
2. **Event Processing**: Evaluation Service listens to the event and starts evaluation
3. **Assignment Retrieval**: Fetches assignment details and test cases from Content Service via Feign
4. **Code Execution**: Executes submitted code against each test case using Piston API in parallel
5. **Result Processing**: Compares actual output with expected output for each test case
6. **Score Calculation**: Calculates overall score based on weighted test case results
7. **Event Publishing**: Publishes `SubmissionEvaluatedEvent` back to RabbitMQ for Submission Service

## API Endpoints

| Method | Endpoint         | Description                                                 | Role      |
|--------|------------------|-------------------------------------------------------------|-----------|
| GET    | /api/v1/runtimes | List all supported programming languages and their versions | All Roles |

## Models

### RuntimeResponse

- `language`: Name of the programming language (e.g., "java", "python")
- `version`: Version of the programming language (e.g., "21.0.0")
- `aliases`: List of alternative names for the language (e.g., ["java", "java-21"])
- `runtime`: Name of the runtime, only provided if alternative runtimes exist (e.g., "openjdk")

## Configuration

### Environment Variables

- `PISTON_API_URL`: URL of the Piston API service (default: http://localhost:2000)
- `RABBITMQ_HOST`: RabbitMQ host (default: localhost)
- `RABBITMQ_PORT`: RabbitMQ port (default: 5672)
- `RABBITMQ_USERNAME`: RabbitMQ username (default: guest)
- `RABBITMQ_PASSWORD`: RabbitMQ password (default: guest)
- `EUREKA_SERVER_URL`: Eureka service registry URL (default: http://localhost:8761/eureka/)
- `PORT`: Service port (default: 8084)

### Application Properties

```yaml
# Piston API
piston.api.url: URL of Piston API

# Async Processing
spring.task.execution:
  pool.core-size: Number of core threads (default: 5)
  pool.max-size: Maximum number of threads (default: 10)
  pool.queue-capacity: Queue capacity (default: 100)
```

## Messaging

### Consumes

- **Queue**: `evaluation.submission.created`
- **Routing Key**: `submission.created`
- **Event**: `SubmissionCreatedEvent`
    - `submissionId`: UUID of the submission
    - `assignmentId`: UUID of the assignment
    - `studentId`: UUID of the student
    - `code`: Student's submitted code
    - `language`: Programming language used

### Publishes

- **Routing Key**: `submission.evaluated`
- **Event**: `SubmissionEvaluatedEvent`
    - `submissionId`: UUID of the submission
    - `status`: Submission status (EVALUATED, FAILED)
    - `result`: Overall result (PASSED, FAILED, PARTIAL)
    - `score`: Overall score (0-100)
    - `testCaseResults`: List of individual test case results
    - `evaluatedAt`: Evaluation timestamp

## Integration with Piston API

The Evaluation Service integrates with [Piston API v2](https://github.com/engineer-man/piston) for executing code in
various programming languages.

### Supported Features

- Multi-language code execution
- Custom timeout and memory limits per test case
- Compilation and runtime error detection
- Standard input/output support

### Error Handling

- Retry logic with exponential backoff (3 attempts, 1s initial delay, 2x multiplier)
- Graceful handling of compilation errors
- Timeout and memory limit enforcement
- Detailed error messages in evaluation results

## Building and Running

### Build

```bash
./amper build -m evaluation
```

### Run

```bash
java -jar build/tasks/evaluation/executableJarJvm/evaluation.jar
```

## Dependencies

- Spring Boot 3.5.6
- Spring Cloud (Eureka, Config, OpenFeign)
- Spring AMQP (RabbitMQ)
- Spring Retry
- SpringDoc OpenAPI (Swagger)
- Shared Messaging Module

## API Documentation

Swagger UI is available at: `http://localhost:8084/swagger-ui.html`

API Docs JSON: `http://localhost:8084/api-docs`

## Development Notes

- Uses `@Async` annotation for asynchronous processing
- Thread pool configuration in `AsyncConfig`
- Retry configuration uses Spring Retry
- Feign client for inter-service communication
- RestClient for external API calls (Piston)
- Output comparison normalizes whitespace and line endings

## Future Enhancements

- Support for custom judges and checkers
- Memory usage tracking from Piston API
- Code plagiarism detection integration
- Support for interactive problems
- Custom compilation flags per language
