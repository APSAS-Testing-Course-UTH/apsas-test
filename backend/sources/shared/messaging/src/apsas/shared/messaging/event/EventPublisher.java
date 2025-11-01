package apsas.shared.messaging.event;

import apsas.shared.messaging.config.RabbitMqConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.stereotype.Service;

/**
 * Service để xuất bản event tới RabbitMQ. Gửi tất cả các event tới topic exchange với routing key
 * thích hợp. Được sử dụng bởi tất cả các service để xuất bản event.
 */
@Service
@RequiredArgsConstructor
public class EventPublisher {
  /** AMQP template để gửi message */
  private final AmqpTemplate amqpTemplate;

  /**
   * Xuất bản một event tới topic exchange với routing key được chỉ định.
   *
   * @param routingKey khóa định tuyến để xác định queue sẽ nhận event
   * @param event      event được xuất bản
   */
  public void publish(String routingKey, BaseEvent event) {
    amqpTemplate.convertAndSend(RabbitMqConfig.EXCHANGE, routingKey, event);
  }
}
