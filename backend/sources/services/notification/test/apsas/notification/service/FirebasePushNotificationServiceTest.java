package apsas.notification.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

/**
 * Unit test cho FirebasePushNotificationService.
 *
 * <p>Nhóm test này tập trung vào 2 mục tiêu:
 * 1) Bảo đảm service fail-safe khi FCM chưa sẵn sàng.
 * 2) Bảo đảm các phương thức business-level tạo đúng payload khi delegate.</p>
 */
@Tag("unit")
@Epic("Notification Service")
@Feature("Firebase Push Notification Service")
class FirebasePushNotificationServiceTest {

  private static final String TOKEN = "token-1";
  private static final String TITLE = "Title";
  private static final String BODY = "Body";

  @Test
  @Story("Send single push")
  @TmsLink("NTF-PUSH-001")
  @DisplayName("Does not throw when sending single push while Firebase is unavailable")
  void sendNotificationShouldNotThrowWhenFirebaseIsUnavailable() {
    FirebasePushNotificationService service = new FirebasePushNotificationService();

    assertDoesNotThrow(() -> service.sendNotification(TOKEN, TITLE, BODY, Map.of("k", "v")));
    assertDoesNotThrow(() -> service.sendNotification(TOKEN, TITLE, BODY, null));
  }

  @Test
  @Story("Send multicast push")
  @TmsLink("NTF-PUSH-002")
  @DisplayName("Returns early for empty token list and stays fail-safe for non-empty list")
  void sendMulticastNotificationShouldHandleTokenBoundariesSafely() {
    FirebasePushNotificationService service = new FirebasePushNotificationService();

    assertDoesNotThrow(() -> service.sendMulticastNotification(List.of(), TITLE, BODY, Map.of()));
    assertDoesNotThrow(() -> service.sendMulticastNotification(List.of(TOKEN), TITLE, BODY, Map.of()));
  }

  @Test
  @Story("Assignment published push payload")
  @TmsLink("NTF-PUSH-003")
  @DisplayName("Delegates assignment published payload with expected title, body and data")
  void sendAssignmentPublishedNotificationShouldDelegateWithExpectedPayload() {
    FirebasePushNotificationService service = spy(new FirebasePushNotificationService());
    doNothing().when(service).sendMulticastNotification(anyList(), anyString(), anyString(), anyMap());

    service.sendAssignmentPublishedNotification(List.of("token-a"), "Assignment A", "assignment-id-1");

    @SuppressWarnings("unchecked")
    ArgumentCaptor<Map<String, String>> dataCaptor = ArgumentCaptor.forClass(Map.class);
    verify(service).sendMulticastNotification(
        org.mockito.ArgumentMatchers.eq(List.of("token-a")),
        org.mockito.ArgumentMatchers.eq("Bài tập mới đã được phát hành"),
        org.mockito.ArgumentMatchers.eq("Bài tập mới: Assignment A"),
        dataCaptor.capture()
    );

    assertEquals("ASSIGNMENT_PUBLISHED", dataCaptor.getValue().get("type"));
    assertEquals("assignment-id-1", dataCaptor.getValue().get("assignmentId"));
  }

  @Test
  @Story("Submission evaluated push payload")
  @TmsLink("NTF-PUSH-004")
  @DisplayName("Delegates submission evaluated payload with expected score and submission id")
  void sendSubmissionEvaluatedNotificationShouldDelegateWithExpectedPayload() {
    FirebasePushNotificationService service = spy(new FirebasePushNotificationService());
    doNothing().when(service).sendNotification(anyString(), anyString(), anyString(), anyMap());

    service.sendSubmissionEvaluatedNotification(
        "token-z",
        "Assignment B",
        88,
        "submission-id-1"
    );

    @SuppressWarnings("unchecked")
    ArgumentCaptor<Map<String, String>> dataCaptor = ArgumentCaptor.forClass(Map.class);
    verify(service).sendNotification(
        org.mockito.ArgumentMatchers.eq("token-z"),
        org.mockito.ArgumentMatchers.eq("Bài nộp đã được chấm điểm"),
        org.mockito.ArgumentMatchers.eq("Bài nộp của bạn cho Assignment B đã được đánh giá. Điểm: 88/100"),
        dataCaptor.capture()
    );

    assertEquals("SUBMISSION_EVALUATED", dataCaptor.getValue().get("type"));
    assertEquals("submission-id-1", dataCaptor.getValue().get("submissionId"));
    assertEquals("88", dataCaptor.getValue().get("score"));
  }

}
