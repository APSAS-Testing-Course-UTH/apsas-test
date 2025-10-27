package apsas.shared.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Exception được ném khi người dùng chưa được ủy quyền truy cập tài nguyên. */
public class UnauthorizedException extends ResponseStatusException {
  public UnauthorizedException(String message) {
    super(HttpStatus.UNAUTHORIZED, message);
  }

  public UnauthorizedException(String message, Throwable cause) {
    super(HttpStatus.UNAUTHORIZED, message, cause);
  }
}
