package apsas.identity.controller;

import apsas.identity.model.dto.ChangePasswordRequest;
import apsas.identity.model.dto.CreateUserRequest;
import apsas.identity.model.dto.UpdateProfileRequest;
import apsas.identity.model.dto.UserResponse;
import apsas.identity.model.entity.UserRole;
import apsas.identity.service.UserService;
import apsas.shared.models.pagination.PageRequestParams;
import apsas.shared.models.pagination.PageResponse;
import apsas.shared.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "User management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class UserController {
  private final UserService userService;

  @GetMapping("/me")
  @Operation(
      summary = "Get current user profile",
      description = "Get the profile of the currently authenticated user"
  )
  public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    UserResponse response = userService.getUserById(userId);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/me")
  @Operation(
      summary = "Update current user profile",
      description = "Update the profile of the currently authenticated user"
  )
  public ResponseEntity<UserResponse> updateCurrentUserProfile(
      Authentication authentication,
      @Valid
      @RequestBody
      UpdateProfileRequest request
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    UserResponse response = userService.updateProfile(userId, request);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/me/change-password")
  @Operation(
      summary = "Change password",
      description = "Change password for the currently authenticated user"
  )
  public ResponseEntity<Map<String, String>> changePassword(
      Authentication authentication,
      @Valid
      @RequestBody
      ChangePasswordRequest request
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    userService.changePassword(userId, request);
    return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
  }

  @GetMapping("/{userId}")
  @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
  @Operation(
      summary = "Get user by ID",
      description = "Get user details by ID (Admin and Instructor only)"
  )
  public ResponseEntity<UserResponse> getUserById(
      @PathVariable
      UUID userId
  ) {
    UserResponse response = userService.getUserById(userId);
    return ResponseEntity.ok(response);
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(
      summary = "Get all users",
      description = "Get all users with pagination and sorting (Admin only)"
  )
  public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
      PageRequestParams pageParams
  ) {
    PageResponse<UserResponse> response = userService.getAllUsers(pageParams.toPageable());
    return ResponseEntity.ok(response);
  }

  @GetMapping("/role/{role}")
  @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
  @Operation(
      summary = "Get users by role",
      description = "Get users by role with pagination and sorting (Admin and Instructor only)"
  )
  public ResponseEntity<PageResponse<UserResponse>> getUsersByRole(
      @PathVariable
      UserRole role,
      PageRequestParams pageParams
  ) {
    PageResponse<UserResponse> response = userService.getUsersByRole(role, pageParams.toPageable());
    return ResponseEntity.ok(response);
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Create user", description = "Create a new user (Admin only)")
  public ResponseEntity<UserResponse> createUser(
      @Valid
      @RequestBody
      CreateUserRequest request
  ) {
    UserResponse response = userService.createUser(request);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  @PutMapping("/{userId}/deactivate")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Deactivate user", description = "Deactivate a user account (Admin only)")
  public ResponseEntity<Map<String, String>> deactivateUser(
      @PathVariable
      UUID userId
  ) {
    userService.deactivateUser(userId);
    return ResponseEntity.ok(Map.of("message", "User deactivated successfully"));
  }

  @PutMapping("/{userId}/activate")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Activate user", description = "Activate a user account (Admin only)")
  public ResponseEntity<Map<String, String>> activateUser(
      @PathVariable
      UUID userId
  ) {
    userService.activateUser(userId);
    return ResponseEntity.ok(Map.of("message", "User activated successfully"));
  }

  @DeleteMapping("/{userId}")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Delete user", description = "Delete a user account (Admin only)")
  public ResponseEntity<Map<String, String>> deleteUser(
      @PathVariable
      UUID userId
  ) {
    userService.deleteUser(userId);
    return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
  }
}
