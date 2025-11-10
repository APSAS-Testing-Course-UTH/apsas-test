package apsas.shared.exception;

import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Xử lý ngoại lệ toàn cục cho các controller trong ứng dụng web.
 *
 * <p>Tuân thủ chuẩn RFC 9457 cho chi tiết lỗi trong phản hồi HTTP.
 */
@RestControllerAdvice
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@Slf4j
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
  @Override
  protected ResponseEntity<Object> handleMethodArgumentNotValid(
      MethodArgumentNotValidException ex,
      @NonNull
      HttpHeaders headers,
      @NonNull
      HttpStatusCode status,
      @NonNull
      WebRequest request
  ) {
    var body = ProblemDetail.forStatus(status);
    body.setTitle("Lỗi xác thực dữ liệu");
    body.setDetail("Dữ liệu đầu vào không hợp lệ.");
    var errors =
        ex.getBindingResult().getFieldErrors().stream()
            .collect(
                Collectors.toMap(
                    FieldError::getField,
                    fieldError ->
                        fieldError.getDefaultMessage() != null
                            ? fieldError.getDefaultMessage()
                            : "Giá trị không hợp lệ"
                ));
    body.setProperty("errors", errors);
    return handleExceptionInternal(ex, body, headers, status, request);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Object> handleAllExceptions(Exception ex, WebRequest request) {
    log.error("Unhandled exception occurred: ", ex);
    var status = HttpStatusCode.valueOf(500);
    var body = ProblemDetail.forStatusAndDetail(status, ex.getMessage());
    body.setTitle("Lỗi máy chủ nội bộ");
    body.setDetail(ex.getMessage());
    return handleExceptionInternal(ex, body, new HttpHeaders(), status, request);
  }

  @ExceptionHandler(AuthorizationDeniedException.class)
  public ResponseEntity<Object> handleAuthorizationDeniedException(
      AuthorizationDeniedException ex,
      WebRequest request
  ) {
    var status = HttpStatusCode.valueOf(403);
    var body = ProblemDetail.forStatusAndDetail(status, ex.getMessage());
    body.setTitle("Quyền truy cập bị từ chối");
    body.setDetail(ex.getMessage());
    return handleExceptionInternal(ex, body, new HttpHeaders(), status, request);
  }
}
