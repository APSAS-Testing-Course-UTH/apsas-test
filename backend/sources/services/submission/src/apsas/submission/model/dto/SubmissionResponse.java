package apsas.submission.model.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import apsas.submission.model.entity.SubmissionResult;
import apsas.submission.model.entity.SubmissionStatus;

public class SubmissionResponse {
  private UUID id;
  private UUID assignmentId;
  private UUID studentId;
  private LocalDateTime submittedAt;
  private SubmissionStatus status;
  private String code;
  private String language;
  private SubmissionResult result;
  private BigDecimal score;
  private List<TestCaseResultResponse> testCaseResults;
  private LocalDateTime evaluatedAt;
  private String feedback;

  // Getters and Setters
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
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

  public LocalDateTime getSubmittedAt() {
    return submittedAt;
  }

  public void setSubmittedAt(LocalDateTime submittedAt) {
    this.submittedAt = submittedAt;
  }

  public SubmissionStatus getStatus() {
    return status;
  }

  public void setStatus(SubmissionStatus status) {
    this.status = status;
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

  public SubmissionResult getResult() {
    return result;
  }

  public void setResult(SubmissionResult result) {
    this.result = result;
  }

  public BigDecimal getScore() {
    return score;
  }

  public void setScore(BigDecimal score) {
    this.score = score;
  }

  public List<TestCaseResultResponse> getTestCaseResults() {
    return testCaseResults;
  }

  public void setTestCaseResults(List<TestCaseResultResponse> testCaseResults) {
    this.testCaseResults = testCaseResults;
  }

  public LocalDateTime getEvaluatedAt() {
    return evaluatedAt;
  }

  public void setEvaluatedAt(LocalDateTime evaluatedAt) {
    this.evaluatedAt = evaluatedAt;
  }

  public String getFeedback() {
    return feedback;
  }

  public void setFeedback(String feedback) {
    this.feedback = feedback;
  }
}
