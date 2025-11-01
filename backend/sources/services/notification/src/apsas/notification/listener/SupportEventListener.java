package apsas.notification.listener;

import apsas.feign.client.UserFeignClient;
import apsas.feign.dto.UserResponse;
import apsas.notification.service.NotificationDispatcher;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.SupportRequestedEvent;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Handles support request events and notifies instructors. */
@Component
@RequiredArgsConstructor
@Slf4j
public class SupportEventListener {
  private final NotificationDispatcher notificationDispatcher;
  private final UserFeignClient userFeignClient;

  @Value("${notification.url.support-session}")
  private String supportSessionUrlTemplate;

  @RabbitListener(queues = RabbitMqConfig.NOTIFICATION_SUPPORT_REQUESTED_QUEUE)
  public void handleSupportRequested(SupportRequestedEvent event) {
    try {
      String sessionUrl = supportSessionUrlTemplate.replace("%id%", event.getSessionId().toString());

      // Get all instructors
      List<UserResponse> instructors = userFeignClient.getUsersByRole("INSTRUCTOR");
      if (instructors == null || instructors.isEmpty()) {
        return;
      }

      // Extract instructor emails and IDs and their names
      var instructorEmails = instructors.stream()
          .filter(UserResponse::getIsActive)
          .collect(Collectors.toUnmodifiableMap(
              UserResponse::getEmail,
              user -> user.getLastName() + " " + user.getFirstName()
          ));


      var instructorIds = instructors.stream()
          .filter(UserResponse::getIsActive)
          .map(UserResponse::getId)
          .toList();

      // Send notifications to all instructors
      notificationDispatcher.sendSupportRequestNotification(
          instructorEmails,
          instructorIds,
          event.getStudentName(),
          event.getStudentEmail(),
          event.getInitialMessage(),
          sessionUrl
      );
    } catch (Exception e) {
      log.error("Error handling support requested event", e);
    }
  }
}
