package apsas.identity.security;

import apsas.identity.model.entity.User;
import apsas.shared.security.JwtClaims;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {
  private final JwtEncoder jwtEncoder;

  @Value("${jwt.issuer}")
  private String jwtIssuer;

  @Value("${jwt.expiration}")
  private long jwtExpiration;

  public JwtTokenProvider(JwtEncoder jwtEncoder) {
    this.jwtEncoder = jwtEncoder;
  }

  public String generateToken(User user) {
    var now = Instant.now();
    return jwtEncoder
        .encode(
            JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(),
                JwtClaimsSet.builder()
                    .issuer(jwtIssuer)
                    .issuedAt(now)
                    .expiresAt(now.plusSeconds(jwtExpiration))
                    .subject(user.getId().toString())
                    .claim(JwtClaims.USER_ID, user.getId())
                    .claim(JwtClaims.EMAIL, user.getEmail())
                    .claim(JwtClaims.ROLE, user.getRole())
                    .claim(JwtClaims.IS_ACTIVE, user.getIsActive())
                    .claim(JwtClaims.FIRST_NAME, user.getFirstName())
                    .claim(JwtClaims.LAST_NAME, user.getLastName())
                    .build()))
        .getTokenValue();
  }
}
