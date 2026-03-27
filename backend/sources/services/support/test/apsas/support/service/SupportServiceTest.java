package apsas.support.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
import io.qameta.allure.Owner;
import io.qameta.allure.Story;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;

@ExtendWith(MockitoExtension.class)
@Epic("R2 Backend")
@Feature("Support Session Workflow")
@Owner("hoanglhh20026")
class SupportServiceTest {
  @Mock private SupportSessionRepository sessionRepository;
  @Mock private SupportMessageRepository messageRepository;
  @Mock private SupportSessionMapper sessionMapper;
  @Mock private EventPublisher eventPublisher;

  private SupportService supportService;

  @BeforeEach
  void setUp() {
    supportService =
        new SupportService(sessionRepository, messageRepository, sessionMapper, eventPublisher);
  }

  @Test
  @Story("SUP-SVC-001")
  void supSvc001_createSession_createsOpenSessionWithInitialMessage() {
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
  @Story("SUP-SVC-002")
  void supSvc002_createSessionFailsWhenRoleIsNotStudent_wsPath() {
    UUID studentId = UUID.randomUUID();

    assertThrows(
        ForbiddenException.class,
        () ->
            supportService.createSessionWs(
                studentId, "st@example.com", "Student A", "Need help", "INSTRUCTOR"));
  }

  @Test
  @Story("SUP-SVC-003")
  void supSvc003_sendMessage_assignsInstructorOnFirstInstructorMessage() {
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
  @Story("SUP-SVC-004")
  void supSvc004_sendMessage_throwsWhenSessionClosed() {
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

    assertThrows(
        BadRequestException.class,
        () -> supportService.sendMessage(student, sessionId, request));

    verify(messageRepository, never()).save(any());
  }

  @Test
  @Story("SUP-SVC-005")
  void supSvc005_closeSession_succeedsForOwnerStudent() {
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
    assertEquals(true, result.isClosed());
  }

  @Test
  @Story("SUP-SVC-006")
  void supSvc006_closeSession_throwsForNonOwner() {
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
  @Story("SUP-SVC-007")
  void supSvc007_getSessionById_marksOppositeSideMessagesAsRead() {
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
    assertEquals(true, captor.getValue().getIsRead());
  }

  @Test
  @Story("SUP-SVC-EXTRA-001")
  void supSvcExtra_getSessionById_studentWithoutOwnership_throwsForbidden() {
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
  @Story("SUP-SVC-EXTRA-002")
  void supSvcExtra_getSessionById_notFound_throwsNotFound() {
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
  @Story("SUP-SVC-008")
  void supSvc008_getSessions_studentOnlySeesOwnSessions() {
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
