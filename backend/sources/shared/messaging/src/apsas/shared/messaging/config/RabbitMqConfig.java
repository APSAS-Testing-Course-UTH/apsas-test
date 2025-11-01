package apsas.shared.messaging.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

  // Exchange
  public static final String EXCHANGE = "apsas.exchange";

  // Routing Keys - Centralized for all services
  public static final String USER_REGISTERED_ROUTING_KEY = "user.registered";
  public static final String PASSWORD_RESET_ROUTING_KEY = "password.reset";
  public static final String ASSIGNMENT_PUBLISHED_ROUTING_KEY = "assignment.published";
  public static final String ASSIGNMENT_SCHEDULE_UPDATED_ROUTING_KEY =
      "assignment.schedule.updated";
  public static final String SUBMISSION_CREATED_ROUTING_KEY = "submission.created";
  public static final String SUBMISSION_EVALUATED_ROUTING_KEY = "submission.evaluated";
  public static final String SUPPORT_REQUESTED_ROUTING_KEY = "support.requested";

  // Queue naming pattern: <service>.<domain>.<event>
  // Identity Service publishes: user.registered, password.reset
  // Content Service publishes: assignment.published, assignment.schedule.updated
  // Submission Service publishes: submission.created
  // Evaluation Service publishes: submission.evaluated

  // Notification Service consumes all events
  public static final String NOTIFICATION_USER_REGISTERED_QUEUE = "notification.user.registered";
  public static final String NOTIFICATION_PASSWORD_RESET_QUEUE = "notification.password.reset";
  public static final String NOTIFICATION_ASSIGNMENT_PUBLISHED_QUEUE =
      "notification.assignment.published";
  public static final String NOTIFICATION_ASSIGNMENT_SCHEDULE_UPDATED_QUEUE =
      "notification.assignment.schedule.updated";
  public static final String NOTIFICATION_SUBMISSION_EVALUATED_QUEUE =
      "notification.submission.evaluated";
  public static final String NOTIFICATION_SUPPORT_REQUESTED_QUEUE =
      "notification.support.requested";

  // Evaluation Service consumes submission.created
  public static final String EVALUATION_SUBMISSION_CREATED_QUEUE = "evaluation.submission.created";

  // Submission Service consumes submission.evaluated
  public static final String SUBMISSION_SUBMISSION_EVALUATED_QUEUE =
      "submission.submission.evaluated";

  @Bean
  public TopicExchange exchange() {
    return new TopicExchange(EXCHANGE);
  }

  @Bean
  public MessageConverter jsonMessageConverter() {
    return new Jackson2JsonMessageConverter();
  }
}
