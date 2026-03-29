package apsas.support.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import apsas.shared.exception.BadRequestException;
import apsas.shared.exception.ForbiddenException;
import apsas.shared.exception.NotFoundException;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.models.pagination.PageRequestParams;
import apsas.shared.security.UserPrincipal;
import apsas.support.mapper.SupportSessionMapper;
import apsas.support.model.dto.SendMessageRequest;
import apsas.support.model.dto.SupportSessionResponse;
import apsas.support.model.entity.SupportMessage;
import apsas.support.model.entity.SupportSession;
import apsas.support.repository.SupportMessageRepository;
import apsas.support.repository.SupportSessionRepository;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;

@ExtendWith(MockitoExtension.class)
@Epic("Support Service")
@Feature("Support Session Workflow")
@Issue("13")
class SupportServiceTest {
  @Mock
  private SupportSessionRepository sessionRepository;

  @Mock
  private SupportMessageRepository messageRepository;

  @Mock
  private SupportSessionMapper sessionMapper;

  @Mock
  private EventPublisher eventPublisher;

  private SupportService supportService;

  @BeforeEach
  void setUp() {
    supportService =
        new SupportService(sessionRepository, messageRepository, sessionMapper, eventPublisher);
  }

  @Test
  @Tag("unit")
  @Story("Create support session")
  @TmsLink("SUP-SVC-001")
  @DisplayName("Should create an open session with initial message for student")
  void createSession_shouldCreateOpenSessionWithInitialMessage_whenStudentDataIsValid() {
    UUID studentId = UUID.randomUUID();
    SupportSession saved = new SupportSession();
    saved.setId(UUID.randomUUID());
    saved.setStudentId(studentId);
    saved.setIsClosed(false);

    SupportSessionResponse dto =
        new SupportSessionResponse(saved.getId(), studentId, null, false, null, null, List.of());

    when(sessionRepository.save(any(SupportSession.class))).thenReturn(saved);
    when(sessionMapper.toDto(saved)).thenReturn(dto);

    SupportSessionResponse result =
        supportService.createSession(studentId, "st@example.com", "Student A", "Need help");

    assertEquals(saved.getId(), result.id());
    verify(sessionRepository).save(any(SupportSession.class));
    verify(eventPublisher).publish(eq(RabbitMqConfig.SUPPORT_REQUESTED_ROUTING_KEY), any());
  }

  @Test
  @Tag("unit")
  @Story("Create support session with role validation")
  @TmsLink("SUP-SVC-002")
  @DisplayName("Should throw forbidden when role is not student in websocket session creation")
  void createSessionWs_shouldThrowForbidden_whenRoleIsNotStudent() {
    UUID studentId = UUID.randomUUID();

    assertThrows(
        ForbiddenException.class,
        () ->
            supportService.createSessionWs(
                studentId, "st@example.com", "Student A", "Need help", "INSTRUCTOR"));
  }

  @Test
  @Tag("unit")
  @Story("Send support message")
  @TmsLink("SUP-SVC-003")
  @DisplayName("Should assign instructor on first instructor message")
  void sendMessage_shouldAssignInstructor_whenFirstInstructorMessageIsSent() {
    UUID studentId = UUID.randomUUID();
    UUID instructorId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();

    SupportSession session = new SupportSession();
    session.setId(sessionId);
    session.setStudentId(studentId);
    session.setInstructorId(null);
    session.setIsClosed(false);

    UserPrincipal instructor =
        UserPrincipal.builder()
            .userId(instructorId)
            .email("ins@example.com")
            .firstName("Ins")
            .lastName("A")
            .role("INSTRUCTOR")
            .isActive(true)
            .build();

    SendMessageRequest request = new SendMessageRequest("I will help you");
    SupportSessionResponse dto =
        new SupportSessionResponse(sessionId, studentId, instructorId, false, null, null, List.of());

    when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
    when(sessionMapper.toDto(session)).thenReturn(dto);

    SupportSessionResponse result = supportService.sendMessage(instructor, sessionId, request);

    assertEquals(sessionId, result.id());
    verify(sessionRepository).save(session);
    verify(messageRepository).save(any(SupportMessage.class));
    assertEquals(instructorId, session.getInstructorId());
  }

  @Test
  @Tag("unit")
  @Story("Validate closed support session")
  @TmsLink("SUP-SVC-004")
  @DisplayName("Should throw bad request when sending message to closed session")
  void sendMessage_shouldThrowBadRequest_whenSessionIsClosed() {
    UUID studentId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();

    SupportSession session = new SupportSession();
    session.setId(sessionId);
    session.setStudentId(studentId);
    session.setIsClosed(true);

    UserPrincipal student =
        UserPrincipal.builder()
            .userId(studentId)
            .email("st@example.com")
            .firstName("St")
            .lastName("A")
            .role("STUDENT")
            .isActive(true)
            .build();

    when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

    SendMessageRequest request = new SendMessageRequest("msg");

    assertThrows(BadRequestException.class, () -> supportService.sendMessage(student, sessionId, request));

    verify(messageRepository, never()).save(any());
  }

  @Test
  @Tag("unit")
  @Story("Close support session")
  @TmsLink("SUP-SVC-005")
  @DisplayName("Should close session when owner student requests closure")
  void closeSession_shouldCloseSession_whenRequesterIsOwnerStudent() {
    UUID studentId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();

    SupportSession session = new SupportSession();
    session.setId(sessionId);
    session.setStudentId(studentId);
    session.setIsClosed(false);

    SupportSessionResponse dto =
        new SupportSessionResponse(sessionId, studentId, null, true, null, null, List.of());

    when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
    when(sessionRepository.save(session)).thenReturn(session);
    when(sessionMapper.toDto(session)).thenReturn(dto);

    SupportSessionResponse result = supportService.closeSession(sessionId, studentId);

    assertEquals(Boolean.TRUE, session.getIsClosed());
    assertNotNull(session.getClosedAt());
    assertTrue(result.isClosed());
  }

  @Test
  @Tag("unit")
  @Story("Authorize close support session")
  @TmsLink("SUP-SVC-006")
  @DisplayName("Should throw forbidden when non-owner attempts to close session")
  void closeSession_shouldThrowForbidden_whenRequesterIsNotSessionOwner() {
    UUID studentId = UUID.randomUUID();
    UUID otherUser = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();

    SupportSession session = new SupportSession();
    session.setId(sessionId);
    session.setStudentId(studentId);
    session.setIsClosed(false);

    when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

    assertThrows(ForbiddenException.class, () -> supportService.closeSession(sessionId, otherUser));
  }

  @Test
  @Tag("unit")
  @Story("Mark messages as read")
  @TmsLink("SUP-SVC-007")
  @DisplayName("Should mark opposite participant messages as read when loading session details")
  void getSessionById_shouldMarkOppositeMessagesAsRead_whenSessionIsLoaded() {
    UUID studentId = UUID.randomUUID();
    UUID instructorId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();

    SupportMessage fromInstructor = new SupportMessage();
    fromInstructor.setSenderId(instructorId);
    fromInstructor.setIsRead(false);

    SupportMessage fromStudent = new SupportMessage();
    fromStudent.setSenderId(studentId);
    fromStudent.setIsRead(false);

    SupportSession session = new SupportSession();
    session.setId(sessionId);
    session.setStudentId(studentId);
    session.setIsClosed(false);
    session.setMessages(List.of(fromInstructor, fromStudent));

    UserPrincipal student =
        UserPrincipal.builder()
            .userId(studentId)
            .email("st@example.com")
            .firstName("St")
            .lastName("A")
            .role("STUDENT")
            .isActive(true)
            .build();

    SupportSessionResponse dto =
        new SupportSessionResponse(sessionId, studentId, instructorId, false, null, null, List.of());

    when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
    when(sessionMapper.toDto(session)).thenReturn(dto);

    supportService.getSessionById(sessionId, student);

    ArgumentCaptor<SupportMessage> captor = ArgumentCaptor.forClass(SupportMessage.class);
    verify(messageRepository).save(captor.capture());
    assertEquals(instructorId, captor.getValue().getSenderId());
    assertEquals(Boolean.TRUE, captor.getValue().getIsRead());
  }

  @Test
  @Tag("unit")
  @Story("Authorize session detail access")
  @TmsLink("SUP-SVC-EXTRA-001")
  @DisplayName("Should throw forbidden when student requests another student's session")
  void getSessionById_shouldThrowForbidden_whenStudentDoesNotOwnSession() {
    UUID ownerId = UUID.randomUUID();
    UUID otherStudentId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();

    SupportSession session = new SupportSession();
    session.setId(sessionId);
    session.setStudentId(ownerId);

    UserPrincipal otherStudent =
        UserPrincipal.builder()
            .userId(otherStudentId)
            .email("other@example.com")
            .firstName("Other")
            .lastName("St")
            .role("STUDENT")
            .isActive(true)
            .build();

    when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

    assertThrows(ForbiddenException.class, () -> supportService.getSessionById(sessionId, otherStudent));
  }

  @Test
  @Tag("unit")
  @Story("Handle missing support session")
  @TmsLink("SUP-SVC-EXTRA-002")
  @DisplayName("Should throw not found when session does not exist")
  void getSessionById_shouldThrowNotFound_whenSessionDoesNotExist() {
    UUID sessionId = UUID.randomUUID();
    UserPrincipal principal =
        UserPrincipal.builder()
            .userId(UUID.randomUUID())
            .email("ins@example.com")
            .firstName("Ins")
            .lastName("A")
            .role("INSTRUCTOR")
            .isActive(true)
            .build();

    when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

    assertThrows(NotFoundException.class, () -> supportService.getSessionById(sessionId, principal));
  }

  @Test
  @Tag("unit")
  @Story("List sessions for student")
  @TmsLink("SUP-SVC-008")
  @DisplayName("Should return only student sessions when principal role is student")
  void getSessions_shouldQueryStudentSessionsOnly_whenPrincipalIsStudent() {
    UUID studentId = UUID.randomUUID();
    UserPrincipal student =
        UserPrincipal.builder()
            .userId(studentId)
            .email("st@example.com")
            .firstName("St")
            .lastName("A")
            .role("STUDENT")
            .isActive(true)
            .build();

    when(sessionRepository.findByStudentIdOrderByCreatedAtDesc(eq(studentId), any()))
        .thenReturn(new PageImpl<>(List.of()));

    supportService.getSessions(new PageRequestParams(0, 10), student);

    verify(sessionRepository).findByStudentIdOrderByCreatedAtDesc(eq(studentId), any());
    verify(sessionRepository, never()).findAll(any(org.springframework.data.domain.Pageable.class));
  }
}
