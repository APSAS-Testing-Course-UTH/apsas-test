package apsas.support.config;

import apsas.shared.security.HeaderAuthenticationToken;
import apsas.support.security.WebSocketAuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Interceptor to authenticate WebSocket connections using JWT tokens from STOMP CONNECT headers.
 * Supports multiple header formats:
 * <ul>
 *   <li>Authorization: Bearer {token}</li>
 *   <li>X-Auth-Token: {token}</li>
 *   <li>token: {token}</li>
 * </ul>
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {
  private final WebSocketAuthenticationService authenticationService;

  @Override
  public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
    var accessor =
        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

    if (accessor == null) {
      return message;
    }

    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
      return handleConnect(accessor, message);
    }

    handleOtherCommands(accessor);
    return message;
  }

  /**
   * Handle CONNECT command - authenticate and store in session
   */
  private Message<?> handleConnect(StompHeaderAccessor accessor, Message<?> message) {
    var token = extractToken(accessor);
    if (token == null || token.isEmpty()) {
      log.warn("WebSocket CONNECT attempted without authentication token");
      return null;
    }

    var authentication = authenticationService.authenticate(token);
    if (authentication == null) {
      log.warn("WebSocket CONNECT authentication failed");
      return null;
    }

    setAuthentication(accessor, authentication);
    storeAuthenticationInSession(accessor, authentication);
    log.debug("WebSocket CONNECT authenticated: {}", authentication.getName());

    return message;
  }

  /**
   * Handle other commands (SEND, SUBSCRIBE, etc.) - restore authentication from session
   */
  private void handleOtherCommands(StompHeaderAccessor accessor) {
    var authentication = retrieveAuthentication(accessor);

    if (authentication != null) {
      setAuthentication(accessor, authentication);
      log.debug(
          "WebSocket {} command authenticated: {}",
          accessor.getCommand(),
          authentication.getName()
      );
    } else {
      log.warn("WebSocket {} command missing authentication", accessor.getCommand());
    }
  }

  /**
   * Retrieve authentication from accessor or session attributes
   */
  private HeaderAuthenticationToken retrieveAuthentication(StompHeaderAccessor accessor) {
    // Try to get from accessor.getUser() first
    if (accessor.getUser() instanceof HeaderAuthenticationToken auth) {
      return auth;
    }

    // Fallback: retrieve from session attributes
    var sessionAttributes = accessor.getSessionAttributes();
    if (sessionAttributes != null && sessionAttributes.containsKey("authentication")) {
      var auth = sessionAttributes.get("authentication");
      if (auth instanceof HeaderAuthenticationToken token) {
        // Set user on accessor so Principal parameter works in @MessageMapping methods
        accessor.setUser(token);
        return token;
      }
    }

    return null;
  }

  /**
   * Set authentication in SecurityContext
   */
  private void setAuthentication(
      StompHeaderAccessor accessor, HeaderAuthenticationToken authentication) {
    accessor.setUser(authentication);
    SecurityContextHolder.getContext().setAuthentication(authentication);
  }

  /**
   * Store authentication in session attributes for later retrieval
   */
  private void storeAuthenticationInSession(
      StompHeaderAccessor accessor, HeaderAuthenticationToken authentication) {
    var sessionAttributes = accessor.getSessionAttributes();
    if (sessionAttributes != null) {
      sessionAttributes.put("authentication", authentication);
    }
  }

  /**
   * Extracts JWT token from STOMP headers. Checks multiple header formats in order of preference.
   *
   * @param accessor STOMP header accessor
   * @return JWT token string or null if not found
   */
  private String extractToken(StompHeaderAccessor accessor) {
    // Try Authorization header first (standard)
    var authHeaders = accessor.getNativeHeader("Authorization");
    if (authHeaders != null && !authHeaders.isEmpty()) {
      var authHeader = authHeaders.getFirst();
      if (authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
      }
      return authHeader;
    }

    // Try X-Auth-Token header (custom)
    var tokenHeaders = accessor.getNativeHeader("X-Auth-Token");
    if (tokenHeaders != null && !tokenHeaders.isEmpty()) {
      return tokenHeaders.getFirst();
    }

    // Try token header (simple)
    var simpleTokenHeaders = accessor.getNativeHeader("token");
    if (simpleTokenHeaders != null && !simpleTokenHeaders.isEmpty()) {
      return simpleTokenHeaders.getFirst();
    }

    return null;
  }
}
