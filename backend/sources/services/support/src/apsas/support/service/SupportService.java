package apsas.support.service;

import apsas.shared.exception.BadRequestException;
import apsas.shared.exception.ForbiddenException;
import apsas.shared.exception.NotFoundException;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.messaging.event.SupportRequestedEvent;
import apsas.shared.models.pagination.PageRequestParams;
import apsas.shared.models.pagination.PageResponse;
import apsas.shared.security.UserPrincipal;
import apsas.support.mapper.SupportSessionMapper;
import apsas.support.model.dto.SendMessageRequest;
import apsas.support.model.dto.SupportSessionResponse;
import apsas.support.model.entity.SupportMessage;
import apsas.support.model.entity.SupportSession;
import apsas.support.repository.SupportMessageRepository;
import apsas.support.repository.SupportSessionRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
@Slf4j
public class SupportService {
  private final SupportSessionRepository sessionRepository;
  private final SupportMessageRepository messageRepository;
  private final SupportSessionMapper sessionMapper;
  private final EventPublisher eventPublisher;

  @Transactional
  @PreAuthorize("hasRole('STUDENT')")
  public SupportSessionResponse createSession(
      UUID studentId, String studentEmail, String studentName, String initialMessage) {
    return createSessionInternal(studentId, studentEmail, studentName, initialMessage);
  }

  @Transactional
  @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
  public SupportSessionResponse getSessionById(UUID sessionId, UserPrincipal principal) {
    var session = getSessionById0(sessionId);
    validateUserAccess(session.getStudentId(), principal.userId(), principal.role());
    markMessagesAsRead(sessionId, principal.userId());
    return sessionMapper.toDto(session);
  }

  @Transactional(readOnly = true)
  @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
  public PageResponse<SupportSessionResponse> getSessions(
      PageRequestParams pageParams,
      UserPrincipal userPrincipal
  ) {
    var pageable = pageParams.toPageable();
    var sessionsPage = isInstructor(userPrincipal)
        ? sessionRepository.findAll(pageable)
        : sessionRepository.findByStudentIdOrderByCreatedAtDesc(userPrincipal.userId(), pageable);

    return PageResponse.of(sessionsPage.map(sessionMapper::toDto));
  }

  @PreAuthorize("hasRole('STUDENT')")
  @Transactional
  public SupportSessionResponse closeSession(UUID sessionId, UUID userId) {
    return closeSessionInternal(sessionId, userId);
  }

  @Transactional
  @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
  public SupportSessionResponse sendMessage(
      UserPrincipal userPrincipal, UUID sessionId, SendMessageRequest request) {
    return sendMessageInternal(userPrincipal, sessionId, request);
  }

  private void markMessagesAsRead(UUID sessionId, UUID userId) {
    var session = getSessionById0(sessionId);
    session.getMessages().stream()
        .filter(msg -> !msg.getSenderId().equals(userId))
        .filter(msg -> !msg.getIsRead())
        .forEach(
            msg -> {
              msg.setIsRead(true);
              messageRepository.save(msg);
            });
  }

  private void validateUserAccess(UUID studentId, UUID userId, String userRole) {
    log.debug(
        "Validating access: studentId={}, userId={}, userRole={}",
        studentId,
        userId,
        userRole
    );

    var isStudent = "STUDENT".equals(userRole);
    var isInstructor = "INSTRUCTOR".equals(userRole);

    if (isStudent && !studentId.equals(userId)) {
      throw new ForbiddenException("You don't have access to this session");
    }

    if (!isStudent && !isInstructor) {
      throw new ForbiddenException("You don't have permission to access support sessions");
    }
  }

  private boolean isInstructor(UserPrincipal userPrincipal) {
    return "INSTRUCTOR".equals(userPrincipal.role());
  }

  private SupportSession getSessionById0(UUID sessionId) {
    return sessionRepository
        .findById(sessionId)
        .orElseThrow(() -> new NotFoundException("Support session not found"));
  }

  @Transactional
  public SupportSessionResponse createSessionWs(
      UUID studentId, String studentEmail, String studentName, String initialMessage, String role) {
    validateStudentRole(role);
    return createSessionInternal(studentId, studentEmail, studentName, initialMessage);
  }

  @Transactional
  public SupportSessionResponse getSessionByIdWs(UUID sessionId, UserPrincipal principal) {
    var session = getSessionById0(sessionId);
    validateUserAccess(session.getStudentId(), principal.userId(), principal.role());
    markMessagesAsRead(sessionId, principal.userId());
    return sessionMapper.toDto(session);
  }

  @Transactional
  public SupportSessionResponse sendMessageWs(
      UserPrincipal userPrincipal, UUID sessionId, SendMessageRequest request) {
    log.debug("sendMessageWs: userPrincipal={}, sessionId={}", userPrincipal, sessionId);

    if (userPrincipal == null) {
      throw new ForbiddenException("User not authenticated");
    }

    return sendMessageInternal(userPrincipal, sessionId, request);
  }

  @Transactional
  public SupportSessionResponse closeSessionWs(UUID sessionId, UUID userId, String role) {
    validateStudentRole(role);
    return closeSessionInternal(sessionId, userId);
  }

  private void validateStudentRole(String role) {
    if (!"STUDENT".equals(role)) {
      throw new ForbiddenException("Only students can perform this action");
    }
  }

  private void validateSessionOpen(SupportSession session) {
    if (session.getIsClosed()) {
      throw new BadRequestException("Cannot perform action on a closed session");
    }
  }

  private void validateSessionOwnership(SupportSession session, UUID userId) {
    if (!session.getStudentId().equals(userId)) {
      throw new ForbiddenException("Only the student who created this session can close it");
    }
  }

  private void assignInstructorIfNeeded(
      SupportSession session, UUID instructorId, boolean isInstructor) {
    if (isInstructor && session.getInstructorId() == null) {
      session.setInstructorId(instructorId);
      sessionRepository.save(session);
    }
  }

  private SupportMessage createMessage(UUID senderId, String content, boolean isInstructor) {
    var message = new SupportMessage();
    message.setSenderId(senderId);
    message.setContent(content);
    message.setIsInstructor(isInstructor);
    message.setIsRead(false);
    return message;
  }

  private SupportSessionResponse createSessionInternal(
      UUID studentId, String studentEmail, String studentName, String initialMessage) {
    var session = new SupportSession();
    session.setStudentId(studentId);
    session.setIsClosed(false);

    var message = createMessage(studentId, initialMessage, false);
    session.addMessage(message);

    var savedSession = sessionRepository.save(session);

    publishSupportRequestedEvent(savedSession, studentEmail, studentName, initialMessage);

    return sessionMapper.toDto(savedSession);
  }

  private SupportSessionResponse sendMessageInternal(
      UserPrincipal userPrincipal, UUID sessionId, SendMessageRequest request) {
    var session = getSessionById0(sessionId);
    validateUserAccess(session.getStudentId(), userPrincipal.userId(), userPrincipal.role());
    validateSessionOpen(session);

    var isInstructor = isInstructor(userPrincipal);
    assignInstructorIfNeeded(session, userPrincipal.userId(), isInstructor);

    var message = createMessage(userPrincipal.userId(), request.content(), isInstructor);
    session.addMessage(message);
    messageRepository.save(message);

    return sessionMapper.toDto(session);
  }

  private SupportSessionResponse closeSessionInternal(UUID sessionId, UUID userId) {
    var session = getSessionById0(sessionId);
    validateSessionOpen(session);
    validateSessionOwnership(session, userId);

    session.setIsClosed(true);
    session.setClosedAt(LocalDateTime.now());

    return sessionMapper.toDto(sessionRepository.save(session));
  }

  private void publishSupportRequestedEvent(
      SupportSession session, String studentEmail, String studentName, String initialMessage) {
    var event =
        new SupportRequestedEvent(
            session.getId(), session.getStudentId(), studentEmail, studentName, initialMessage);
    eventPublisher.publish(RabbitMqConfig.SUPPORT_REQUESTED_ROUTING_KEY, event);
  }
}
