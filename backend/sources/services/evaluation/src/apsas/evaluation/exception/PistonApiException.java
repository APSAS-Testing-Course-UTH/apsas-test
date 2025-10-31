package apsas.evaluation.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Exception thrown when Piston API communication fails
 */
public class PistonApiException extends ResponseStatusException {
  public PistonApiException(String message) {
    super(HttpStatus.SERVICE_UNAVAILABLE, message);
  }

  public PistonApiException(String message, Throwable cause) {
    super(HttpStatus.SERVICE_UNAVAILABLE, message, cause);
  }
}
