package apsas.submission.controller;

import apsas.shared.common.dto.PageResponse;
import apsas.shared.common.util.PageRequestParams;
import apsas.shared.security.UserPrincipal;
import apsas.submission.model.dto.CreateSubmissionRequest;
import apsas.submission.model.dto.SubmissionResponse;
import apsas.submission.model.entity.SubmissionStatus;
import apsas.submission.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/submissions")
@Tag(name = "Submission Management", description = "Submission management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class SubmissionController {

  private final SubmissionService submissionService;

  public SubmissionController(SubmissionService submissionService) {
    this.submissionService = submissionService;
  }

  @GetMapping
  @Operation(
      summary = "Get all submissions",
      description =
          "Get all submissions with pagination and sorting. Students see only their own, instructors can filter by assignment and student"
  )
  public ResponseEntity<PageResponse<SubmissionResponse>> getAllSubmissions(
      @Parameter(description = "Filter by assignment ID (instructors only)")
      @RequestParam(required = false)
      UUID assignmentId,
      @Parameter(description = "Filter by student ID (instructors only)")
      @RequestParam(required = false)
      UUID studentId,
      @Parameter(description = "Filter by status")
      @RequestParam(required = false)
      SubmissionStatus status,
      @Parameter
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

  @GetMapping("/{id}")
  @Operation(
      summary = "Get submission by ID",
      description =
          "Get submission details by ID. Students can only view their own, instructors can view all"
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

  @PostMapping
  @PreAuthorize("hasRole('STUDENT')")
  @Operation(
      summary = "Create a new submission",
      description = "Submit a solution for an assignment (Students only)"
  )
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

  @PostMapping("/{id}/feedback")
  @PreAuthorize("hasRole('INSTRUCTOR')")
  @Operation(
      summary = "Provide feedback for a submission",
      description = "Add instructor feedback to a submission (Instructors only)"
  )
  public ResponseEntity<SubmissionResponse> provideFeedback(
      @PathVariable
      UUID id,
      @Valid
      @RequestBody
      apsas.submission.model.dto.SubmissionFeedbackRequest request
  ) {
    SubmissionResponse submission = submissionService.provideFeedback(id, request.getFeedback());
    return ResponseEntity.ok(submission);
  }
}
