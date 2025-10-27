package apsas.shared.common.exception;

import java.util.stream.Collectors;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
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
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
  @Nullable
  @Override
  protected ResponseEntity<Object> handleMethodArgumentNotValid(
      @NotNull MethodArgumentNotValidException ex,
      @NotNull HttpHeaders headers,
      @NotNull HttpStatusCode status,
      @NotNull WebRequest request) {
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
                            : "Giá trị không hợp lệ"));
    body.setProperty("errors", errors);
    return handleExceptionInternal(ex, body, headers, status, request);
  }
}
