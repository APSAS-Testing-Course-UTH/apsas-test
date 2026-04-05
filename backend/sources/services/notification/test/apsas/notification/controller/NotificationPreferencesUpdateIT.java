package apsas.notification.controller;

import static apsas.notification.controller.NotificationControllerTestSupport.FIELD_EMAIL_ASSIGNMENT_PUBLISHED;
import static apsas.notification.controller.NotificationControllerTestSupport.FIELD_EMAIL_ENABLED;
import static apsas.notification.controller.NotificationControllerTestSupport.FIELD_EMAIL_SUBMISSION_EVALUATED;
import static apsas.notification.controller.NotificationControllerTestSupport.FIELD_PUSH_ASSIGNMENT_PUBLISHED;
import static apsas.notification.controller.NotificationControllerTestSupport.FIELD_PUSH_ENABLED;
import static apsas.notification.controller.NotificationControllerTestSupport.FIELD_PUSH_SUBMISSION_EVALUATED;
import static apsas.notification.controller.NotificationControllerTestSupport.PREFERENCES_API;
import static apsas.notification.controller.NotificationControllerTestSupport.STUDENT_ID;
import static apsas.notification.controller.NotificationControllerTestSupport.USER_INFO_HEADER;
import static apsas.notification.controller.NotificationControllerTestSupport.defaultPreferencesResponse;
import static apsas.notification.controller.NotificationControllerTestSupport.encodedUserInfo;
import static apsas.notification.controller.NotificationControllerTestSupport.studentPrincipal;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import apsas.notification.model.dto.NotificationPreferencesRequest;
import apsas.notification.model.dto.NotificationPreferencesResponse;
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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Integration test cho nhóm boundary của API cập nhật tùy chọn thông báo.
 *
 * Các kịch bản tập trung vào BVA cho partial update, explicit false và authorization boundary.
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
@Feature("REST API - Preferences Update Boundary")
@Owner("HuynhSang2005")
class NotificationPreferencesUpdateIT {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockitoBean
  private NotificationPreferencesService preferencesService;

  @MockitoBean
  private DeviceTokenService deviceTokenService;

  @MockitoBean
  private NotificationDispatcher notificationDispatcher;

  @Test
  @DisplayName("Updates only provided field when request payload is partial")
  @Description("BVA valid edge: partial payload should preserve null for unspecified fields.")
  @Story("Update notification preferences")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("NTF-BVA-PREF-UPD-001")
  void updatePreferencesShouldUpdateOnlyProvidedFieldWhenPayloadIsPartial() throws Exception {
    NotificationPreferencesResponse stub = defaultPreferencesResponse(STUDENT_ID);
    stub.setEmailEnabled(false);

    when(preferencesService.updatePreferences(eq(STUDENT_ID), any(NotificationPreferencesRequest.class)))
        .thenReturn(stub);

    mockMvc.perform(patch(PREFERENCES_API)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(singleFieldPayload(FIELD_EMAIL_ENABLED, false))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$." + FIELD_EMAIL_ENABLED).value(false));

    ArgumentCaptor<NotificationPreferencesRequest> captor =
        ArgumentCaptor.forClass(NotificationPreferencesRequest.class);
    verify(preferencesService).updatePreferences(eq(STUDENT_ID), captor.capture());

    NotificationPreferencesRequest capturedRequest = captor.getValue();
    assertEquals(Boolean.FALSE, capturedRequest.getEmailEnabled());
    assertNull(capturedRequest.getPushEnabled());
  }

  @Test
  @DisplayName("Keeps explicit false values when updating detailed preference flags")
  @Description("BVA valid edge: explicit false/true values must survive JSON binding and service call.")
  @Story("Update notification preferences")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("NTF-BVA-PREF-UPD-002")
  void updatePreferencesShouldKeepExplicitFalseValuesWhenFlagsAreProvided() throws Exception {
    NotificationPreferencesResponse stub = defaultPreferencesResponse(STUDENT_ID);
    stub.setEmailAssignmentPublished(false);
    stub.setPushSubmissionEvaluated(false);
    stub.setEmailSubmissionEvaluated(false);
    stub.setPushAssignmentPublished(true);

    when(preferencesService.updatePreferences(eq(STUDENT_ID), any(NotificationPreferencesRequest.class)))
        .thenReturn(stub);

    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put(FIELD_EMAIL_ASSIGNMENT_PUBLISHED, false);
    payload.put(FIELD_PUSH_SUBMISSION_EVALUATED, false);
    payload.put(FIELD_EMAIL_SUBMISSION_EVALUATED, false);
    payload.put(FIELD_PUSH_ASSIGNMENT_PUBLISHED, true);

    mockMvc.perform(patch(PREFERENCES_API)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(payload)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$." + FIELD_EMAIL_ASSIGNMENT_PUBLISHED).value(false))
        .andExpect(jsonPath("$." + FIELD_PUSH_SUBMISSION_EVALUATED).value(false))
        .andExpect(jsonPath("$." + FIELD_EMAIL_SUBMISSION_EVALUATED).value(false))
        .andExpect(jsonPath("$." + FIELD_PUSH_ASSIGNMENT_PUBLISHED).value(true));

    ArgumentCaptor<NotificationPreferencesRequest> captor =
        ArgumentCaptor.forClass(NotificationPreferencesRequest.class);
    verify(preferencesService).updatePreferences(eq(STUDENT_ID), captor.capture());

    NotificationPreferencesRequest capturedRequest = captor.getValue();
    assertEquals(Boolean.FALSE, capturedRequest.getEmailAssignmentPublished());
    assertEquals(Boolean.FALSE, capturedRequest.getPushSubmissionEvaluated());
    assertEquals(Boolean.FALSE, capturedRequest.getEmailSubmissionEvaluated());
    assertEquals(Boolean.TRUE, capturedRequest.getPushAssignmentPublished());
  }

  @Test
  @DisplayName("Applies mixed global channel flags at boundary combinations")
  @Description("BVA mixed edge: combine emailEnabled=true and pushEnabled=false to validate channel precedence.")
  @Story("Update notification preferences")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("NTF-BVA-PREF-UPD-006")
  void updatePreferencesShouldApplyMixedGlobalChannelFlagsAtBoundaryCombination() throws Exception {
    NotificationPreferencesResponse stub = defaultPreferencesResponse(STUDENT_ID);
    stub.setEmailEnabled(true);
    stub.setPushEnabled(false);

    when(preferencesService.updatePreferences(eq(STUDENT_ID), any(NotificationPreferencesRequest.class)))
        .thenReturn(stub);

    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put(FIELD_EMAIL_ENABLED, true);
    payload.put(FIELD_PUSH_ENABLED, false);

    mockMvc.perform(patch(PREFERENCES_API)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(payload)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$." + FIELD_EMAIL_ENABLED).value(true))
        .andExpect(jsonPath("$." + FIELD_PUSH_ENABLED).value(false));

    ArgumentCaptor<NotificationPreferencesRequest> captor =
        ArgumentCaptor.forClass(NotificationPreferencesRequest.class);
    verify(preferencesService).updatePreferences(eq(STUDENT_ID), captor.capture());

    NotificationPreferencesRequest capturedRequest = captor.getValue();
    assertEquals(Boolean.TRUE, capturedRequest.getEmailEnabled());
    assertEquals(Boolean.FALSE, capturedRequest.getPushEnabled());
  }

  @Test
  @DisplayName("Accepts empty payload and delegates as no-op preference update")
  @Description("Boundary case: empty JSON object should bind safely and return 200.")
  @Story("Update notification preferences")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("NTF-BVA-PREF-UPD-003")
  void updatePreferencesShouldAcceptEmptyPayloadAsNoOp() throws Exception {
    NotificationPreferencesResponse stub = defaultPreferencesResponse(STUDENT_ID);

    when(preferencesService.updatePreferences(eq(STUDENT_ID), any(NotificationPreferencesRequest.class)))
        .thenReturn(stub);

    mockMvc.perform(patch(PREFERENCES_API)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$." + FIELD_EMAIL_ENABLED).value(true))
        .andExpect(jsonPath("$." + FIELD_PUSH_ENABLED).value(false));

    ArgumentCaptor<NotificationPreferencesRequest> captor =
        ArgumentCaptor.forClass(NotificationPreferencesRequest.class);
    verify(preferencesService).updatePreferences(eq(STUDENT_ID), captor.capture());

    NotificationPreferencesRequest capturedRequest = captor.getValue();
    assertNull(capturedRequest.getEmailEnabled());
    assertNull(capturedRequest.getPushEnabled());
  }

  @Test
  @DisplayName("Returns 403 when updating preferences without user info header")
  @Description("Security boundary: update endpoint must reject unauthenticated requests.")
  @Story("Update notification preferences")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("NTF-BVA-PREF-UPD-004")
  void updatePreferencesShouldReturnForbiddenWhenHeaderIsMissing() throws Exception {
    mockMvc.perform(patch(PREFERENCES_API)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}"))
        .andExpect(status().isForbidden());

    verifyNoInteractions(preferencesService);
  }

  @Test
  @DisplayName("Returns 403 when updating preferences with malformed user info header")
  @Description("Security boundary: malformed X-User-Info must not authenticate caller.")
  @Story("Update notification preferences")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("NTF-BVA-PREF-UPD-005")
  void updatePreferencesShouldReturnForbiddenWhenHeaderIsMalformed() throws Exception {
    mockMvc.perform(patch(PREFERENCES_API)
            .header(USER_INFO_HEADER, "not-base64")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}"))
        .andExpect(status().isForbidden());

    verifyNoInteractions(preferencesService);
  }

  private Map<String, Object> singleFieldPayload(String field, Object value) {
    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put(field, value);
    return payload;
  }
}
