package apsas.notification.model.entity;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/**
 * Unit test cho entity NotificationPreferences.
 *
 * Đảm bảo default flags và callbacks timestamp phù hợp với business expectation.
 */
@Tag("unit")
@Epic("Notification Service")
@Feature("Entity - Notification Preferences")
class NotificationPreferencesEntityTest {

  @Test
  @Story("Default values")
  @TmsLink("NTF-ENT-004")
  @DisplayName("Default channel and type flags are initialized correctly")
  void defaultFlagsShouldBeInitializedCorrectly() {
    NotificationPreferences entity = new NotificationPreferences();

    assertTrue(entity.getEmailEnabled());
    assertTrue(!entity.getPushEnabled());
    assertTrue(entity.getEmailAssignmentPublished());
    assertTrue(entity.getEmailSubmissionEvaluated());
    assertTrue(entity.getPushAssignmentPublished());
    assertTrue(entity.getPushSubmissionEvaluated());
  }

  @Test
  @Story("JPA lifecycle")
  @TmsLink("NTF-ENT-005")
  @DisplayName("onCreate sets createdAt and updatedAt")
  void onCreateShouldSetCreatedAtAndUpdatedAt() {
    NotificationPreferences entity = new NotificationPreferences();

    entity.onCreate();

    assertNotNull(entity.getCreatedAt());
    assertNotNull(entity.getUpdatedAt());
  }

  @Test
  @Story("JPA lifecycle")
  @TmsLink("NTF-ENT-006")
  @DisplayName("onUpdate refreshes updatedAt")
  void onUpdateShouldRefreshUpdatedAt() {
    NotificationPreferences entity = new NotificationPreferences();
    entity.setUpdatedAt(LocalDateTime.of(2000, 1, 1, 0, 0));

    entity.onUpdate();

    assertTrue(entity.getUpdatedAt().isAfter(LocalDateTime.of(2000, 1, 1, 0, 0)));
  }
}
