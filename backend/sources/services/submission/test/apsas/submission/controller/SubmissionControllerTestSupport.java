package apsas.submission.controller;

import apsas.shared.security.UserPrincipal;
import apsas.shared.security.UserPrincipals;
import java.util.UUID;

/**
 * Tiện ích dùng chung cho integration test của SubmissionController.
 *
 * <p>Giúp giảm lặp code và đảm bảo test data nhất quán theo nguyên tắc FIRST (Independent,
 * Repeatable).</p>
 */
final class SubmissionControllerTestSupport {
  static final String SUBMISSIONS_API = "/api/v1/submissions";
  static final String USER_INFO_HEADER = "X-User-Info";
  static final String FIELD_ASSIGNMENT_ID = "assignmentId";
  static final String FIELD_CODE = "code";
  static final String FIELD_LANGUAGE = "language";
  static final String FIELD_FEEDBACK = "feedback";
  static final String SAMPLE_CODE_BASE64 = "Y29uc29sZS5sb2coJ2hpJyk=";
  static final String ERRORS_CODE_PATH = "$.errors.code";
  static final String ERRORS_LANGUAGE_PATH = "$.errors.language";
  static final String ERRORS_ASSIGNMENT_ID_PATH = "$.errors.assignmentId";
  static final String ERRORS_FEEDBACK_PATH = "$.errors.feedback";

  static final UUID STUDENT_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
  static final UUID INSTRUCTOR_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");

  private SubmissionControllerTestSupport() {}

  static String feedbackEndpointTemplate() {
    return SUBMISSIONS_API + "/" + "{id}" + "/feedback";
  }

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
}
