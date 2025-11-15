package apsas.support.model.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record SupportMessageResponse(
    UUID id,
    UUID sessionId,
    UUID senderId,
    String content,
    Boolean isInstructor,
    Boolean isRead,
    LocalDateTime createdAt
) {}
