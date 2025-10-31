package apsas.notification.controller;

import apsas.notification.model.dto.DeviceTokenResponse;
import apsas.notification.model.dto.RegisterDeviceRequest;
import apsas.notification.service.DeviceTokenService;
import apsas.shared.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/devices")
@Tag(name = "Device Management", description = "FCM device token management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class DeviceTokenController {

  private final DeviceTokenService deviceTokenService;

  public DeviceTokenController(DeviceTokenService deviceTokenService) {
    this.deviceTokenService = deviceTokenService;
  }

  @PostMapping("/register")
  @Operation(
      summary = "Register FCM device token",
      description = "Register a Firebase Cloud Messaging device token for push notifications")
  public ResponseEntity<DeviceTokenResponse> registerDevice(
      @Valid @RequestBody RegisterDeviceRequest request, Authentication authentication) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    DeviceTokenResponse response = deviceTokenService.registerToken(request, userId);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @DeleteMapping("/{token}")
  @Operation(summary = "Remove device token", description = "Remove a registered FCM device token")
  public ResponseEntity<Map<String, String>> removeDevice(
      @PathVariable String token, Authentication authentication) {
    deviceTokenService.removeToken(token);
    return ResponseEntity.ok(Map.of("message", "Device token removed successfully"));
  }

  @GetMapping
  @Operation(
      summary = "Get user devices",
      description = "Get all registered devices for the current user")
  public ResponseEntity<List<DeviceTokenResponse>> getUserDevices(Authentication authentication) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    List<DeviceTokenResponse> devices = deviceTokenService.getUserDevices(userId);
    return ResponseEntity.ok(devices);
  }
}
