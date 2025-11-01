package apsas.notification.model.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class NotificationPreferencesRequest {

  private Boolean emailEnabled;
  private Boolean pushEnabled;

  // Email preferences by type (verification and password reset are always enabled)
  private Boolean emailAssignmentPublished;
  private Boolean emailSubmissionEvaluated;

  // Push preferences by type
  private Boolean pushAssignmentPublished;
  private Boolean pushSubmissionEvaluated;
}
