package apsas.shared.messaging.event;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Event: Người dùng đã đăng ký. Identity Service công bố event này khi người dùng đăng ký mới.
 * Notification Service nhận event này để gửi email xác minh.
 */
@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public final class UserRegisteredEvent extends BaseEvent {
  /** ID của người dùng mới */
  private UUID userId;
  /** Email của người dùng */
  private String email;
  /** Tên của người dùng */
  private String firstName;
  /** Họ của người dùng */
  private String lastName;
  /** Token để xác minh email */
  private String verificationToken;
}
