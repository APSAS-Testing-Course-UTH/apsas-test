package apsas.shared.security;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Exception được ném khi có lỗi trong việc xử lý thông tin người dùng (UserPrincipal). */
public class UserPrincipalException extends ResponseStatusException {

  public UserPrincipalException(String message, Throwable cause) {
    super(HttpStatus.UNAUTHORIZED, message, cause);
  }
}
