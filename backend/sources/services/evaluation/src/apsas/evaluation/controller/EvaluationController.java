package apsas.evaluation.controller;

import apsas.evaluation.model.dto.RuntimeResponse;
import apsas.evaluation.service.EvaluationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Bộ điều khiển REST cho các API liên quan đến đánh giá mã nguồn.
 */
@RestController
@RequestMapping(
  value = "/api/v1",
  consumes = MediaType.APPLICATION_JSON_VALUE,
  produces = MediaType.APPLICATION_JSON_VALUE
)
@Tag(name = "Đánh giá mã nguồn", description = "Quản lý đánh giá và kiểm thử mã nguồn")
@AllArgsConstructor
public class EvaluationController {
  private final EvaluationService evaluationService;

  /**
   * Lấy danh sách ngôn ngữ lập trình và phiên bản được hỗ trợ.
   *
   * @return Danh sách runtime hỗ trợ
   */
  @GetMapping("/runtimes")
  @Operation(
      summary = "Lấy danh sách runtime hỗ trợ",
      description = "Trả về danh sách tất cả ngôn ngữ lập trình và phiên bản được hỗ trợ"
  )
  public ResponseEntity<List<RuntimeResponse>> getSupportedRuntimes() {
    List<RuntimeResponse> runtimes = evaluationService.getSupportedRuntimes();
    return ResponseEntity.ok(runtimes);
  }
}
