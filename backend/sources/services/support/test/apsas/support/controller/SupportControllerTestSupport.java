package apsas.support.controller;

import apsas.shared.security.UserPrincipal;
import apsas.shared.security.UserPrincipals;
import java.util.UUID;

/**
 * Tiện ích dùng chung cho integration test của SupportController.
 */
final class SupportControllerTestSupport {
  static final String SUPPORT_SESSIONS_API = "/api/v1/support/sessions";
  static final String USER_INFO_HEADER = "X-User-Info";
  static final String FIELD_INITIAL_MESSAGE = "initialMessage";
  static final String FIELD_CONTENT = "content";
  static final String ERRORS_INITIAL_MESSAGE_PATH = "$.errors.initialMessage";
  static final String ERRORS_CONTENT_PATH = "$.errors.content";

  static final UUID STUDENT_ID = UUID.fromString("33333333-3333-3333-3333-333333333333");
  static final UUID INSTRUCTOR_ID = UUID.fromString("44444444-4444-4444-4444-444444444444");

  private SupportControllerTestSupport() {}

  static String messageEndpointTemplate() {
    return SUPPORT_SESSIONS_API + "/" + "{sessionId}" + "/messages";
  }

  static UserPrincipal studentPrincipal() {
    return UserPrincipal.builder()
        .userId(STUDENT_ID)
        .email("student.support@example.com")
        .firstName("Student")
        .lastName("Support")
        .role("STUDENT")
        .isActive(true)
        .build();
  }

  static UserPrincipal instructorPrincipal() {
    return UserPrincipal.builder()
        .userId(INSTRUCTOR_ID)
        .email("instructor.support@example.com")
        .firstName("Instructor")
        .lastName("Support")
        .role("INSTRUCTOR")
        .isActive(true)
        .build();
  }

  static String encodedUserInfo(UserPrincipal principal) {
    return UserPrincipals.toBase64(principal)
        .orElseThrow(() -> new IllegalStateException("Unable to encode principal"));
  }
}
