package apsas.content.controller;

import apsas.content.model.dto.CreateSkillRequest;
import apsas.content.model.dto.SkillResponse;
import apsas.content.model.dto.UpdateSkillRequest;
import apsas.content.service.SkillService;
import apsas.shared.common.dto.PageResponse;
import apsas.shared.common.util.PageRequestParams;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/skills")
@Tag(name = "Skill Management", description = "Skill management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class SkillController {

  private final SkillService skillService;

  public SkillController(SkillService skillService) {
    this.skillService = skillService;
  }

  @GetMapping
  @Operation(
      summary = "Get all skills",
      description = "Get all available skills with pagination and sorting")
  public ResponseEntity<PageResponse<SkillResponse>> getAllSkills(
      @Parameter PageRequestParams pageParams) {
    PageResponse<SkillResponse> skills = skillService.getAllSkills(pageParams.toPageable());
    return ResponseEntity.ok(skills);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get skill by ID", description = "Get skill details by ID")
  public ResponseEntity<SkillResponse> getSkillById(@PathVariable UUID id) {
    SkillResponse skill = skillService.getSkillById(id);
    return ResponseEntity.ok(skill);
  }

  @PostMapping
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Create a new skill",
      description = "Create a new skill (Content Provider only)")
  public ResponseEntity<SkillResponse> createSkill(@Valid @RequestBody CreateSkillRequest request) {
    SkillResponse skill = skillService.createSkill(request);
    return new ResponseEntity<>(skill, HttpStatus.CREATED);
  }

  @PatchMapping("/{id}")
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(summary = "Update skill", description = "Update skill details (Content Provider only)")
  public ResponseEntity<SkillResponse> updateSkill(
      @PathVariable UUID id, @Valid @RequestBody UpdateSkillRequest request) {
    SkillResponse skill = skillService.updateSkill(id, request);
    return ResponseEntity.ok(skill);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(summary = "Delete skill", description = "Delete a skill (Content Provider only)")
  public ResponseEntity<Map<String, String>> deleteSkill(@PathVariable UUID id) {
    skillService.deleteSkill(id);
    return ResponseEntity.ok(Map.of("message", "Skill deleted successfully"));
  }
}
