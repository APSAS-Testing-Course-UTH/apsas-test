package apsas.content.controller;

import apsas.content.model.dto.CreateTutorialRequest;
import apsas.content.model.dto.TutorialResponse;
import apsas.content.model.dto.UpdateTutorialRequest;
import apsas.content.service.TutorialService;
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
 * Bộ điều khiển quản lý hướng dẫn cho hệ thống APSAS. Cung cấp các API tạo, cập nhật, xóa và phân
 * trang hướng dẫn.
 */
@RestController
@RequestMapping(
    value = "/api/v1/tutorials",
    produces = MediaType.APPLICATION_JSON_VALUE
)
@Tag(name = "Quản lý hướng dẫn", description = "Các API quản lý hướng dẫn")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class TutorialController {
  private final TutorialService tutorialService;

  /**
   * Lấy danh sách tất cả hướng dẫn có phân trang và sắp xếp.
   *
   * @param pageParams Tham số phân trang
   * @return Danh sách hướng dẫn
   */
  @GetMapping
  @Operation(
      summary = "Lấy tất cả hướng dẫn",
      description = "Lấy danh sách hướng dẫn có phân trang và sắp xếp"
  )
  public ResponseEntity<PageResponse<TutorialResponse>> getAllTutorials(
      PageRequestParams pageParams
  ) {
    PageResponse<TutorialResponse> tutorials =
        tutorialService.getAllTutorials(pageParams.toPageable());
    return ResponseEntity.ok(tutorials);
  }

  /**
   * Lấy chi tiết hướng dẫn theo ID.
   *
   * @param id ID hướng dẫn
   * @return Thông tin hướng dẫn
   */
  @GetMapping("/{id}")
  @Operation(summary = "Lấy hướng dẫn theo ID", description = "Lấy chi tiết hướng dẫn theo ID")
  public ResponseEntity<TutorialResponse> getTutorialById(
      @PathVariable
      UUID id
  ) {
    TutorialResponse tutorial = tutorialService.getTutorialById(id);
    return ResponseEntity.ok(tutorial);
  }

  /**
   * Tạo mới hướng dẫn (chỉ Content Provider).
   *
   * @param request        Dữ liệu hướng dẫn mới
   * @param authentication Thông tin xác thực
   * @return Thông tin hướng dẫn vừa tạo
   */
  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Tạo hướng dẫn mới",
      description = "Tạo mới hướng dẫn (chỉ Content Provider)"
  )
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<TutorialResponse> createTutorial(
      @Valid
      @RequestBody
      CreateTutorialRequest request, Authentication authentication
  ) {
    UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    UUID creatorId = userPrincipal.userId();
    TutorialResponse tutorial = tutorialService.createTutorial(request, creatorId);
    return ResponseEntity.status(HttpStatus.CREATED).body(tutorial);
  }

  /**
   * Cập nhật thông tin hướng dẫn (chỉ Content Provider).
   *
   * @param id             ID hướng dẫn
   * @param request        Dữ liệu cập nhật
   * @param authentication Thông tin xác thực
   * @return Thông tin hướng dẫn đã cập nhật
   */
  @PatchMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(
      summary = "Cập nhật hướng dẫn",
      description = "Cập nhật thông tin hướng dẫn (chỉ Content Provider)"
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

  /**
   * Xóa hướng dẫn (chỉ Content Provider).
   *
   * @param id             ID hướng dẫn
   * @param authentication Thông tin xác thực
   */
  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('CONTENT_PROVIDER')")
  @Operation(summary = "Xóa hướng dẫn", description = "Xóa hướng dẫn (chỉ Content Provider)")
  @ResponseStatus(HttpStatus.NO_CONTENT)
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
