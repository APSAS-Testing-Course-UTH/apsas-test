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

## Integration

- The Submission Service should be integrated with the Content Service to fetch assignment details and test cases.
- When a student submits a solution, the Submission Service send message to trigger the evaluation process (evaluation service will be implemented separately).
- When the evaluation is complete, the evaluation service will trigger an event, listened by the Submission Service, to update the submission status and results.

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
