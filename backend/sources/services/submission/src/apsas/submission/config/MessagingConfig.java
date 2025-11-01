package apsas.submission.config;

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
  public Queue submissionEvaluatedQueue() {
    return createQueue(RabbitMqConfig.SUBMISSION_SUBMISSION_EVALUATED_QUEUE);
  }

  @Bean
  public Binding submissionEvaluatedBinding(
      Queue submissionEvaluatedQueue, TopicExchange exchange) {
    return createBinding(
        submissionEvaluatedQueue,
        exchange,
        RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY
    );
  }
}
