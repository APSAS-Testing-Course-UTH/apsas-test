package apsas.support.config;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import apsas.shared.security.HeaderAuthenticationToken;
import apsas.shared.security.UserPrincipal;
import apsas.support.security.WebSocketAuthenticationService;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.core.context.SecurityContextHolder;

class WebSocketAuthInterceptorTest {

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void preSend_returnsNullForConnectWithoutToken() {
    WebSocketAuthenticationService authService = mock(WebSocketAuthenticationService.class);
    WebSocketAuthInterceptor interceptor = new WebSocketAuthInterceptor(authService);

    Message<byte[]> connectMessage = createStompMessage(StompCommand.CONNECT, null, null);

    Message<?> result = interceptor.preSend(connectMessage, mock(MessageChannel.class));

    assertNull(result);
  }

  @Test
  void preSend_authenticatesConnectAndStoresAuthenticationInSession() {
    WebSocketAuthenticationService authService = mock(WebSocketAuthenticationService.class);
    WebSocketAuthInterceptor interceptor = new WebSocketAuthInterceptor(authService);

    HeaderAuthenticationToken authentication = createAuthenticationToken();
    when(authService.authenticate("jwt-token")).thenReturn(authentication);

    Message<byte[]> connectMessage =
        createStompMessage(StompCommand.CONNECT, "Authorization", "Bearer jwt-token");

    Message<?> result = interceptor.preSend(connectMessage, mock(MessageChannel.class));

    assertNotNull(result);
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(result);
    assertSame(authentication, accessor.getUser());
    assertSame(authentication, SecurityContextHolder.getContext().getAuthentication());
    assertSame(authentication, accessor.getSessionAttributes().get("authentication"));
    verify(authService).authenticate("jwt-token");
  }

  @Test
  void preSend_restoresAuthenticationFromSessionForNonConnectCommands() {
    WebSocketAuthenticationService authService = mock(WebSocketAuthenticationService.class);
    WebSocketAuthInterceptor interceptor = new WebSocketAuthInterceptor(authService);

    HeaderAuthenticationToken authentication = createAuthenticationToken();
    Message<byte[]> sendMessage =
        createStompMessage(
            StompCommand.SEND,
            null,
            null,
            Map.of("authentication", authentication));

    Message<?> result = interceptor.preSend(sendMessage, mock(MessageChannel.class));

    assertNotNull(result);
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(result);
    assertSame(authentication, accessor.getUser());
    assertSame(authentication, SecurityContextHolder.getContext().getAuthentication());
  }

  private static HeaderAuthenticationToken createAuthenticationToken() {
    UserPrincipal principal =
        new UserPrincipal(
            UUID.randomUUID(),
            "user@example.com",
            "First",
            "Last",
            "STUDENT",
            true);
    return new HeaderAuthenticationToken(principal);
  }

  private static Message<byte[]> createStompMessage(
      StompCommand command,
      String headerName,
      String headerValue) {
    return createStompMessage(command, headerName, headerValue, new HashMap<>());
  }

  private static Message<byte[]> createStompMessage(
      StompCommand command,
      String headerName,
      String headerValue,
      Map<String, Object> sessionAttributes) {
    StompHeaderAccessor accessor = StompHeaderAccessor.create(command);
    accessor.setSessionId("session-1");
    accessor.setSessionAttributes(new HashMap<>(sessionAttributes));
    if (headerName != null && headerValue != null) {
      accessor.setNativeHeader(headerName, headerValue);
    }
    accessor.setLeaveMutable(true);
    return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
  }
}
