package apsas.support.controller;

import apsas.shared.models.pagination.PageResponse;
import apsas.shared.models.pagination.PageRequestParams;
import apsas.shared.security.UserPrincipal;
import apsas.support.mapper.SupportSessionMapper;
import apsas.support.model.dto.CreateSupportSessionRequest;
import apsas.support.model.dto.SupportSessionDto;
import apsas.support.model.entity.SupportSession;
import apsas.support.service.SupportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller quản lý các endpoint liên quan đến phiên hỗ trợ
 */
@RestController
@RequestMapping("/api/v1/support/sessions")
@Tag(name = "Support", description = "Support session management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class SupportController {
  private final SupportService supportService;
  private final SupportSessionMapper sessionMapper;

  @GetMapping
  @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
  @Operation(
      summary = "List all support sessions",
      description = "Instructors view all sessions with pagination, students view their own"
  )
  @ApiResponses(
      value = {@ApiResponse(responseCode = "200", description = "Successfully retrieved sessions")}
  )
  public ResponseEntity<PageResponse<SupportSessionDto>> listSessions(
      @Parameter
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

  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
  @Operation(
      summary = "Get support session by ID",
      description = "Instructors can view all, students can view their own"
  )
  @ApiResponses(
      value = {
          @ApiResponse(responseCode = "200", description = "Successfully retrieved session"),
          @ApiResponse(responseCode = "404", description = "Session not found"),
          @ApiResponse(responseCode = "403", description = "Access denied")
      }
  )
  public ResponseEntity<SupportSessionDto> getSessionById(
      @PathVariable
      UUID id,
      @AuthenticationPrincipal
      UserPrincipal principal
  ) {

    SupportSession session = supportService.getSessionById(id);
    supportService.validateUserAccess(session, principal.userId(), principal.role());

    // Mark messages as read when viewing the session
    supportService.markMessagesAsRead(id, principal.userId());

    return ResponseEntity.ok(sessionMapper.toDto(session));
  }

  @PostMapping
  @PreAuthorize("hasRole('STUDENT')")
  @Operation(
      summary = "Create a new support session",
      description = "Students can create support sessions"
  )
  @ApiResponses(
      value = {
          @ApiResponse(responseCode = "201", description = "Session created successfully"),
          @ApiResponse(responseCode = "400", description = "Invalid request")
      }
  )
  public ResponseEntity<SupportSessionDto> createSession(
      @Valid
      @RequestBody
      CreateSupportSessionRequest request,
      @AuthenticationPrincipal
      UserPrincipal principal
  ) {

    String studentName = principal.firstName() + " " + principal.lastName();
    SupportSession session =
        supportService.createSession(
            principal.userId(),
            principal.email(),
            studentName,
            request.initialMessage());

    return ResponseEntity.status(HttpStatus.CREATED).body(sessionMapper.toDto(session));
  }

  @PostMapping("/{id}/close")
  @PreAuthorize("hasRole('STUDENT')")
  @Operation(
      summary = "Close a support session",
      description = "Only the student who created the session can close it"
  )
  @ApiResponses(
      value = {
          @ApiResponse(responseCode = "200", description = "Session closed successfully"),
          @ApiResponse(responseCode = "404", description = "Session not found"),
          @ApiResponse(responseCode = "403", description = "Access denied"),
          @ApiResponse(responseCode = "400", description = "Session already closed")
      }
  )
  public ResponseEntity<SupportSessionDto> closeSession(
      @PathVariable
      UUID id,
      @AuthenticationPrincipal
      UserPrincipal principal
  ) {

    SupportSession session = supportService.closeSession(id, principal.userId());

    return ResponseEntity.ok(sessionMapper.toDto(session));
  }
}
