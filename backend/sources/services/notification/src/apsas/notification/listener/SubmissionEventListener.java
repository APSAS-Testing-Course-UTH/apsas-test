package apsas.notification.listener;

import apsas.messaging.event.SubmissionEvaluatedEvent;
import apsas.notification.config.MessagingConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class SubmissionEventListener {

  private static final Logger logger = LoggerFactory.getLogger(SubmissionEventListener.class);

  // Note: This is a placeholder implementation
  // In a real system, you would need to:
  // 1. Fetch submission details from submission service
  // 2. Get student user info from identity service
  // 3. Get assignment details from content service
  // 4. Check notification preferences
  // 5. Send email and/or push notifications with results

  @RabbitListener(queues = MessagingConfig.SUBMISSION_EVALUATED_QUEUE)
  public void handleSubmissionEvaluated(SubmissionEvaluatedEvent event) {
    try {
      logger.info(
          "Received submission evaluated event for submission: {} with score: {}",
          event.getSubmissionId(),
          event.getScore()
      );

      // TODO: Implement full notification logic
      // 1. Fetch submission details (student ID, assignment ID) from submission service
      // 2. Get student user info (email, name) from identity service
      // 3. Get assignment details (title) from content service
      // 4. Check notification preferences for the student
      // 5. Check rate limits
      // 6. Send email notification with evaluation results
      // 7. Send push notification if enabled

      logger.info("Submission evaluated notification processed for: {}", event.getSubmissionId());
    } catch (Exception e) {
      logger.error("Error handling submission evaluated event", e);
    }
  }
}
