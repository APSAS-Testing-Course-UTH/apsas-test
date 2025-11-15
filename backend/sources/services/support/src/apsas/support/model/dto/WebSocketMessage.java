package apsas.support.model.dto;

public record WebSocketMessage<T>(
    Type type,
    T data
) {
  public static WebSocketMessage<SupportSessionResponse> newSession(SupportSessionResponse session) {
    return new WebSocketMessage<>(Type.NEW_SESSION, session);
  }

  public static WebSocketMessage<SupportMessageResponse> newMessage(SupportMessageResponse message) {
    return new WebSocketMessage<>(Type.NEW_MESSAGE, message);
  }

  public static WebSocketMessage<SupportSessionResponse> sessionJoined(SupportSessionResponse session) {
    return new WebSocketMessage<>(Type.SESSION_JOINED, session);
  }

  public static WebSocketMessage<SupportSessionResponse> getSession(SupportSessionResponse session) {
    return new WebSocketMessage<>(Type.GET_SESSION, session);
  }

  public static WebSocketMessage<SupportSessionResponse> sessionClosed(SupportSessionResponse message) {
    return new WebSocketMessage<>(Type.SESSION_CLOSED, message);
  }

  public enum Type {
    NEW_SESSION,
    NEW_MESSAGE,
    SESSION_JOINED,
    SESSION_CLOSED,
    GET_SESSION
  }
}
