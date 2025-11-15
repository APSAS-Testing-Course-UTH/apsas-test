package apsas.portal.admin.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class CustomPasswordEncoder implements PasswordEncoder {
  private final JwtDecoder jwtDecoder;

  @Override
  public String encode(CharSequence rawPassword) {
    return rawPassword.toString();
  }

  @Override
  public boolean matches(CharSequence rawPassword, String encodedPassword) {
    try {
      var jwt = jwtDecoder.decode(rawPassword.toString());
      return jwt != null;
    } catch (Exception e) {
      return false;
    }
  }
}
