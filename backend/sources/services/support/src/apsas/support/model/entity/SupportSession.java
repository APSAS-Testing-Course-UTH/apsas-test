package apsas.support.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "support_sessions", schema = "support")
public class SupportSession {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "student_id", nullable = false)
  private UUID studentId;

  @Column(name = "instructor_id")
  private UUID instructorId;

  @Column(name = "is_closed", nullable = false)
  private Boolean isClosed = false;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "closed_at")
  private LocalDateTime closedAt;

  @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("createdAt ASC")
  private List<SupportMessage> messages = new ArrayList<>();

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }

  public void addMessage(SupportMessage message) {
    messages.add(message);
    message.setSession(this);
  }

  public void removeMessage(SupportMessage message) {
    messages.remove(message);
    message.setSession(null);
  }
}
