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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/assignments")
@Tag(name = "Assignment Management", description = "Assignment management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class AssignmentController {
  private final AssignmentService assignmentService;

  @GetMapping
  @Operation(
      summary = "Get all assignments",
      description = "Get all available assignments with pagination and sorting"
  )
  public ResponseEntity<PageResponse<AssignmentResponse>> getAllAssignments(
      PageRequestParams pageParams
  ) {
    PageResponse<AssignmentResponse> assignments =
        assignmentService.getAllAssignments(pageParams.toPageable());
    return ResponseEntity.ok(assignments);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get assignment by ID", description = "Get assignment details by ID")
  public ResponseEntity<AssignmentResponse> getAssignmentById(
      @PathVariable
      UUID id
  ) {
    AssignmentResponse assignment = assignmentService.getAssignmentById(id);
    return ResponseEntity.ok(assignment);
  }

  @PostMapping
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Create a new assignment",
      description = "Create a new assignment (Content Provider only)"
  )
  public ResponseEntity<AssignmentResponse> createAssignment(
      @Valid
      @RequestBody
      CreateAssignmentRequest request, Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID creatorId = userPrincipal.userId();
    AssignmentResponse assignment = assignmentService.createAssignment(request, creatorId);
    return new ResponseEntity<>(assignment, HttpStatus.CREATED);
  }

  @PatchMapping("/{id}")
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Update assignment",
      description = "Update assignment details (Content Provider only)"
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

  @PatchMapping("/{id}/schedule")
  @PreAuthorize("hasRole('INSTRUCTOR')")
  @Operation(
      summary = "Update assignment schedule",
      description = "Update assignment schedule (start_date, due_date) (Instructor only)"
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

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Delete assignment",
      description = "Delete an assignment (Content Provider only)"
  )
  public ResponseEntity<Void> deleteAssignment(
      @PathVariable
      UUID id, Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    assignmentService.deleteAssignment(id, userId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{id}/publish")
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Publish an assignment",
      description = "Publish a draft assignment (Content Provider only)"
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

  @PostMapping("/{id}/archive")
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Archive an assignment",
      description = "Archive an assignment (Content Provider only)"
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
