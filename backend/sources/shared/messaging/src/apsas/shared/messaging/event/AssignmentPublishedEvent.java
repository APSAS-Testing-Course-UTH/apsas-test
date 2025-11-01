package apsas.shared.messaging.event;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Event: Bài tập được xuất bản. Content Service công bố event này khi bài tập được xuất bản công
 * khai. Notification Service nhận event này để thông báo cho sinh viên.
 */
@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public final class AssignmentPublishedEvent extends BaseEvent {
  /** ID của bài tập */
  private UUID assignmentId;
  /** Tiêu đề của bài tập */
  private String title;
  /** Thời gian xuất bản */
  private LocalDateTime publishedAt;
}
