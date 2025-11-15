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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class SupportService {
  private final SupportSessionRepository sessionRepository;
  private final SupportMessageRepository messageRepository;
  private final SupportSessionMapper sessionMapper;
  private final EventPublisher eventPublisher;

  @Transactional
  @PreAuthorize("hasRole('STUDENT')")
  public SupportSessionResponse createSession(
      UUID studentId, String studentEmail, String studentName, String initialMessage) {
    var session = new SupportSession();
    session.setStudentId(studentId);
    session.setIsClosed(false);

    var message = new SupportMessage();
    message.setSenderId(studentId);
    message.setContent(initialMessage);
    message.setIsInstructor(false);
    message.setIsRead(false);

    session.addMessage(message);

    var savedSession = sessionRepository.save(session);

    // Publish event to notify instructors
    var event =
        new SupportRequestedEvent(
            savedSession.getId(), studentId, studentEmail, studentName, initialMessage);
    eventPublisher.publish(RabbitMqConfig.SUPPORT_REQUESTED_ROUTING_KEY, event);

    return sessionMapper.toDto(savedSession);
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
    var session = getSessionById0(sessionId);

    if (session.getIsClosed()) {
      throw new BadRequestException("Session is already closed");
    }

    if (!session.getStudentId().equals(userId)) {
      throw new ForbiddenException("Only the student who created this session can close it");
    }

    session.setIsClosed(true);
    session.setClosedAt(LocalDateTime.now());

    return sessionMapper.toDto(sessionRepository.save(session));
  }

  @Transactional
  @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
  public SupportSessionResponse sendMessage(
      UserPrincipal userPrincipal,
      UUID sessionId,
      SendMessageRequest request
  ) {
    var session = getSessionById0(sessionId);
    validateUserAccess(session.getStudentId(), userPrincipal.userId(), userPrincipal.role());

    if (session.getIsClosed()) {
      throw new BadRequestException("Cannot send message to a closed session");
    }

    var isInstructor = isInstructor(userPrincipal);
    // If instructor sends a message and is not yet assigned, assign them
    if (isInstructor && session.getInstructorId() == null) {
      session.setInstructorId(userPrincipal.userId());
      sessionRepository.save(session);
    }

    var message = new SupportMessage();
    message.setSenderId(userPrincipal.userId());
    message.setContent(request.content());
    message.setIsInstructor(isInstructor);
    message.setIsRead(false);

    session.addMessage(message);
    messageRepository.save(message);

    return sessionMapper.toDto(session);
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
}
