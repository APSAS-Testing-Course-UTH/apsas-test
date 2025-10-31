package apsas.notification.controller;

import apsas.notification.model.dto.NotificationPreferencesRequest;
import apsas.notification.model.dto.NotificationPreferencesResponse;
import apsas.notification.service.NotificationPreferencesService;
import apsas.shared.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/preferences")
@Tag(
    name = "Notification Preferences",
    description = "Notification preferences management endpoints"
)
@SecurityRequirement(name = "Bearer Authentication")
public class NotificationPreferencesController {

  private final NotificationPreferencesService preferencesService;

  public NotificationPreferencesController(NotificationPreferencesService preferencesService) {
    this.preferencesService = preferencesService;
  }

  @GetMapping
  @Operation(
      summary = "Get notification preferences",
      description = "Get notification preferences for the current user"
  )
  public ResponseEntity<NotificationPreferencesResponse> getPreferences(
      Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    NotificationPreferencesResponse response = preferencesService.getPreferences(userId);
    return ResponseEntity.ok(response);
  }

  @PutMapping
  @Operation(
      summary = "Update notification preferences",
      description = "Update notification preferences for the current user"
  )
  public ResponseEntity<NotificationPreferencesResponse> updatePreferences(
      @Valid
      @RequestBody
      NotificationPreferencesRequest request, Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    NotificationPreferencesResponse response =
        preferencesService.updatePreferences(userId, request);
    return ResponseEntity.ok(response);
  }
}
