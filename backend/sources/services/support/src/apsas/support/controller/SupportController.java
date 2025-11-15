package apsas.support.controller;

import apsas.shared.models.pagination.PageRequestParams;
import apsas.shared.models.pagination.PageResponse;
import apsas.shared.security.UserPrincipal;
import apsas.support.model.dto.CreateSupportSessionRequest;
import apsas.support.model.dto.SendMessageRequest;
import apsas.support.model.dto.SupportSessionResponse;
import apsas.support.service.SupportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Bộ điều khiển REST quản lý phiên hỗ trợ và tin nhắn giữa sinh viên và giảng viên.
 */
@RestController
@RequestMapping(value = "/api/v1/support", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Quản lý hỗ trợ", description = "API quản lý phiên hỗ trợ và tin nhắn")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class SupportController {
  private final SupportService supportService;

  /**
   * Liệt kê các phiên hỗ trợ.
   *
   * @param pageParams Thông tin phân trang
   * @param principal  Người dùng hiện tại
   * @return Danh sách các phiên hỗ trợ dưới dạng phân trang
   */
  @GetMapping("/sessions")
  @Operation(
      summary = "Liệt kê các phiên hỗ trợ",
      description = "Giảng viên xem tất cả phiên, sinh viên chỉ xem phiên của mình"
  )
  public ResponseEntity<PageResponse<SupportSessionResponse>> listSessions(
      PageRequestParams pageParams,
      @AuthenticationPrincipal
      UserPrincipal principal
  ) {
    return ResponseEntity.ok(supportService.getSessions(pageParams, principal));
  }

  /**
   * Xem chi tiết một phiên hỗ trợ cụ thể.
   *
   * @param sessionId ID của phiên hỗ trợ
   * @param principal Người dùng hiện tại
   * @return Chi tiết của phiên hỗ trợ
   */
  @GetMapping("/sessions/{sessionId}")
  @Operation(
      summary = "Xem chi tiết phiên hỗ trợ",
      description = "Giảng viên xem mọi phiên, sinh viên chỉ xem phiên của mình"
  )
  public ResponseEntity<SupportSessionResponse> getSessionById(
      @PathVariable
      UUID sessionId,
      @AuthenticationPrincipal
      UserPrincipal principal
  ) {
    return ResponseEntity.ok(supportService.getSessionById(sessionId, principal));
  }

  /**
   * Tạo một phiên hỗ trợ mới.
   *
   * @param request   Dữ liệu yêu cầu tạo phiên hỗ trợ
   * @param principal Người dùng hiện tại
   * @return Phiên hỗ trợ mới được tạo
   */
  @PostMapping(value = "/sessions", consumes = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      summary = "Tạo phiên hỗ trợ mới",
      description = "Sinh viên có thể tạo phiên hỗ trợ mới"
  )
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<SupportSessionResponse> createSession(
      @Valid
      @RequestBody
      CreateSupportSessionRequest request,
      @AuthenticationPrincipal
      UserPrincipal principal
  ) {
    String studentName = principal.firstName() + " " + principal.lastName();
    var session = supportService.createSession(
        principal.userId(), principal.email(), studentName, request.initialMessage());
    return ResponseEntity.status(HttpStatus.CREATED).body(session);
  }

  /**
   * Đóng một phiên hỗ trợ.
   *
   * @param sessionId ID của phiên hỗ trợ cần đóng
   * @param principal Người dùng hiện tại
   * @return Phiên hỗ trợ đã được đóng
   */
  @PostMapping("/sessions/{sessionId}/close")
  @Operation(
      summary = "Đóng phiên hỗ trợ",
      description = "Chỉ sinh viên tạo phiên mới được đóng phiên"
  )
  public ResponseEntity<SupportSessionResponse> closeSession(
      @PathVariable
      UUID sessionId,
      @AuthenticationPrincipal
      UserPrincipal principal
  ) {
    var session = supportService.closeSession(sessionId, principal.userId());
    return ResponseEntity.ok(session);
  }

  /**
   * Gửi tin nhắn trong một phiên hỗ trợ.
   *
   * @param sessionId ID của phiên hỗ trợ
   * @param request   Dữ liệu tin nhắn cần gửi
   * @param principal Người dùng hiện tại
   * @return Phiên hỗ trợ sau khi gửi tin nhắn
   */
  @PostMapping(
      value = "/sessions/{sessionId}/messages",
      consumes = MediaType.APPLICATION_JSON_VALUE
  )
  @Operation(
      summary = "Gửi tin nhắn trong phiên hỗ trợ",
      description = "Gửi tin nhắn trong một phiên hỗ trợ"
  )
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<SupportSessionResponse> sendMessage(
      @PathVariable
      UUID sessionId,
      @Valid
      @RequestBody
      SendMessageRequest request,
      @AuthenticationPrincipal
      UserPrincipal principal
  ) {
    var session = supportService.sendMessage(principal, sessionId, request);
    return ResponseEntity.ok(session);
  }
}
