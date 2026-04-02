package apsas.notification.controller;

import static apsas.notification.controller.NotificationControllerTestSupport.DEVICES_REGISTER_API;
import static apsas.notification.controller.NotificationControllerTestSupport.DEVICE_TYPE_ANDROID;
import static apsas.notification.controller.NotificationControllerTestSupport.ERRORS_DEVICE_TYPE_PATH;
import static apsas.notification.controller.NotificationControllerTestSupport.ERRORS_TOKEN_PATH;
import static apsas.notification.controller.NotificationControllerTestSupport.FIELD_DEVICE_TYPE;
import static apsas.notification.controller.NotificationControllerTestSupport.FIELD_TOKEN;
import static apsas.notification.controller.NotificationControllerTestSupport.FIELD_USER_AGENT;
import static apsas.notification.controller.NotificationControllerTestSupport.SAMPLE_USER_AGENT;
import static apsas.notification.controller.NotificationControllerTestSupport.STUDENT_ID;
import static apsas.notification.controller.NotificationControllerTestSupport.USER_INFO_HEADER;
import static apsas.notification.controller.NotificationControllerTestSupport.deviceTokenResponse;
import static apsas.notification.controller.NotificationControllerTestSupport.encodedUserInfo;
import static apsas.notification.controller.NotificationControllerTestSupport.studentPrincipal;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import apsas.notification.model.dto.DeviceTokenResponse;
import apsas.notification.model.dto.RegisterDeviceRequest;
import apsas.notification.service.DeviceTokenService;
import apsas.notification.service.NotificationDispatcher;
import apsas.notification.service.NotificationPreferencesService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Integration test cho nhóm validation + authentication boundary của API đăng ký token thiết bị.
 *
 * Mỗi test chỉ kiểm tra một hành vi để giữ tính độc lập và giúp truy vết lỗi nhanh.
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
@Feature("REST API - Device Registration Boundary")
@Owner("HuynhSang2005")
class DeviceTokenRegistrationIT {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockitoBean
  private DeviceTokenService deviceTokenService;

  @MockitoBean
  private NotificationPreferencesService preferencesService;

  @MockitoBean
  private NotificationDispatcher notificationDispatcher;

  @ParameterizedTest
  @ValueSource(strings = {"", " ", "\t"})
  @DisplayName("Returns 400 when device token is blank")
  @Description("BVA invalid edge: token at blank or whitespace should be rejected by @NotBlank.")
  @Story("Register device token")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("NTF-BVA-REG-001")
  void registerDeviceShouldReturnBadRequestWhenTokenIsBlank(String blankToken) throws Exception {
    mockMvc.perform(post(DEVICES_REGISTER_API)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newDevicePayload(blankToken, DEVICE_TYPE_ANDROID))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath(ERRORS_TOKEN_PATH).value("Device token is required"));

    verifyNoInteractions(deviceTokenService);
  }

  @ParameterizedTest
  @ValueSource(strings = {"", " ", "\n"})
  @DisplayName("Returns 400 when device type is blank")
  @Description("BVA invalid edge: deviceType at blank or whitespace should be rejected by @NotBlank.")
  @Story("Register device token")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("NTF-BVA-REG-002")
  void registerDeviceShouldReturnBadRequestWhenDeviceTypeIsBlank(String blankDeviceType)
      throws Exception {
    mockMvc.perform(post(DEVICES_REGISTER_API)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newDevicePayload("valid-fcm-token", blankDeviceType))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath(ERRORS_DEVICE_TYPE_PATH).value("Device type is required"));

    verifyNoInteractions(deviceTokenService);
  }

  @ParameterizedTest
  @ValueSource(strings = {"a", "x"})
  @DisplayName("Accepts single-character token at valid boundary")
  @Description("BVA valid edge: single-character token should be accepted and forwarded to service.")
  @Story("Register device token")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("NTF-BVA-REG-003")
  void registerDeviceShouldAcceptSingleCharacterTokenWhenAtValidBoundary(String token)
      throws Exception {
    DeviceTokenResponse stub = deviceTokenResponse(UUID.randomUUID(), token, DEVICE_TYPE_ANDROID);
    when(deviceTokenService.registerToken(any(RegisterDeviceRequest.class), eq(STUDENT_ID)))
        .thenReturn(stub);

    mockMvc.perform(post(DEVICES_REGISTER_API)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newDevicePayload(token, DEVICE_TYPE_ANDROID))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.token").value(token))
        .andExpect(jsonPath("$.isActive").value(true));

    verify(deviceTokenService).registerToken(any(RegisterDeviceRequest.class), eq(STUDENT_ID));
  }

  @ParameterizedTest
  @ValueSource(strings = {"A", "i"})
  @DisplayName("Accepts single-character device type at valid boundary")
  @Description("BVA valid edge: single-character deviceType should pass @NotBlank validation.")
  @Story("Register device token")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("NTF-BVA-REG-006")
  void registerDeviceShouldAcceptSingleCharacterDeviceTypeWhenAtValidBoundary(String deviceType)
      throws Exception {
    DeviceTokenResponse stub = deviceTokenResponse(UUID.randomUUID(), "token-bva-device-type", deviceType);
    when(deviceTokenService.registerToken(any(RegisterDeviceRequest.class), eq(STUDENT_ID)))
        .thenReturn(stub);

    mockMvc.perform(post(DEVICES_REGISTER_API)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newDevicePayload("token-bva-device-type", deviceType))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.deviceType").value(deviceType));

    verify(deviceTokenService).registerToken(any(RegisterDeviceRequest.class), eq(STUDENT_ID));
  }

  @ParameterizedTest
  @ValueSource(strings = {"valid-token", "another-token"})
  @DisplayName("Returns 403 when user info header is missing")
  @Description("Security boundary: register endpoint must reject requests without X-User-Info.")
  @Story("Register device token")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("NTF-BVA-REG-004")
  void registerDeviceShouldReturnForbiddenWhenUserInfoHeaderIsMissing(String token)
      throws Exception {
    mockMvc.perform(post(DEVICES_REGISTER_API)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newDevicePayload(token, DEVICE_TYPE_ANDROID))))
        .andExpect(status().isForbidden());

    verifyNoInteractions(deviceTokenService);
  }

  @ParameterizedTest
  @ValueSource(strings = {"not-base64", "###"})
  @DisplayName("Returns 403 when user info header is malformed")
  @Description("Security boundary: malformed X-User-Info must not authenticate caller.")
  @Story("Register device token")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("NTF-BVA-REG-005")
  void registerDeviceShouldReturnForbiddenWhenUserInfoHeaderIsMalformed(String malformedHeader)
      throws Exception {
    mockMvc.perform(post(DEVICES_REGISTER_API)
            .header(USER_INFO_HEADER, malformedHeader)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(newDevicePayload("valid-token", DEVICE_TYPE_ANDROID))))
        .andExpect(status().isForbidden());

    verifyNoInteractions(deviceTokenService);
  }

  private Map<String, Object> newDevicePayload(String token, String deviceType) {
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put(FIELD_TOKEN, token);
    payload.put(FIELD_DEVICE_TYPE, deviceType);
    payload.put(FIELD_USER_AGENT, SAMPLE_USER_AGENT);
    return payload;
  }
}
