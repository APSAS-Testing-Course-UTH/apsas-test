package apsas.notification.service;

import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * No-op implementation of FcmService when Firebase is not enabled. Used when firebase.enabled is
 * false or not configured.
 */
@Service
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "false", matchIfMissing = true)
public class FcmServiceNoOp implements IFcmService {

  private static final Logger logger = LoggerFactory.getLogger(FcmServiceNoOp.class);

  @Override
  public void sendNotification(String token, String title, String body, Map<String, String> data) {
    logger.debug(
        "FCM is disabled. Skipping notification: title={}, body={}, token={}", title, body, token);
  }

  @Override
  public void sendMulticastNotification(
      List<String> tokens, String title, String body, Map<String, String> data) {
    logger.debug(
        "FCM is disabled. Skipping multicast notification: title={}, body={}, tokenCount={}",
        title,
        body,
        tokens != null ? tokens.size() : 0);
  }

  @Override
  public void sendAssignmentPublishedNotification(
      List<String> tokens, String assignmentTitle, String assignmentId) {
    logger.debug(
        "FCM is disabled. Skipping assignment published notification for: {}", assignmentTitle);
  }

  @Override
  public void sendAssignmentReminderNotification(
      String token, String assignmentTitle, String timeRemaining, String assignmentId) {
    logger.debug(
        "FCM is disabled. Skipping assignment reminder notification for: {}", assignmentTitle);
  }

  @Override
  public void sendSubmissionEvaluatedNotification(
      String token, String assignmentTitle, Integer score, String submissionId) {
    logger.debug(
        "FCM is disabled. Skipping submission evaluated notification for: {}", assignmentTitle);
  }
}
