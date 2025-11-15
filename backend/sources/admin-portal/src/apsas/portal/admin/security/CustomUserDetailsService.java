package apsas.portal.admin.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class CustomUserDetailsService implements UserDetailsService {
  private final JwtDecoder jwtDecoder;
  private final JwtToPrincipalWrapperConverter jwtToPrincipalWrapperConverter;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    try {
      var jwt = jwtDecoder.decode(username);
      return jwtToPrincipalWrapperConverter.convert(jwt);
    } catch (Exception e) {
      throw new UsernameNotFoundException("Invalid JWT jwt", e);
    }
  }
}
