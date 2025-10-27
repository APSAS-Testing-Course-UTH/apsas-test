package apsas.shared.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Exception được ném khi tài nguyên không được tìm thấy. */
public class NotFoundException extends ResponseStatusException {
  public NotFoundException(String message) {
    super(HttpStatus.NOT_FOUND, message);
  }

  public NotFoundException(String message, Throwable cause) {
    super(HttpStatus.NOT_FOUND, message, cause);
  }
}
