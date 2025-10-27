package apsas.support.model.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateSupportSessionRequest(
    @NotBlank(message = "Initial message is required") String initialMessage) {}
