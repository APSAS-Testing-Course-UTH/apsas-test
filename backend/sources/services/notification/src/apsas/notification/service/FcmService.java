package apsas.notification.service;

import com.google.firebase.messaging.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true", matchIfMissing = false)
public class FcmService implements IFcmService {

  private static final Logger logger = LoggerFactory.getLogger(FcmService.class);

  @Async
  public void sendNotification(String token, String title, String body, Map<String, String> data) {
    try {
      Message.Builder messageBuilder =
          Message.builder()
              .setToken(token)
              .setNotification(Notification.builder().setTitle(title).setBody(body).build());

      if (data != null && !data.isEmpty()) {
        messageBuilder.putAllData(data);
      }

      Message message = messageBuilder.build();
      String response = FirebaseMessaging.getInstance().send(message);
      logger.info("Successfully sent FCM message to token: {}, response: {}", token, response);
    } catch (FirebaseMessagingException e) {
      logger.error("Failed to send FCM message to token: {}", token, e);
      handleFcmException(token, e);
    } catch (Exception e) {
      logger.error("Unexpected error while sending FCM message to token: {}", token, e);
    }
  }

  @Async
  public void sendMulticastNotification(
      List<String> tokens, String title, String body, Map<String, String> data) {
    if (tokens == null || tokens.isEmpty()) {
      logger.warn("No tokens provided for multicast notification");
      return;
    }

    try {
      MulticastMessage.Builder messageBuilder =
          MulticastMessage.builder()
              .addAllTokens(tokens)
              .setNotification(Notification.builder().setTitle(title).setBody(body).build());

      if (data != null && !data.isEmpty()) {
        messageBuilder.putAllData(data);
      }

      MulticastMessage message = messageBuilder.build();
      BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);

      logger.info(
          "Successfully sent multicast FCM message. Success: {}, Failure: {}",
          response.getSuccessCount(),
          response.getFailureCount());

      if (response.getFailureCount() > 0) {
        handleBatchResponseFailures(tokens, response);
      }
    } catch (FirebaseMessagingException e) {
      logger.error("Failed to send multicast FCM message", e);
    } catch (Exception e) {
      logger.error("Unexpected error while sending multicast FCM message", e);
    }
  }

  private void handleFcmException(String token, FirebaseMessagingException e) {
    String errorCode =
        e.getMessagingErrorCode() != null ? e.getMessagingErrorCode().name() : "UNKNOWN";

    switch (errorCode) {
      case "INVALID_ARGUMENT":
      case "UNREGISTERED":
        logger.warn("Invalid or unregistered FCM token: {}", token);
        // Token should be removed from database
        break;
      case "QUOTA_EXCEEDED":
        logger.error("FCM quota exceeded");
        break;
      case "THIRD_PARTY_AUTH_ERROR":
        logger.error("Firebase authentication error");
        break;
      case "UNAVAILABLE":
        logger.warn("FCM service temporarily unavailable, retry later");
        break;
      default:
        logger.error("FCM error code: {}, message: {}", errorCode, e.getMessage());
    }
  }

  private void handleBatchResponseFailures(List<String> tokens, BatchResponse response) {
    List<SendResponse> responses = response.getResponses();
    List<String> invalidTokens = new ArrayList<>();

    for (int i = 0; i < responses.size(); i++) {
      SendResponse sendResponse = responses.get(i);
      if (!sendResponse.isSuccessful()) {
        String token = tokens.get(i);
        FirebaseMessagingException exception = sendResponse.getException();

        if (exception != null) {
          String errorCode =
              exception.getMessagingErrorCode() != null
                  ? exception.getMessagingErrorCode().name()
                  : "UNKNOWN";

          if ("INVALID_ARGUMENT".equals(errorCode) || "UNREGISTERED".equals(errorCode)) {
            invalidTokens.add(token);
          }

          logger.error(
              "Failed to send to token {}: {} - {}", token, errorCode, exception.getMessage());
        }
      }
    }

    if (!invalidTokens.isEmpty()) {
      logger.warn("Found {} invalid tokens that should be removed", invalidTokens.size());
      // These tokens should be marked as inactive in the database
    }
  }

  public void sendAssignmentPublishedNotification(
      List<String> tokens, String assignmentTitle, String assignmentId) {
    String title = "New Assignment Published";
    String body = "A new assignment has been published: " + assignmentTitle;
    Map<String, String> data = Map.of("type", "ASSIGNMENT_PUBLISHED", "assignmentId", assignmentId);
    sendMulticastNotification(tokens, title, body, data);
  }

  public void sendAssignmentReminderNotification(
      String token, String assignmentTitle, String timeRemaining, String assignmentId) {
    String title = "Assignment Deadline Reminder";
    String body = assignmentTitle + " is due in " + timeRemaining;
    Map<String, String> data = Map.of("type", "ASSIGNMENT_REMINDER", "assignmentId", assignmentId);
    sendNotification(token, title, body, data);
  }

  public void sendSubmissionEvaluatedNotification(
      String token, String assignmentTitle, Integer score, String submissionId) {
    String title = "Submission Evaluated";
    String body =
        "Your submission for " + assignmentTitle + " has been evaluated. Score: " + score + "/100";
    Map<String, String> data =
        Map.of(
            "type",
            "SUBMISSION_EVALUATED",
            "submissionId",
            submissionId,
            "score",
            String.valueOf(score));
    sendNotification(token, title, body, data);
  }
}
