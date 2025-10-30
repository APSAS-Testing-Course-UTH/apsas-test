package apsas.submission.model.entity;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "submissions", schema = "submission")
public class Submission {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "assignment_id", nullable = false)
  private UUID assignmentId;

  @Column(name = "student_id", nullable = false)
  private UUID studentId;

  @Column(name = "submitted_at", nullable = false, updatable = false)
  private LocalDateTime submittedAt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 50)
  private SubmissionStatus status;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String code;

  @Column(nullable = false, length = 100)
  private String language;

  @Enumerated(EnumType.STRING)
  @Column(length = 50)
  private SubmissionResult result;

  @Column(precision = 5, scale = 2)
  private BigDecimal score;

  @Type(JsonType.class)
  @Column(name = "test_case_results", columnDefinition = "jsonb")
  private List<TestCaseResult> testCaseResults;

  @Column(name = "evaluated_at")
  private LocalDateTime evaluatedAt;

  @Column(columnDefinition = "TEXT")
  private String feedback;

  @PrePersist
  protected void onCreate() {
    submittedAt = LocalDateTime.now();
    if (status == null) {
      status = SubmissionStatus.PENDING;
    }
  }

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

  public String getFeedback() {
    return feedback;
  }

  public void setFeedback(String feedback) {
    this.feedback = feedback;
  }
}
