package apsas.notification.model.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class NotificationPreferencesResponse {

  private UUID id;
  private UUID userId;
  private Boolean emailEnabled;
  private Boolean pushEnabled;

  // Email preferences by type (verification and password reset are always enabled)
  private Boolean emailAssignmentPublished;
  private Boolean emailSubmissionEvaluated;

  // Push preferences by type
  private Boolean pushAssignmentPublished;
  private Boolean pushSubmissionEvaluated;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
