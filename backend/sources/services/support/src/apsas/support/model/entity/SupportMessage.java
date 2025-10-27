package apsas.support.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "support_messages", schema = "support")
public class SupportMessage {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "session_id", nullable = false)
  private SupportSession session;

  @Column(name = "sender_id", nullable = false)
  private UUID senderId;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;

  @Column(name = "is_instructor", nullable = false)
  private Boolean isInstructor;

  @Column(name = "is_read", nullable = false)
  private Boolean isRead = false;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
