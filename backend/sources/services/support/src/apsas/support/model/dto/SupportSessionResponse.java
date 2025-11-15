package apsas.support.model.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SupportSessionResponse(
    UUID id,
    UUID studentId,
    UUID instructorId,
    Boolean isClosed,
    LocalDateTime createdAt,
    LocalDateTime closedAt,
    List<SupportMessageResponse> messages
) {}
