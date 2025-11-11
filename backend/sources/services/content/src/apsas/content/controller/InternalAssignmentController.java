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
 * Bộ điều khiển API nội bộ phục vụ giao tiếp giữa các dịch vụ trong hệ thống APSAS.
 * Không công khai qua API Gateway, chỉ truy cập trong service mesh.
 * Được sử dụng bởi Evaluation Service để lấy thông tin bài tập.
 */
@Hidden
@RestController
@RequestMapping("/internal/assignments")
@RequiredArgsConstructor
public class InternalAssignmentController {

  private final AssignmentService assignmentService;
  private final FeignAssignmentMapper feignAssignmentMapper;

  /**
   * API nội bộ lấy thông tin bài tập theo ID.
   * @param id ID bài tập
   * @return Thông tin bài tập
   */
  @GetMapping("/{id}")
  public apsas.feign.dto.AssignmentResponse getAssignmentById(@PathVariable UUID id) {
    return feignAssignmentMapper.toFeignDto(assignmentService.getAssignmentById(id));
  }

  /**
   * API nội bộ lấy thông tin nhiều bài tập theo danh sách ID.
   * @param ids Danh sách ID bài tập
   * @return Danh sách thông tin bài tập
   */
  @PostMapping("/batch")
  public List<apsas.feign.dto.AssignmentResponse> getBatchAssignments(@RequestBody List<UUID> ids) {
    return ids.stream()
        .map(assignmentService::getAssignmentById)
        .map(feignAssignmentMapper::toFeignDto)
        .collect(Collectors.toList());
  }
}
