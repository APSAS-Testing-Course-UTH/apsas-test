package apsas.notification.controller;

import static apsas.notification.controller.NotificationControllerTestSupport.FIELD_EMAIL_ENABLED;
import static apsas.notification.controller.NotificationControllerTestSupport.FIELD_PUSH_ENABLED;
import static apsas.notification.controller.NotificationControllerTestSupport.PREFERENCES_API;
import static apsas.notification.controller.NotificationControllerTestSupport.STUDENT_ID;
import static apsas.notification.controller.NotificationControllerTestSupport.USER_INFO_HEADER;
import static apsas.notification.controller.NotificationControllerTestSupport.defaultPreferencesResponse;
import static apsas.notification.controller.NotificationControllerTestSupport.encodedUserInfo;
import static apsas.notification.controller.NotificationControllerTestSupport.studentPrincipal;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import apsas.notification.model.dto.NotificationPreferencesResponse;
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
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Integration test cho API lấy tùy chọn thông báo của người dùng.
 *
 * Nhóm test này xác minh contract response và authentication boundary cho endpoint GET
 * /preferences.
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
@Feature("REST API - Preferences Query Boundary")
@Owner("HuynhSang2005")
class NotificationPreferencesGetIT {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private NotificationPreferencesService preferencesService;

  @MockitoBean
  private DeviceTokenService deviceTokenService;

  @MockitoBean
  private NotificationDispatcher notificationDispatcher;

  /** BVA valid edge: profile mặc định phải trả đúng giá trị default. */
  @Test
  @DisplayName("Returns default preferences contract when service provides default profile")
  @Description("Boundary case: default preference values should be explicit and stable in response.")
  @Story("Get notification preferences")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("NTF-BVA-PREF-GET-001")
  void getPreferencesShouldReturnDefaultPreferencesWhenProfileIsDefault() throws Exception {
    NotificationPreferencesResponse stub = defaultPreferencesResponse(STUDENT_ID);
    when(preferencesService.getPreferences(STUDENT_ID)).thenReturn(stub);

    mockMvc.perform(get(PREFERENCES_API)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.userId").value(STUDENT_ID.toString()))
        .andExpect(jsonPath("$." + FIELD_EMAIL_ENABLED).value(true))
        .andExpect(jsonPath("$." + FIELD_PUSH_ENABLED).value(false));

    verify(preferencesService).getPreferences(STUDENT_ID);
  }

  /** BVA valid edge: profile tùy chỉnh phải trả đúng trạng thái đã lưu. */
  @Test
  @DisplayName("Returns custom preferences contract when service provides customized profile")
  @Description("Boundary case: customized preference values should be reflected exactly in response.")
  @Story("Get notification preferences")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("NTF-BVA-PREF-GET-002")
  void getPreferencesShouldReturnCustomPreferencesWhenProfileIsCustomized() throws Exception {
    NotificationPreferencesResponse stub = defaultPreferencesResponse(STUDENT_ID);
    stub.setEmailEnabled(false);
    stub.setPushEnabled(true);

    when(preferencesService.getPreferences(STUDENT_ID)).thenReturn(stub);

    mockMvc.perform(get(PREFERENCES_API)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$." + FIELD_EMAIL_ENABLED).value(false))
        .andExpect(jsonPath("$." + FIELD_PUSH_ENABLED).value(true));

    verify(preferencesService).getPreferences(STUDENT_ID);
  }

  /** Authorization boundary: thiếu header người dùng phải bị chặn. */
  @Test
  @DisplayName("Returns 403 when requesting preferences without user info header")
  @Description("Security boundary: get preferences endpoint must reject unauthenticated requests.")
  @Story("Get notification preferences")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("NTF-BVA-PREF-GET-003")
  void getPreferencesShouldReturnForbiddenWhenHeaderIsMissing() throws Exception {
    mockMvc.perform(get(PREFERENCES_API))
        .andExpect(status().isForbidden());

    verifyNoInteractions(preferencesService);
  }

  /** Authorization boundary: header lỗi định dạng phải bị chặn. */
  @Test
  @DisplayName("Returns 403 when requesting preferences with malformed user info header")
  @Description("Security boundary: malformed X-User-Info must not authenticate caller.")
  @Story("Get notification preferences")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("NTF-BVA-PREF-GET-004")
  void getPreferencesShouldReturnForbiddenWhenHeaderIsMalformed() throws Exception {
    mockMvc.perform(get(PREFERENCES_API)
            .header(USER_INFO_HEADER, "not-base64"))
        .andExpect(status().isForbidden());

    verifyNoInteractions(preferencesService);
  }
}
