package apsas.shared.messaging.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;

/**
 * Lớp cơ sở cho cấu hình messaging của mỗi service. Cung cấp phương thức trợ giúp để tạo queue và
 * binding tới exchange.
 */
public abstract class BaseMessagingConfig {

  /**
   * Tạo một queue bền vững (sẽ lưu trữ message ngay cả khi RabbitMQ khởi động lại).
   *
   * @param queueName tên của queue
   * @return queue được tạo
   */
  protected Queue createQueue(String queueName) {
    return new Queue(queueName, true);
  }

  /**
   * Tạo binding giữa queue và exchange với routing key.
   *
   * @param queue      queue cần binding
   * @param exchange   topic exchange
   * @param routingKey khóa định tuyến
   * @return binding được tạo
   */
  protected Binding createBinding(Queue queue, TopicExchange exchange, String routingKey) {
    return BindingBuilder.bind(queue).to(exchange).with(routingKey);
  }
}
