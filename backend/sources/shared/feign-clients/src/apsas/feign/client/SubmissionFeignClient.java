package apsas.feign.client;

import apsas.feign.dto.SubmissionResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Feign client for calling Submission Service internal endpoints. This client is used by Evaluation
 * Service to fetch submission details.
 */
@FeignClient(name = "submission-service", path = "/internal/submissions")
public interface SubmissionFeignClient {

  /**
   * Get submission by ID
   *
   * @param id Submission ID
   * @return Submission details
   */
  @GetMapping("/{id}")
  SubmissionResponse getSubmissionById(
      @PathVariable
      UUID id
  );

  /**
   * Get multiple submissions by their IDs in a batch
   *
   * @param submissionIds List of submission IDs
   * @return List of submission details
   */
  @PostMapping("/batch")
  List<SubmissionResponse> getBatchSubmissions(
      @RequestBody
      List<UUID> submissionIds
  );

  /**
   * Get submissions filtered by student ID
   *
   * @param studentId Student ID
   * @return List of submissions for the student
   */
  @GetMapping("/by-student")
  List<SubmissionResponse> getSubmissionsByStudent(
      @RequestParam("studentId")
      UUID studentId
  );

  /**
   * Get submissions filtered by assignment ID
   *
   * @param assignmentId Assignment ID
   * @return List of submissions for the assignment
   */
  @GetMapping("/by-assignment")
  List<SubmissionResponse> getSubmissionsByAssignment(
      @RequestParam("assignmentId")
      UUID assignmentId
  );
}
