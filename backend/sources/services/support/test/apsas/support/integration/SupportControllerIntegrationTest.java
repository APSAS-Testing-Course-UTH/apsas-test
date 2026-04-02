package apsas.support.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.security.UserPrincipal;
import apsas.shared.security.UserPrincipals;
import apsas.support.model.entity.SupportMessage;
import apsas.support.model.entity.SupportSession;
import apsas.support.repository.SupportMessageRepository;
import apsas.support.repository.SupportSessionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;
import io.qameta.allure.Story;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest(
    properties = {
      "spring.config.location=classpath:/application-test.yaml"
    })
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Epic("R3 Backend")
@Feature("Support Integration BVA")
@Owner("lehuynhhuyhoang05")
class SupportControllerIntegrationTest {

  private static final UUID STUDENT_A_ID = UUID.fromString("00000000-0000-0000-0000-0000000000a1");
  private static final UUID STUDENT_B_ID = UUID.fromString("00000000-0000-0000-0000-0000000000b2");
  private static final UUID INSTRUCTOR_ID = UUID.fromString("00000000-0000-0000-0000-0000000000c3");

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private SupportSessionRepository sessionRepository;
  @Autowired private SupportMessageRepository messageRepository;

  @MockBean private EventPublisher eventPublisher;

  @BeforeEach
  void setUp() {
    messageRepository.deleteAll();
    sessionRepository.deleteAll();
  }

  @Test
  @Story("SUP-BVA-001")
  void supBva001_createSession_withMinValidInitialMessage_returnsCreated() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/support/sessions")
                .with(auth(studentA()))
                .contentType(APPLICATION_JSON)
                .content(json(Map.of("initialMessage", "a"))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.studentId").value(STUDENT_A_ID.toString()))
        .andExpect(jsonPath("$.isClosed").value(false));

    assertThat(sessionRepository.count()).isEqualTo(1);
  }

  @Test
  @Story("SUP-BVA-002")
  void supBva002_createSession_withNullInitialMessage_returnsBadRequest() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/support/sessions")
                .with(auth(studentA()))
                .contentType(APPLICATION_JSON)
                .content("{\"initialMessage\":null}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.initialMessage").value("Initial message is required"));
  }

  @Test
  @Story("SUP-BVA-003")
  void supBva003_createSession_withEmptyInitialMessage_returnsBadRequest() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/support/sessions")
                .with(auth(studentA()))
                .contentType(APPLICATION_JSON)
                .content(json(Map.of("initialMessage", ""))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.initialMessage").value("Initial message is required"));
  }

  @Test
  @Story("SUP-BVA-004")
  void supBva004_createSession_withInstructorRole_returnsForbidden() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/support/sessions")
                .with(auth(instructor()))
                .contentType(APPLICATION_JSON)
                .content(json(Map.of("initialMessage", "Need help"))))
        .andExpect(status().isForbidden());
  }

  @Test
  @Story("SUP-BVA-005")
  void supBva005_listSessions_withNegativePage_clampsToZero() throws Exception {
    createSession(STUDENT_A_ID, null, false);

    mockMvc
        .perform(get("/api/v1/support/sessions?page=-1&size=10").with(auth(studentA())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pageNumber").value(0));
  }

  @Test
  @Story("SUP-BVA-006")
  void supBva006_listSessions_withSizeZero_clampsToOne() throws Exception {
    createSession(STUDENT_A_ID, null, false);

    mockMvc
        .perform(get("/api/v1/support/sessions?page=0&size=0").with(auth(studentA())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pageSize").value(1));
  }

  @Test
  @Story("SUP-BVA-007")
  void supBva007_listSessions_withSizeAboveMax_clampsTo100() throws Exception {
    createSession(STUDENT_A_ID, null, false);

    mockMvc
        .perform(get("/api/v1/support/sessions?page=0&size=101").with(auth(studentA())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pageSize").value(100));
  }

  @Test
  @Story("SUP-BVA-008")
  void supBva008_listSessions_studentOnlySeesOwnSessions() throws Exception {
    createSession(STUDENT_A_ID, null, false);
    createSession(STUDENT_B_ID, null, false);

    mockMvc
        .perform(get("/api/v1/support/sessions").with(auth(studentA())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalElements").value(1))
        .andExpect(jsonPath("$.content", hasSize(1)))
        .andExpect(jsonPath("$.content[*].studentId", everyItem(is(STUDENT_A_ID.toString()))));
  }

  @Test
  @Story("SUP-BVA-009")
  void supBva009_listSessions_instructorSeesAllSessions() throws Exception {
    createSession(STUDENT_A_ID, null, false);
    createSession(STUDENT_B_ID, null, false);

    mockMvc
        .perform(get("/api/v1/support/sessions").with(auth(instructor())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalElements").value(2));
  }

  @Test
  @Story("SUP-BVA-010")
  void supBva010_getSessionById_ownerCanAccess() throws Exception {
    SupportSession session = createSession(STUDENT_A_ID, null, false);

    mockMvc
        .perform(get("/api/v1/support/sessions/{id}", session.getId()).with(auth(studentA())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(session.getId().toString()));
  }

  @Test
  @Story("SUP-BVA-011")
  void supBva011_getSessionById_nonOwnerGetsForbidden() throws Exception {
    SupportSession session = createSession(STUDENT_A_ID, null, false);

    mockMvc
        .perform(get("/api/v1/support/sessions/{id}", session.getId()).with(auth(studentB())))
        .andExpect(status().isForbidden());
  }

  @Test
  @Story("SUP-BVA-012")
  void supBva012_getSessionById_notFoundReturns404() throws Exception {
    mockMvc
        .perform(
            get("/api/v1/support/sessions/{id}", UUID.randomUUID()).with(auth(studentA())))
        .andExpect(status().isNotFound());
  }

  @Test
  @Story("SUP-BVA-013")
  void supBva013_getSessionById_invalidUuidReturns400() throws Exception {
    mockMvc
        .perform(get("/api/v1/support/sessions/abc").with(auth(studentA())))
        .andExpect(status().isBadRequest());
  }

  @Test
  @Story("SUP-BVA-014")
  void supBva014_sendMessage_withMinValidContent_returnsOkAndPersists() throws Exception {
    SupportSession session = createSession(STUDENT_A_ID, null, false);

    mockMvc
        .perform(
            post("/api/v1/support/sessions/{id}/messages", session.getId())
                .with(auth(studentA()))
                .contentType(APPLICATION_JSON)
                .content(json(Map.of("content", "a"))))
        .andExpect(status().isOk());

    assertThat(messageRepository.count()).isEqualTo(1);
  }

  @Test
  @Story("SUP-BVA-015")
  void supBva015_sendMessage_withNullContent_returnsBadRequest() throws Exception {
    SupportSession session = createSession(STUDENT_A_ID, null, false);

    mockMvc
        .perform(
            post("/api/v1/support/sessions/{id}/messages", session.getId())
                .with(auth(studentA()))
                .contentType(APPLICATION_JSON)
                .content("{\"content\":null}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.content").value("Content is required"));
  }

  @Test
  @Story("SUP-BVA-016")
  void supBva016_sendMessage_withEmptyContent_returnsBadRequest() throws Exception {
    SupportSession session = createSession(STUDENT_A_ID, null, false);

    mockMvc
        .perform(
            post("/api/v1/support/sessions/{id}/messages", session.getId())
                .with(auth(studentA()))
                .contentType(APPLICATION_JSON)
                .content(json(Map.of("content", ""))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.content").value("Content is required"));
  }

  @Test
  @Story("SUP-BVA-017")
  void supBva017_sendMessage_onClosedSession_returnsBadRequest() throws Exception {
    SupportSession session = createSession(STUDENT_A_ID, null, true);

    mockMvc
        .perform(
            post("/api/v1/support/sessions/{id}/messages", session.getId())
                .with(auth(studentA()))
                .contentType(APPLICATION_JSON)
                .content(json(Map.of("content", "hello"))))
        .andExpect(status().isBadRequest());
  }

  @Test
  @Story("SUP-BVA-018")
  void supBva018_closeSession_firstCloseByOwner_returnsOkAndClosed() throws Exception {
    SupportSession session = createSession(STUDENT_A_ID, null, false);

    mockMvc
        .perform(
            post("/api/v1/support/sessions/{id}/close", session.getId()).with(auth(studentA())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.isClosed").value(true))
        .andExpect(jsonPath("$.closedAt").isNotEmpty());
  }

  @Test
  @Story("SUP-BVA-019")
  void supBva019_closeSession_nonOwnerGetsForbidden() throws Exception {
    SupportSession session = createSession(STUDENT_A_ID, null, false);

    mockMvc
        .perform(
            post("/api/v1/support/sessions/{id}/close", session.getId()).with(auth(studentB())))
        .andExpect(status().isForbidden());
  }

  @Test
  @Story("SUP-BVA-020")
  void supBva020_closeSession_secondCloseReturnsBadRequest() throws Exception {
    SupportSession session = createSession(STUDENT_A_ID, null, false);

    mockMvc.perform(post("/api/v1/support/sessions/{id}/close", session.getId()).with(auth(studentA())))
        .andExpect(status().isOk());

    mockMvc.perform(post("/api/v1/support/sessions/{id}/close", session.getId()).with(auth(studentA())))
        .andExpect(status().isBadRequest());
  }

  @Test
  @Story("SUP-BVA-021")
  void supBva021_getSessionById_marksOpponentUnreadMessagesAsRead() throws Exception {
    SupportSession session = createSession(STUDENT_A_ID, INSTRUCTOR_ID, false);
    SupportMessage unreadFromInstructor =
        createMessage(session, INSTRUCTOR_ID, "Xin chao", true, false);

    mockMvc
        .perform(get("/api/v1/support/sessions/{id}", session.getId()).with(auth(studentA())))
        .andExpect(status().isOk());

    SupportMessage refreshed = messageRepository.findById(unreadFromInstructor.getId()).orElseThrow();
    assertThat(refreshed.getIsRead()).isTrue();
  }

  @Test
  @Story("SUP-EXTRA-001")
  void supExtra001_createSession_withoutAuth_returnsForbidden() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/support/sessions")
                .contentType(APPLICATION_JSON)
                .content(json(Map.of("initialMessage", "Need help"))))
        .andExpect(status().isForbidden());
  }

  @Test
  @Story("SUP-EXTRA-002")
  void supExtra002_listSessions_withoutAuth_returnsForbidden() throws Exception {
    mockMvc.perform(get("/api/v1/support/sessions")).andExpect(status().isForbidden());
  }

  @Test
  @Story("SUP-EXTRA-003")
  void supExtra003_createSession_withBlankInitialMessage_returnsBadRequest() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/support/sessions")
                .with(auth(studentA()))
                .contentType(APPLICATION_JSON)
                .content(json(Map.of("initialMessage", "   "))))
        .andExpect(status().isBadRequest());
  }

  @Test
  @Story("SUP-EXTRA-004")
  void supExtra004_sendMessage_withBlankContent_returnsBadRequest() throws Exception {
    SupportSession session = createSession(STUDENT_A_ID, null, false);

    mockMvc
        .perform(
            post("/api/v1/support/sessions/{id}/messages", session.getId())
                .with(auth(studentA()))
                .contentType(APPLICATION_JSON)
                .content(json(Map.of("content", "   "))))
        .andExpect(status().isBadRequest());
  }

  @Test
  @Story("SUP-EXTRA-005")
  void supExtra005_closeSession_withNotFoundSession_returnsNotFound() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/support/sessions/{id}/close", UUID.randomUUID()).with(auth(studentA())))
        .andExpect(status().isNotFound());
  }

  @Test
  @Story("SUP-EXTRA-006")
  void supExtra006_getSessionById_instructorCanAccess() throws Exception {
    SupportSession session = createSession(STUDENT_A_ID, INSTRUCTOR_ID, false);

    mockMvc
        .perform(get("/api/v1/support/sessions/{id}", session.getId()).with(auth(instructor())))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(session.getId().toString()));
  }

  private SupportSession createSession(UUID studentId, UUID instructorId, boolean isClosed) {
    SupportSession session = new SupportSession();
    session.setStudentId(studentId);
    session.setInstructorId(instructorId);
    session.setIsClosed(isClosed);
    return sessionRepository.saveAndFlush(session);
  }

  private SupportMessage createMessage(
      SupportSession session,
      UUID senderId,
      String content,
      boolean isInstructor,
      boolean isRead) {
    SupportMessage message = new SupportMessage();
    message.setSession(session);
    message.setSenderId(senderId);
    message.setContent(content);
    message.setIsInstructor(isInstructor);
    message.setIsRead(isRead);
    return messageRepository.saveAndFlush(message);
  }

  private RequestPostProcessor auth(UserPrincipal principal) {
    String userInfo =
        UserPrincipals.toBase64(principal)
            .orElseThrow(() -> new IllegalStateException("Cannot encode principal to header"));
    return request -> {
      request.addHeader(UserPrincipals.USER_INFO_HEADER, userInfo);
      return request;
    };
  }

  private UserPrincipal studentA() {
    return UserPrincipal.builder()
        .userId(STUDENT_A_ID)
        .email("student.a@example.com")
        .firstName("Student")
        .lastName("A")
        .role("STUDENT")
        .isActive(true)
        .build();
  }

  private UserPrincipal studentB() {
    return UserPrincipal.builder()
        .userId(STUDENT_B_ID)
        .email("student.b@example.com")
        .firstName("Student")
        .lastName("B")
        .role("STUDENT")
        .isActive(true)
        .build();
  }

  private UserPrincipal instructor() {
    return UserPrincipal.builder()
        .userId(INSTRUCTOR_ID)
        .email("instructor@example.com")
        .firstName("Instructor")
        .lastName("One")
        .role("INSTRUCTOR")
        .isActive(true)
        .build();
  }

  private String json(Object value) throws Exception {
    return objectMapper.writeValueAsString(value);
  }
}
