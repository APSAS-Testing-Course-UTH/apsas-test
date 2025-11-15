package apsas.content.controller;

import apsas.content.model.dto.AssignmentResponse;
import apsas.content.model.dto.CreateAssignmentRequest;
import apsas.content.model.dto.UpdateAssignmentRequest;
import apsas.content.model.dto.UpdateAssignmentScheduleRequest;
import apsas.content.service.AssignmentService;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Bộ điều khiển quản lý bài tập cho hệ thống APSAS. Cung cấp các API tạo, cập nhật, xóa, xuất bản
 * và phân trang bài tập.
 */
@RestController
@RequestMapping(
    path = "/api/v1/assignments",
    produces = MediaType.APPLICATION_JSON_VALUE
)
@Tag(name = "Quản lý bài tập", description = "Các API quản lý bài tập")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class AssignmentController {
  private final AssignmentService assignmentService;

  /**
   * Lấy danh sách tất cả bài tập có phân trang và sắp xếp.
   *
   * @param pageParams Tham số phân trang
   * @return Danh sách bài tập
   */
  @GetMapping
  @Operation(
      summary = "Lấy tất cả bài tập",
      description = "Lấy danh sách bài tập có phân trang và sắp xếp"
  )
  public ResponseEntity<PageResponse<AssignmentResponse>> getAllAssignments(
      PageRequestParams pageParams
  ) {
    PageResponse<AssignmentResponse> assignments =
        assignmentService.getAllAssignments(pageParams.toPageable());
    return ResponseEntity.ok(assignments);
  }

  /**
   * Lấy chi tiết bài tập theo ID.
   *
   * @param id ID bài tập
   * @return Thông tin bài tập
   */
  @GetMapping("/{id}")
  @Operation(summary = "Lấy bài tập theo ID", description = "Lấy chi tiết bài tập theo ID")
  public ResponseEntity<AssignmentResponse> getAssignmentById(
      @PathVariable
      UUID id
  ) {
    AssignmentResponse assignment = assignmentService.getAssignmentById(id);
    return ResponseEntity.ok(assignment);
  }

  /**
   * Tạo mới bài tập (chỉ Content Provider).
   *
   * @param request        Dữ liệu bài tập mới
   * @param authentication Thông tin xác thực
   * @return Thông tin bài tập vừa tạo
   */
  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Tạo bài tập mới",
      description = "Tạo mới bài tập (chỉ Content Provider)"
  )
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<AssignmentResponse> createAssignment(
      @Valid
      @RequestBody
      CreateAssignmentRequest request, Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID creatorId = userPrincipal.userId();
    AssignmentResponse assignment = assignmentService.createAssignment(request, creatorId);
    return ResponseEntity.status(HttpStatus.CREATED).body(assignment);
  }

  /**
   * Cập nhật thông tin bài tập (chỉ Content Provider).
   *
   * @param id             ID bài tập
   * @param request        Dữ liệu cập nhật
   * @param authentication Thông tin xác thực
   * @return Thông tin bài tập đã cập nhật
   */
  @PatchMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Cập nhật bài tập",
      description = "Cập nhật thông tin bài tập (chỉ Content Provider)"
  )
  public ResponseEntity<AssignmentResponse> updateAssignment(
      @PathVariable
      UUID id,
      @Valid
      @RequestBody
      UpdateAssignmentRequest request,
      Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    AssignmentResponse assignment = assignmentService.updateAssignment(id, request, userId);
    return ResponseEntity.ok(assignment);
  }

  /**
   * Cập nhật lịch bài tập (chỉ Giảng viên).
   *
   * @param id      ID bài tập
   * @param request Dữ liệu lịch bài tập
   * @return Thông tin bài tập đã cập nhật
   */
  @PatchMapping(value = "/{id}/schedule", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('INSTRUCTOR')")
  @Operation(
      summary = "Cập nhật lịch bài tập",
      description = "Cập nhật lịch bài tập (start_date, due_date) (chỉ Giảng viên)"
  )
  public ResponseEntity<AssignmentResponse> updateAssignmentSchedule(
      @PathVariable
      UUID id,
      @Valid
      @RequestBody
      UpdateAssignmentScheduleRequest request
  ) {
    AssignmentResponse assignment = assignmentService.updateAssignmentSchedule(id, request);
    return ResponseEntity.ok(assignment);
  }

  /**
   * Xóa bài tập (chỉ Content Provider).
   *
   * @param id             ID bài tập
   * @param authentication Thông tin xác thực
   */
  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Xóa bài tập",
      description = "Xóa bài tập (chỉ Content Provider)"
  )
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public ResponseEntity<Void> deleteAssignment(
      @PathVariable
      UUID id, Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    assignmentService.deleteAssignment(id, userId);
    return ResponseEntity.noContent().build();
  }

  /**
   * Xuất bản bài tập nháp (chỉ Content Provider).
   *
   * @param id             ID bài tập
   * @param authentication Thông tin xác thực
   * @return Thông tin bài tập đã xuất bản
   */
  @PostMapping("/{id}/publish")
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Xuất bản bài tập",
      description = "Xuất bản bài tập nháp (chỉ Content Provider)"
  )
  public ResponseEntity<AssignmentResponse> publishAssignment(
      @PathVariable
      UUID id, Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    AssignmentResponse assignment = assignmentService.publishAssignment(id, userId);
    return ResponseEntity.ok(assignment);
  }

  /**
   * Lưu trữ bài tập (chỉ Content Provider).
   *
   * @param id             ID bài tập
   * @param authentication Thông tin xác thực
   * @return Thông tin bài tập đã lưu trữ
   */
  @PostMapping("/{id}/archive")
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Lưu trữ bài tập",
      description = "Lưu trữ bài tập (chỉ Content Provider)"
  )
  public ResponseEntity<AssignmentResponse> archiveAssignment(
      @PathVariable
      UUID id, Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    AssignmentResponse assignment = assignmentService.archiveAssignment(id, userId);
    return ResponseEntity.ok(assignment);
  }
}
