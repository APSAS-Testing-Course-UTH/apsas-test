package apsas.submission.controller;

import apsas.submission.mapper.FeignSubmissionMapper;
import apsas.submission.service.SubmissionService;
import io.swagger.v3.oas.annotations.Hidden;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Internal API controller for inter-service communication. Not exposed through API Gateway - only
 * accessible within the service mesh. Used by Evaluation Service to retrieve submission details.
 */
@Hidden
@RestController
@RequestMapping("/internal/submissions")
@RequiredArgsConstructor
public class InternalSubmissionController {
  private final SubmissionService submissionService;
  private final FeignSubmissionMapper feignSubmissionMapper;

  /**
   * Internal endpoint to get submission details by ID
   *
   * @param id Submission ID
   * @return Submission details
   */
  @GetMapping("/{id}")
  public apsas.feign.dto.SubmissionResponse getSubmissionById(
      @PathVariable
      UUID id
  ) {
    return feignSubmissionMapper.toFeignDto(submissionService.getSubmissionById(id, null, true));
  }

  /**
   * Internal endpoint to get multiple submissions by IDs
   *
   * @param ids List of submission IDs
   * @return List of submission details
   */
  @PostMapping("/batch")
  public List<apsas.feign.dto.SubmissionResponse> getBatchSubmissions(
      @RequestBody
      List<UUID> ids
  ) {
    return ids.stream()
        .map(id -> submissionService.getSubmissionById(id, null, true))
        .map(feignSubmissionMapper::toFeignDto)
        .toList();
  }

  /**
   * Internal endpoint to get submissions by student ID
   *
   * @param studentId Student ID
   * @return List of submissions
   */
  @GetMapping("/by-student")
  public List<apsas.feign.dto.SubmissionResponse> getSubmissionsByStudent(
      @RequestParam
      UUID studentId
  ) {
    return submissionService
        .getAllSubmissions(studentId, null, null, null, true, null)
        .content()
        .stream()
        .map(feignSubmissionMapper::toFeignDto)
        .toList();
  }

  /**
   * Internal endpoint to get submissions by assignment ID
   *
   * @param assignmentId Assignment ID
   * @return List of submissions
   */
  @GetMapping("/by-assignment")
  public List<apsas.feign.dto.SubmissionResponse> getSubmissionsByAssignment(
      @RequestParam
      UUID assignmentId
  ) {
    return submissionService
        .getAllSubmissions(null, assignmentId, null, null, true, null)
        .content()
        .stream()
        .map(feignSubmissionMapper::toFeignDto)
        .toList();
  }
}
