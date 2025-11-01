package apsas.notification.listener;

import apsas.feign.client.AssignmentFeignClient;
import apsas.feign.client.UserFeignClient;
import apsas.feign.dto.AssignmentResponse;
import apsas.feign.dto.UserResponse;
import apsas.notification.service.NotificationDispatcher;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.AssignmentPublishedEvent;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Log4j2
public class AssignmentEventListener {
  private final NotificationDispatcher notificationDispatcher;
  private final AssignmentFeignClient assignmentFeignClient;
  private final UserFeignClient userFeignClient;

  @Value("${notification.url.assignment}")
  private String assignmentUrlTemplate;

  @RabbitListener(queues = RabbitMqConfig.NOTIFICATION_ASSIGNMENT_PUBLISHED_QUEUE)
  public void handleAssignmentPublished(AssignmentPublishedEvent event) {
    try {
      AssignmentResponse assignment = assignmentFeignClient.getAssignmentById(event.getAssignmentId());
      if (assignment == null) {
        return;
      }

      List<UserResponse> students = userFeignClient.getUsersByRole("STUDENT");
      if (students == null || students.isEmpty()) {
        return;
      }

      // Format deadline for display
      String deadline = assignment.getDueDate() != null
          ? assignment.getDueDate().toString()
          : "No deadline";

      // Send notification to each student
      String assignmentUrl = assignmentUrlTemplate.replace("%id%", event.getAssignmentId().toString());

      for (UserResponse student : students) {
        if (Boolean.TRUE.equals(student.getIsActive())) {
          notificationDispatcher.sendAssignmentPublishedNotification(
              student.getId(),
              student.getEmail(),
              student.getFirstName(),
              assignment.getTitle(),
              deadline,
              assignmentUrl
          );
        }
      }
    } catch (Exception e) {
      log.error("Error handling assignment published event", e);
    }
  }
}
