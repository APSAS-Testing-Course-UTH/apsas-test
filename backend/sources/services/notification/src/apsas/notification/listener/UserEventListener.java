package apsas.notification.listener;

import apsas.messaging.event.PasswordResetRequestedEvent;
import apsas.messaging.event.UserRegisteredEvent;
import apsas.notification.config.MessagingConfig;
import apsas.notification.service.EmailService;
import apsas.notification.service.RateLimitService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class UserEventListener {

  private static final Logger logger = LoggerFactory.getLogger(UserEventListener.class);

  private final EmailService emailService;
  private final RateLimitService rateLimitService;

  public UserEventListener(EmailService emailService, RateLimitService rateLimitService) {
    this.emailService = emailService;
    this.rateLimitService = rateLimitService;
  }

  @RabbitListener(queues = MessagingConfig.USER_REGISTERED_QUEUE)
  public void handleUserRegistered(UserRegisteredEvent event) {
    try {
      logger.info("Received user registered event for user: {}", event.getEmail());

      // Check rate limit
      if (!rateLimitService.checkRateLimit(event.getUserId(), "email-verification")) {
        logger.warn("Rate limit exceeded for user registration email: {}", event.getUserId());
        return;
      }

      // Send verification email
      emailService.sendVerificationEmail(
          event.getEmail(),
          event.getFirstName(),
          event.getLastName(),
          event.getVerificationToken()
      );

      logger.info("Sent verification email to: {}", event.getEmail());
    } catch (Exception e) {
      logger.error("Error handling user registered event", e);
    }
  }

  @RabbitListener(queues = MessagingConfig.PASSWORD_RESET_QUEUE)
  public void handlePasswordResetRequested(PasswordResetRequestedEvent event) {
    try {
      logger.info("Received password reset event for email: {}", event.getEmail());

      // Send password reset email
      emailService.sendPasswordResetEmail(
          event.getEmail(), event.getFirstName(), event.getResetToken());

      logger.info("Sent password reset email to: {}", event.getEmail());
    } catch (Exception e) {
      logger.error("Error handling password reset event", e);
    }
  }
}
