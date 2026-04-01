package apsas.support.controller;

import static apsas.support.controller.SupportControllerTestSupport.STUDENT_ID;
import static apsas.support.controller.SupportControllerTestSupport.SUPPORT_SESSIONS_API;
import static apsas.support.controller.SupportControllerTestSupport.USER_INFO_HEADER;
import static apsas.support.controller.SupportControllerTestSupport.encodedUserInfo;
import static apsas.support.controller.SupportControllerTestSupport.instructorPrincipal;
import static apsas.support.controller.SupportControllerTestSupport.studentPrincipal;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import apsas.shared.messaging.event.EventPublisher;
import apsas.support.mapper.SupportSessionMapper;
import apsas.support.repository.SupportMessageRepository;
import apsas.support.repository.SupportSessionRepository;
import apsas.support.security.WebSocketAuthenticationService;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Integration test cho BVA phân trang của endpoint GET /support/sessions.
 */
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.MOCK,
    properties = {
        "spring.config.name=support-it",
        "spring.cloud.config.enabled=false",
        "spring.cloud.config.discovery.enabled=false",
        "eureka.client.enabled=false",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration"
    }
)
@AutoConfigureMockMvc
@Tag("integration")
@Epic("Support Service")
@Feature("REST API - Pagination Boundary")
@Owner("HuynhSang2005")
class SupportPaginationIT {

  @Autowired
  private MockMvc mockMvc;

    @MockitoBean
  private SupportSessionRepository sessionRepository;

    @MockitoBean
  private SupportMessageRepository messageRepository;

    @MockitoBean
  private SupportSessionMapper sessionMapper;

    @MockitoBean
  private EventPublisher eventPublisher;

    @MockitoBean
  private WebSocketAuthenticationService webSocketAuthenticationService;

  /**
   * BVA cho page/size với vai trò STUDENT.
   */
  @ParameterizedTest
  @CsvSource({
      "-1,10,0,10",
      "0,0,0,1",
      "0,1,0,1",
      "0,100,0,100",
      "0,101,0,100"
  })
  @DisplayName("Clamps page and size boundaries for student")
  @Description("BVA for pagination in support list API when caller role is STUDENT.")
  @Story("List support sessions")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUP-BVA-005")
  void listSessionsShouldClampPageAndSizeForStudent(
      int page,
      int size,
      int expectedPage,
      int expectedSize
  ) throws Exception {
    when(sessionRepository.findByStudentIdOrderByCreatedAtDesc(eq(STUDENT_ID), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of()));

    mockMvc.perform(get(SUPPORT_SESSIONS_API)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .param("page", String.valueOf(page))
            .param("size", String.valueOf(size)))
        .andExpect(status().isOk());

    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
    verify(sessionRepository)
        .findByStudentIdOrderByCreatedAtDesc(eq(STUDENT_ID), pageableCaptor.capture());

    Pageable pageable = pageableCaptor.getValue();
    assertEquals(expectedPage, pageable.getPageNumber());
    assertEquals(expectedSize, pageable.getPageSize());
  }

  /**
   * BVA cho page/size với vai trò INSTRUCTOR.
   */
  @ParameterizedTest
  @CsvSource({
      "-1,10,0,10",
      "0,0,0,1",
      "0,1,0,1",
      "0,100,0,100",
      "0,101,0,100"
  })
  @DisplayName("Clamps page and size boundaries for instructor")
  @Description("BVA for pagination in support list API when caller role is INSTRUCTOR.")
  @Story("List support sessions")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUP-BVA-006")
  void listSessionsShouldClampPageAndSizeForInstructor(
      int page,
      int size,
      int expectedPage,
      int expectedSize
  ) throws Exception {
    when(sessionRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));

    mockMvc.perform(get(SUPPORT_SESSIONS_API)
            .header(USER_INFO_HEADER, encodedUserInfo(instructorPrincipal()))
            .param("page", String.valueOf(page))
            .param("size", String.valueOf(size)))
        .andExpect(status().isOk());

    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
    verify(sessionRepository).findAll(pageableCaptor.capture());

    Pageable pageable = pageableCaptor.getValue();
    assertEquals(expectedPage, pageable.getPageNumber());
    assertEquals(expectedSize, pageable.getPageSize());
  }

  /**
   * Biên vai trò cho endpoint list sessions.
   */
  @ParameterizedTest
  @CsvSource({"0,10", "1,50"})
  @DisplayName("Routes role boundary to correct repository method")
  @Description("Student must query by studentId, instructor must query all sessions.")
  @Story("List support sessions")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUP-BVA-008")
  void listSessionsShouldRouteByRoleBoundary(int page, int size) throws Exception {
    when(sessionRepository.findByStudentIdOrderByCreatedAtDesc(eq(STUDENT_ID), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of()));
    when(sessionRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));

    mockMvc.perform(get(SUPPORT_SESSIONS_API)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .param("page", String.valueOf(page))
            .param("size", String.valueOf(size)))
        .andExpect(status().isOk());

    mockMvc.perform(get(SUPPORT_SESSIONS_API)
            .header(USER_INFO_HEADER, encodedUserInfo(instructorPrincipal()))
            .param("page", String.valueOf(page))
            .param("size", String.valueOf(size)))
        .andExpect(status().isOk());

    verify(sessionRepository).findByStudentIdOrderByCreatedAtDesc(eq(STUDENT_ID), any(Pageable.class));
    verify(sessionRepository).findAll(any(Pageable.class));
  }
}
