package apsas.identity.controller;

import apsas.identity.model.dto.AuthResponse;
import apsas.identity.model.dto.EmailRequest;
import apsas.identity.model.dto.LoginRequest;
import apsas.identity.model.dto.RegisterRequest;
import apsas.identity.model.dto.ResetPasswordRequest;
import apsas.identity.model.dto.TokenRequest;
import apsas.identity.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  @Operation(
      summary = "Register a new user",
      description = "Register a new user account with student role")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    AuthResponse response = authService.register(request);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  @PostMapping("/login")
  @Operation(summary = "Login", description = "Authenticate user and return JWT token")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    AuthResponse response = authService.login(request);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/verify-email")
  @Operation(summary = "Verify email", description = "Verify user email with token")
  public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody TokenRequest request) {
    authService.verifyEmail(request.getToken());
    return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
  }

  @PostMapping("/resend-verification")
  @Operation(summary = "Resend verification email", description = "Resend email verification link")
  public ResponseEntity<Map<String, String>> resendVerificationEmail(
      @Valid @RequestBody EmailRequest request) {
    authService.resendVerificationEmail(request);
    return ResponseEntity.ok(Map.of("message", "Verification email sent"));
  }

  @PostMapping("/forgot-password")
  @Operation(summary = "Request password reset", description = "Request password reset link")
  public ResponseEntity<Map<String, String>> requestPasswordReset(
      @Valid @RequestBody EmailRequest request) {
    authService.requestPasswordReset(request);
    return ResponseEntity.ok(Map.of("message", "Password reset email sent"));
  }

  @PostMapping("/reset-password")
  @Operation(summary = "Reset password", description = "Reset password with token")
  public ResponseEntity<Map<String, String>> resetPassword(
      @Valid @RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request);
    return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
  }
}