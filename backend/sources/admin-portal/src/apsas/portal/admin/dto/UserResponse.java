package apsas.portal.admin.dto;

import java.time.LocalDateTime;

public record UserResponse(
    String id,
    String email,
    String firstName,
    String lastName,
    String role,
    boolean isActive,
    boolean isEmailVerified,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
