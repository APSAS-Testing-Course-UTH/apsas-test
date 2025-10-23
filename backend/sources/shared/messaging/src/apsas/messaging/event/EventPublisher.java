package apsas.messaging.event;

import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class EventPublisher {

  private final AmqpTemplate amqpTemplate;

  public EventPublisher(RabbitTemplate amqpTemplate) {
    this.amqpTemplate = amqpTemplate;
  }

  public void publish(String routingKey, Object event) {
    amqpTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, routingKey, event);
  }
}