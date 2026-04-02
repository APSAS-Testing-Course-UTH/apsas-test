package apsas.notification.controller;

import static apsas.notification.controller.NotificationControllerTestSupport.DEVICES_API;
import static apsas.notification.controller.NotificationControllerTestSupport.INSTRUCTOR_ID;
import static apsas.notification.controller.NotificationControllerTestSupport.STUDENT_ID;
import static apsas.notification.controller.NotificationControllerTestSupport.USER_INFO_HEADER;
import static apsas.notification.controller.NotificationControllerTestSupport.deviceTokenResponse;
import static apsas.notification.controller.NotificationControllerTestSupport.encodedUserInfo;
import static apsas.notification.controller.NotificationControllerTestSupport.instructorPrincipal;
import static apsas.notification.controller.NotificationControllerTestSupport.studentPrincipal;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import apsas.notification.model.dto.DeviceTokenResponse;
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
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Integration test cho nhóm boundary của API lấy danh sách thiết bị.
 *
 * Nhóm test này kiểm tra danh sách rỗng, danh sách có dữ liệu và xác minh user identity từ
 * header.
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
@Feature("REST API - Device Retrieval Boundary")
@Owner("HuynhSang2005")
class DeviceTokenRetrievalIT {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private DeviceTokenService deviceTokenService;

  @MockitoBean
  private NotificationPreferencesService preferencesService;

  @MockitoBean
  private NotificationDispatcher notificationDispatcher;

  /** BVA edge: danh sách thiết bị rỗng vẫn phải trả HTTP 200 và mảng rỗng. */
  @Test
  @DisplayName("Returns 200 with empty array when caller has no registered devices")
  @Description("Boundary case: empty collection response should be explicit and deterministic.")
  @Story("Get user devices")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("NTF-BVA-GET-001")
  void getUserDevicesShouldReturnEmptyArrayWhenNoDeviceExists() throws Exception {
    when(deviceTokenService.getUserDevices(eq(STUDENT_ID))).thenReturn(List.of());

    mockMvc.perform(get(DEVICES_API)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(deviceTokenService).getUserDevices(STUDENT_ID);
  }

  /** BVA edge: nhiều thiết bị phải được trả đầy đủ và đúng dữ liệu. */
  @Test
  @DisplayName("Returns 200 with all registered devices")
  @Description("Boundary case: non-empty collection should preserve each device contract field.")
  @Story("Get user devices")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("NTF-BVA-GET-002")
  void getUserDevicesShouldReturnAllDevicesWhenDataExists() throws Exception {
    DeviceTokenResponse first = deviceTokenResponse(UUID.randomUUID(), "token-1", "ANDROID");
    DeviceTokenResponse second = deviceTokenResponse(UUID.randomUUID(), "token-2", "IOS");

    when(deviceTokenService.getUserDevices(eq(STUDENT_ID))).thenReturn(List.of(first, second));

    mockMvc.perform(get(DEVICES_API)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].token").value("token-1"))
        .andExpect(jsonPath("$[1].token").value("token-2"));

    verify(deviceTokenService).getUserDevices(STUDENT_ID);
  }

  /** Security/identity boundary: principal khác phải map đúng sang userId tương ứng. */
  @Test
  @DisplayName("Uses caller identity from header when fetching devices")
  @Description("Security boundary: endpoint must delegate using userId extracted from header principal.")
  @Story("Get user devices")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("NTF-BVA-GET-003")
  void getUserDevicesShouldUseCallerIdentityFromHeader() throws Exception {
    when(deviceTokenService.getUserDevices(eq(INSTRUCTOR_ID))).thenReturn(List.of());

    mockMvc.perform(get(DEVICES_API)
            .header(USER_INFO_HEADER, encodedUserInfo(instructorPrincipal())))
        .andExpect(status().isOk());

    verify(deviceTokenService).getUserDevices(INSTRUCTOR_ID);
  }

  /** Authorization boundary: thiếu header người dùng phải bị chặn. */
  @Test
  @DisplayName("Returns 403 when user info header is missing")
  @Description("Security boundary: get devices endpoint must reject unauthenticated requests.")
  @Story("Get user devices")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("NTF-BVA-GET-004")
  void getUserDevicesShouldReturnForbiddenWhenHeaderIsMissing() throws Exception {
    mockMvc.perform(get(DEVICES_API))
        .andExpect(status().isForbidden());

    verifyNoInteractions(deviceTokenService);
  }

  /** Authorization boundary: header lỗi định dạng phải bị chặn. */
  @Test
  @DisplayName("Returns 403 when user info header is malformed")
  @Description("Security boundary: malformed X-User-Info must not authenticate caller.")
  @Story("Get user devices")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("NTF-BVA-GET-005")
  void getUserDevicesShouldReturnForbiddenWhenHeaderIsMalformed() throws Exception {
    mockMvc.perform(get(DEVICES_API)
            .header(USER_INFO_HEADER, "not-base64"))
        .andExpect(status().isForbidden());

    verifyNoInteractions(deviceTokenService);
  }
}
