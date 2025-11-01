# API Gateway Instructions

API Gateway (`sources/gateway`) is the single entry point for all client requests in the APSAS architecture. Built on Spring Cloud Gateway (WebFlux), it handles routing, authentication, and load balancing.

## Port

- **Default**: 8080

## Authentication and Authorization

API Gateway uses **OAuth2 Resource Server** with JWT tokens for authentication:

- **JWT Decoding**: Uses `NimbusReactiveJwtDecoder` with HMAC-SHA256 secret key
- **Claims Extraction**: Converts JWT claims to `UserPrincipal` (userId, email, firstName, lastName, role, isActive)
- **Public Endpoints**: `/api/auth/**`, `/api-docs/**`, `/swagger-ui/**` are permitted without authentication
- **Protected Endpoints**: All other endpoints require valid JWT tokens

### JWT Claims

Extracted from `shared/security/JwtClaims.java`:
- `USER_ID`: UUID of the user
- `EMAIL`: User email address
- `FIRST_NAME`: User's first name
- `LAST_NAME`: User's last name
- `IS_ACTIVE`: Account active status
- `ROLE`: User role (STUDENT, INSTRUCTOR, CONTENT_PROVIDER, ADMIN)

### Security Configuration

See `sources/gateway/src/apsas/gateway/config/SecurityConfig.java` for implementation.

## Service Discovery and Routing

- **Eureka Integration**: API Gateway discovers backend services via Netflix Eureka
- **Load Balancing**: Uses Spring Cloud LoadBalancer for client-side load balancing
- **Dynamic Routing**: Routes are automatically created based on service registry

### Route Pattern

Routes follow the pattern: `/api/**` → discovered services

Example service URLs:
- Identity Service: `http://identity-service`
- Content Service: `http://content-service`
- Submission Service: `http://submission-service`
- Support Service: `http://support-service`

## Configuration

- **Service config**: `config/api-gateway.yaml`
- **Dev profile**: `config/api-gateway-dev.yaml`
- **Fragments**: Imports `jwt.yaml`, `eureka-client.yaml`, `springdoc.yaml`

## Implementation Notes

- WebFlux-based (reactive, non-blocking)
- No custom RouteLocator - relies on Eureka service discovery
- JWT validation happens at gateway level; downstream services receive validated `UserPrincipal` in headers
- CSRF disabled (stateless JWT authentication)
- HTTP Basic and Form Login disabled
