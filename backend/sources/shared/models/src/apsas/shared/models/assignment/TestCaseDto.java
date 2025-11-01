package apsas.shared.models.assignment;

import jakarta.validation.constraints.NotNull;

/**
 * Shared DTO for Test Case details used across services. This is the single source of truth for
 * test case data in inter-service communication.
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
