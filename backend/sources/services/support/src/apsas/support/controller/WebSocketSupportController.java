package apsas.support.controller;

import apsas.shared.security.UserPrincipal;
import apsas.support.model.dto.CreateSupportSessionRequest;
import apsas.support.model.dto.SendMessageRequest;
import apsas.support.model.dto.SupportMessageResponse;
import apsas.support.model.dto.SupportSessionResponse;
import apsas.support.model.dto.WebSocketMessage;
import apsas.support.service.SupportService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

/**
 * Bộ điều khiển WebSocket cho chat hỗ trợ thời gian thực giữa sinh viên và giảng viên. Quản lý
 * phiên và xử lý tin nhắn qua giao thức WebSocket. Việc chuyển đổi dữ liệu được thực hiện ở tầng
 * dịch vụ.
 */
@Controller
@RequiredArgsConstructor
public class WebSocketSupportController {
  private final SupportService supportService;

  @MessageMapping("/support/sessions/create")
  @SendTo("/topic/support")
  public WebSocketMessage<SupportSessionResponse> createSession(
      @Payload
      CreateSupportSessionRequest request,
      @AuthenticationPrincipal
      UserPrincipal userPrincipal
  ) {
    var studentName = userPrincipal.firstName() + " " + userPrincipal.lastName();
    var session = supportService.createSession(
        userPrincipal.userId(),
        userPrincipal.email(),
        studentName,
        request.initialMessage()
    );
    return WebSocketMessage.newSession(session);
  }

  @MessageMapping("/support/sessions/{sessionId}/messages/send")
  @SendTo({"/topic/support", "/topic/support/{sessionId}"})
  public WebSocketMessage<SupportMessageResponse> sendMessage(
      @DestinationVariable
      UUID sessionId,
      @Payload
      SendMessageRequest request,
      @AuthenticationPrincipal
      UserPrincipal userPrincipal
  ) {
    var session = supportService.sendMessage(userPrincipal, sessionId, request);
    return WebSocketMessage.newMessage(session.messages().getLast());
  }

  @SubscribeMapping("/support/sessions/{sessionId}")
  @SendTo({"/topic/support/{sessionId}", "/topic/support"})
  public WebSocketMessage<SupportSessionResponse> handleSubscribe(
      @DestinationVariable
      UUID sessionId,
      @AuthenticationPrincipal
      UserPrincipal userPrincipal
  ) {
    var session = supportService.getSessionById(sessionId, userPrincipal);
    return WebSocketMessage.sessionJoined(session);
  }

  @MessageMapping("/support/sessions/{sessionId}")
  @SendToUser("/topic/support")
  public WebSocketMessage<SupportSessionResponse> getSession(
      @DestinationVariable
      UUID sessionId,
      @AuthenticationPrincipal
      UserPrincipal userPrincipal
  ) {
    var session = supportService.getSessionById(sessionId, userPrincipal);
    return WebSocketMessage.getSession(session);
  }

  @MessageMapping("/support/sessions/{sessionId}/close")
  @SendTo({"/topic/support/{sessionId}", "/topic/support"})
  public WebSocketMessage<SupportSessionResponse> closeSession(
      @DestinationVariable
      UUID sessionId,
      @AuthenticationPrincipal
      UserPrincipal userPrincipal
  ) {
    var session = supportService.closeSession(sessionId, userPrincipal.userId());
    return WebSocketMessage.sessionClosed(session);
  }
}
