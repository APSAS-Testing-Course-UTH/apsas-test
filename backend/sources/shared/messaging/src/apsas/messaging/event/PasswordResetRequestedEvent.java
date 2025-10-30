package apsas.messaging.event;

import java.time.LocalDateTime;

public class PasswordResetRequestedEvent {

  private String email;
  private String firstName;
  private String resetToken;
  private LocalDateTime timestamp;

  public PasswordResetRequestedEvent() {
    this.timestamp = LocalDateTime.now();
  }

  public PasswordResetRequestedEvent(String email, String firstName, String resetToken) {
    this.email = email;
    this.firstName = firstName;
    this.resetToken = resetToken;
    this.timestamp = LocalDateTime.now();
  }

  // Getters and Setters
  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getResetToken() {
    return resetToken;
  }

  public void setResetToken(String resetToken) {
    this.resetToken = resetToken;
  }

  public LocalDateTime getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(LocalDateTime timestamp) {
    this.timestamp = timestamp;
  }
}
