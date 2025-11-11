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
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Bộ điều khiển quản lý người dùng cho hệ thống APSAS.
 * Cung cấp các API quản lý tài khoản, hồ sơ, phân quyền và bảo mật.
 */
@RestController
@RequestMapping(
  value = "/api/v1/users",
  consumes = MediaType.APPLICATION_JSON_VALUE,
  produces = MediaType.APPLICATION_JSON_VALUE
)
@Tag(name = "Quản lý người dùng", description = "Các API quản lý người dùng")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class UserController {
  private final UserService userService;

  /**
   * Lấy thông tin hồ sơ người dùng hiện tại.
   * @param authentication Thông tin xác thực
   * @return Hồ sơ người dùng
   */
  @GetMapping("/me")
  @Operation(
      summary = "Lấy hồ sơ người dùng hiện tại",
      description = "Lấy thông tin hồ sơ của người dùng đang đăng nhập"
  )
  public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    UserResponse response = userService.getUserById(userId);
    return ResponseEntity.ok(response);
  }

  /**
   * Cập nhật hồ sơ người dùng hiện tại.
   * @param authentication Thông tin xác thực
   * @param request Dữ liệu cập nhật hồ sơ
   * @return Hồ sơ người dùng đã cập nhật
   */
  @PutMapping("/me")
  @Operation(
      summary = "Cập nhật hồ sơ người dùng",
      description = "Cập nhật thông tin hồ sơ của người dùng đang đăng nhập"
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

  /**
   * Đổi mật khẩu cho người dùng hiện tại.
   * @param authentication Thông tin xác thực
   * @param request Dữ liệu đổi mật khẩu
   * @return Thông báo đổi mật khẩu thành công
   */
  @PostMapping("/me/change-password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(
      summary = "Đổi mật khẩu",
      description = "Đổi mật khẩu cho người dùng đang đăng nhập"
  )
  public ResponseEntity<Void> changePassword(
      Authentication authentication,
      @Valid
      @RequestBody
      ChangePasswordRequest request
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    userService.changePassword(userId, request);
    return ResponseEntity.noContent().build();
  }

  /**
   * Lấy thông tin người dùng theo ID (chỉ Admin và Giảng viên).
   * @param userId ID người dùng
   * @return Thông tin người dùng
   */
  @GetMapping(value = "/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
  @Operation(
      summary = "Lấy người dùng theo ID",
      description = "Lấy thông tin người dùng theo ID (chỉ Admin và Giảng viên)"
  )
  public ResponseEntity<UserResponse> getUserById(
      @PathVariable
      UUID userId
  ) {
    UserResponse response = userService.getUserById(userId);
    return ResponseEntity.ok(response);
  }

  /**
   * Lấy danh sách tất cả người dùng (chỉ Admin).
   * @param pageParams Tham số phân trang
   * @return Danh sách người dùng
   */
  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(
      summary = "Lấy tất cả người dùng",
      description = "Lấy danh sách người dùng có phân trang và sắp xếp (chỉ Admin)"
  )
  public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
      PageRequestParams pageParams
  ) {
    PageResponse<UserResponse> response = userService.getAllUsers(pageParams.toPageable());
    return ResponseEntity.ok(response);
  }

  /**
   * Lấy danh sách người dùng theo vai trò (chỉ Admin và Giảng viên).
   * @param role Vai trò người dùng
   * @param pageParams Tham số phân trang
   * @return Danh sách người dùng
   */
  @GetMapping(value = "/role/{role}", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
  @Operation(
      summary = "Lấy người dùng theo vai trò",
      description = "Lấy danh sách người dùng theo vai trò có phân trang và sắp xếp (chỉ Admin và Giảng viên)"
  )
  public ResponseEntity<PageResponse<UserResponse>> getUsersByRole(
      @PathVariable
      UserRole role,
      PageRequestParams pageParams
  ) {
    PageResponse<UserResponse> response = userService.getUsersByRole(role, pageParams.toPageable());
    return ResponseEntity.ok(response);
  }

  /**
   * Tạo mới người dùng (chỉ Admin).
   * @param request Dữ liệu người dùng mới
   * @return Thông tin người dùng vừa tạo
   */
  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Tạo người dùng", description = "Tạo mới người dùng (chỉ Admin)")
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<UserResponse> createUser(
      @Valid
      @RequestBody
      CreateUserRequest request
  ) {
    UserResponse response = userService.createUser(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  /**
   * Vô hiệu hóa tài khoản người dùng (chỉ Admin).
   * @param userId ID người dùng
   * @return Thông báo vô hiệu hóa thành công
   */
  @PutMapping("/{userId}/deactivate")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Vô hiệu hóa người dùng", description = "Vô hiệu hóa tài khoản người dùng (chỉ Admin)")
  public ResponseEntity<Void> deactivateUser(
      @PathVariable
      UUID userId
  ) {
    userService.deactivateUser(userId);
    return ResponseEntity.noContent().build();
  }

  /**
   * Kích hoạt tài khoản người dùng (chỉ Admin).
   * @param userId ID người dùng
   * @return Thông báo kích hoạt thành công
   */
  @PutMapping("/{userId}/activate")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Kích hoạt người dùng", description = "Kích hoạt tài khoản người dùng (chỉ Admin)")
  public ResponseEntity<Void> activateUser(
      @PathVariable
      UUID userId
  ) {
    userService.activateUser(userId);
    return ResponseEntity.noContent().build();
  }

  /**
   * Xóa tài khoản người dùng (chỉ Admin).
   * @param userId ID người dùng
   * @return Thông báo xóa thành công
   */
  @DeleteMapping("/{userId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Xóa người dùng", description = "Xóa tài khoản người dùng (chỉ Admin)")
  public ResponseEntity<Void> deleteUser(
      @PathVariable
      UUID userId
  ) {
    userService.deleteUser(userId);
    return ResponseEntity.noContent().build();
  }
}
