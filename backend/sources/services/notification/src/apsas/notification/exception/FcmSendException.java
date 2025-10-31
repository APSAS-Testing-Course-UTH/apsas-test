package apsas.notification.exception;

public class FcmSendException extends RuntimeException {
  public FcmSendException(String message) {
    super(message);
  }

  public FcmSendException(String message, Throwable cause) {
    super(message, cause);
  }
}
