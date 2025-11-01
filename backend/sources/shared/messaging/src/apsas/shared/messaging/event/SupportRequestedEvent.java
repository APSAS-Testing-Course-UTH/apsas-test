package apsas.shared.messaging.event;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Event: Student has requested support.
 * Support Service publishes this event when a student creates a new support session.
 * Notification Service listens to this event to notify instructors.
 */
@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public final class SupportRequestedEvent extends BaseEvent {
  /** ID of the support session */
  private UUID sessionId;
  /** ID of the student requesting support */
  private UUID studentId;
  /** Email of the student */
  private String studentEmail;
  /** Full name of the student */
  private String studentName;
  /** Initial message from the student */
  private String initialMessage;
}
