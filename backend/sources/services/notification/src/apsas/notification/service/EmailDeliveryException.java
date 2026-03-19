package apsas.notification.service;

/** Domain-specific exception for failures while composing or sending notification emails. */
public class EmailDeliveryException extends RuntimeException {
  public EmailDeliveryException(String message, Throwable cause) {
    super(message, cause);
  }
}