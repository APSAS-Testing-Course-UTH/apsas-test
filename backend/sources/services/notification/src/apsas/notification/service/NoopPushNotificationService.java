package apsas.notification.service;

import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "false", matchIfMissing = true)
public class NoopPushNotificationService implements PushNotificationService {
  @Override
  public void sendNotification(String token, String title, String body, Map<String, String> data) {
    // No-op: FCM is disabled
  }

  @Override
  public void sendMulticastNotification(
      List<String> tokens, String title, String body, Map<String, String> data) {
    // No-op: FCM is disabled
  }

  @Override
  public void sendAssignmentPublishedNotification(
      List<String> tokens, String assignmentTitle, String assignmentId) {
    // No-op: FCM is disabled
  }

  @Override
  public void sendSubmissionEvaluatedNotification(
      String token, String assignmentTitle, Integer score, String submissionId) {
    // No-op: FCM is disabled
  }

  @Override
  public void sendSupportRequestNotification(
      List<String> tokens, String studentName, String message, String sessionId) {
    // No-op: FCM is disabled
  }
}
