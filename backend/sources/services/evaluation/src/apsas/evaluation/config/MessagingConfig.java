package apsas.evaluation.config;

import apsas.messaging.event.RabbitMQConfig;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ configuration for Evaluation Service
 */
@Configuration
public class MessagingConfig {

  private static final String SUBMISSION_CREATED_QUEUE = "evaluation.submission.created";

  @Bean
  public Queue submissionCreatedQueue() {
    return new Queue(SUBMISSION_CREATED_QUEUE, true);
  }

  @Bean
  public Binding submissionCreatedBinding(Queue submissionCreatedQueue, TopicExchange exchange) {
    return BindingBuilder.bind(submissionCreatedQueue)
        .to(exchange)
        .with(RabbitMQConfig.SUBMISSION_CREATED_ROUTING_KEY);
  }
}
