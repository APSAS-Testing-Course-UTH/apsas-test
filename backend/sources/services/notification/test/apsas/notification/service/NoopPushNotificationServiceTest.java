package apsas.notification.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/**
 * Unit test cho NoopPushNotificationService.
 *
 * <p>Khi FCM bị tắt, service phải luôn no-op và không được phát sinh exception.</p>
 */
@Tag("unit")
@Epic("Notification Service")
@Feature("Noop Push Notification Service")
class NoopPushNotificationServiceTest {

  @Test
  @Story("No-op behavior")
  @TmsLink("NTF-NOOP-001")
  @DisplayName("All push notification methods are safe no-op when Firebase is disabled")
  void allMethodsShouldBeSafeNoOpWhenFirebaseIsDisabled() {
    NoopPushNotificationService service = new NoopPushNotificationService();

    assertDoesNotThrow(() -> service.sendNotification("token", "title", "body", Map.of("k", "v")));
    assertDoesNotThrow(() -> service.sendMulticastNotification(List.of("a", "b"), "title", "body", Map.of()));
    assertDoesNotThrow(() -> service.sendAssignmentPublishedNotification(List.of("a"), "Assignment A", "as-1"));
    assertDoesNotThrow(() -> service.sendSubmissionEvaluatedNotification("token", "Assignment A", 80, "sub-1"));
  }
}
