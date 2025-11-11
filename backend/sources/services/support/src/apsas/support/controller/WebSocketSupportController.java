package apsas.support.controller;

import apsas.shared.security.UserPrincipal;
import apsas.support.mapper.SupportMessageMapper;
import apsas.support.model.dto.SendMessageRequest;
import apsas.support.model.dto.WebSocketMessage;
import apsas.support.model.entity.SupportMessage;
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

/**
 * Bộ điều khiển xử lý các kết nối WebSocket cho chức năng hỗ trợ trực tuyến giữa sinh viên và giảng viên.
 */
@Controller
@RequiredArgsConstructor
public class WebSocketSupportController {
  private final SupportService supportService;
  private final SupportMessageMapper messageMapper;
  private final SimpMessagingTemplate messagingTemplate;

  /**
   * Xử lý sự kiện người dùng subscribe vào một phiên hỗ trợ qua WebSocket.
   *
   * @param sessionId ID phiên hỗ trợ
   * @param userPrincipal Thông tin người dùng
   */
  @SubscribeMapping("/support/sessions/{sessionId}")
  @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
  public void handleSubscribe(
      @DestinationVariable
      UUID sessionId,
      @AuthenticationPrincipal
      UserPrincipal userPrincipal
  ) {

    // Validate access to the session
    var session = supportService.getSessionById(sessionId);
    supportService.validateUserAccess(session, userPrincipal.userId(), userPrincipal.role());
    // Thông báo cho các người dùng khác khi có người tham gia
    WebSocketMessage joinMessage =
        WebSocketMessage.sessionJoined(sessionId, userPrincipal.userId());
    messagingTemplate.convertAndSend("/topic/support/" + sessionId, joinMessage);
  }

    /**
     * Xử lý sự kiện gửi tin nhắn trong phiên hỗ trợ qua WebSocket.
     *
     * @param sessionId ID phiên hỗ trợ
     * @param request Nội dung tin nhắn gửi
     * @param userPrincipal Thông tin người dùng
     */
    @MessageMapping("/support/sessions/{sessionId}/message")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
    public void handleMessage(
      @DestinationVariable
      UUID sessionId,
      @Payload
      SendMessageRequest request,
      @AuthenticationPrincipal
      UserPrincipal userPrincipal
  ) {

    // Validate access to the session
    var session = supportService.getSessionById(sessionId);
    supportService.validateUserAccess(session, userPrincipal.userId(), userPrincipal.role());
    boolean isInstructor = "INSTRUCTOR".equals(userPrincipal.role());
    // Lưu tin nhắn
    SupportMessage message =
      supportService.sendMessage(
        sessionId, userPrincipal.userId(), request.content(), isInstructor);
    // Phát tin nhắn đến tất cả người dùng trong phiên
    WebSocketMessage wsMessage =
      WebSocketMessage.newMessage(sessionId, messageMapper.toDto(message));
    messagingTemplate.convertAndSend("/topic/support/" + sessionId, wsMessage);
    }

  /**
   * Xử lý sự kiện người dùng rời khỏi phiên hỗ trợ qua WebSocket.
   *
   * @param sessionId ID phiên hỗ trợ
   * @param userPrincipal Thông tin người dùng
   */
  @MessageMapping("/support/sessions/{sessionId}/leave")
  @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
  public void handleLeave(
      @DestinationVariable
      UUID sessionId,
      @AuthenticationPrincipal
      UserPrincipal userPrincipal
  ) {
    // Thông báo cho các người dùng khác khi có người rời khỏi phiên
    WebSocketMessage leaveMessage = WebSocketMessage.sessionLeft(sessionId, userPrincipal.userId());
    messagingTemplate.convertAndSend("/topic/support/" + sessionId, leaveMessage);
  }
}
