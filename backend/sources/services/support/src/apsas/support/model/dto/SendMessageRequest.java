package apsas.support.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record SendMessageRequest(
    @NotNull(message = "Session ID is required") UUID sessionId,
    @NotBlank(message = "Content is required") String content
) {}
