package apsas.notification.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import apsas.shared.messaging.config.RabbitMqConfig;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;

/**
 * Unit test cho MessagingConfig của notification service.
 *
 * Mục tiêu: đảm bảo queue/binding được tạo đúng tên và đúng routing key theo hợp đồng RabbitMQ.
 */
@Tag("unit")
@Epic("Notification Service")
@Feature("Messaging Configuration")
class MessagingConfigTest {

  private final MessagingConfig messagingConfig = new MessagingConfig();
  private final TopicExchange exchange = new TopicExchange(RabbitMqConfig.EXCHANGE, true, false);

  @Test
  @Story("Queue declaration")
  @TmsLink("NTF-CFG-001")
  @DisplayName("Declares durable queues with expected queue names")
  void queueMethodsShouldCreateDurableQueuesWithExpectedNames() {
    Queue userRegistered = messagingConfig.userRegisteredQueue();
    Queue passwordReset = messagingConfig.passwordResetQueue();
    Queue assignmentPublished = messagingConfig.assignmentPublishedQueue();
    Queue assignmentScheduleUpdated = messagingConfig.assignmentScheduleUpdatedQueue();
    Queue submissionEvaluated = messagingConfig.submissionEvaluatedQueue();

    assertEquals(RabbitMqConfig.NOTIFICATION_USER_REGISTERED_QUEUE, userRegistered.getName());
    assertEquals(RabbitMqConfig.NOTIFICATION_PASSWORD_RESET_QUEUE, passwordReset.getName());
    assertEquals(RabbitMqConfig.NOTIFICATION_ASSIGNMENT_PUBLISHED_QUEUE, assignmentPublished.getName());
    assertEquals(
        RabbitMqConfig.NOTIFICATION_ASSIGNMENT_SCHEDULE_UPDATED_QUEUE,
        assignmentScheduleUpdated.getName()
    );
    assertEquals(RabbitMqConfig.NOTIFICATION_SUBMISSION_EVALUATED_QUEUE, submissionEvaluated.getName());

    assertTrue(userRegistered.isDurable());
    assertTrue(passwordReset.isDurable());
    assertTrue(assignmentPublished.isDurable());
    assertTrue(assignmentScheduleUpdated.isDurable());
    assertTrue(submissionEvaluated.isDurable());
  }

  @Test
  @Story("Binding declaration")
  @TmsLink("NTF-CFG-002")
  @DisplayName("Creates user and password-reset bindings with expected routing keys")
  void userAndPasswordBindingMethodsShouldUseExpectedRoutingKeys() {
    Queue userRegisteredQueue = messagingConfig.userRegisteredQueue();
    Queue passwordResetQueue = messagingConfig.passwordResetQueue();

    Binding userBinding = messagingConfig.userRegisteredBinding(userRegisteredQueue, exchange);
    Binding passwordBinding = messagingConfig.passwordResetBinding(passwordResetQueue, exchange);

    assertEquals(RabbitMqConfig.NOTIFICATION_USER_REGISTERED_QUEUE, userBinding.getDestination());
    assertEquals(RabbitMqConfig.EXCHANGE, userBinding.getExchange());
    assertEquals(RabbitMqConfig.USER_REGISTERED_ROUTING_KEY, userBinding.getRoutingKey());

    assertEquals(RabbitMqConfig.NOTIFICATION_PASSWORD_RESET_QUEUE, passwordBinding.getDestination());
    assertEquals(RabbitMqConfig.EXCHANGE, passwordBinding.getExchange());
    assertEquals(RabbitMqConfig.PASSWORD_RESET_ROUTING_KEY, passwordBinding.getRoutingKey());
  }

  @Test
  @Story("Binding declaration")
  @TmsLink("NTF-CFG-003")
    @DisplayName("Creates assignment and submission bindings with expected routing keys")
    void assignmentAndSubmissionBindingsShouldUseExpectedRoutingKeys() {
    Binding assignmentPublishedBinding =
        messagingConfig.assignmentPublishedBinding(messagingConfig.assignmentPublishedQueue(), exchange);
    Binding assignmentScheduleBinding =
        messagingConfig.assignmentScheduleUpdatedBinding(
            messagingConfig.assignmentScheduleUpdatedQueue(),
            exchange
        );
    Binding submissionBinding =
        messagingConfig.submissionEvaluatedBinding(messagingConfig.submissionEvaluatedQueue(), exchange);

    assertEquals(
        RabbitMqConfig.ASSIGNMENT_PUBLISHED_ROUTING_KEY,
        assignmentPublishedBinding.getRoutingKey()
    );
    assertEquals(
        RabbitMqConfig.ASSIGNMENT_SCHEDULE_UPDATED_ROUTING_KEY,
        assignmentScheduleBinding.getRoutingKey()
    );
    assertEquals(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY, submissionBinding.getRoutingKey());
  }
}
