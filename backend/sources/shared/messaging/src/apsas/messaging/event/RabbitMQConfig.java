package apsas.messaging.event;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

  public static final String EXCHANGE = "apsas.exchange";

  public static final String USER_REGISTERED_ROUTING_KEY = "user.registered";
  public static final String PASSWORD_RESET_ROUTING_KEY = "password.reset";

  public static final String ASSIGNMENT_PUBLISHED_ROUTING_KEY = "assignment.published";
  public static final String ASSIGNMENT_SCHEDULE_UPDATED_ROUTING_KEY =
      "assignment.schedule.updated";

  public static final String SUBMISSION_CREATED_ROUTING_KEY = "submission.created";
  public static final String SUBMISSION_EVALUATED_ROUTING_KEY = "submission.evaluated";

  @Bean
  public TopicExchange exchange() {
    return new TopicExchange(EXCHANGE);
  }

  @Bean
  public MessageConverter jsonMessageConverter() {
    return new Jackson2JsonMessageConverter();
  }
}
