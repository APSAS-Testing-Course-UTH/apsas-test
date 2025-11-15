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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Bộ điều khiển REST cho các API quản lý tùy chọn thông báo của người dùng.
 */
@RestController
@RequestMapping(
    value = "/api/v1/preferences",
    produces = MediaType.APPLICATION_JSON_VALUE
)
@Tag(
    name = "Tùy chọn thông báo",
    description = "Quản lý tùy chọn nhận thông báo của người dùng"
)
@SecurityRequirement(name = "Bearer Authentication")
public class NotificationPreferencesController {

  private final NotificationPreferencesService preferencesService;

  public NotificationPreferencesController(NotificationPreferencesService preferencesService) {
    this.preferencesService = preferencesService;
  }

  /**
   * Lấy tùy chọn nhận thông báo của người dùng hiện tại.
   *
   * @param authentication Thông tin xác thực người dùng
   * @return Tùy chọn nhận thông báo
   */
  @GetMapping
  @Operation(
      summary = "Lấy tùy chọn thông báo",
      description = "Lấy tùy chọn nhận thông báo của người dùng hiện tại"
  )
  public ResponseEntity<NotificationPreferencesResponse> getPreferences(
      Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    NotificationPreferencesResponse response = preferencesService.getPreferences(userId);
    return ResponseEntity.ok(response);
  }

  /**
   * Cập nhật tùy chọn nhận thông báo của người dùng hiện tại.
   *
   * @param request        Yêu cầu cập nhật tùy chọn
   * @param authentication Thông tin xác thực người dùng
   * @return Tùy chọn nhận thông báo đã cập nhật
   */
  @PatchMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      summary = "Cập nhật tùy chọn thông báo",
      description = "Cập nhật tùy chọn nhận thông báo của người dùng hiện tại"
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
