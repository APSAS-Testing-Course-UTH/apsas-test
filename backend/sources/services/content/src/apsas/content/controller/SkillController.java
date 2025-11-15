package apsas.content.controller;

import apsas.content.model.dto.CreateSkillRequest;
import apsas.content.model.dto.SkillResponse;
import apsas.content.model.dto.UpdateSkillRequest;
import apsas.content.service.SkillService;
import apsas.shared.models.pagination.PageRequestParams;
import apsas.shared.models.pagination.PageResponse;
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
 * Bộ điều khiển quản lý kỹ năng cho hệ thống APSAS. Cung cấp các API tạo, cập nhật, xóa và phân
 * trang kỹ năng.
 */
@RestController
@RequestMapping(
    value = "/api/v1/skills",
    produces = MediaType.APPLICATION_JSON_VALUE
)
@Tag(name = "Quản lý kỹ năng", description = "Các API quản lý kỹ năng")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class SkillController {
  private final SkillService skillService;

  /**
   * Lấy danh sách tất cả kỹ năng có phân trang và sắp xếp.
   *
   * @param pageParams Tham số phân trang
   * @return Danh sách kỹ năng
   */
  @GetMapping
  @Operation(
      summary = "Lấy tất cả kỹ năng",
      description = "Lấy danh sách kỹ năng có phân trang và sắp xếp"
  )
  public ResponseEntity<PageResponse<SkillResponse>> getAllSkills(
      PageRequestParams pageParams
  ) {
    PageResponse<SkillResponse> skills = skillService.getAllSkills(pageParams.toPageable());
    return ResponseEntity.ok(skills);
  }

  /**
   * Lấy chi tiết kỹ năng theo ID.
   *
   * @param id ID kỹ năng
   * @return Thông tin kỹ năng
   */
  @GetMapping(value = "/{id}")
  @Operation(summary = "Lấy kỹ năng theo ID", description = "Lấy chi tiết kỹ năng theo ID")
  public ResponseEntity<SkillResponse> getSkillById(
      @PathVariable
      UUID id
  ) {
    SkillResponse skill = skillService.getSkillById(id);
    return ResponseEntity.ok(skill);
  }

  /**
   * Tạo mới kỹ năng (chỉ Content Provider).
   *
   * @param request Dữ liệu kỹ năng mới
   * @return Thông tin kỹ năng vừa tạo
   */
  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Tạo kỹ năng mới",
      description = "Tạo mới kỹ năng (chỉ Content Provider)"
  )
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<SkillResponse> createSkill(
      @Valid
      @RequestBody
      CreateSkillRequest request
  ) {
    SkillResponse skill = skillService.createSkill(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(skill);
  }

  /**
   * Cập nhật thông tin kỹ năng (chỉ Content Provider).
   *
   * @param id      ID kỹ năng
   * @param request Dữ liệu cập nhật
   * @return Thông tin kỹ năng đã cập nhật
   */
  @PatchMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Cập nhật kỹ năng",
      description = "Cập nhật thông tin kỹ năng (chỉ Content Provider)"
  )
  public ResponseEntity<SkillResponse> updateSkill(
      @PathVariable
      UUID id,
      @Valid
      @RequestBody
      UpdateSkillRequest request
  ) {
    SkillResponse skill = skillService.updateSkill(id, request);
    return ResponseEntity.ok(skill);
  }

  /**
   * Xóa kỹ năng (chỉ Content Provider).
   *
   * @param id ID kỹ năng
   */
  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(summary = "Xóa kỹ năng", description = "Xóa kỹ năng (chỉ Content Provider)")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public ResponseEntity<Void> deleteSkill(
      @PathVariable
      UUID id
  ) {
    skillService.deleteSkill(id);
    return ResponseEntity.noContent().build();
  }
}
