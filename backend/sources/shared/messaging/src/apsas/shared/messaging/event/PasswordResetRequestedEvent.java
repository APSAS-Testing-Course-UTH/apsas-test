package apsas.shared.messaging.event;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Event: Người dùng yêu cầu đặt lại mật khẩu. Identity Service công bố event này khi người dùng yêu
 * cầu reset mật khẩu. Notification Service nhận event này để gửi email reset mật khẩu.
 */
@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public final class PasswordResetRequestedEvent extends BaseEvent {
  /** Email của người dùng */
  private String email;
  /** Tên của người dùng */
  private String firstName;
  /** Token để xác nhận yêu cầu reset */
  private String resetToken;
}
