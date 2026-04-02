package apsas.notification.config;

import static org.junit.jupiter.api.Assertions.assertThrows;

import com.google.firebase.FirebaseApp;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

/**
 * Unit test cho FirebaseConfig.
 *
 * Mục tiêu: xác minh đường đi khởi tạo Firebase với credential không hợp lệ được xử lý theo
 * đúng hợp đồng exception.
 */
@Tag("unit")
@Epic("Notification Service")
@Feature("Firebase Configuration")
class FirebaseConfigTest {

  @AfterEach
  void tearDown() {
    for (FirebaseApp app : FirebaseApp.getApps()) {
      app.delete();
    }
  }

  @Test
  @Story("Firebase app initialization")
  @TmsLink("NTF-FB-CFG-001")
  @DisplayName("Throws exception when service-account private key format is invalid")
  void firebaseAppShouldThrowWhenPrivateKeyFormatIsInvalid() {
    FirebaseConfig config = new FirebaseConfig();
    ReflectionTestUtils.setField(config, "projectId", "test-project");
    ReflectionTestUtils.setField(config, "credentialsType", "service_account");
    ReflectionTestUtils.setField(config, "credentialsProjectId", "test-project");
    ReflectionTestUtils.setField(config, "privateKeyId", "private-key-id");
    ReflectionTestUtils.setField(config, "privateKey", "-----BEGIN PRIVATE KEY-----\\ninvalid\\n-----END PRIVATE KEY-----\\n");
    ReflectionTestUtils.setField(config, "clientEmail", "firebase-adminsdk@test-project.iam.gserviceaccount.com");
    ReflectionTestUtils.setField(config, "clientId", "123456789");

    assertThrows(Exception.class, config::firebaseApp);
  }
}
