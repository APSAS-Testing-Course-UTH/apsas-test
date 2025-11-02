# Submission Service Instructions

This document provides instructions for using the Submission Service in your project. The Submission Service is designed to handle the student submissions for programming assignments and manage their evaluation results.

## Permissions

- **Student**: Submit solutions for assignments and view their own submission history and results.
- **Instructor**: View all submissions, include by assignment and student, and manage submission evaluations.

## Models

### Submission

- `id`: Unique identifier for the submission (UUID).
- `assignment_id`: ID of the assignment for which the submission was made (UUID).
- `student_id`: ID of the student who made the submission (UUID).
- `submitted_at`: Timestamp of when the submission was made.
- `status`: Status of the submission (Pending, Evaluated, Failed).
- `code`: The actual code submitted by the student (text).
- `language`: Programming language used for the submission (e.g., "Java", "Python").
- `result`: Result of the submission evaluation (Passed, Failed, Partial).
- `score`: Score awarded for the submission (float).
- `test_case_results`: List of results for each test case (JSON array of Test Case Result objects).
- `evaluated_at`: Timestamp of when the submission was evaluated.
- `feedback`: Optional feedback provided by the instructor (text).

#### Test Case Result

- `order`: Order of the test case in the assignment (integer).
- `description`: Optional description of the test case.
- `hidden`: Boolean indicating if the test case is hidden from students.
- `weight`: Weight of the test case in scoring (e.g., 1.0 for full weight, 0.5 for half weight).
- `input`: Input data for the test case.
- `output`: Expected output data for the test case.
- `timeout`: Maximum execution time allowed for the test case (in seconds).
- `memory_limit`: Maximum memory allowed for the test case (in MB).
- `passed`: Boolean indicating if the test case was passed.
- `actual_output`: Actual output produced by the submission for the test case.
- `error_message`: Error message if the test case failed (optional).
- `execution_time`: Time taken to execute the test case (in seconds).
- `memory_used`: Memory used during the execution of the test case (in MB).

## Port

- **Default**: 8083

## Integration

### Content Service
- Fetches assignment details and validates language support before accepting submissions

### Evaluation Service (via RabbitMQ)
- **Publishing**: Sends `SubmissionCreatedEvent` to `submission.created` routing key when a submission is created
- **Listening**: Listens for `SubmissionEvaluatedEvent` on `submission.evaluated.queue` to update submission results

## Events

### Published Events

- **SubmissionCreatedEvent** (`submission.created` routing key)
  - Payload: submissionId, assignmentId, studentId, code, language
  - Consumed by: Evaluation Service

### Consumed Events

- **SubmissionEvaluatedEvent** (from `submission.evaluated.queue`)
  - Payload: submissionId, score, testCaseResults[], feedback
  - Updates submission status, score, and test case results

## API Endpoints

| Method | Endpoint                          | Description                                                                  | Role                |
| ------ | --------------------------------- | ---------------------------------------------------------------------------- | ------------------- |
| GET    | /api/v1/submissions               | List all submissions (instructors view all, students view their own)         | Student, Instructor |
| GET    | /api/v1/submissions/{id}          | Get submission by ID (instructors can view all, students can view their own) | Student, Instructor |
| POST   | /api/v1/submissions               | Create a new submission                                                      | Student             |
| POST   | /api/v1/submissions/{id}/feedback | Provide feedback for a submission (instructors only)                         | Instructor          |

### `GET /api/v1/submissions`

- Allows students to view their own submissions only.
- Instructors can view all submissions.
- Instructors can filter submissions by `assignment_id`, `student_id`, `status`.

## Testing

### RabbitMQ Listener Integration Tests

The submission service includes comprehensive integration tests for RabbitMQ event listening in `EventListenerIntegrationTest.kt`. These tests verify that the service correctly processes `SubmissionEvaluatedEvent` messages from the Evaluation Service.

#### Test Coverage

**SubmissionCreatedEvent Tests**:
- `shouldCreateSubmissionWithValidInput` - Validates submission creation with all required fields
- `shouldRejectInvalidLanguage` - Ensures unsupported languages are rejected
- `shouldPublishSubmissionCreatedEvent` - Verifies event is published when submission is created

**SubmissionEvaluatedEvent Handler Tests**:
- `shouldUpdateSubmissionWithPassedResult` - Updates submission when all tests pass
- `shouldUpdateSubmissionWithPartialResult` - Updates submission when some tests fail
- `shouldUpdateSubmissionWithFailedResult` - Updates submission when all tests fail
- `shouldUpdateEvaluationResults` - Verifies evaluation results are correctly stored
- `shouldHandleNullTestCaseResults` - Gracefully handles null test case data
- `shouldPreserveTestCaseMetrics` - Preserves execution time and memory metrics
- `shouldUpdateEvaluatedAtTimestamp` - Correctly updates the evaluation timestamp with microsecond precision
- `shouldHandleWeightedTestCases` - Correctly handles weighted test case scoring
- `shouldHandleHiddenTestCases` - Correctly processes hidden test cases
- `shouldProcessMultipleEventsSequentially` - Processes multiple events in sequence for different submissions

#### Running Tests

```bash
# Run all submission service tests
./amper test -m submission

# Run specific test class
./amper test -m submission --test EventListenerIntegrationTest
```

#### Key Testing Considerations

- **Timestamp Precision**: PostgreSQL stores timestamps at microsecond precision. Tests use `LocalDateTime.now().truncatedTo(ChronoUnit.MICROS)` to match database storage behavior
- **RabbitMQ Integration**: Tests use `@ActiveProfiles("integration")` and require RabbitMQ to be running (via Docker Compose)
- **Test Data**: Uses `TestDataHelper` to create consistent test submissions
- **Event Serialization**: Ensures `SubmissionEvaluatedEvent` is correctly deserialized from JSON
