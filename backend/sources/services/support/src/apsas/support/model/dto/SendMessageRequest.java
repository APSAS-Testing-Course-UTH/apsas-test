package apsas.support.model.dto;

import jakarta.validation.constraints.NotBlank;

public record SendMessageRequest(
    @NotBlank(message = "Content is required") String content
) {}
