package apsas.messaging.event;

import java.util.UUID;

public class SubmissionCreatedEvent {
  private UUID submissionId;
  private UUID assignmentId;
  private UUID studentId;
  private String code;
  private String language;

  public SubmissionCreatedEvent() {}

  public SubmissionCreatedEvent(
      UUID submissionId, UUID assignmentId, UUID studentId, String code, String language) {
    this.submissionId = submissionId;
    this.assignmentId = assignmentId;
    this.studentId = studentId;
    this.code = code;
    this.language = language;
  }

  // Getters and Setters
  public UUID getSubmissionId() {
    return submissionId;
  }

  public void setSubmissionId(UUID submissionId) {
    this.submissionId = submissionId;
  }

  public UUID getAssignmentId() {
    return assignmentId;
  }

  public void setAssignmentId(UUID assignmentId) {
    this.assignmentId = assignmentId;
  }

  public UUID getStudentId() {
    return studentId;
  }

  public void setStudentId(UUID studentId) {
    this.studentId = studentId;
  }

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public String getLanguage() {
    return language;
  }

  public void setLanguage(String language) {
    this.language = language;
  }
}