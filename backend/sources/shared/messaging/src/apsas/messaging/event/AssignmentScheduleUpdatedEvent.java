package apsas.messaging.event;

import java.time.LocalDateTime;
import java.util.UUID;

public class AssignmentScheduleUpdatedEvent {
  private UUID assignmentId;
  private LocalDateTime startDate;
  private LocalDateTime dueDate;
  private LocalDateTime updatedAt;

  public AssignmentScheduleUpdatedEvent() {}

  public AssignmentScheduleUpdatedEvent(
      UUID assignmentId, LocalDateTime startDate, LocalDateTime dueDate, LocalDateTime updatedAt) {
    this.assignmentId = assignmentId;
    this.startDate = startDate;
    this.dueDate = dueDate;
    this.updatedAt = updatedAt;
  }

  // Getters and Setters
  public UUID getAssignmentId() {
    return assignmentId;
  }

  public void setAssignmentId(UUID assignmentId) {
    this.assignmentId = assignmentId;
  }

  public LocalDateTime getStartDate() {
    return startDate;
  }

  public void setStartDate(LocalDateTime startDate) {
    this.startDate = startDate;
  }

  public LocalDateTime getDueDate() {
    return dueDate;
  }

  public void setDueDate(LocalDateTime dueDate) {
    this.dueDate = dueDate;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }
}
