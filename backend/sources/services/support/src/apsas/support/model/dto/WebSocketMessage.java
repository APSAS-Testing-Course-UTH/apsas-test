package apsas.support.model.dto;

import java.util.UUID;

public record WebSocketMessage(
    String type, UUID sessionId, UUID userId, String content, Object data) {
  public static WebSocketMessage sessionJoined(UUID sessionId, UUID userId) {
    return new WebSocketMessage("session_joined", sessionId, userId, null, null);
  }

  public static WebSocketMessage sessionLeft(UUID sessionId, UUID userId) {
    return new WebSocketMessage("session_left", sessionId, userId, null, null);
  }

  public static WebSocketMessage newMessage(UUID sessionId, SupportMessageDto message) {
    return new WebSocketMessage("new_message", sessionId, null, null, message);
  }
}
