package apsas.notification.listener;

import apsas.notification.service.NotificationDispatcher;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.PasswordResetRequestedEvent;
import apsas.shared.messaging.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class UserEventListener {
  private final NotificationDispatcher notificationDispatcher;

  @RabbitListener(queues = RabbitMqConfig.NOTIFICATION_USER_REGISTERED_QUEUE)
  public void handleUserRegistered(UserRegisteredEvent event) {
    try {
      notificationDispatcher.sendVerificationEmail(
          event.getEmail(),
          event.getFirstName(),
          event.getLastName(),
          event.getVerificationToken()
      );
    } catch (Exception e) {
      log.error("Error handling user registered event", e);
    }
  }

  @RabbitListener(queues = RabbitMqConfig.NOTIFICATION_PASSWORD_RESET_QUEUE)
  public void handlePasswordResetRequested(PasswordResetRequestedEvent event) {
    try {
      notificationDispatcher.sendPasswordResetEmail(
          event.getEmail(), event.getFirstName(), event.getResetToken());
    } catch (Exception e) {
      log.error("Error handling password reset event", e);
    }
  }
}
