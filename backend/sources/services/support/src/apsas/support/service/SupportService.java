package apsas.support.service;

import apsas.shared.exception.BadRequestException;
import apsas.shared.exception.ForbiddenException;
import apsas.shared.exception.NotFoundException;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.messaging.event.SupportRequestedEvent;
import apsas.shared.models.pagination.PageResponse;
import apsas.support.mapper.SupportSessionMapper;
import apsas.support.model.dto.SupportSessionDto;
import apsas.support.model.entity.SupportMessage;
import apsas.support.model.entity.SupportSession;
import apsas.support.repository.SupportMessageRepository;
import apsas.support.repository.SupportSessionRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
  public SupportSessionDto createSession(
      UUID studentId, String studentEmail, String studentName, String initialMessage) {
    SupportSession session = new SupportSession();
    session.setStudentId(studentId);
    session.setIsClosed(false);

    SupportMessage message = new SupportMessage();
    message.setSenderId(studentId);
    message.setContent(initialMessage);
    message.setIsInstructor(false);
    message.setIsRead(false);

    session.addMessage(message);

    SupportSession savedSession = sessionRepository.save(session);

    // Publish event to notify instructors
    SupportRequestedEvent event =
        new SupportRequestedEvent(
            savedSession.getId(), studentId, studentEmail, studentName, initialMessage);
    eventPublisher.publish(RabbitMqConfig.SUPPORT_REQUESTED_ROUTING_KEY, event);

    return sessionMapper.toDto(savedSession);
  }

  @Transactional(readOnly = true)
  public SupportSessionDto getSessionById(UUID sessionId) {
    return sessionRepository
        .findById(sessionId)
        .map(sessionMapper::toDto)
        .orElseThrow(() -> new NotFoundException("Support session not found"));
  }

  @Transactional(readOnly = true)
  public PageResponse<SupportSessionDto> getSessionsForStudent(UUID studentId, Pageable pageable) {
    Page<SupportSession> sessionPage =
        sessionRepository.findByStudentIdOrderByCreatedAtDesc(studentId, pageable);
    Page<SupportSessionDto> responsePage = sessionPage.map(sessionMapper::toDto);
    return PageResponse.of(responsePage);
  }

  @Transactional(readOnly = true)
  public PageResponse<SupportSessionDto> getAllSessions(Pageable pageable) {
    Page<SupportSession> sessionPage = sessionRepository.findAll(pageable);
    Page<SupportSessionDto> responsePage = sessionPage.map(sessionMapper::toDto);
    return PageResponse.of(responsePage);
  }

  @Transactional
  public SupportSessionDto closeSession(UUID sessionId, UUID userId) {
    SupportSession session = getSessionById0(sessionId);

    if (session.getIsClosed()) {
      throw new BadRequestException("Session is already closed");
    }

    // Only the student who created the session can close it
    if (!session.getStudentId().equals(userId)) {
      throw new ForbiddenException("Only the student who created this session can close it");
    }

    session.setIsClosed(true);
    session.setClosedAt(LocalDateTime.now());

    return sessionMapper.toDto(sessionRepository.save(session));
  }

  @Transactional
  public SupportMessage sendMessage(
      UUID sessionId, UUID senderId, String content, boolean isInstructor) {
    SupportSession session = getSessionById0(sessionId);

    if (session.getIsClosed()) {
      throw new BadRequestException("Cannot send message to a closed session");
    }

    // If instructor sends a message and is not yet assigned, assign them
    if (isInstructor && session.getInstructorId() == null) {
      session.setInstructorId(senderId);
      sessionRepository.save(session);
    }

    SupportMessage message = new SupportMessage();
    message.setSenderId(senderId);
    message.setContent(content);
    message.setIsInstructor(isInstructor);
    message.setIsRead(false);

    session.addMessage(message);
    messageRepository.save(message);

    return message;
  }

  @Transactional
  public void markMessagesAsRead(UUID sessionId, UUID userId) {
    SupportSession session = getSessionById0(sessionId);

    session.getMessages().stream()
        .filter(msg -> !msg.getSenderId().equals(userId))
        .filter(msg -> !msg.getIsRead())
        .forEach(
            msg -> {
              msg.setIsRead(true);
              messageRepository.save(msg);
            });
  }

  public void validateUserAccess(SupportSessionDto session, UUID userId, String userRole) {
    boolean isStudent = "STUDENT".equals(userRole);
    boolean isInstructor = "INSTRUCTOR".equals(userRole);

    if (isStudent && !session.studentId().equals(userId)) {
      throw new ForbiddenException("You don't have access to this session");
    }

    if (!isStudent && !isInstructor) {
      throw new ForbiddenException("You don't have permission to access support sessions");
    }
  }

  private SupportSession getSessionById0(UUID sessionId) {
    return sessionRepository
        .findById(sessionId)
        .orElseThrow(() -> new NotFoundException("Support session not found"));
  }
}
