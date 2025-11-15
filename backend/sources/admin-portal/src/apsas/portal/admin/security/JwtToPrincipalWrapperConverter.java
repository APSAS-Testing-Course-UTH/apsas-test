package apsas.portal.admin.security;

import apsas.shared.security.JwtClaims;
import apsas.shared.security.UserPrincipal;
import java.util.UUID;
import org.jspecify.annotations.NonNull;
import org.jspecify.annotations.Nullable;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class JwtToPrincipalWrapperConverter implements Converter<Jwt, PrincipalWrapper> {
  @Override
  public @Nullable PrincipalWrapper convert(@NonNull Jwt jwt) {
    var userId = jwt.getClaimAsString(JwtClaims.USER_ID);
    var email = jwt.getClaimAsString(JwtClaims.EMAIL);
    var firstName = jwt.getClaimAsString(JwtClaims.FIRST_NAME);
    var lastName = jwt.getClaimAsString(JwtClaims.LAST_NAME);
    var isActive = jwt.getClaimAsBoolean(JwtClaims.IS_ACTIVE);
    var role = jwt.getClaimAsString(JwtClaims.ROLE);
    var principal = new UserPrincipal(
        UUID.fromString(userId),
        email,
        firstName,
        lastName,
        role,
        isActive
    );
    return new PrincipalWrapper(principal, jwt);
  }
}
