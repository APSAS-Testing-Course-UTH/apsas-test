package apsas.notification.service;

import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MulticastMessage;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.SendResponse;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true")
public class FirebasePushNotificationService implements PushNotificationService {
  @Override
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
      FirebaseMessaging.getInstance().send(message);
    } catch (FirebaseMessagingException e) {
      handleFcmException(e);
    } catch (Exception e) {
      log.error("Unexpected error sending FCM to token: {}", token, e);
    }
  }

  @Override
  @Async
  public void sendMulticastNotification(
      List<String> tokens, String title, String body, Map<String, String> data) {
    if (tokens == null || tokens.isEmpty()) {
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

      if (response.getFailureCount() > 0) {
        handleBatchResponseFailures(response);
      }
    } catch (FirebaseMessagingException e) {
      log.error("Failed to send multicast FCM", e);
    } catch (Exception e) {
      log.error("Unexpected error sending multicast FCM", e);
    }
  }

  private void handleFcmException(FirebaseMessagingException e) {
    String errorCode =
        e.getMessagingErrorCode() != null ? e.getMessagingErrorCode().name() : "UNKNOWN";

    switch (errorCode) {
      case "INVALID_ARGUMENT":
      case "UNREGISTERED":
        break;
      default:
        log.error("FCM error {}: {}", errorCode, e.getMessage());
    }
  }

  private void handleBatchResponseFailures(BatchResponse response) {
    List<SendResponse> responses = response.getResponses();
    int invalidCount = 0;

    for (SendResponse sendResponse : responses) {
      if (!sendResponse.isSuccessful()) {
        FirebaseMessagingException exception = sendResponse.getException();

        if (exception != null) {
          String errorCode =
              exception.getMessagingErrorCode() != null
                  ? exception.getMessagingErrorCode().name()
                  : "UNKNOWN";

          if ("INVALID_ARGUMENT".equals(errorCode) || "UNREGISTERED".equals(errorCode)) {
            invalidCount++;
          }
        }
      }
    }

    if (invalidCount > 0) {
      log.warn("{} invalid FCM tokens found", invalidCount);
    }
  }

  @Override
  public void sendAssignmentPublishedNotification(
      List<String> tokens, String assignmentTitle, String assignmentId) {
    String title = "Bài tập mới đã được phát hành";
    String body = "Bài tập mới: " + assignmentTitle;
    Map<String, String> data = Map.of("type", "ASSIGNMENT_PUBLISHED", "assignmentId", assignmentId);
    sendMulticastNotification(tokens, title, body, data);
  }

  @Override
  public void sendSubmissionEvaluatedNotification(
      String token, String assignmentTitle, Integer score, String submissionId) {
    String title = "Bài nộp đã được chấm điểm";
    String body =
        "Bài nộp của bạn cho " + assignmentTitle + " đã được đánh giá. Điểm: " + score + "/100";
    Map<String, String> data =
        Map.of(
            "type",
            "SUBMISSION_EVALUATED",
            "submissionId",
            submissionId,
            "score",
            String.valueOf(score)
        );
    sendNotification(token, title, body, data);
  }

  @Override
  public void sendSupportRequestNotification(
      List<String> tokens, String studentName, String message, String sessionId) {
    String title = "🆘 Yêu cầu hỗ trợ mới";
    String body = studentName + " cần hỗ trợ: " +
        (message.length() > 50 ? message.substring(0, 47) + "..." : message);
    Map<String, String> data =
        Map.of(
            "type", "SUPPORT_REQUEST",
            "sessionId", sessionId,
            "studentName", studentName
        );
    sendMulticastNotification(tokens, title, body, data);
  }
}
