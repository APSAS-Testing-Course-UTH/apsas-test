package apsas.notification.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(
    name = "rate_limits",
    schema = "notification",
    uniqueConstraints = {
      @UniqueConstraint(columnNames = {"user_id", "notification_type", "window_start"})
    })
public class RateLimit {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "notification_type", nullable = false, length = 50)
  private String notificationType;

  @Column(name = "sent_count", nullable = false)
  private Integer sentCount = 0;

  @Column(name = "window_start", nullable = false)
  private LocalDateTime windowStart;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
