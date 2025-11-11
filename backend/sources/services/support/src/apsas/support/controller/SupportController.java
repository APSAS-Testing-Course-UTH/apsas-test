package apsas.support.controller;

import apsas.shared.models.pagination.PageRequestParams;
import apsas.shared.models.pagination.PageResponse;
import apsas.shared.security.UserPrincipal;
import apsas.support.model.dto.CreateSupportSessionRequest;
import apsas.support.model.dto.SupportSessionDto;
import apsas.support.service.SupportService;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Bộ điều khiển REST cho các API quản lý phiên hỗ trợ giữa sinh viên và giảng viên.
 */
@RestController
@RequestMapping(
    value = "/api/v1/support/sessions",
    consumes = MediaType.APPLICATION_JSON_VALUE,
    produces = MediaType.APPLICATION_JSON_VALUE
)
@Tag(name = "Quản lý hỗ trợ", description = "Quản lý phiên hỗ trợ giữa sinh viên và giảng viên")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class SupportController {
  private final SupportService supportService;

    /**
     * Lấy danh sách phiên hỗ trợ. Giảng viên xem tất cả, sinh viên chỉ xem phiên của mình.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
    @Operation(
            summary = "Lấy danh sách phiên hỗ trợ",
            description = "Giảng viên xem tất cả phiên hỗ trợ với phân trang, sinh viên chỉ xem phiên của mình"
    )
    public ResponseEntity<PageResponse<SupportSessionDto>> listSessions(
            PageRequestParams pageParams,
            @AuthenticationPrincipal
            UserPrincipal principal
    ) {
        PageResponse<SupportSessionDto> sessions;
        if ("INSTRUCTOR".equals(principal.role())) {
            sessions = supportService.getAllSessions(pageParams.toPageable());
        } else {
            sessions = supportService.getSessionsForStudent(principal.userId(), pageParams.toPageable());
        }
        return ResponseEntity.ok(sessions);
    }

  /**
   * Lấy chi tiết phiên hỗ trợ theo ID. Giảng viên xem được tất cả, sinh viên chỉ xem phiên của mình.
   */
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
  @Operation(
      summary = "Lấy phiên hỗ trợ theo ID",
      description = "Giảng viên xem được tất cả, sinh viên chỉ xem phiên của mình"
  )
  public ResponseEntity<SupportSessionDto> getSessionById(
      @PathVariable
      UUID id,
      @AuthenticationPrincipal
      UserPrincipal principal
  ) {

    var session = supportService.getSessionById(id);
    supportService.validateUserAccess(session, principal.userId(), principal.role());
    // Đánh dấu tin nhắn đã đọc khi xem phiên hỗ trợ
    supportService.markMessagesAsRead(id, principal.userId());

    return ResponseEntity.ok(session);
  }

  /**
   * Tạo phiên hỗ trợ mới (chỉ sinh viên).
   */
  @PostMapping
  @PreAuthorize("hasRole('STUDENT')")
  @Operation(
      summary = "Tạo phiên hỗ trợ mới",
      description = "Sinh viên có thể tạo phiên hỗ trợ mới"
  )
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<SupportSessionDto> createSession(
      @Valid
      @RequestBody
      CreateSupportSessionRequest request,
      @AuthenticationPrincipal
      UserPrincipal principal
  ) {
    String studentName = principal.firstName() + " " + principal.lastName();
    var session =
        supportService.createSession(
            principal.userId(),
            principal.email(),
            studentName,
            request.initialMessage()
        );

    return ResponseEntity.status(HttpStatus.CREATED).body(session);
  }

  /**
   * Đóng phiên hỗ trợ (chỉ sinh viên tạo phiên mới được đóng).
   */
  @PostMapping("/{id}/close")
  @PreAuthorize("hasRole('STUDENT')")
  @Operation(
      summary = "Đóng phiên hỗ trợ",
      description = "Chỉ sinh viên tạo phiên mới được đóng phiên hỗ trợ"
  )
  public ResponseEntity<SupportSessionDto> closeSession(
      @PathVariable
      UUID id,
      @AuthenticationPrincipal
      UserPrincipal principal
  ) {

    var session = supportService.closeSession(id, principal.userId());

    return ResponseEntity.ok(session);
  }
}
