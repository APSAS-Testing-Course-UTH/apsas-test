package apsas.notification.controller;

import apsas.notification.model.dto.DeviceTokenResponse;
import apsas.notification.model.dto.NotificationPreferencesResponse;
import apsas.shared.security.UserPrincipal;
import apsas.shared.security.UserPrincipals;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Tiện ích dùng chung cho integration test của Notification REST API.
 *
 * Giúp giảm lặp code và giữ test data nhất quán theo nguyên tắc FIRST (Independent,
 * Repeatable, Self-validating).
 */
final class NotificationControllerTestSupport {

  static final String DEVICES_API = "/api/v1/devices";
  static final String DEVICES_REGISTER_API = DEVICES_API + "/register";
  static final String DEVICES_TOKEN_API_TEMPLATE = DEVICES_API + "/{token}";
  static final String PREFERENCES_API = "/api/v1/preferences";
  static final String USER_INFO_HEADER = "X-User-Info";
  static final String DEVICE_TYPE_ANDROID = "ANDROID";
  static final String SAMPLE_USER_AGENT = "Mozilla/5.0";

  static final String FIELD_TOKEN = "token";
  static final String FIELD_DEVICE_TYPE = "deviceType";
  static final String FIELD_USER_AGENT = "userAgent";

  static final String FIELD_EMAIL_ENABLED = "emailEnabled";
  static final String FIELD_PUSH_ENABLED = "pushEnabled";
  static final String FIELD_EMAIL_ASSIGNMENT_PUBLISHED = "emailAssignmentPublished";
  static final String FIELD_EMAIL_SUBMISSION_EVALUATED = "emailSubmissionEvaluated";
  static final String FIELD_PUSH_ASSIGNMENT_PUBLISHED = "pushAssignmentPublished";
  static final String FIELD_PUSH_SUBMISSION_EVALUATED = "pushSubmissionEvaluated";

  static final String ERRORS_TOKEN_PATH = "$.errors.token";
  static final String ERRORS_DEVICE_TYPE_PATH = "$.errors.deviceType";

  static final UUID STUDENT_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
  static final UUID INSTRUCTOR_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");

  private NotificationControllerTestSupport() {}

  static UserPrincipal studentPrincipal() {
    return UserPrincipal.builder()
        .userId(STUDENT_ID)
        .email("student@example.com")
        .firstName("Student")
        .lastName("One")
        .role("STUDENT")
        .isActive(true)
        .build();
  }

  static UserPrincipal instructorPrincipal() {
    return UserPrincipal.builder()
        .userId(INSTRUCTOR_ID)
        .email("instructor@example.com")
        .firstName("Instructor")
        .lastName("One")
        .role("INSTRUCTOR")
        .isActive(true)
        .build();
  }

  static String encodedUserInfo(UserPrincipal principal) {
    return UserPrincipals.toBase64(principal)
        .orElseThrow(() -> new IllegalStateException("Unable to encode principal"));
  }

  static DeviceTokenResponse deviceTokenResponse(UUID id, String token, String deviceType) {
    DeviceTokenResponse response = new DeviceTokenResponse();
    response.setId(id);
    response.setToken(token);
    response.setDeviceType(deviceType);
    response.setUserAgent(SAMPLE_USER_AGENT);
    response.setIsActive(true);
    response.setCreatedAt(LocalDateTime.of(2026, 4, 2, 10, 0));
    response.setUpdatedAt(LocalDateTime.of(2026, 4, 2, 10, 0));
    return response;
  }

  static NotificationPreferencesResponse defaultPreferencesResponse(UUID userId) {
    NotificationPreferencesResponse response = new NotificationPreferencesResponse();
    response.setId(UUID.randomUUID());
    response.setUserId(userId);
    response.setEmailEnabled(true);
    response.setPushEnabled(false);
    response.setEmailAssignmentPublished(true);
    response.setEmailSubmissionEvaluated(true);
    response.setPushAssignmentPublished(true);
    response.setPushSubmissionEvaluated(true);
    response.setCreatedAt(LocalDateTime.of(2026, 4, 2, 10, 0));
    response.setUpdatedAt(LocalDateTime.of(2026, 4, 2, 10, 0));
    return response;
  }
}
