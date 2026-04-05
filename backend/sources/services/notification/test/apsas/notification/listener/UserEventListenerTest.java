package apsas.notification.listener;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import apsas.notification.service.NotificationDispatcher;
import apsas.shared.messaging.event.PasswordResetRequestedEvent;
import apsas.shared.messaging.event.UserRegisteredEvent;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@Tag("unit")
@Epic("Notification Service")
@Feature("User Event Listener")
class UserEventListenerTest {

  private static final String STUDENT_EMAIL = "student@example.com";
  private static final String FIRST_NAME = "An";
  private static final String LAST_NAME = "Tran";
  private static final String VERIFY_TOKEN = "verify-token";
  private static final String RESET_TOKEN = "reset-token";

  @Mock
  private NotificationDispatcher notificationDispatcher;

  @InjectMocks
  private UserEventListener userEventListener;

  @Test
  @Story("Handle user registered event")
  @TmsLink("NTF-LSN-USR-001")
  @DisplayName("Dispatches verification email when user registration event is received")
  void handleUserRegisteredShouldDispatchVerificationEmailWhenEventIsValid() {
    UserRegisteredEvent event =
        new UserRegisteredEvent(UUID.randomUUID(), STUDENT_EMAIL, FIRST_NAME, LAST_NAME, VERIFY_TOKEN);

    userEventListener.handleUserRegistered(event);

    verify(notificationDispatcher)
        .sendVerificationEmail(STUDENT_EMAIL, FIRST_NAME, LAST_NAME, VERIFY_TOKEN);
  }

  @Test
  @Story("Handle user registered event")
  @TmsLink("NTF-LSN-USR-002")
  @DisplayName("Swallows dispatcher exception when handling user registration event")
  void handleUserRegisteredShouldNotThrowWhenDispatcherFails() {
    UserRegisteredEvent event =
        new UserRegisteredEvent(UUID.randomUUID(), STUDENT_EMAIL, FIRST_NAME, LAST_NAME, VERIFY_TOKEN);

    doThrow(new RuntimeException("mail-failed"))
        .when(notificationDispatcher)
        .sendVerificationEmail(STUDENT_EMAIL, FIRST_NAME, LAST_NAME, VERIFY_TOKEN);

    assertDoesNotThrow(() -> userEventListener.handleUserRegistered(event));
  }

  @Test
  @Story("Handle password reset event")
  @TmsLink("NTF-LSN-USR-003")
  @DisplayName("Dispatches password reset email when password reset event is received")
  void handlePasswordResetRequestedShouldDispatchResetEmailWhenEventIsValid() {
    PasswordResetRequestedEvent event =
        new PasswordResetRequestedEvent(STUDENT_EMAIL, FIRST_NAME, RESET_TOKEN);

    userEventListener.handlePasswordResetRequested(event);

    verify(notificationDispatcher).sendPasswordResetEmail(STUDENT_EMAIL, FIRST_NAME, RESET_TOKEN);
  }

  @Test
  @Story("Handle password reset event")
  @TmsLink("NTF-LSN-USR-004")
  @DisplayName("Swallows dispatcher exception when handling password reset event")
  void handlePasswordResetRequestedShouldNotThrowWhenDispatcherFails() {
    PasswordResetRequestedEvent event =
        new PasswordResetRequestedEvent(STUDENT_EMAIL, FIRST_NAME, RESET_TOKEN);

    doThrow(new RuntimeException("mail-failed"))
        .when(notificationDispatcher)
        .sendPasswordResetEmail(STUDENT_EMAIL, FIRST_NAME, RESET_TOKEN);

    assertDoesNotThrow(() -> userEventListener.handlePasswordResetRequested(event));
  }
}
