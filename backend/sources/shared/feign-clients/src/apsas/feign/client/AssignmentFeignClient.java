package apsas.feign.client;

import apsas.feign.dto.AssignmentResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Feign client for calling Content Service internal endpoints. This client is used by Evaluation
 * Service to fetch assignment details.
 */
@SuppressWarnings("SpringMvcPathVariableDeclarationInspection")
@FeignClient(name = "content-service", path = "/internal/assignments")
public interface AssignmentFeignClient {

  /**
   * Get assignment by ID
   *
   * @param id Assignment ID
   * @return Assignment details
   */
  @GetMapping("/{id}")
  AssignmentResponse getAssignmentById(
      @PathVariable("id")
      UUID id
  );

  /**
   * Get multiple assignments by their IDs in a batch
   *
   * @param assignmentIds List of assignment IDs
   * @return List of assignment details
   */
  @PostMapping("/batch")
  List<AssignmentResponse> getBatchAssignments(
      @RequestBody
      List<UUID> assignmentIds
  );
}
