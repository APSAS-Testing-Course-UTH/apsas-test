package apsas.evaluation.client;

import apsas.evaluation.model.AssignmentDto;
import java.util.UUID;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client for Content Service
 */
@FeignClient(name = "content-service", path = "/api/v1/assignments")
public interface ContentServiceClient {

  /**
   * Get assignment details by ID
   *
   * @param id Assignment ID
   * @return Assignment details
   */
  @GetMapping("/{id}")
  AssignmentDto getAssignment(
      @PathVariable("id")
      UUID id
  );
}
