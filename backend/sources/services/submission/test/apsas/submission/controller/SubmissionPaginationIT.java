package apsas.submission.controller;

import static apsas.submission.controller.SubmissionControllerTestSupport.INSTRUCTOR_ID;
import static apsas.submission.controller.SubmissionControllerTestSupport.STUDENT_ID;
import static apsas.submission.controller.SubmissionControllerTestSupport.SUBMISSIONS_API;
import static apsas.submission.controller.SubmissionControllerTestSupport.encodedUserInfo;
import static apsas.submission.controller.SubmissionControllerTestSupport.instructorPrincipal;
import static apsas.submission.controller.SubmissionControllerTestSupport.studentPrincipal;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import apsas.shared.models.pagination.PageResponse;
import apsas.submission.service.SubmissionService;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Integration test cho boundary phân trang của endpoint GET /submissions.
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
@Feature("REST API - Pagination Boundary")
@Owner("HuynhSang2005")
class SubmissionPaginationIT {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private SubmissionService submissionService;

  /**
   * BVA cho page/size ở vai trò INSTRUCTOR.
   */
  @ParameterizedTest
  @CsvSource({
      "-1,10,0,10",
      "0,0,0,1",
      "0,1,0,1",
      "0,100,0,100",
      "0,101,0,100"
  })
  @DisplayName("Clamps page and size at boundaries for instructor")
  @Description("BVA for pagination: page >= 0 and size in [1..100] before reaching service layer.")
  @Story("List submissions")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUB-BVA-006")
  void getAllSubmissionsShouldClampPageAndSizeForInstructor(
      int page,
      int size,
      int expectedPage,
      int expectedSize
  ) throws Exception {
    when(submissionService.getAllSubmissions(any(), any(), any(), any(), anyBoolean(), any()))
        .thenReturn(new PageResponse<>(List.of(), expectedPage, expectedSize, 0, 0, true, true, false, false));

    mockMvc.perform(get(SUBMISSIONS_API)
            .header("X-User-Info", encodedUserInfo(instructorPrincipal()))
            .param("page", String.valueOf(page))
            .param("size", String.valueOf(size)))
        .andExpect(status().isOk());

    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
    verify(submissionService).getAllSubmissions(
        eq(INSTRUCTOR_ID),
        isNull(),
        isNull(),
        isNull(),
        eq(true),
        pageableCaptor.capture()
    );

    Pageable pageable = pageableCaptor.getValue();
    assertEquals(expectedPage, pageable.getPageNumber());
    assertEquals(expectedSize, pageable.getPageSize());
  }

  /**
   * Biên vai trò: cùng endpoint nhưng STUDENT phải được truyền cờ isInstructor=false.
   */
  @ParameterizedTest
  @CsvSource({"0,10", "1,100"})
  @DisplayName("Passes student role boundary correctly")
  @Description("Role boundary: student requests must propagate isInstructor=false and studentId from principal.")
  @Story("List submissions")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUB-BVA-007")
  void getAllSubmissionsShouldPropagateStudentBoundary(int page, int size) throws Exception {
    when(submissionService.getAllSubmissions(any(), any(), any(), any(), anyBoolean(), any()))
        .thenReturn(new PageResponse<>(List.of(), page, size, 0, 0, true, true, false, false));

    mockMvc.perform(get(SUBMISSIONS_API)
            .header("X-User-Info", encodedUserInfo(studentPrincipal()))
            .param("page", String.valueOf(page))
            .param("size", String.valueOf(size)))
        .andExpect(status().isOk());

    verify(submissionService).getAllSubmissions(
        eq(STUDENT_ID),
        isNull(),
        isNull(),
        isNull(),
        eq(false),
        any(Pageable.class)
    );
  }
}
