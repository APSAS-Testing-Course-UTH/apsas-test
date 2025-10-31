package apsas.notification.listener;

import apsas.messaging.event.AssignmentPublishedEvent;
import apsas.messaging.event.AssignmentScheduleUpdatedEvent;
import apsas.notification.config.MessagingConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class AssignmentEventListener {

  private static final Logger logger = LoggerFactory.getLogger(AssignmentEventListener.class);

  // Note: This is a placeholder implementation
  // In a real system, you would need to:
  // 1. Fetch assignment details from content service
  // 2. Get list of enrolled students
  // 3. Check notification preferences for each student
  // 4. Send email and/or push notifications

  @RabbitListener(queues = MessagingConfig.ASSIGNMENT_PUBLISHED_QUEUE)
  public void handleAssignmentPublished(AssignmentPublishedEvent event) {
    try {
      logger.info(
          "Received assignment published event for assignment: {} - {}",
          event.getAssignmentId(),
          event.getTitle()
      );

      // TODO: Implement full notification logic
      // 1. Fetch assignment details (description, deadline) from content service
      // 2. Get enrolled students from content service
      // 3. For each student:
      //    - Check notification preferences
      //    - Check rate limits
      //    - Send email notification if enabled
      //    - Send push notification if enabled and has device tokens

      logger.info("Assignment published notification processed for: {}", event.getTitle());
    } catch (Exception e) {
      logger.error("Error handling assignment published event", e);
    }
  }

  @RabbitListener(queues = MessagingConfig.ASSIGNMENT_SCHEDULE_UPDATED_QUEUE)
  public void handleAssignmentScheduleUpdated(AssignmentScheduleUpdatedEvent event) {
    try {
      logger.info(
          "Received assignment schedule updated event for assignment: {}", event.getAssignmentId());

      // TODO: Implement notification logic similar to assignment published
      // Send notifications about deadline changes

      logger.info("Assignment schedule update notification processed");
    } catch (Exception e) {
      logger.error("Error handling assignment schedule updated event", e);
    }
  }
}
