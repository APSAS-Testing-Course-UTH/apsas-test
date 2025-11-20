package apsas.support.security;

import apsas.shared.security.HeaderAuthenticationToken;
import apsas.shared.security.JwtClaims;
import apsas.shared.security.UserPrincipal;
import java.util.UUID;
import javax.crypto.spec.SecretKeySpec;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

/**
 * Service for authenticating WebSocket connections using JWT tokens. This service decodes JWT
 * tokens from WebSocket connection headers and creates authentication tokens containing user
 * principals.
 */
@Service
@Slf4j
public class WebSocketAuthenticationService {
  private final JwtDecoder jwtDecoder;

  public WebSocketAuthenticationService(
      @Value("${jwt.secret}")
      String jwtSecret
  ) {
    SecretKeySpec secretKey = new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA256");
    this.jwtDecoder = NimbusJwtDecoder.withSecretKey(secretKey).build();
  }

  /**
   * Authenticates a JWT token and returns an authentication token.
   *
   * @param token JWT token string (with or without "Bearer " prefix)
   * @return HeaderAuthenticationToken if successful, null if authentication fails
   */
  @Nullable
  public HeaderAuthenticationToken authenticate(String token) {
    if (token == null || token.isEmpty()) {
      log.warn("Empty JWT token provided for WebSocket authentication");
      return null;
    }

    // Remove "Bearer " prefix if present
    String jwtToken = token.startsWith("Bearer ") ? token.substring(7) : token;

    try {
      Jwt jwt = jwtDecoder.decode(jwtToken);
      UserPrincipal userPrincipal = extractUserPrincipal(jwt);

      if (userPrincipal == null) {
        log.error("Failed to extract user principal from JWT");
        return null;
      }

      log.debug(
          "WebSocket authenticated user: {} ({})",
          userPrincipal.email(),
          userPrincipal.role()
      );

      return new HeaderAuthenticationToken(userPrincipal);

    } catch (JwtException e) {
      log.error("JWT validation failed for WebSocket connection", e);
      return null;
    } catch (Exception e) {
      log.error("Unexpected error during WebSocket JWT authentication", e);
      return null;
    }
  }

  /**
   * Extracts UserPrincipal from JWT claims.
   *
   * @param jwt Decoded JWT token
   * @return UserPrincipal object or null if extraction fails
   */
  @Nullable
  private UserPrincipal extractUserPrincipal(Jwt jwt) {
    try {
      String userId = jwt.getClaimAsString(JwtClaims.USER_ID);
      String email = jwt.getClaimAsString(JwtClaims.EMAIL);
      String firstName = jwt.getClaimAsString(JwtClaims.FIRST_NAME);
      String lastName = jwt.getClaimAsString(JwtClaims.LAST_NAME);
      Boolean isActive = jwt.getClaimAsBoolean(JwtClaims.IS_ACTIVE);
      String role = jwt.getClaimAsString(JwtClaims.ROLE);

      if (userId == null || email == null || role == null) {
        log.error("Missing required JWT claims: userId={}, email={}, role={}", userId, email, role);
        return null;
      }

      return new UserPrincipal(
          UUID.fromString(userId),
          email,
          firstName != null ? firstName : "",
          lastName != null ? lastName : "",
          role,
          isActive != null && isActive
      );
    } catch (Exception e) {
      log.error("Error extracting user principal from JWT claims", e);
      return null;
    }
  }
}
