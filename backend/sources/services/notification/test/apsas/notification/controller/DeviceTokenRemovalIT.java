package apsas.notification.controller;

import static apsas.notification.controller.NotificationControllerTestSupport.DEVICES_API;
import static apsas.notification.controller.NotificationControllerTestSupport.DEVICES_TOKEN_API_TEMPLATE;
import static apsas.notification.controller.NotificationControllerTestSupport.USER_INFO_HEADER;
import static apsas.notification.controller.NotificationControllerTestSupport.encodedUserInfo;
import static apsas.notification.controller.NotificationControllerTestSupport.studentPrincipal;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import apsas.notification.service.DeviceTokenService;
import apsas.notification.service.NotificationDispatcher;
import apsas.notification.service.NotificationPreferencesService;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Integration test cho nhóm boundary của API xóa token thiết bị.
 *
 * Nhóm test này tập trung vào hợp đồng HTTP + authentication boundary cho thao tác delete.
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.MOCK,
    properties = {
        "spring.config.name=notification-it",
        "spring.cloud.config.enabled=false",
        "spring.cloud.config.discovery.enabled=false",
        "eureka.client.enabled=false",
        "spring.main.lazy-initialization=true",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration"
    }
)
@AutoConfigureMockMvc
@Tag("integration")
@Epic("Notification Service")
@Feature("REST API - Device Removal Boundary")
@Owner("HuynhSang2005")
class DeviceTokenRemovalIT {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private DeviceTokenService deviceTokenService;

  @MockitoBean
  private NotificationPreferencesService preferencesService;

  @MockitoBean
  private NotificationDispatcher notificationDispatcher;

  /** BVA valid edge cho token tối thiểu và token thông thường khi xóa. */
  @ParameterizedTest
  @ValueSource(strings = {"a", "token-123-xyz"})
  @DisplayName("Returns 204 when removing token at valid boundaries")
  @Description("BVA valid edges: minimal and typical token values should be accepted for delete.")
  @Story("Remove device token")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("NTF-BVA-REM-001")
  void removeDeviceShouldReturnNoContentWhenTokenIsValid(String token) throws Exception {
    mockMvc.perform(delete(DEVICES_TOKEN_API_TEMPLATE, token)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal())))
        .andExpect(status().isNoContent());

    verify(deviceTokenService).removeToken(token);
  }

  /** Authorization boundary: thiếu header người dùng phải bị chặn. */
  @ParameterizedTest
  @ValueSource(strings = {"token-a", "token-b"})
  @DisplayName("Returns 403 when removing token without user info header")
  @Description("Security boundary: remove endpoint must reject unauthenticated requests.")
  @Story("Remove device token")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("NTF-BVA-REM-002")
  void removeDeviceShouldReturnForbiddenWhenHeaderIsMissing(String token) throws Exception {
    mockMvc.perform(delete(DEVICES_TOKEN_API_TEMPLATE, token))
        .andExpect(status().isForbidden());

    verifyNoInteractions(deviceTokenService);
  }

  /** Authorization boundary: header lỗi định dạng phải bị chặn. */
  @ParameterizedTest
  @ValueSource(strings = {"not-base64", "@@@"})
  @DisplayName("Returns 403 when removing token with malformed user info header")
  @Description("Security boundary: malformed X-User-Info must not allow delete operation.")
  @Story("Remove device token")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("NTF-BVA-REM-003")
  void removeDeviceShouldReturnForbiddenWhenHeaderIsMalformed(String malformedHeader)
      throws Exception {
    mockMvc.perform(delete(DEVICES_TOKEN_API_TEMPLATE, "token-123")
            .header(USER_INFO_HEADER, malformedHeader))
        .andExpect(status().isForbidden());

    verifyNoInteractions(deviceTokenService);
  }
}
