package apsas.evaluation.controller;

import apsas.evaluation.model.dto.RuntimeResponse;
import apsas.evaluation.service.EvaluationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** REST controller for evaluation-related endpoints */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Evaluation", description = "Code evaluation management")
@AllArgsConstructor
public class EvaluationController {
  private static final Logger logger = LoggerFactory.getLogger(EvaluationController.class);

  private final EvaluationService evaluationService;

  /**
   * Get list of supported programming languages and their versions
   *
   * @return List of supported runtimes
   */
  @GetMapping("/runtimes")
  @Operation(
      summary = "Get supported runtimes",
      description = "Returns list of all supported programming languages and their versions")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved runtimes"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<List<RuntimeResponse>> getSupportedRuntimes() {
    logger.debug("Fetching supported runtimes");
    List<RuntimeResponse> runtimes = evaluationService.getSupportedRuntimes();
    return ResponseEntity.ok(runtimes);
  }
}
