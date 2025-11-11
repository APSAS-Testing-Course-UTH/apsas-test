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
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
    path = "/api/auth",
    consumes = MediaType.APPLICATION_JSON_VALUE,
    produces = MediaType.APPLICATION_JSON_VALUE
)
/**
 * Bộ điều khiển xác thực cho hệ thống APSAS.
 * Cung cấp các API đăng ký, đăng nhập, xác thực email và quản lý mật khẩu.
 */
@Tag(
  name = "Xác thực",
  description = "Các API xác thực và phân quyền"
)
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  /**
   * Đăng ký tài khoản mới với vai trò sinh viên.
   * @param request Thông tin đăng ký
   * @return Thông tin xác thực
   */
  @PostMapping("/register")
  @Operation(
      summary = "Đăng ký người dùng mới",
      description = "Đăng ký tài khoản mới với vai trò sinh viên"
  )
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<AuthResponse> register(
      @Valid
      @RequestBody
      RegisterRequest request
  ) {
    AuthResponse response = authService.register(request);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  /**
   * Đăng nhập và nhận JWT token.
   * @param request Thông tin đăng nhập
   * @return Thông tin xác thực
   */
  @PostMapping("/login")
  @Operation(
      summary = "Đăng nhập",
      description = "Xác thực người dùng và trả về JWT token"
  )
  public ResponseEntity<AuthResponse> login(
      @Valid
      @RequestBody
      LoginRequest request
  ) {
    AuthResponse response = authService.login(request);
    return ResponseEntity.ok(response);
  }

  /**
   * Xác thực email người dùng bằng mã token.
   * @param request Token xác thực email
   */
  @PostMapping("/verify-email")
  @Operation(
      summary = "Xác thực email",
      description = "Xác thực email người dùng bằng mã token"
  )
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public ResponseEntity<Void> verifyEmail(
      @Valid
      @RequestBody
      TokenRequest request
  ) {
    authService.verifyEmail(request.getToken());
    return ResponseEntity.noContent().build();
  }

  /**
   * Gửi lại email xác thực tài khoản.
   * @param request Thông tin email
   */
  @PostMapping("/resend-verification")
  @Operation(
      summary = "Gửi lại email xác thực",
      description = "Gửi lại liên kết xác thực email"
  )
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public ResponseEntity<Void> resendVerificationEmail(
      @Valid
      @RequestBody
      EmailRequest request
  ) {
    authService.resendVerificationEmail(request);
    return ResponseEntity.noContent().build();
  }

  /**
   * Yêu cầu gửi email đặt lại mật khẩu.
   * @param request Thông tin email
   */
  @PostMapping("/forgot-password")
  @Operation(
      summary = "Yêu cầu đặt lại mật khẩu",
      description = "Yêu cầu gửi liên kết đặt lại mật khẩu qua email"
  )
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public ResponseEntity<Void> requestPasswordReset(
      @Valid
      @RequestBody
      EmailRequest request
  ) {
    authService.requestPasswordReset(request);
    return ResponseEntity.noContent().build();
  }

  /**
   * Đặt lại mật khẩu bằng mã token.
   * @param request Thông tin đặt lại mật khẩu
   */
  @PostMapping("/reset-password")
  @Operation(
      summary = "Đặt lại mật khẩu",
      description = "Đặt lại mật khẩu bằng mã token"
  )
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public ResponseEntity<Void> resetPassword(
      @Valid
      @RequestBody
      ResetPasswordRequest request
  ) {
    authService.resetPassword(request);
    return ResponseEntity.noContent().build();
  }
}
