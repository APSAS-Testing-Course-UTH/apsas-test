package apsas.notification.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "preferences", schema = "notification")
public class NotificationPreferences {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "user_id", nullable = false, unique = true)
  private UUID userId;

  @Column(name = "email_enabled", nullable = false)
  private Boolean emailEnabled = true;

  @Column(name = "push_enabled", nullable = false)
  private Boolean pushEnabled = false;

  // Email preferences by type
  @Column(name = "email_assignment_published", nullable = false)
  private Boolean emailAssignmentPublished = true;

  @Column(name = "email_submission_evaluated", nullable = false)
  private Boolean emailSubmissionEvaluated = true;

  // Push preferences by type
  @Column(name = "push_assignment_published", nullable = false)
  private Boolean pushAssignmentPublished = true;

  @Column(name = "push_submission_evaluated", nullable = false)
  private Boolean pushSubmissionEvaluated = true;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
