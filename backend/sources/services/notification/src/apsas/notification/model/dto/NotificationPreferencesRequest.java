package apsas.notification.model.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class NotificationPreferencesRequest {

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
}
