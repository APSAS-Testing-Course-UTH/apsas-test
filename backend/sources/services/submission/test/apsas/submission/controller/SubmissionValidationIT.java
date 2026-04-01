package apsas.submission.controller;

import static apsas.submission.controller.SubmissionControllerTestSupport.ERRORS_ASSIGNMENT_ID_PATH;
import static apsas.submission.controller.SubmissionControllerTestSupport.ERRORS_CODE_PATH;
import static apsas.submission.controller.SubmissionControllerTestSupport.ERRORS_FEEDBACK_PATH;
import static apsas.submission.controller.SubmissionControllerTestSupport.ERRORS_LANGUAGE_PATH;
import static apsas.submission.controller.SubmissionControllerTestSupport.FIELD_ASSIGNMENT_ID;
import static apsas.submission.controller.SubmissionControllerTestSupport.FIELD_CODE;
import static apsas.submission.controller.SubmissionControllerTestSupport.FIELD_FEEDBACK;
import static apsas.submission.controller.SubmissionControllerTestSupport.FIELD_LANGUAGE;
import static apsas.submission.controller.SubmissionControllerTestSupport.SAMPLE_CODE_BASE64;
import static apsas.submission.controller.SubmissionControllerTestSupport.STUDENT_ID;
import static apsas.submission.controller.SubmissionControllerTestSupport.SUBMISSIONS_API;
import static apsas.submission.controller.SubmissionControllerTestSupport.USER_INFO_HEADER;
import static apsas.submission.controller.SubmissionControllerTestSupport.encodedUserInfo;
import static apsas.submission.controller.SubmissionControllerTestSupport.feedbackEndpointTemplate;
import static apsas.submission.controller.SubmissionControllerTestSupport.instructorPrincipal;
import static apsas.submission.controller.SubmissionControllerTestSupport.studentPrincipal;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import apsas.submission.model.dto.SubmissionResponse;
import apsas.submission.service.SubmissionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Integration test cho nhóm validation + authorization của các endpoint ghi dữ liệu Submission.
 *
 * <p>Mỗi test chỉ xác minh 1 hành vi để đảm bảo test rõ ràng, dễ bảo trì và fail đúng nguyên nhân.</p>
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.MOCK,
    properties = {
        "spring.config.name=submission-it",
        "spring.cloud.config.enabled=false",
        "spring.cloud.config.discovery.enabled=false",
        "eureka.client.enabled=false",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration"
    }
)
@AutoConfigureMockMvc
@Tag("integration")
@Epic("Submission Service")
@Feature("REST API - Validation and Access Boundary")
@Owner("HuynhSang2005")
class SubmissionValidationIT {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockBean
  private SubmissionService submissionService;

  /**
   * BVA invalid edge cho trường assignmentId.
   */
  @ParameterizedTest
  @ValueSource(strings = {"java", "python"})
  @DisplayName("Returns 400 when assignmentId is missing")
  @Description("BVA invalid edge: assignmentId null/missing must fail with validation error.")
  @Story("Create submission")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUB-BVA-001")
  void createSubmissionShouldReturnBadRequestWhenAssignmentIdIsMissing(String language)
      throws Exception {
    Map<String, Object> payload = new HashMap<>();
        payload.put(FIELD_ASSIGNMENT_ID, null);
        payload.put(FIELD_CODE, SAMPLE_CODE_BASE64);
        payload.put(FIELD_LANGUAGE, language);

    mockMvc.perform(post(SUBMISSIONS_API)
          .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(payload)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath(ERRORS_ASSIGNMENT_ID_PATH).value("Assignment ID is required"));

    verifyNoInteractions(submissionService);
  }

  /**
   * BVA invalid edge cho code gồm rỗng hoặc chỉ khoảng trắng.
   */
  @ParameterizedTest
  @ValueSource(strings = {"", " ", "   "})
  @DisplayName("Returns 400 when code is blank")
  @Description("BVA invalid edge: code at blank/whitespace should be rejected by @NotBlank.")
  @Story("Create submission")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUB-BVA-002")
  void createSubmissionShouldReturnBadRequestWhenCodeIsBlank(String blankCode) throws Exception {
    Map<String, Object> payload = new HashMap<>();
        payload.put(FIELD_ASSIGNMENT_ID, UUID.randomUUID());
        payload.put(FIELD_CODE, blankCode);
        payload.put(FIELD_LANGUAGE, "java");

    mockMvc.perform(post(SUBMISSIONS_API)
          .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(payload)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath(ERRORS_CODE_PATH).value("Code is required"));

    verifyNoInteractions(submissionService);
  }

  /**
   * BVA valid edge cho code có đúng 1 ký tự.
   */
  @ParameterizedTest
  @ValueSource(strings = {"a", "x"})
  @DisplayName("Accepts minimum non-blank code boundary")
  @Description("BVA valid edge: single-character code should be accepted for submission creation.")
  @Story("Create submission")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUB-BVA-003")
  void createSubmissionShouldAcceptSingleCharacterCodeWhenAtValidBoundary(String code)
      throws Exception {
    UUID assignmentId = UUID.randomUUID();
    SubmissionResponse stub = new SubmissionResponse();
    stub.setCode(code);

    when(submissionService.createSubmission(any(), eq(STUDENT_ID))).thenReturn(stub);

    Map<String, Object> payload = new HashMap<>();
        payload.put(FIELD_ASSIGNMENT_ID, assignmentId);
        payload.put(FIELD_CODE, code);
        payload.put(FIELD_LANGUAGE, "java");

    mockMvc.perform(post(SUBMISSIONS_API)
          .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(payload)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.code").value(code));

    verify(submissionService).createSubmission(any(), eq(STUDENT_ID));
  }

  /**
   * BVA invalid edge cho language gồm rỗng hoặc chỉ khoảng trắng.
   */
  @ParameterizedTest
  @ValueSource(strings = {"", " ", "\t"})
  @DisplayName("Returns 400 when language is blank")
  @Description("BVA invalid edge: language at blank/whitespace should be rejected by @NotBlank.")
  @Story("Create submission")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUB-BVA-004")
  void createSubmissionShouldReturnBadRequestWhenLanguageIsBlank(String blankLanguage)
      throws Exception {
    Map<String, Object> payload = new HashMap<>();
        payload.put(FIELD_ASSIGNMENT_ID, UUID.randomUUID());
        payload.put(FIELD_CODE, SAMPLE_CODE_BASE64);
        payload.put(FIELD_LANGUAGE, blankLanguage);

    mockMvc.perform(post(SUBMISSIONS_API)
          .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(payload)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath(ERRORS_LANGUAGE_PATH).value("Language is required"));

    verifyNoInteractions(submissionService);
  }

  /**
   * Biên phân quyền: create submission chỉ cho STUDENT.
   */
  @ParameterizedTest
  @ValueSource(strings = {"java", "javascript"})
  @DisplayName("Returns 403 when instructor tries to create submission")
  @Description("Authorization boundary: create submission endpoint must deny instructor role.")
  @Story("Create submission")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUB-BVA-009")
  void createSubmissionShouldReturnForbiddenWhenCallerIsInstructor(String language) throws Exception {
    Map<String, Object> payload = new HashMap<>();
        payload.put(FIELD_ASSIGNMENT_ID, UUID.randomUUID());
        payload.put(FIELD_CODE, SAMPLE_CODE_BASE64);
        payload.put(FIELD_LANGUAGE, language);

    mockMvc.perform(post(SUBMISSIONS_API)
          .header(USER_INFO_HEADER, encodedUserInfo(instructorPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(payload)))
        .andExpect(status().isForbidden());

    verifyNoInteractions(submissionService);
  }

  /**
   * BVA invalid edge cho feedback rỗng hoặc chỉ khoảng trắng.
   */
  @ParameterizedTest
  @ValueSource(strings = {"", " ", "\n"})
  @DisplayName("Returns 400 when feedback is blank")
  @Description("BVA invalid edge: feedback at blank/whitespace should be rejected by @NotBlank.")
  @Story("Provide feedback")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUB-BVA-005")
  void provideFeedbackShouldReturnBadRequestWhenFeedbackIsBlank(String blankFeedback)
      throws Exception {
        Map<String, Object> payload = Map.of(FIELD_FEEDBACK, blankFeedback);

        mockMvc.perform(post(feedbackEndpointTemplate(), UUID.randomUUID())
          .header(USER_INFO_HEADER, encodedUserInfo(instructorPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(payload)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath(ERRORS_FEEDBACK_PATH).value("Feedback is required"));

    verifyNoInteractions(submissionService);
  }

  /**
   * BVA valid edge: feedback hợp lệ tối thiểu 1 ký tự.
   */
  @ParameterizedTest
  @ValueSource(strings = {"a", "x"})
  @DisplayName("Accepts minimum non-blank feedback boundary")
  @Description("BVA valid edge: single-character feedback should be accepted.")
  @Story("Provide feedback")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUB-BVA-008")
  void provideFeedbackShouldAcceptSingleCharacterFeedbackWhenValidBoundary(String feedback)
      throws Exception {
    SubmissionResponse stub = new SubmissionResponse();
    stub.setFeedback(feedback);

    when(submissionService.provideFeedback(any(), eq(feedback))).thenReturn(stub);

        mockMvc.perform(post(feedbackEndpointTemplate(), UUID.randomUUID())
          .header(USER_INFO_HEADER, encodedUserInfo(instructorPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(Map.of(FIELD_FEEDBACK, feedback))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.feedback").value(feedback));
  }

  /**
   * Biên phân quyền: feedback chỉ cho INSTRUCTOR.
   */
  @ParameterizedTest
  @ValueSource(strings = {"review ok", "good"})
  @DisplayName("Returns 403 when student tries to provide feedback")
  @Description("Authorization boundary: feedback endpoint must deny student role.")
  @Story("Provide feedback")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUB-BVA-010")
  void provideFeedbackShouldReturnForbiddenWhenCallerIsStudent(String feedback) throws Exception {
        Map<String, Object> payload = Map.of(FIELD_FEEDBACK, feedback);

        mockMvc.perform(post(feedbackEndpointTemplate(), UUID.randomUUID())
          .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(payload)))
        .andExpect(status().isForbidden());

    verifyNoInteractions(submissionService);
  }
}
