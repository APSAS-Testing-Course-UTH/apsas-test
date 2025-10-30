package apsas.messaging.event;

import apsas.messaging.model.SubmissionResult;
import apsas.messaging.model.SubmissionStatus;
import apsas.messaging.model.TestCaseResult;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class SubmissionEvaluatedEvent {
  private UUID submissionId;
  private SubmissionStatus status;
  private SubmissionResult result;
  private BigDecimal score;
  private List<TestCaseResult> testCaseResults;
  private LocalDateTime evaluatedAt;

  public SubmissionEvaluatedEvent() {}

  public SubmissionEvaluatedEvent(
      UUID submissionId,
      SubmissionStatus status,
      SubmissionResult result,
      BigDecimal score,
      List<TestCaseResult> testCaseResults,
      LocalDateTime evaluatedAt) {
    this.submissionId = submissionId;
    this.status = status;
    this.result = result;
    this.score = score;
    this.testCaseResults = testCaseResults;
    this.evaluatedAt = evaluatedAt;
  }

  // Getters and Setters
  public UUID getSubmissionId() {
    return submissionId;
  }

  public void setSubmissionId(UUID submissionId) {
    this.submissionId = submissionId;
  }

  public SubmissionStatus getStatus() {
    return status;
  }

  public void setStatus(SubmissionStatus status) {
    this.status = status;
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

  public List<TestCaseResult> getTestCaseResults() {
    return testCaseResults;
  }

  public void setTestCaseResults(List<TestCaseResult> testCaseResults) {
    this.testCaseResults = testCaseResults;
  }

  public LocalDateTime getEvaluatedAt() {
    return evaluatedAt;
  }

  public void setEvaluatedAt(LocalDateTime evaluatedAt) {
    this.evaluatedAt = evaluatedAt;
  }
}
