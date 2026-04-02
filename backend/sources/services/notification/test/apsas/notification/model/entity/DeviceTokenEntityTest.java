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
 * Unit test cho entity DeviceToken.
 *
 * Đảm bảo các giá trị mặc định và lifecycle callbacks hoạt động đúng.
 */
@Tag("unit")
@Epic("Notification Service")
@Feature("Entity - Device Token")
class DeviceTokenEntityTest {

  @Test
  @Story("Default value")
  @TmsLink("NTF-ENT-001")
  @DisplayName("Initial isActive is true by default")
  void isActiveShouldBeTrueByDefault() {
    DeviceToken entity = new DeviceToken();

    assertTrue(entity.getIsActive());
  }

  @Test
  @Story("JPA lifecycle")
  @TmsLink("NTF-ENT-002")
  @DisplayName("onCreate sets createdAt and updatedAt")
  void onCreateShouldSetCreatedAtAndUpdatedAt() {
    DeviceToken entity = new DeviceToken();

    entity.onCreate();

    assertNotNull(entity.getCreatedAt());
    assertNotNull(entity.getUpdatedAt());
  }

  @Test
  @Story("JPA lifecycle")
  @TmsLink("NTF-ENT-003")
  @DisplayName("onUpdate refreshes updatedAt")
  void onUpdateShouldRefreshUpdatedAt() {
    DeviceToken entity = new DeviceToken();
    entity.setUpdatedAt(LocalDateTime.of(2000, 1, 1, 0, 0));

    entity.onUpdate();

    assertTrue(entity.getUpdatedAt().isAfter(LocalDateTime.of(2000, 1, 1, 0, 0)));
  }
}
