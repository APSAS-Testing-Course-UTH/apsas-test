package apsas.shared.models.assignment;

import java.util.List;

/**
 * DTO dùng chung cho thông tin bài tập, sử dụng trong giao tiếp giữa các service.
 * Chỉ chứa thông tin tối thiểu về bài tập cần thiết cho các service khác.
 */
public record AssignmentDto(
    String[] languages,
    List<TestCaseDto> testCases
) {}
