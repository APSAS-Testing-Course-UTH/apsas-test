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

  // Email preferences by type
  private Boolean emailVerification;
  private Boolean emailPasswordReset;
  private Boolean emailAssignmentPublished;
  private Boolean emailAssignmentReminder;
  private Boolean emailSubmissionEvaluated;

  // Push preferences by type
  private Boolean pushAssignmentPublished;
  private Boolean pushAssignmentReminder;
  private Boolean pushSubmissionEvaluated;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
