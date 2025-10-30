package apsas.messaging.event;

import java.time.LocalDateTime;
import java.util.UUID;

public class AssignmentPublishedEvent {
  private UUID assignmentId;
  private String title;
  private LocalDateTime publishedAt;

  public AssignmentPublishedEvent() {}

  public AssignmentPublishedEvent(UUID assignmentId, String title, LocalDateTime publishedAt) {
    this.assignmentId = assignmentId;
    this.title = title;
    this.publishedAt = publishedAt;
  }

  // Getters and Setters
  public UUID getAssignmentId() {
    return assignmentId;
  }

  public void setAssignmentId(UUID assignmentId) {
    this.assignmentId = assignmentId;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public LocalDateTime getPublishedAt() {
    return publishedAt;
  }

  public void setPublishedAt(LocalDateTime publishedAt) {
    this.publishedAt = publishedAt;
  }
}
