package apsas.shared.messaging.event;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Event: Lịch của bài tập được cập nhật. Content Service công bố event này khi ngày bắt đầu hoặc
 * hạn chót thay đổi. Notification Service nhận event này để thông báo cho sinh viên.
 */
@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public final class AssignmentScheduleUpdatedEvent extends BaseEvent {
  /** ID của bài tập */
  private UUID assignmentId;
  /** Ngày bắt đầu */
  private LocalDateTime startDate;
  /** Ngày hạn chót nộp bài */
  private LocalDateTime dueDate;
  /** Thời gian cập nhật */
  private LocalDateTime updatedAt;
}
