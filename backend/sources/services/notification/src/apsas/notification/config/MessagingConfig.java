package apsas.notification.config;

import apsas.shared.messaging.config.BaseMessagingConfig;
import apsas.shared.messaging.config.RabbitMqConfig;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MessagingConfig extends BaseMessagingConfig {
  // User event queues
  @Bean
  public Queue userRegisteredQueue() {
    return createQueue(RabbitMqConfig.NOTIFICATION_USER_REGISTERED_QUEUE);
  }

  @Bean
  public Queue passwordResetQueue() {
    return createQueue(RabbitMqConfig.NOTIFICATION_PASSWORD_RESET_QUEUE);
  }

  @Bean
  public Binding userRegisteredBinding(Queue userRegisteredQueue, TopicExchange exchange) {
    return createBinding(userRegisteredQueue, exchange, RabbitMqConfig.USER_REGISTERED_ROUTING_KEY);
  }

  @Bean
  public Binding passwordResetBinding(Queue passwordResetQueue, TopicExchange exchange) {
    return createBinding(passwordResetQueue, exchange, RabbitMqConfig.PASSWORD_RESET_ROUTING_KEY);
  }

  // Assignment event queues
  @Bean
  public Queue assignmentPublishedQueue() {
    return createQueue(RabbitMqConfig.NOTIFICATION_ASSIGNMENT_PUBLISHED_QUEUE);
  }

  @Bean
  public Queue assignmentScheduleUpdatedQueue() {
    return createQueue(RabbitMqConfig.NOTIFICATION_ASSIGNMENT_SCHEDULE_UPDATED_QUEUE);
  }

  @Bean
  public Binding assignmentPublishedBinding(
      Queue assignmentPublishedQueue,
      TopicExchange exchange
  ) {
    return createBinding(
        assignmentPublishedQueue, exchange, RabbitMqConfig.ASSIGNMENT_PUBLISHED_ROUTING_KEY);
  }

  @Bean
  public Binding assignmentScheduleUpdatedBinding(
      Queue assignmentScheduleUpdatedQueue,
      TopicExchange exchange
  ) {
    return createBinding(
        assignmentScheduleUpdatedQueue,
        exchange,
        RabbitMqConfig.ASSIGNMENT_SCHEDULE_UPDATED_ROUTING_KEY
    );
  }

  // Submission event queues
  @Bean
  public Queue submissionEvaluatedQueue() {
    return createQueue(RabbitMqConfig.NOTIFICATION_SUBMISSION_EVALUATED_QUEUE);
  }

  @Bean
  public Binding submissionEvaluatedBinding(
      Queue submissionEvaluatedQueue,
      TopicExchange exchange
  ) {
    return createBinding(
        submissionEvaluatedQueue,
        exchange,
        RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY
    );
  }

  // Support event queues
  @Bean
  public Queue supportRequestedQueue() {
    return createQueue(RabbitMqConfig.NOTIFICATION_SUPPORT_REQUESTED_QUEUE);
  }

  @Bean
  public Binding supportRequestedBinding(Queue supportRequestedQueue, TopicExchange exchange) {
    return createBinding(
        supportRequestedQueue, exchange, RabbitMqConfig.SUPPORT_REQUESTED_ROUTING_KEY);
  }
}
