package apsas.evaluation.config;

import apsas.shared.messaging.config.BaseMessagingConfig;
import apsas.shared.messaging.config.RabbitMqConfig;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MessagingConfig extends BaseMessagingConfig {

  @Bean
  public Queue submissionCreatedQueue() {
    return createQueue(RabbitMqConfig.EVALUATION_SUBMISSION_CREATED_QUEUE);
  }

  @Bean
  public Binding submissionCreatedBinding(Queue submissionCreatedQueue, TopicExchange exchange) {
    return createBinding(
        submissionCreatedQueue,
        exchange,
        RabbitMqConfig.SUBMISSION_CREATED_ROUTING_KEY
    );
  }
}
