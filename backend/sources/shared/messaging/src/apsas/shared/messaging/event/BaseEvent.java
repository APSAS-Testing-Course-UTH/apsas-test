package apsas.shared.messaging.event;

import java.io.Serializable;
import java.time.Instant;
import lombok.Getter;

/**
 * Lớp cơ sở cho tất cả các event. Cung cấp trường timestamp để theo dõi thời gian event được tạo.
 */
@Getter
public abstract class BaseEvent implements Serializable {
  /** Dấu thời gian event được tạo */
  private final Instant timestamp;

  /**
   * Khởi tạo event với timestamp hiện tại.
   */
  protected BaseEvent() {
    this.timestamp = Instant.now();
  }
}
