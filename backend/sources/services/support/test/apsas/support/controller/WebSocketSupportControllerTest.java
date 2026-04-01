package apsas.support.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import apsas.shared.exception.ForbiddenException;
import apsas.shared.security.HeaderAuthenticationToken;
import apsas.shared.security.UserPrincipal;
import apsas.support.model.dto.CreateSupportSessionRequest;
import apsas.support.model.dto.SendMessageRequest;
import apsas.support.model.dto.SupportMessageResponse;
import apsas.support.model.dto.SupportSessionResponse;
import apsas.support.model.dto.WebSocketMessage;
import apsas.support.service.SupportService;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit test cho WebSocketSupportController.
 */
@ExtendWith(MockitoExtension.class)
@Tag("unit")
@Epic("Support Service")
@Feature("WebSocket Controller")
@Owner("HuynhSang2005")
class WebSocketSupportControllerTest {

  private static final String ROLE_STUDENT = "STUDENT";
  private static final String MESSAGE_HELLO = "hello";

  @Mock
  private SupportService supportService;

  @InjectMocks
  private WebSocketSupportController webSocketSupportController;

  @Test
  @Story("Create support session via websocket")
  @TmsLink("SUP-WS-001")
  @DisplayName("Creates websocket session and returns NEW_SESSION message")
  void createSessionShouldReturnNewSessionMessage() {
    UserPrincipal principal = userPrincipal(ROLE_STUDENT);
    HeaderAuthenticationToken token = new HeaderAuthenticationToken(principal);

    SupportSessionResponse response = sessionResponse(UUID.randomUUID(), List.of());
    when(supportService.createSessionWs(
        eq(principal.userId()),
        eq(principal.email()),
        eq(principal.firstName() + " " + principal.lastName()),
        eq("need help"),
        eq(principal.role())
    )).thenReturn(response);

    WebSocketMessage<SupportSessionResponse> actual = webSocketSupportController.createSession(
        new CreateSupportSessionRequest("need help"),
        token
    );

    assertEquals(WebSocketMessage.Type.NEW_SESSION, actual.type());
    assertEquals(response, actual.data());
  }

  @Test
  @Story("Send support message via websocket")
  @TmsLink("SUP-WS-002")
  @DisplayName("Sends websocket message and returns NEW_MESSAGE with last payload")
  void sendMessageShouldReturnLastMessage() {
    UserPrincipal principal = userPrincipal(ROLE_STUDENT);
    HeaderAuthenticationToken token = new HeaderAuthenticationToken(principal);
    UUID sessionId = UUID.randomUUID();

    SupportMessageResponse message = new SupportMessageResponse(
        UUID.randomUUID(),
        sessionId,
        principal.userId(),
        MESSAGE_HELLO,
        false,
        false,
        LocalDateTime.now()
    );

    SupportSessionResponse session = sessionResponse(sessionId, List.of(message));
    when(supportService.sendMessageWs(principal, sessionId, new SendMessageRequest(MESSAGE_HELLO)))
        .thenReturn(session);

    WebSocketMessage<SupportMessageResponse> actual = webSocketSupportController.sendMessage(
        sessionId,
        new SendMessageRequest(MESSAGE_HELLO),
        token
    );

    assertEquals(WebSocketMessage.Type.NEW_MESSAGE, actual.type());
    assertEquals(message, actual.data());
  }

  @Test
  @Story("Subscribe websocket support session")
  @TmsLink("SUP-WS-003")
  @DisplayName("Returns SESSION_JOINED when subscribing to session topic")
  void handleSubscribeShouldReturnSessionJoined() {
    UserPrincipal principal = userPrincipal("INSTRUCTOR");
    HeaderAuthenticationToken token = new HeaderAuthenticationToken(principal);
    UUID sessionId = UUID.randomUUID();

    SupportSessionResponse response = sessionResponse(sessionId, List.of());
    when(supportService.getSessionByIdWs(sessionId, principal)).thenReturn(response);

    WebSocketMessage<SupportSessionResponse> actual =
        webSocketSupportController.handleSubscribe(sessionId, token);

    assertEquals(WebSocketMessage.Type.SESSION_JOINED, actual.type());
    assertEquals(response, actual.data());
  }

  @Test
  @Story("Close websocket support session")
  @TmsLink("SUP-WS-004")
  @DisplayName("Returns SESSION_CLOSED when closing websocket session")
  void closeSessionShouldReturnSessionClosed() {
    UserPrincipal principal = userPrincipal(ROLE_STUDENT);
    HeaderAuthenticationToken token = new HeaderAuthenticationToken(principal);
    UUID sessionId = UUID.randomUUID();

    SupportSessionResponse response = sessionResponse(sessionId, List.of());
    when(supportService.closeSessionWs(sessionId, principal.userId(), principal.role())).thenReturn(response);

    WebSocketMessage<SupportSessionResponse> actual = webSocketSupportController.closeSession(sessionId, token);

    assertEquals(WebSocketMessage.Type.SESSION_CLOSED, actual.type());
    assertEquals(response, actual.data());
    verify(supportService).closeSessionWs(sessionId, principal.userId(), principal.role());
  }

  @Test
  @Story("Authenticate websocket principal")
  @TmsLink("SUP-WS-005")
  @DisplayName("Throws forbidden when principal is not header authentication token")
  void getSessionShouldThrowForbiddenWhenPrincipalInvalid() {
    UUID sessionId = UUID.randomUUID();
    Principal invalidPrincipal = () -> "invalid";

    assertThrows(
        ForbiddenException.class,
        () -> webSocketSupportController.getSession(sessionId, invalidPrincipal)
    );
  }

  private static SupportSessionResponse sessionResponse(
      UUID sessionId,
      List<SupportMessageResponse> messages
  ) {
    return new SupportSessionResponse(
        sessionId,
        UUID.randomUUID(),
        null,
        false,
        LocalDateTime.now(),
        null,
        messages
    );
  }

  private static UserPrincipal userPrincipal(String role) {
    return UserPrincipal.builder()
        .userId(UUID.randomUUID())
        .email("user@example.com")
        .firstName("User")
        .lastName("Principal")
        .role(role)
        .isActive(true)
        .build();
  }
}
