package apsas.notification.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MessagingConfig {

  public static final String EXCHANGE = "apsas.exchange";

  // Queue names
  public static final String USER_REGISTERED_QUEUE = "notification.user.registered";
  public static final String PASSWORD_RESET_QUEUE = "notification.password.reset";
  public static final String ASSIGNMENT_PUBLISHED_QUEUE = "notification.assignment.published";
  public static final String ASSIGNMENT_SCHEDULE_UPDATED_QUEUE =
      "notification.assignment.schedule.updated";
  public static final String SUBMISSION_EVALUATED_QUEUE = "notification.submission.evaluated";

  // Routing keys
  public static final String USER_REGISTERED_ROUTING_KEY = "user.registered";
  public static final String PASSWORD_RESET_ROUTING_KEY = "password.reset";
  public static final String ASSIGNMENT_PUBLISHED_ROUTING_KEY = "assignment.published";
  public static final String ASSIGNMENT_SCHEDULE_UPDATED_ROUTING_KEY =
      "assignment.schedule.updated";
  public static final String SUBMISSION_EVALUATED_ROUTING_KEY = "submission.evaluated";

  // User event queues
  @Bean
  public Queue userRegisteredQueue() {
    return new Queue(USER_REGISTERED_QUEUE, true);
  }

  @Bean
  public Queue passwordResetQueue() {
    return new Queue(PASSWORD_RESET_QUEUE, true);
  }

  @Bean
  public Binding userRegisteredBinding(Queue userRegisteredQueue, TopicExchange exchange) {
    return BindingBuilder.bind(userRegisteredQueue).to(exchange).with(USER_REGISTERED_ROUTING_KEY);
  }

  @Bean
  public Binding passwordResetBinding(Queue passwordResetQueue, TopicExchange exchange) {
    return BindingBuilder.bind(passwordResetQueue).to(exchange).with(PASSWORD_RESET_ROUTING_KEY);
  }

  // Assignment event queues
  @Bean
  public Queue assignmentPublishedQueue() {
    return new Queue(ASSIGNMENT_PUBLISHED_QUEUE, true);
  }

  @Bean
  public Queue assignmentScheduleUpdatedQueue() {
    return new Queue(ASSIGNMENT_SCHEDULE_UPDATED_QUEUE, true);
  }

  @Bean
  public Binding assignmentPublishedBinding(
      Queue assignmentPublishedQueue, TopicExchange exchange) {
    return BindingBuilder.bind(assignmentPublishedQueue)
        .to(exchange)
        .with(ASSIGNMENT_PUBLISHED_ROUTING_KEY);
  }

  @Bean
  public Binding assignmentScheduleUpdatedBinding(
      Queue assignmentScheduleUpdatedQueue, TopicExchange exchange) {
    return BindingBuilder.bind(assignmentScheduleUpdatedQueue)
        .to(exchange)
        .with(ASSIGNMENT_SCHEDULE_UPDATED_ROUTING_KEY);
  }

  // Submission event queues
  @Bean
  public Queue submissionEvaluatedQueue() {
    return new Queue(SUBMISSION_EVALUATED_QUEUE, true);
  }

  @Bean
  public Binding submissionEvaluatedBinding(
      Queue submissionEvaluatedQueue, TopicExchange exchange) {
    return BindingBuilder.bind(submissionEvaluatedQueue)
        .to(exchange)
        .with(SUBMISSION_EVALUATED_ROUTING_KEY);
  }
}
