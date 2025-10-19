# Tài liệu Backend APSAS

## Tổng quan

Backend của hệ thống APSAS được xây dựng theo kiến trúc microservices sử dụng Spring Cloud ecosystem. Bao gồm các thành phần chính:

- **Config Server**: Quản lý cấu hình tập trung
- **Service Registry**: Eureka server cho service discovery
- **Gateway**: API Gateway (chưa triển khai đầy đủ)

## Kiến trúc

### Config Server
- **Port**: 8888
- **Framework**: Spring Cloud Config Server
- **Chức năng**: Cung cấp cấu hình tập trung cho các microservices
- **Cấu hình**: Sử dụng native profile, tìm config trong thư mục `./config`

### Service Registry
- **Port**: 8761
- **Framework**: Netflix Eureka Server
- **Chức năng**: Service discovery và registration
- **Cấu hình**: Standalone server, không tự register

### Gateway
- **Trạng thái**: Chưa triển khai đầy đủ (chỉ có module definition)
- **Mục đích**: API Gateway để route requests từ frontend đến các microservices

## API Contract

Vì backend sử dụng kiến trúc microservices, frontend giao tiếp thông qua Gateway (sẽ route đến các services tương ứng). Dưới đây là contract API chi tiết từ OpenAPI specifications:

### 1. Identity Service
**Base URL**: http://localhost:8080 (hoặc qua Gateway)

#### Authentication Endpoints
- **POST /api/auth/register**
  - Mô tả: Đăng ký user mới với role STUDENT
  - Request Body:
    ```json
    {
      "email": "string (email)",
      "password": "string (min 8 chars)",
      "firstName": "string",
      "lastName": "string"
    }
    ```
  - Response: AuthResponse với token và user info

- **POST /api/auth/login**
  - Mô tả: Đăng nhập
  - Request Body:
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
  - Response: AuthResponse

- **POST /api/auth/forgot-password**
  - Mô tả: Yêu cầu reset password
  - Request Body: `{"email": "string"}`
  - Response: Generic success message

- **POST /api/auth/reset-password**
  - Mô tả: Reset password với token
  - Request Body:
    ```json
    {
      "token": "string",
      "newPassword": "string (min 8 chars)"
    }
    ```
  - Response: Generic success message

- **POST /api/auth/verify-email**
  - Mô tả: Verify email với token
  - Request Body: `{"token": "string"}`
  - Response: Generic success message

- **POST /api/auth/resend-verification**
  - Mô tả: Gửi lại email verification
  - Request Body: `{"email": "string"}`
  - Response: Generic success message

#### User Management Endpoints (Admin/Instructor)
- **GET /api/v1/users**
  - Mô tả: Lấy danh sách users với pagination
  - Query params: page, size, sort
  - Response: PageResponse<UserResponse>

- **POST /api/v1/users**
  - Mô tả: Tạo user mới (Admin only)
  - Request Body: CreateUserRequest
  - Response: UserResponse

- **GET /api/v1/users/{userId}**
  - Mô tả: Lấy user theo ID
  - Response: UserResponse

- **DELETE /api/v1/users/{userId}**
  - Mô tả: Xóa user (Admin only)
  - Response: Generic success message

- **PUT /api/v1/users/{userId}/activate**
  - Mô tả: Activate user (Admin only)
  - Response: Generic success message

- **PUT /api/v1/users/{userId}/deactivate**
  - Mô tả: Deactivate user (Admin only)
  - Response: Generic success message

- **GET /api/v1/users/role/{role}**
  - Mô tả: Lấy users theo role
  - Path param: role (STUDENT|INSTRUCTOR|CONTENT_PROVIDER|ADMIN)
  - Response: PageResponse<UserResponse>

#### Current User Endpoints
- **GET /api/v1/users/me**
  - Mô tả: Lấy profile user hiện tại
  - Response: UserResponse

- **PUT /api/v1/users/me**
  - Mô tả: Update profile user hiện tại
  - Request Body: UpdateProfileRequest
  - Response: UserResponse

- **POST /api/v1/users/me/change-password**
  - Mô tả: Đổi password
  - Request Body:
    ```json
    {
      "currentPassword": "string",
      "newPassword": "string (min 8 chars)"
    }
    ```
  - Response: Generic success message

### 2. Content Service
**Base URL**: Qua Gateway

#### Tutorials
- **GET /api/v1/tutorials** - Lấy danh sách tutorials
- **POST /api/v1/tutorials** - Tạo tutorial mới
- **GET /api/v1/tutorials/{id}** - Lấy tutorial theo ID
- **PUT /api/v1/tutorials/{id}** - Update tutorial
- **DELETE /api/v1/tutorials/{id}** - Xóa tutorial

#### Skills
- **GET /api/v1/skills** - Lấy danh sách skills
- **POST /api/v1/skills** - Tạo skill mới
- **GET /api/v1/skills/{id}** - Lấy skill theo ID
- **PUT /api/v1/skills/{id}** - Update skill
- **DELETE /api/v1/skills/{id}** - Xóa skill

#### Assignments
- **GET /api/v1/assignments** - Lấy danh sách assignments
- **POST /api/v1/assignments** - Tạo assignment mới
- **GET /api/v1/assignments/{id}** - Lấy assignment theo ID
- **PUT /api/v1/assignments/{id}** - Update assignment
- **PUT /api/v1/assignments/{id}/schedule** - Update assignment schedule
- **PUT /api/v1/assignments/{id}/publish** - Publish assignment
- **PUT /api/v1/assignments/{id}/archive** - Archive assignment
- **DELETE /api/v1/assignments/{id}** - Xóa assignment

### 3. Submission Service
**Base URL**: Qua Gateway

- **GET /api/v1/submissions** - Lấy danh sách submissions
- **POST /api/v1/submissions** - Tạo submission mới
- **GET /api/v1/submissions/{id}** - Lấy submission theo ID
- **PUT /api/v1/submissions/{id}/feedback** - Provide feedback

### 4. Evaluation Service
**Base URL**: Qua Gateway

- **GET /api/v1/evaluation/runtimes** - Lấy danh sách supported runtimes

### 5. Support Service
**Base URL**: Qua Gateway

- **GET /api/v1/support/sessions** - Lấy danh sách sessions
- **POST /api/v1/support/sessions** - Tạo session mới
- **GET /api/v1/support/sessions/{id}** - Lấy session theo ID
- **PUT /api/v1/support/sessions/{id}/close** - Close session

## Data Models

### UserResponse
```json
{
  "id": "string (uuid)",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "STUDENT|INSTRUCTOR|CONTENT_PROVIDER|ADMIN",
  "isActive": "boolean",
  "isEmailVerified": "boolean",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)"
}
```

### AuthResponse
```json
{
  "token": "string",
  "type": "string",
  "user": "UserResponse"
}
```

### PageResponse<T>
```json
{
  "content": "Array<T>",
  "pageNumber": "integer",
  "pageSize": "integer",
  "totalElements": "integer",
  "totalPages": "integer",
  "first": "boolean",
  "last": "boolean",
  "hasNext": "boolean",
  "hasPrevious": "boolean"
}
```

## Authentication
- Sử dụng JWT Bearer tokens
- Include token trong header: `Authorization: Bearer <token>`
- Các endpoints protected yêu cầu authentication

## Development Setup

### Prerequisites
- Java 17+
- Amper (build tool)

### Running Services
1. **Config Server**: `amper run --module sources/config-server`
2. **Service Registry**: `amper run --module sources/service-registry`
3. **Gateway**: Chưa triển khai

### Configuration
- Config files trong `./config` directory cho Config Server
- Services register với Eureka tại `http://localhost:8761`

## Notes
- Gateway hiện tại chưa được triển khai đầy đủ
- API contract dựa trên OpenAPI specs trong frontend/openapi/
- Services sử dụng Spring Boot với Spring Cloud dependencies