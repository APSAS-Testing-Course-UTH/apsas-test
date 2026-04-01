package apsas.support.controller;

import static apsas.support.controller.SupportControllerTestSupport.SUPPORT_SESSIONS_API;
import static apsas.support.controller.SupportControllerTestSupport.STUDENT_ID;
import static apsas.support.controller.SupportControllerTestSupport.USER_INFO_HEADER;
import static apsas.support.controller.SupportControllerTestSupport.encodedUserInfo;
import static apsas.support.controller.SupportControllerTestSupport.instructorPrincipal;
import static apsas.support.controller.SupportControllerTestSupport.studentPrincipal;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import apsas.shared.messaging.event.EventPublisher;
import apsas.support.mapper.SupportSessionMapper;
import apsas.support.model.dto.SupportSessionResponse;
import apsas.support.model.entity.SupportSession;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Integration test cho endpoint detail/close của SupportController.
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
@Feature("REST API - Session Lifecycle Boundary")
@Owner("HuynhSang2005")
class SupportSessionLifecycleIT {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private SupportSessionRepository sessionRepository;

  @MockBean
  private SupportMessageRepository messageRepository;

  @MockBean
  private SupportSessionMapper sessionMapper;

  @MockBean
  private EventPublisher eventPublisher;

  @MockBean
  private WebSocketAuthenticationService webSocketAuthenticationService;

  /**
   * INSTRUCTOR được phép xem chi tiết session.
   */
  @ParameterizedTest
  @ValueSource(strings = {"instructor", "reviewer"})
  @DisplayName("Returns 200 when instructor views session detail")
  @Description("Role boundary: instructor should access any support session detail.")
  @Story("Get support session by id")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUP-BVA-009")
  void getSessionByIdShouldReturnOkForInstructor(String ignored) throws Exception {
    UUID sessionId = UUID.randomUUID();

    SupportSession session = new SupportSession();
    session.setId(sessionId);
    session.setStudentId(STUDENT_ID);
    session.setIsClosed(false);
    session.setMessages(List.of());

    SupportSessionResponse response = new SupportSessionResponse(
        sessionId,
        STUDENT_ID,
        UUID.randomUUID(),
        false,
        LocalDateTime.now(),
        null,
        List.of()
    );

    when(sessionRepository.findById(sessionId)).thenReturn(java.util.Optional.of(session));
    when(sessionMapper.toDto(session)).thenReturn(response);

    mockMvc.perform(get(SUPPORT_SESSIONS_API + "/{sessionId}", sessionId)
            .header(USER_INFO_HEADER, encodedUserInfo(instructorPrincipal())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(sessionId.toString()));
  }

  /**
   * STUDENT không được xem session của người khác.
   */
  @ParameterizedTest
  @ValueSource(strings = {"user-a", "user-b"})
  @DisplayName("Returns 403 when student accesses another student session")
  @Description("Authorization boundary: student can only access own sessions.")
  @Story("Get support session by id")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUP-BVA-010")
  void getSessionByIdShouldReturnForbiddenForNonOwnerStudent(String ignored) throws Exception {
    UUID sessionId = UUID.randomUUID();

    SupportSession session = new SupportSession();
    session.setId(sessionId);
    session.setStudentId(UUID.randomUUID());
    session.setIsClosed(false);
    session.setMessages(List.of());

    when(sessionRepository.findById(sessionId)).thenReturn(java.util.Optional.of(session));

    mockMvc.perform(get(SUPPORT_SESSIONS_API + "/{sessionId}", sessionId)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal())))
        .andExpect(status().isForbidden());
  }

  /**
   * Chỉ STUDENT mới được close session (theo pre-authorize).
   */
  @ParameterizedTest
  @ValueSource(strings = {"instructor-a", "instructor-b"})
  @DisplayName("Returns 403 when instructor tries to close session")
  @Description("Authorization boundary: close session endpoint only allows STUDENT role.")
  @Story("Close support session")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUP-BVA-011")
  void closeSessionShouldReturnForbiddenForInstructor(String ignored) throws Exception {
    mockMvc.perform(post(SUPPORT_SESSIONS_API + "/{sessionId}/close", UUID.randomUUID())
            .header(USER_INFO_HEADER, encodedUserInfo(instructorPrincipal())))
        .andExpect(status().isForbidden());

    verifyNoInteractions(sessionRepository);
  }

  /**
   * STUDENT owner close session thành công.
   */
  @ParameterizedTest
  @ValueSource(strings = {"ok", "done"})
  @DisplayName("Returns 200 when owner student closes session")
  @Description("Lifecycle boundary: open session can be closed by owner student.")
  @Story("Close support session")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUP-BVA-012")
  void closeSessionShouldReturnOkForOwnerStudent(String ignored) throws Exception {
    UUID sessionId = UUID.randomUUID();

    SupportSession session = new SupportSession();
    session.setId(sessionId);
    session.setStudentId(STUDENT_ID);
    session.setIsClosed(false);
    session.setMessages(List.of());

    SupportSessionResponse response = new SupportSessionResponse(
        sessionId,
        STUDENT_ID,
        null,
        true,
        LocalDateTime.now().minusMinutes(1),
        LocalDateTime.now(),
        List.of()
    );

    when(sessionRepository.findById(sessionId)).thenReturn(java.util.Optional.of(session));
    when(sessionRepository.save(any(SupportSession.class))).thenReturn(session);
    when(sessionMapper.toDto(session)).thenReturn(response);

    mockMvc.perform(post(SUPPORT_SESSIONS_API + "/{sessionId}/close", sessionId)
            .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.isClosed").value(true));
  }
}
