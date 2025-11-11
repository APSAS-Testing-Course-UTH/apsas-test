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
 * Bộ điều khiển API nội bộ dùng cho giao tiếp giữa các dịch vụ. Không công khai qua API Gateway, chỉ truy cập trong service mesh. Được Evaluation Service sử dụng để lấy thông tin bài nộp.
 */
@Hidden
@RestController
@RequestMapping("/internal/submissions")
@RequiredArgsConstructor
public class InternalSubmissionController {
  private final SubmissionService submissionService;
  private final FeignSubmissionMapper feignSubmissionMapper;

  /**
   * API nội bộ lấy chi tiết bài nộp theo ID
   *
   * @param id ID bài nộp
   * @return Thông tin chi tiết bài nộp
   */
  @GetMapping("/{id}")
  public apsas.feign.dto.SubmissionResponse getSubmissionById(
      @PathVariable
      UUID id
  ) {
    return feignSubmissionMapper.toFeignDto(submissionService.getSubmissionById(id, null, true));
  }

  /**
   * API nội bộ lấy nhiều bài nộp theo danh sách ID
   *
   * @param ids Danh sách ID bài nộp
   * @return Danh sách thông tin chi tiết bài nộp
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
   * API nội bộ lấy bài nộp theo ID sinh viên
   *
   * @param studentId ID sinh viên
   * @return Danh sách bài nộp
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
   * API nội bộ lấy bài nộp theo ID bài tập
   *
   * @param assignmentId ID bài tập
   * @return Danh sách bài nộp
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
