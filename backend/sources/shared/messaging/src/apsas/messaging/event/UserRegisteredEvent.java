package apsas.messaging.event;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserRegisteredEvent {

  private UUID userId;
  private String email;
  private String firstName;
  private String lastName;
  private String verificationToken;
  private LocalDateTime timestamp;

  public UserRegisteredEvent() {
    this.timestamp = LocalDateTime.now();
  }

  public UserRegisteredEvent(UUID userId, String email, String firstName, String lastName, String verificationToken) {
    this.userId = userId;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.verificationToken = verificationToken;
    this.timestamp = LocalDateTime.now();
  }

  // Getters and Setters
  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

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

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getVerificationToken() {
    return verificationToken;
  }

  public void setVerificationToken(String verificationToken) {
    this.verificationToken = verificationToken;
  }

  public LocalDateTime getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(LocalDateTime timestamp) {
    this.timestamp = timestamp;
  }
}