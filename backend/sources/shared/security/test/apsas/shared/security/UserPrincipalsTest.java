package apsas.shared.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.instancio.Instancio;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.server.reactive.ServerHttpRequest;

@Epic("Shared Security")
@Feature("User Principals Utility")
class UserPrincipalsTest {

  @Test
  @Tag("unit")
  @Story("Decode principal from valid header")
  @Severity(SeverityLevel.NORMAL)
  @Issue("9")
  @TmsLink("SHD-UPR-001")
  @DisplayName("Extracts principal when header contains valid Base64 payload")
  void fromHeader_shouldReturnPrincipal_whenHeaderIsValid() {
    var principal = Instancio.create(UserPrincipal.class);

    var request = mock(HttpServletRequest.class);
    var base64 = UserPrincipals.toBase64(principal).orElseThrow();
    when(request.getHeader(UserPrincipals.USER_INFO_HEADER)).thenReturn(base64);

    var actual = UserPrincipals.fromHeader(request);

    assertTrue(actual.isPresent());
    assertEquals(principal, actual.get());
  }

  @ParameterizedTest
  @Tag("unit")
  @Story("Reject missing or malformed header")
  @Severity(SeverityLevel.NORMAL)
  @Issue("9")
  @TmsLink("SHD-UPR-002")
  @DisplayName("Returns empty when header is missing or malformed")
  @NullAndEmptySource
  @ValueSource(strings = {"%%%not-base64%%%"})
  void fromHeader_shouldReturnEmpty_whenHeaderMissingOrInvalid(String headerValue) {
    var request = mock(HttpServletRequest.class);
    when(request.getHeader(UserPrincipals.USER_INFO_HEADER)).thenReturn(headerValue);

    var actual = UserPrincipals.fromHeader(request);

    assertTrue(actual.isEmpty());
  }

  @Test
  @Tag("unit")
  @Story("Reject non-deserializable payload")
  @Severity(SeverityLevel.NORMAL)
  @Issue("9")
  @TmsLink("SHD-UPR-004")
  @DisplayName("Returns empty when header is valid Base64 but payload is not a serialized principal")
  void fromHeader_shouldReturnEmpty_whenBase64PayloadCannotBeDeserialized() {
    var request = mock(HttpServletRequest.class);
    var invalidSerializedPayload = Base64.getEncoder()
        .encodeToString("invalid-serialized-content".getBytes(StandardCharsets.UTF_8));
    when(request.getHeader(UserPrincipals.USER_INFO_HEADER)).thenReturn(invalidSerializedPayload);

    var actual = UserPrincipals.fromHeader(request);

    assertTrue(actual.isEmpty());
  }

  @Test
  @Tag("unit")
  @Story("Enrich downstream request with principal header")
  @Severity(SeverityLevel.NORMAL)
  @Issue("9")
  @TmsLink("SHD-UPR-003")
  @DisplayName("Adds user info header to server request builder")
  void enrichRequestWithUserInfo_shouldAddHeader_whenPrincipalIsSerializable() {
    var principal = Instancio.create(UserPrincipal.class);

    var builder = mock(ServerHttpRequest.Builder.class);
    when(builder.header(
        eq(UserPrincipals.USER_INFO_HEADER),
        org.mockito.ArgumentMatchers.anyString()
    ))
        .thenReturn(builder);

    var actual = UserPrincipals.enrichRequestWithUserInfo(builder, principal);

    assertSame(builder, actual);
    verify(builder).header(
        eq(UserPrincipals.USER_INFO_HEADER),
        org.mockito.ArgumentMatchers.anyString()
    );
  }
}
