package apsas.shared.models.assignment;

import java.util.List;

/**
 * Shared DTO for Assignment details used in inter-service communication. Contains minimal
 * assignment information needed by other services.
 */
public record AssignmentDto(
    String[] languages,
    List<TestCaseDto> testCases
) {}
