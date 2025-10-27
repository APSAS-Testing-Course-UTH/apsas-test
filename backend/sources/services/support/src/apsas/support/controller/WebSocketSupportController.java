package apsas.support.controller;

import apsas.shared.security.UserPrincipal;
import apsas.support.mapper.SupportMessageMapper;
import apsas.support.model.dto.SendMessageRequest;
import apsas.support.model.dto.WebSocketMessage;
import apsas.support.model.entity.SupportMessage;
import apsas.support.model.entity.SupportSession;
import apsas.support.service.SupportService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

/** Controller xử lý các kết nối WebSocket cho hỗ trợ trực tiếp */
@Controller
@RequiredArgsConstructor
public class WebSocketSupportController {
  private final SupportService supportService;
  private final SupportMessageMapper messageMapper;
  private final SimpMessagingTemplate messagingTemplate;

  @SubscribeMapping("/support/sessions/{sessionId}")
  @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
  public void handleSubscribe(
      @DestinationVariable UUID sessionId, @AuthenticationPrincipal UserPrincipal userPrincipal) {

    // Validate access to the session
    SupportSession session = supportService.getSessionById(sessionId);
    supportService.validateUserAccess(session, userPrincipal.userId(), userPrincipal.role());

    // Notify other users that someone joined
    WebSocketMessage joinMessage =
        WebSocketMessage.sessionJoined(sessionId, userPrincipal.userId());
    messagingTemplate.convertAndSend("/topic/support/" + sessionId, joinMessage);
  }

  @MessageMapping("/support/sessions/{sessionId}/message")
  @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
  public void handleMessage(
      @DestinationVariable UUID sessionId,
      @Payload SendMessageRequest request,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {

    // Validate access to the session
    SupportSession session = supportService.getSessionById(sessionId);
    supportService.validateUserAccess(session, userPrincipal.userId(), userPrincipal.role());

    boolean isInstructor = "INSTRUCTOR".equals(userPrincipal.role());

    // Save the message
    SupportMessage message =
        supportService.sendMessage(
            sessionId, userPrincipal.userId(), request.content(), isInstructor);

    // Broadcast the message to all subscribers of this session
    WebSocketMessage wsMessage =
        WebSocketMessage.newMessage(sessionId, messageMapper.toDto(message));
    messagingTemplate.convertAndSend("/topic/support/" + sessionId, wsMessage);
  }

  @MessageMapping("/support/sessions/{sessionId}/leave")
  @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
  public void handleLeave(
      @DestinationVariable UUID sessionId, @AuthenticationPrincipal UserPrincipal userPrincipal) {

    // Notify other users that someone left
    WebSocketMessage leaveMessage = WebSocketMessage.sessionLeft(sessionId, userPrincipal.userId());
    messagingTemplate.convertAndSend("/topic/support/" + sessionId, leaveMessage);
  }
}
