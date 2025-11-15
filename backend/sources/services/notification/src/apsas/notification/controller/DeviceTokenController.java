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
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Bộ điều khiển REST cho các API quản lý thiết bị và token FCM của người dùng.
 */
@RestController
@RequestMapping(
    value = "/api/v1/devices",
    produces = MediaType.APPLICATION_JSON_VALUE
)
@Tag(name = "Quản lý thiết bị", description = "Quản lý token thiết bị FCM cho thông báo đẩy")
@SecurityRequirement(name = "Bearer Authentication")
public class DeviceTokenController {

  private final DeviceTokenService deviceTokenService;

  public DeviceTokenController(DeviceTokenService deviceTokenService) {
    this.deviceTokenService = deviceTokenService;
  }

  /**
   * Đăng ký token thiết bị FCM cho thông báo đẩy.
   *
   * @param request        Thông tin đăng ký thiết bị
   * @param authentication Thông tin xác thực người dùng
   * @return Thông tin token thiết bị đã đăng ký
   */
  @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      summary = "Đăng ký token thiết bị FCM",
      description = "Đăng ký token thiết bị Firebase Cloud Messaging để nhận thông báo đẩy"
  )
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<DeviceTokenResponse> registerDevice(
      @Valid
      @RequestBody
      RegisterDeviceRequest request, Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    DeviceTokenResponse response = deviceTokenService.registerToken(request, userId);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  /**
   * Xóa token thiết bị FCM đã đăng ký.
   *
   * @param token Token thiết bị cần xóa
   */
  @DeleteMapping("/{token}")
  @Operation(summary = "Xóa token thiết bị", description = "Xóa token thiết bị FCM đã đăng ký")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void removeDevice(
      @PathVariable
      String token
  ) {
    deviceTokenService.removeToken(token);
  }

  /**
   * Lấy danh sách thiết bị đã đăng ký của người dùng hiện tại.
   *
   * @param authentication Thông tin xác thực người dùng
   * @return Danh sách thiết bị đã đăng ký
   */
  @GetMapping
  @Operation(
      summary = "Lấy danh sách thiết bị",
      description = "Lấy tất cả thiết bị đã đăng ký của người dùng hiện tại"
  )
  public ResponseEntity<List<DeviceTokenResponse>> getUserDevices(Authentication authentication) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    List<DeviceTokenResponse> devices = deviceTokenService.getUserDevices(userId);
    return ResponseEntity.ok(devices);
  }
}
