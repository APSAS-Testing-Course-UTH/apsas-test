package apsas.submission.model.entity;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;

@Setter
@Getter
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

}
