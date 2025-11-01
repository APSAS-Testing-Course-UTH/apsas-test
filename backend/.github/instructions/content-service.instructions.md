# Content Service Instructions

Content Service is a microservice responsible for managing programming assignments, educational resources, and course content within the APSAS platform. It allows instructors and content providers to create, update, and delete programming challenges and tutorials.

## Permissions

- **Student**: Read-only access to view assignments and tutorials.
- **Instructor**: Update assignment schedules.
- **Content Provider**: Create, update, and delete assignments and tutorials.

## Models

### Assignment

- `id`: Unique identifier for the assignment (UUID).
- `title`: Title of the assignment.
- `description`: Detailed description of the assignment.
- `difficulty_level`: Difficulty level (Easy, Medium, Hard).
- `creator_id`: ID of the user who created the assignment (UUID).
- `created_at`: Timestamp of when the assignment was created.
- `updated_at`: Timestamp of the last update to the assignment.
- `start_date`: Date when the assignment becomes available.
- `due_date`: Date when the assignment is due.
- `max_score`: Maximum score achievable for the assignment.
- `status`: Status of the assignment (Draft, Published, Archived).
- `languages`: List of programming languages supported for the assignment (e.g., "Java", "Python"). (JSON array)
- `test_cases`: List of test cases (JSON array of Test Case objects).

#### Test Case

- `order`: Order of the test case in the assignment (integer).
- `description`: Optional description of the test case.
- `hidden`: Boolean indicating if the test case is hidden from students.
- `weight`: Weight of the test case in scoring (e.g., 1.0 for full weight, 0.5 for half weight).
- `input`: Input data for the test case.
- `output`: Expected output data for the test case.
- `timeout`: Maximum execution time allowed for the test case (in seconds).
- `memory_limit`: Maximum memory allowed for the test case (in MB).

### Skill

- `id`: Unique identifier for the skill (UUID).
- `name`: Name of the skill (e.g., "Recursion", "Dynamic Programming").
- `description`: Detailed description of the skill.
- `created_at`: Timestamp of when the skill was created.
- `updated_at`: Timestamp of the last update to the skill.

### Tutorial

- `id`: Unique identifier for the tutorial (UUID).
- `title`: Title of the tutorial.
- `content`: Rich text content of the tutorial (Markdown or HTML).
- `creator_id`: ID of the user who created the tutorial (UUID).
- `created_at`: Timestamp of when the tutorial was created.
- `updated_at`: Timestamp of the last update to the tutorial.
- `tags`: List of tags associated with the tutorial (JSON array).

### Associations

- **Assignment-Skill**: Many-to-Many relationship between assignments and skills.
- **Assignment-Tutorial**: Many-to-Many relationship between assignments and tutorials.

## Port

- **Default**: 8082

## Integration

- **Notification Service**: Publishes events for assignment updates and deadlines
- **Evaluation Service**: Provides assignment details and test cases via internal API (called via Feign Client)

## Events Published

- **AssignmentPublishedEvent**: Published to `assignment.published` routing key when an assignment is published
- **AssignmentScheduleUpdatedEvent**: Published to `assignment.schedule.updated` routing key when assignment schedule changes

## API Endpoints

| Method | Endpoint                          | Description                                       | Role                                  |
| ------ | --------------------------------- | ------------------------------------------------- | ------------------------------------- | ------------------------------------- |
| GET    | /api/v1/assignments               | List all assignments                              | Student, Instructor, Content Provider |
| GET    | /api/v1/assignments/{id}          | Get assignment by ID                              |                                       | Student, Instructor, Content Provider |
| POST   | /api/v1/assignments               | Create a new assignment                           | Content Provider                      |
| PATCH  | /api/v1/assignments/{id}          | Update assignment details                         | Content Provider                      |
| PATCH  | /api/v1/assignments/{id}/schedule | Update assignment schedule (start_date, due_date) | Instructor                            |
| DELETE | /api/v1/assignments/{id}          | Delete an assignment                              | Content Provider                      |
| GET    | /api/v1/skills                    | List all skills                                   | Student, Instructor, Content Provider |
| POST   | /api/v1/skills                    | Create a new skill                                | Content Provider                      |
| PATCH  | /api/v1/skills/{id}               | Update skill details                              | Content Provider                      |
| DELETE | /api/v1/skills/{id}               | Delete a skill                                    | Content Provider                      |
| GET    | /api/v1/tutorials                 | List all tutorials                                | Student, Instructor, Content Provider |
| GET    | /api/v1/tutorials/{id}            | Get tutorial by ID                                | Student, Instructor, Content Provider |
| POST   | /api/v1/tutorials                 | Create a new tutorial                             | Content Provider                      |
| PATCH  | /api/v1/tutorials/{id}            | Update tutorial details                           | Content Provider                      |
| DELETE | /api/v1/tutorials/{id}            | Delete a tutorial                                 | Content Provider                      |
| POST   | /api/v1/assignments/{id}/publish  | Publish an assignment                             | Content Provider                      |
| POST   | /api/v1/assignments/{id}/archive  | Archive an assignment                             | Content Provider                      |
