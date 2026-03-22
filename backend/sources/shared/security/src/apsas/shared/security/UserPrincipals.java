package apsas.shared.security;

import apsas.shared.exception.UserPrincipalException;
import jakarta.servlet.http.HttpServletRequest;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Base64;
import java.util.Optional;
import lombok.experimental.UtilityClass;
import org.springframework.http.server.reactive.ServerHttpRequest;

/**
 * Các tiện ích liên quan đến UserPrincipal và xử lý thông tin người dùng trong header của yêu cầu
 * HTTP.
 */
@UtilityClass
public class UserPrincipals {
  /** Tên header chứa thông tin người dùng được mã hóa. */
  public static final String USER_INFO_HEADER = "X-User-Info";

  /** Trích xuất thông tin người dùng từ header của yêu cầu HTTP. */
  public static Optional<UserPrincipal> fromHeader(HttpServletRequest request) {
    var userInfo = request.getHeader(USER_INFO_HEADER);
    if (userInfo == null || userInfo.isEmpty()) {
      return Optional.empty();
    }
    try {
      var decoded = Base64.getDecoder().decode(userInfo);
      return Optional.of(deserialize(decoded));
    } catch (IllegalArgumentException | UserPrincipalException e) {
      // Base64 decoding failed
      return Optional.empty();
    }
  }

  /** Thêm thông tin người dùng vào header của yêu cầu HTTP (dùng trong Gateway). */
  public static ServerHttpRequest.Builder enrichRequestWithUserInfo(
      ServerHttpRequest.Builder request, UserPrincipal userPrincipal) {
    return toBase64(userPrincipal)
        .map(base64 -> request.header(USER_INFO_HEADER, base64))
        .orElse(request);
  }

  /** Chuyển đổi UserPrincipal thành chuỗi Base64 để lưu trong header. */
  public static Optional<String> toBase64(UserPrincipal userPrincipal) {
    try {
      return Optional.ofNullable(Base64.getEncoder().encodeToString(serialize(userPrincipal)));
    } catch (UserPrincipalException e) {
      return Optional.empty();
    }
  }

  /** Chuyển đổi UserPrincipal thành mảy byte để phục vụ việc serialize. */
  private static byte[] serialize(UserPrincipal userPrincipal) throws UserPrincipalException {
    try (var byteStream = new ByteArrayOutputStream();
        var objectStream = new ObjectOutputStream(byteStream)) {
      objectStream.writeObject(userPrincipal);
      objectStream.flush();
      return byteStream.toByteArray();
    } catch (IOException e) {
      throw new UserPrincipalException("Failed to serialize UserPrincipal", e);
    }
  }

  /** Chuyển đổi mảng byte thành UserPrincipal để phục vụ việc deserialize. */
  private static UserPrincipal deserialize(byte[] data) throws UserPrincipalException {
    try (var byteStream = new ByteArrayInputStream(data);
        var objectStream = new ObjectInputStream(byteStream)) {
      return (UserPrincipal) objectStream.readObject();
    } catch (IOException | ClassNotFoundException e) {
      throw new UserPrincipalException("Failed to deserialize UserPrincipal", e);
    }
  }
}
