package apsas.support.model.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SupportSessionDto(
    UUID id,
    UUID studentId,
    UUID instructorId,
    Boolean isClosed,
    LocalDateTime createdAt,
    LocalDateTime closedAt,
    List<SupportMessageDto> messages) {}
