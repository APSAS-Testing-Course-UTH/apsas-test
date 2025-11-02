package apsas.content.controller;

import apsas.content.model.dto.CreateTutorialRequest;
import apsas.content.model.dto.TutorialResponse;
import apsas.content.model.dto.UpdateTutorialRequest;
import apsas.content.service.TutorialService;
import apsas.shared.models.pagination.PageRequestParams;
import apsas.shared.models.pagination.PageResponse;
import apsas.shared.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@RequestMapping("/api/v1/tutorials")
@Tag(name = "Tutorial Management", description = "Tutorial management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class TutorialController {
  private final TutorialService tutorialService;

  @GetMapping
  @Operation(
      summary = "Get all tutorials",
      description = "Get all available tutorials with pagination and sorting"
  )
  public ResponseEntity<PageResponse<TutorialResponse>> getAllTutorials(
      @Parameter
      PageRequestParams pageParams
  ) {
    PageResponse<TutorialResponse> tutorials =
        tutorialService.getAllTutorials(pageParams.toPageable());
    return ResponseEntity.ok(tutorials);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get tutorial by ID", description = "Get tutorial details by ID")
  public ResponseEntity<TutorialResponse> getTutorialById(
      @PathVariable
      UUID id
  ) {
    TutorialResponse tutorial = tutorialService.getTutorialById(id);
    return ResponseEntity.ok(tutorial);
  }

  @PostMapping
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Create a new tutorial",
      description = "Create a new tutorial (Content Provider only)"
  )
  public ResponseEntity<TutorialResponse> createTutorial(
      @Valid
      @RequestBody
      CreateTutorialRequest request, Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID creatorId = userPrincipal.userId();
    TutorialResponse tutorial = tutorialService.createTutorial(request, creatorId);
    return new ResponseEntity<>(tutorial, HttpStatus.CREATED);
  }

  @PatchMapping("/{id}")
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Update tutorial",
      description = "Update tutorial details (Content Provider only)"
  )
  public ResponseEntity<TutorialResponse> updateTutorial(
      @PathVariable
      UUID id,
      @Valid
      @RequestBody
      UpdateTutorialRequest request,
      Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    TutorialResponse tutorial = tutorialService.updateTutorial(id, request, userId);
    return ResponseEntity.ok(tutorial);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(summary = "Delete tutorial", description = "Delete a tutorial (Content Provider only)")
  public ResponseEntity<Void> deleteTutorial(
      @PathVariable
      UUID id, Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID userId = userPrincipal.userId();
    tutorialService.deleteTutorial(id, userId);
    return ResponseEntity.noContent().build();
  }
}
