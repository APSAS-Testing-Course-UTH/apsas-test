package apsas.submission.controller;

import apsas.shared.models.pagination.PageRequestParams;
import apsas.shared.models.pagination.PageResponse;
import apsas.shared.security.UserPrincipal;
import apsas.submission.model.dto.CreateSubmissionRequest;
import apsas.submission.model.dto.SubmissionFeedbackRequest;
import apsas.submission.model.dto.SubmissionResponse;
import apsas.submission.model.entity.SubmissionStatus;
import apsas.submission.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Bộ điều khiển REST cho các API quản lý bài nộp của sinh viên.
 */
@RestController
@RequestMapping(
    value = "/api/v1/submissions",
    produces = MediaType.APPLICATION_JSON_VALUE
)
@Tag(name = "Quản lý bài nộp", description = "Quản lý và xử lý bài nộp của sinh viên")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class SubmissionController {
  private final SubmissionService submissionService;

  /**
   * Lấy danh sách bài nộp với phân trang và sắp xếp. Sinh viên chỉ xem bài của mình, giảng viên có
   * thể lọc theo bài tập và sinh viên.
   */
  @GetMapping
  @Operation(
      summary = "Lấy tất cả bài nộp",
      description = "Lấy danh sách bài nộp với phân trang và sắp xếp. Sinh viên chỉ xem bài của mình, giảng viên có thể lọc theo bài tập và sinh viên."
  )
  public ResponseEntity<PageResponse<SubmissionResponse>> getAllSubmissions(
      @Parameter(description = "Lọc theo ID bài tập (chỉ giảng viên)")
      @RequestParam(required = false)
      UUID assignmentId,
      @Parameter(description = "Lọc theo ID sinh viên (chỉ giảng viên)")
      @RequestParam(required = false)
      UUID studentId,
      @Parameter(description = "Lọc theo trạng thái")
      @RequestParam(required = false)
      SubmissionStatus status,
      PageRequestParams pageParams,
      Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    boolean isInstructor =
        authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_INSTRUCTOR"));

    PageResponse<SubmissionResponse> submissions =
        submissionService.getAllSubmissions(
            userPrincipal.userId(),
            assignmentId,
            studentId,
            status,
            isInstructor,
            pageParams.toPageable()
        );
    return ResponseEntity.ok(submissions);
  }

  /**
   * Lấy chi tiết bài nộp theo ID. Sinh viên chỉ xem bài của mình, giảng viên xem được tất cả.
   */
  @GetMapping("/{id}")
  @Operation(
      summary = "Lấy bài nộp theo ID",
      description = "Lấy chi tiết bài nộp theo ID. Sinh viên chỉ xem bài của mình, giảng viên xem được tất cả."
  )
  public ResponseEntity<SubmissionResponse> getSubmissionById(
      @PathVariable
      UUID id, Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    boolean isInstructor =
        authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_INSTRUCTOR"));

    SubmissionResponse submission =
        submissionService.getSubmissionById(id, userPrincipal.userId(), isInstructor);
    return ResponseEntity.ok(submission);
  }

  /**
   * Tạo bài nộp mới cho bài tập (chỉ sinh viên).
   */
  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('STUDENT')")
  @Operation(
      summary = "Tạo bài nộp mới",
      description = "Nộp bài giải cho một bài tập (chỉ sinh viên)"
  )
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<SubmissionResponse> createSubmission(
      @Valid
      @RequestBody
      CreateSubmissionRequest request, Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    SubmissionResponse submission =
        submissionService.createSubmission(request, userPrincipal.userId());
    return new ResponseEntity<>(submission, HttpStatus.CREATED);
  }

  /**
   * Thêm nhận xét của giảng viên cho bài nộp (chỉ giảng viên).
   */
  @PostMapping(path = "/{id}/feedback", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('INSTRUCTOR')")
  @Operation(
      summary = "Thêm nhận xét cho bài nộp",
      description = "Thêm nhận xét của giảng viên cho bài nộp (chỉ giảng viên)"
  )
  public ResponseEntity<SubmissionResponse> provideFeedback(
      @PathVariable
      UUID id,
      @Valid
      @RequestBody
      SubmissionFeedbackRequest request
  ) {
    SubmissionResponse submission = submissionService.provideFeedback(id, request.getFeedback());
    return ResponseEntity.ok(submission);
  }
}
