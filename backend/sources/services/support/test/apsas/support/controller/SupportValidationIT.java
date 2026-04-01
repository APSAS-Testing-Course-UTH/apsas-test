package apsas.support.controller;

import static apsas.support.controller.SupportControllerTestSupport.ERRORS_CONTENT_PATH;
import static apsas.support.controller.SupportControllerTestSupport.ERRORS_INITIAL_MESSAGE_PATH;
import static apsas.support.controller.SupportControllerTestSupport.FIELD_CONTENT;
import static apsas.support.controller.SupportControllerTestSupport.FIELD_INITIAL_MESSAGE;
import static apsas.support.controller.SupportControllerTestSupport.SUPPORT_SESSIONS_API;
import static apsas.support.controller.SupportControllerTestSupport.STUDENT_ID;
import static apsas.support.controller.SupportControllerTestSupport.USER_INFO_HEADER;
import static apsas.support.controller.SupportControllerTestSupport.encodedUserInfo;
import static apsas.support.controller.SupportControllerTestSupport.instructorPrincipal;
import static apsas.support.controller.SupportControllerTestSupport.messageEndpointTemplate;
import static apsas.support.controller.SupportControllerTestSupport.studentPrincipal;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
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
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Integration test cho nhóm validation + access boundary của SupportController.
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
@Feature("REST API - Validation and Access Boundary")
@Owner("HuynhSang2005")
class SupportValidationIT {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

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
   * BVA invalid edge cho initialMessage.
   */
  @ParameterizedTest
  @ValueSource(strings = {"", " ", "\t"})
  @DisplayName("Returns 400 when initial message is blank")
  @Description("BVA invalid edge: initialMessage at blank/whitespace should be rejected by @NotBlank.")
  @Story("Create support session")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUP-BVA-001")
  void createSessionShouldReturnBadRequestWhenInitialMessageIsBlank(String blankMessage)
      throws Exception {
    mockMvc.perform(post(SUPPORT_SESSIONS_API)
          .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(Map.of(FIELD_INITIAL_MESSAGE, blankMessage))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath(ERRORS_INITIAL_MESSAGE_PATH).value("Initial message is required"));

    verifyNoInteractions(sessionRepository, messageRepository, eventPublisher);
  }

  /**
   * BVA valid edge cho initialMessage có 1 ký tự.
   */
  @ParameterizedTest
  @ValueSource(strings = {"a", "x"})
  @DisplayName("Accepts minimum non-blank initial message")
  @Description("BVA valid edge: single-character initialMessage should be accepted.")
  @Story("Create support session")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUP-BVA-002")
  void createSessionShouldAcceptSingleCharacterMessageWhenAtValidBoundary(String message)
      throws Exception {
    UUID sessionId = UUID.randomUUID();

    SupportSession savedSession = new SupportSession();
    savedSession.setId(sessionId);
    savedSession.setStudentId(STUDENT_ID);
    savedSession.setInstructorId(null);
    savedSession.setIsClosed(false);
    savedSession.setCreatedAt(LocalDateTime.now());

    SupportSessionResponse response =
        new SupportSessionResponse(sessionId, STUDENT_ID, null, false, LocalDateTime.now(), null, List.of());

    when(sessionRepository.save(any(SupportSession.class))).thenReturn(savedSession);
    when(sessionMapper.toDto(savedSession)).thenReturn(response);

    mockMvc.perform(post(SUPPORT_SESSIONS_API)
          .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(Map.of(FIELD_INITIAL_MESSAGE, message))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(sessionId.toString()));

    verify(eventPublisher).publish(eq("support.requested"), any());
  }

  /**
   * Biên phân quyền: create session chỉ dành cho STUDENT.
   */
  @ParameterizedTest
  @ValueSource(strings = {"need help", "error build"})
  @DisplayName("Returns 403 when instructor tries to create support session")
  @Description("Authorization boundary: support session creation must reject instructor role.")
  @Story("Create support session")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUP-BVA-007")
  void createSessionShouldReturnForbiddenWhenCallerIsInstructor(String message) throws Exception {
    mockMvc.perform(post(SUPPORT_SESSIONS_API)
          .header(USER_INFO_HEADER, encodedUserInfo(instructorPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(Map.of(FIELD_INITIAL_MESSAGE, message))))
        .andExpect(status().isForbidden());

    verifyNoInteractions(sessionRepository, messageRepository, eventPublisher);
  }

  /**
   * BVA invalid edge cho content.
   */
  @ParameterizedTest
  @ValueSource(strings = {"", " ", "\n"})
  @DisplayName("Returns 400 when chat content is blank")
  @Description("BVA invalid edge: content at blank/whitespace should be rejected by @NotBlank.")
  @Story("Send support message")
  @Severity(SeverityLevel.CRITICAL)
  @TmsLink("SUP-BVA-003")
  void sendMessageShouldReturnBadRequestWhenContentIsBlank(String blankContent)
      throws Exception {
        mockMvc.perform(post(messageEndpointTemplate(), UUID.randomUUID())
          .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(Map.of(FIELD_CONTENT, blankContent))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath(ERRORS_CONTENT_PATH).value("Content is required"));

    verifyNoInteractions(sessionRepository, messageRepository);
  }

  /**
   * BVA valid edge cho content có 1 ký tự.
   */
  @ParameterizedTest
  @ValueSource(strings = {"a", "x"})
  @DisplayName("Accepts minimum non-blank chat content")
  @Description("BVA valid edge: single-character content should be accepted for message sending.")
  @Story("Send support message")
  @Severity(SeverityLevel.NORMAL)
  @TmsLink("SUP-BVA-004")
  void sendMessageShouldAcceptSingleCharacterContentWhenAtValidBoundary(String content)
      throws Exception {
    UUID sessionId = UUID.randomUUID();

    SupportSession session = new SupportSession();
    session.setId(sessionId);
    session.setStudentId(STUDENT_ID);
    session.setIsClosed(false);

    SupportSessionResponse response =
        new SupportSessionResponse(sessionId, STUDENT_ID, null, false, LocalDateTime.now(), null, List.of());

    when(sessionRepository.findById(sessionId)).thenReturn(java.util.Optional.of(session));
    when(messageRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    when(sessionMapper.toDto(session)).thenReturn(response);

        mockMvc.perform(post(messageEndpointTemplate(), sessionId)
          .header(USER_INFO_HEADER, encodedUserInfo(studentPrincipal()))
            .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(Map.of(FIELD_CONTENT, content))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(sessionId.toString()));

    verify(messageRepository).save(any());
  }
}
