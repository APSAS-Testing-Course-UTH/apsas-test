package apsas.support.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import apsas.shared.security.HeaderAuthenticationToken;
import apsas.shared.security.JwtClaims;
import apsas.shared.security.UserPrincipal;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;

/**
 * Unit test cho xác thực WebSocket bằng JWT.
 */
@Tag("unit")
@Feature("WebSocket Authentication")
class WebSocketAuthenticationServiceTest {

  private static final String JWT_SIGNING_KEY = "01234567890123456789012345678901";
  private static final String USER_ROLE = "STUDENT";
  private static final String USER_EMAIL = "student@example.com";
  private static final String FIRST_NAME = "Minh";
  private static final String LAST_NAME = "Nguyen";

  private final WebSocketAuthenticationService authenticationService =
      new WebSocketAuthenticationService(JWT_SIGNING_KEY);

  @ParameterizedTest
  @NullAndEmptySource
  @DisplayName("authenticate returns null when token is null or empty")
  @Story("Authenticate JWT token")
  void authenticateShouldReturnNullWhenTokenIsNullOrEmpty(String token) {
    HeaderAuthenticationToken actual = authenticationService.authenticate(token);

    assertNull(actual);
  }

  @Test
  @DisplayName("authenticate returns null when token format is malformed")
  @Story("Authenticate JWT token")
  void authenticateShouldReturnNullWhenTokenFormatIsMalformed() {
    HeaderAuthenticationToken actual = authenticationService.authenticate("not-a-jwt-token");

    assertNull(actual);
  }

  @Test
  @DisplayName("authenticate returns authentication token for valid bearer token")
  @Story("Authenticate JWT token")
  void authenticateShouldReturnAuthenticationWhenTokenIsValidWithBearerPrefix() throws Exception {
    UUID userId = UUID.randomUUID();
    String token =
        createSignedToken(
            Map.of(
                JwtClaims.USER_ID,
                userId.toString(),
                JwtClaims.EMAIL,
                USER_EMAIL,
                JwtClaims.FIRST_NAME,
                FIRST_NAME,
                JwtClaims.LAST_NAME,
                LAST_NAME,
                JwtClaims.ROLE,
                USER_ROLE,
                JwtClaims.IS_ACTIVE,
                true));

    HeaderAuthenticationToken actual = authenticationService.authenticate("Bearer " + token);

    assertNotNull(actual);
    UserPrincipal principal = (UserPrincipal) actual.getPrincipal();
    assertEquals(userId, principal.userId());
    assertEquals(USER_EMAIL, principal.email());
    assertEquals(FIRST_NAME, principal.firstName());
    assertEquals(LAST_NAME, principal.lastName());
    assertEquals(USER_ROLE, principal.role());
    assertTrue(principal.isActive());
  }

  @Test
  @DisplayName("authenticate returns null when required claim is missing")
  @Story("Authenticate JWT token")
  void authenticateShouldReturnNullWhenRequiredClaimMissing() throws Exception {
    String token =
        createSignedToken(
            Map.of(
                JwtClaims.USER_ID,
                UUID.randomUUID().toString(),
                JwtClaims.EMAIL,
                USER_EMAIL,
                JwtClaims.FIRST_NAME,
                FIRST_NAME,
                JwtClaims.LAST_NAME,
                LAST_NAME,
                JwtClaims.IS_ACTIVE,
                true));

    HeaderAuthenticationToken actual = authenticationService.authenticate(token);

    assertNull(actual);
  }

  @Test
  @DisplayName("authenticate returns null when user id claim is not a UUID")
  @Story("Authenticate JWT token")
  void authenticateShouldReturnNullWhenUserIdClaimIsInvalidUuid() throws Exception {
    String token =
        createSignedToken(
            Map.of(
                JwtClaims.USER_ID,
                "invalid-uuid",
                JwtClaims.EMAIL,
                USER_EMAIL,
                JwtClaims.FIRST_NAME,
                FIRST_NAME,
                JwtClaims.LAST_NAME,
                LAST_NAME,
                JwtClaims.ROLE,
                USER_ROLE,
                JwtClaims.IS_ACTIVE,
                false));

    HeaderAuthenticationToken actual = authenticationService.authenticate(token);

    assertNull(actual);
  }

  @Test
  @DisplayName("authenticate maps inactive user flag from token")
  @Story("Authenticate JWT token")
  void authenticateShouldMapInactiveUserFlagWhenClaimIsFalse() throws Exception {
    UUID userId = UUID.randomUUID();
    String token =
        createSignedToken(
            Map.of(
                JwtClaims.USER_ID,
                userId.toString(),
                JwtClaims.EMAIL,
                USER_EMAIL,
                JwtClaims.FIRST_NAME,
                FIRST_NAME,
                JwtClaims.LAST_NAME,
                LAST_NAME,
                JwtClaims.ROLE,
                USER_ROLE,
                JwtClaims.IS_ACTIVE,
                false));

    HeaderAuthenticationToken actual = authenticationService.authenticate(token);

    assertNotNull(actual);
    UserPrincipal principal = (UserPrincipal) actual.getPrincipal();
    assertEquals(userId, principal.userId());
    assertFalse(principal.isActive());
  }

  private static String createSignedToken(Map<String, Object> claims) throws JOSEException {
    JWTClaimsSet.Builder builder =
        new JWTClaimsSet.Builder()
            .issueTime(Date.from(Instant.now()))
            .expirationTime(Date.from(Instant.now().plusSeconds(300)));

    for (Map.Entry<String, Object> claimEntry : claims.entrySet()) {
      builder.claim(claimEntry.getKey(), claimEntry.getValue());
    }

    SignedJWT signedJwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), builder.build());
    signedJwt.sign(new MACSigner(JWT_SIGNING_KEY.getBytes(StandardCharsets.UTF_8)));
    return signedJwt.serialize();
  }
}
