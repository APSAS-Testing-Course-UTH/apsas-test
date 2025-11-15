package apsas.portal.admin.dto;

public record CreateUserRequest(
    String email,
    String password,
    String firstName,
    String lastName,
    String role,
    Boolean isActive,
    Boolean isEmailVerified
) {
}
