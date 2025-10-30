package apsas.evaluation.exception;

/** Exception thrown when Piston API communication fails */
public class PistonApiException extends RuntimeException {
  public PistonApiException(String message) {
    super(message);
  }

  public PistonApiException(String message, Throwable cause) {
    super(message, cause);
  }
}
