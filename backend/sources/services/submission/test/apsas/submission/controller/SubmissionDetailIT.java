package apsas.submission.controller;

import static apsas.submission.controller.SubmissionControllerTestSupport.INSTRUCTOR_ID;
import static apsas.submission.controller.SubmissionControllerTestSupport.STUDENT_ID;
import static apsas.submission.controller.SubmissionControllerTestSupport.SUBMISSIONS_API;
import static apsas.submission.controller.SubmissionControllerTestSupport.USER_INFO_HEADER;
import static apsas.submission.controller.SubmissionControllerTestSupport.encodedUserInfo;
import static apsas.submission.controller.SubmissionControllerTestSupport.instructorPrincipal;
import static apsas.submission.controller.SubmissionControllerTestSupport.studentPrincipal;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import apsas.submission.model.dto.SubmissionResponse;
import apsas.submission.service.SubmissionService;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.UUID;
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
 * Integration test cho endpoint GET chi tiết bài nộp.
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
@Feature("REST API - Detail Boundary")
@Owner("HuynhSang2005")
class SubmissionDetailIT {

  private static final String SUBMISSION_BY_ID_TEMPLATE = SUBMISSIONS_API + "/{id}";

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private SubmissionService submissionService;

  /**
   * Kiểm tra boundary phân quyền với vai trò INSTRUCTOR.
   */
  @ParameterizedTest
  @ValueSource(strings = {"instructor@example.com", "reviewer@example.com"})
  @DisplayName("Returns 200 and propagates instructor boundary")
  @Description("Role boundary: instructor can access submission detail and controller forwards isInstructor=true.")
  @Story("Get submission by id")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUB-BVA-011")
  void getSubmissionByIdShouldReturnOkForInstructor(String ignored) throws Exception {
    UUID submissionId = UUID.randomUUID();
    SubmissionResponse response = new SubmissionResponse();
    response.setId(submissionId);

    when(submissionService.getSubmissionById(submissionId, INSTRUCTOR_ID, true)).thenReturn(response);

    mockMvc.perform(get(SUBMISSION_BY_ID_TEMPLATE, submissionId)
            .header(USER_INFO_HEADER, encodedUserInfo(instructorPrincipal())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(submissionId.toString()));

    verify(submissionService).getSubmissionById(submissionId, INSTRUCTOR_ID, true);
  }

  /**
   * Kiểm tra boundary phân quyền với vai trò STUDENT.
   */
  @ParameterizedTest
  @ValueSource(strings = {"student@example.com", "learner@example.com"})
  @DisplayName("Returns 200 and propagates student boundary")
  @Description("Role boundary: student access should propagate isInstructor=false and student principal id.")
  @Story("Get submission by id")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUB-BVA-012")
  void getSubmissionByIdShouldReturnOkForStudent(String ignored) throws Exception {
    UUID submissionId = UUID.randomUUID();
    SubmissionResponse response = new SubmissionResponse();
    response.setId(submissionId);

    when(submissionService.getSubmissionById(submissionId, STUDENT_ID, false)).thenReturn(response);

    mockMvc.perform(get(SUBMISSION_BY_ID_TEMPLATE, submissionId)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(submissionId.toString()));

    verify(submissionService).getSubmissionById(submissionId, STUDENT_ID, false);
  }

  /**
   * Kiểm tra boundary input với UUID sai định dạng.
   */
  @ParameterizedTest
  @ValueSource(strings = {"abc", "invalid-uuid"})
  @DisplayName("Returns 400 when path variable is not UUID")
  @Description("Input boundary: invalid UUID format must fail before entering service layer.")
  @Story("Get submission by id")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUB-BVA-013")
  void getSubmissionByIdShouldReturnBadRequestWhenIdIsInvalid(String invalidId) throws Exception {
    mockMvc.perform(get(SUBMISSION_BY_ID_TEMPLATE, invalidId)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal())))
        .andExpect(status().isBadRequest());

    verifyNoInteractions(submissionService);
  }

  /**
   * Kiểm tra boundary xác thực khi thiếu header user-info.
   */
  @ParameterizedTest
  @ValueSource(strings = {"", "missing"})
  @DisplayName("Returns 403 when user-info header is missing")
  @Description("Security boundary: unauthenticated request must be denied.")
  @Story("Get submission by id")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUB-BVA-014")
  void getSubmissionByIdShouldReturnForbiddenWhenHeaderMissing(String ignored) throws Exception {
    mockMvc.perform(get(SUBMISSION_BY_ID_TEMPLATE, UUID.randomUUID()))
        .andExpect(status().isForbidden());

    verifyNoInteractions(submissionService);
  }
}
