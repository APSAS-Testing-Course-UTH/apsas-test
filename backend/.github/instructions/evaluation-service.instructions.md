# Evaluation Service Instructions

The Evaluation Service is a microservice responsible for evaluating student submissions for programming assignments. It executes the submitted code against predefined test cases and returns the results to the Submission Service.

## Port

- **Default**: 8084

## Permissions

- **All Roles**: Access list of supported programming languages and their versions via `/api/v1/runtimes`

## Models

### Supported Runtimes

- `language`: Name of the programming language (e.g., "Java", "Python").
- `version`: Version of the programming language (e.g., "21" for Java 21).
- `aliases`: List of alternative names that can be used for the language (e.g., ["java", "java-21"]).
- `runtime`: Name of the runtime used to run the language, only provided if alternative runtimes exist for the language (e.g., "openjdk").

## Integrations

### Messaging

- See `sources/shared/messaging` module for shared messaging utilities.
- See `sources/services/submission` module for integration with Submission Service.
- The Evaluation Service listens for submission evaluation requests from the Submission Service via RabbitMQ.
- After evaluation, the Evaluation Service sends the results back to the Submission Service via RabbitMQ.

### Code Execution API

- The Evaluation Service integrates with the [Piston API v2](./piston-api-v2.instructions.md) for executing code in various programming languages.

## Flow

1. The Submission Service sends a message to the Evaluation Service with the submission details.
2. The Evaluation Service retrieves the assignment details and test cases from the Content Service (via Feign Client).
3. The Evaluation Service sends the submitted code and test cases to the Piston API for execution and waits for the results.
4. The Evaluation Service processes the results from the Piston API, compares the actual output with the expected output, and calculates the score.
5. The Evaluation Service sends a message back to the Submission Service with the evaluation results, including test case results and overall score.

## API Endpoints

| Method | Endpoint           | Description                                      | Role          |
|--------|--------------------|-------------------------------------------------|---------------|
| GET    | /api/v1/runtimes   | Get list of supported languages and versions    | Authenticated |

## Other Considerations

- Implements retry logic for handling transient failures when communicating with the Piston API
- Uses Spring Retry with exponential backoff for Piston API calls
- Validates programming language support before executing code
- Compares actual output with expected output (exact string match) for test case evaluation
- Implement worker threads or asynchronous processing to handle multiple evaluation requests concurrently. That means the Evaluation Service should be able to process multiple test cases in parallel to improve performance.

## API Endpoints

| Method | Endpoint         | Description                                                 | Role      |
| ------ | ---------------- | ----------------------------------------------------------- | --------- |
| GET    | /api/v1/runtimes | List all supported programming languages and their versions | All Roles |
