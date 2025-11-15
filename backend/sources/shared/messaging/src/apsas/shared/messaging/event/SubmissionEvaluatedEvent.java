package apsas.shared.messaging.event;

import apsas.shared.models.submission.TestCaseResultResponse;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Event: Bài nộp đã được đánh giá xong. Evaluation Service công bố event này sau khi chạy xong tất
 * cả các test case. Notification Service nhận event này để gửi kết quả cho sinh viên. Submission
 * Service nhận event này để cập nhật trạng thái.
 */
@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public final class SubmissionEvaluatedEvent extends BaseEvent {
  /** ID của bài nộp */
  private UUID submissionId;
  /** Trạng thái (PENDING, EVALUATED, FAILED) */
  private Status status;
  /** Kết quả (PASSED, FAILED, PARTIAL) */
  private Result result;
  /** Điểm số (0-100) */
  private BigDecimal score;
  /** Kết quả chi tiết từng test case */
  private List<TestCaseResultResponse> testCaseResults;
  /** Thời gian hoàn thành đánh giá */
  private LocalDateTime evaluatedAt;

  public enum Result {
    PASSED,
    FAILED,
    PARTIAL
  }

  public enum Status {
    PENDING,
    EVALUATED,
    FAILED
  }
}
