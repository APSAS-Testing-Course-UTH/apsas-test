package apsas.content.controller;

import apsas.content.mapper.FeignAssignmentMapper;
import apsas.content.service.AssignmentService;
import io.swagger.v3.oas.annotations.Hidden;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Internal API controller for inter-service communication.
 * Not exposed through API Gateway - only accessible within the service mesh.
 * Used by Evaluation Service to retrieve assignment details.
 */
@Hidden
@RestController
@RequestMapping("/internal/assignments")
@RequiredArgsConstructor
public class InternalAssignmentController {

  private final AssignmentService assignmentService;
  private final FeignAssignmentMapper feignAssignmentMapper;

  /**
   * Internal endpoint to get assignment details by ID
   *
   * @param id Assignment ID
   * @return Assignment details
   */
  @GetMapping("/{id}")
  public apsas.feign.dto.AssignmentResponse getAssignmentById(@PathVariable UUID id) {
    return feignAssignmentMapper.toFeignDto(assignmentService.getAssignmentById(id));
  }

  /**
   * Internal endpoint to get multiple assignments by IDs
   *
   * @param ids List of assignment IDs
   * @return List of assignment details
   */
  @PostMapping("/batch")
  public List<apsas.feign.dto.AssignmentResponse> getBatchAssignments(@RequestBody List<UUID> ids) {
    return ids.stream()
        .map(assignmentService::getAssignmentById)
        .map(feignAssignmentMapper::toFeignDto)
        .collect(Collectors.toList());
  }
}
