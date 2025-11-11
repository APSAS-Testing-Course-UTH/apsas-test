package apsas.shared.models.assignment;

import jakarta.validation.constraints.NotNull;

/**
 * DTO dùng chung cho thông tin test case, sử dụng giữa các service.
 * Đây là nguồn dữ liệu duy nhất cho test case trong giao tiếp giữa các service.
 */
public record TestCaseDto(
    @NotNull Integer order,
    String description,
    Boolean hidden,
    Double weight,
    String input,
    String output,
    Integer timeout,
    Integer memoryLimit
) {}
