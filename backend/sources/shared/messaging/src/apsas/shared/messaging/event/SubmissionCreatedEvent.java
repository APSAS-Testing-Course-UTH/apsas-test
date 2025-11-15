package apsas.shared.messaging.event;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Event: Sinh viên nộp bài (code). Submission Service công bố event này khi sinh viên nộp code.
 * Evaluation Service nhận event này để thực hiện đánh giá tự động.
 */
@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public final class SubmissionCreatedEvent extends BaseEvent {
  /** ID của bài nộp */
  private UUID submissionId;
  /** ID của bài tập */
  private UUID assignmentId;
  /** ID của sinh viên nộp */
  private UUID studentId;
  /** Mã code được nộp (Base64 encoded) */
  private String codeBase64;
  /** Ngôn ngữ lập trình */
  private String language;
}
