package apsas.identity.controller;

import static org.instancio.Select.field;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import apsas.identity.model.dto.AuthResponse;
import apsas.identity.model.dto.RegisterRequest;
import apsas.identity.model.dto.ResetPasswordRequest;
import apsas.identity.model.dto.UserResponse;
import apsas.identity.model.entity.UserRole;
import apsas.identity.repository.UserRepository;
import apsas.identity.service.AuthService;
import apsas.identity.service.UserService;
import apsas.shared.exception.UnauthorizedException;
import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.security.HeaderAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Owner;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;
import org.instancio.Instancio;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Tag("integration")
@Tag("identity")
@Epic("Identity Service")
@Feature("REST API - Authentication")
@Owner("backend-team")
@Issue("28")
class AuthControllerIT {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockitoBean
  private AuthService authService;

  @MockitoBean
  private UserService userService;

  @MockitoBean
  private HeaderAuthenticationFilter headerAuthenticationFilter;

  @MockitoBean
  private UserRepository userRepository;

  @MockitoBean
  private EventPublisher eventPublisher;

  @MockitoBean
  private CacheManager cacheManager;

  @Test
  @TmsLink("IDT-RESTIT-AUTH-001")
  @DisplayName("Register returns 201 at valid boundaries")
  @Description("BVA: password=8 and name length=100 should pass validation and create account.")
  @Story("Register - BVA valid boundaries")
  void register_shouldReturnCreated_whenPayloadAtBoundaryIsValid() throws Exception {
    when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse());

    Map<String, Object> payload = Map.of(
        "email", "boundary.user@apsas.dev",
        "password", repeat("A", 8),
        "firstName", repeat("F", 100),
        "lastName", repeat("L", 100)
    );

    mockMvc.perform(
            post("/api/auth/register")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload))
        )
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.token").value("jwt-token"))
        .andExpect(jsonPath("$.type").value("Bearer"));

    verify(authService).register(any(RegisterRequest.class));
  }

  @ParameterizedTest(name = "{index} => passwordLen={0}, firstNameLen={1}, expected={2}")
  @MethodSource("invalidRegisterBoundaryCases")
  @TmsLink("IDT-RESTIT-AUTH-002")
  @DisplayName("Register returns 400 for BVA invalid boundaries")
  @Description("BVA: min-1 password and max+1 name lengths must fail request validation.")
  @Story("Register - BVA invalid boundaries")
  void register_shouldReturnBadRequest_whenPayloadViolatesBoundaries(
      int passwordLen,
      int firstNameLen,
      HttpStatus expectedStatus
  ) throws Exception {
    Map<String, Object> payload = Map.of(
        "email", "invalid.boundary@apsas.dev",
        "password", repeat("P", passwordLen),
        "firstName", repeat("F", firstNameLen),
        "lastName", "ValidLast"
    );

    mockMvc.perform(
            post("/api/auth/register")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload))
        )
        .andExpect(status().is(expectedStatus.value()));

    verify(authService, never()).register(any(RegisterRequest.class));
  }

  @Test
  @TmsLink("IDT-RESTIT-AUTH-003")
  @DisplayName("Login returns 200 for valid payload")
  @Description("Equivalence partitioning: valid email/password format delegates to service and returns auth response.")
  @Story("Login - successful path")
  void login_shouldReturnOk_whenPayloadIsValid() throws Exception {
    when(authService.login(any())).thenReturn(authResponse());

    mockMvc.perform(
            post("/api/auth/login")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "email", "user@apsas.dev",
                    "password", "Password@123"
                )))
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token").value("jwt-token"));

    verify(authService).login(any());
  }

  @Test
  @TmsLink("IDT-RESTIT-AUTH-004")
  @DisplayName("Login returns 401 when credentials are rejected")
  @Description("Error guessing: service-level invalid credentials must be mapped to HTTP 401.")
  @Story("Login - failure path")
  void login_shouldReturnUnauthorized_whenServiceRejectsCredentials() throws Exception {
    when(authService.login(any())).thenThrow(new UnauthorizedException("Invalid credentials"));

    mockMvc.perform(
            post("/api/auth/login")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "email", "user@apsas.dev",
                    "password", "wrong"
                )))
        )
        .andExpect(status().isUnauthorized());
  }

  @Test
  @TmsLink("IDT-RESTIT-AUTH-005")
  @DisplayName("Login returns 400 when email format is invalid")
  @Description("Equivalence partitioning: malformed email should fail bean validation before hitting service.")
  @Story("Login - input validation")
  void login_shouldReturnBadRequest_whenEmailFormatIsInvalid() throws Exception {
    mockMvc.perform(
            post("/api/auth/login")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "email", "invalid-email",
                    "password", "Password@123"
                )))
        )
        .andExpect(status().isBadRequest());

    verify(authService, never()).login(any());
  }

  @Test
  @TmsLink("IDT-RESTIT-AUTH-006")
  @DisplayName("Verify email returns 204 for valid token")
  @Description("Non-BVA flow: valid verification token should be accepted.")
  @Story("Verify email - successful path")
  void verifyEmail_shouldReturnNoContent_whenTokenIsValid() throws Exception {
    mockMvc.perform(
            post("/api/auth/verify-email")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("token", "verify-token")))
        )
        .andExpect(status().isNoContent());

    verify(authService).verifyEmail("verify-token");
  }

  @Test
  @TmsLink("IDT-RESTIT-AUTH-007")
  @DisplayName("Verify email returns 400 when token is blank")
  @Description("Equivalence partitioning: blank token is invalid input and must fail validation.")
  @Story("Verify email - invalid input")
  void verifyEmail_shouldReturnBadRequest_whenTokenIsBlank() throws Exception {
    mockMvc.perform(
            post("/api/auth/verify-email")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("token", "")))
        )
        .andExpect(status().isBadRequest());

    verify(authService, never()).verifyEmail(any());
  }

  @ParameterizedTest(name = "{index} => newPasswordLen={0}, expected={1}")
  @MethodSource("resetPasswordBoundaryCases")
  @TmsLink("IDT-RESTIT-AUTH-008")
  @DisplayName("Reset password validates newPassword boundary")
  @Description("BVA: newPassword min boundary 8; test min-1 and min values with parameterized inputs.")
  @Story("Reset password - BVA")
  void resetPassword_shouldValidateNewPasswordBoundary(int newPasswordLen, HttpStatus expected)
      throws Exception {
    Map<String, Object> payload = Map.of(
        "token", "reset-token",
        "newPassword", repeat("N", newPasswordLen)
    );

    mockMvc.perform(
            post("/api/auth/reset-password")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload))
        )
        .andExpect(status().is(expected.value()));

    if (expected == HttpStatus.NO_CONTENT) {
      verify(authService).resetPassword(any(ResetPasswordRequest.class));
    } else {
      verify(authService, never()).resetPassword(any(ResetPasswordRequest.class));
    }
  }

  @Test
  @TmsLink("IDT-RESTIT-AUTH-009")
  @DisplayName("Resend verification returns 204 for valid email")
  @Description("Non-BVA flow: valid email payload is accepted and delegated to service.")
  @Story("Resend verification - successful path")
  void resendVerification_shouldReturnNoContent_whenEmailIsValid() throws Exception {
    mockMvc.perform(
            post("/api/auth/resend-verification")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", "user@apsas.dev")))
        )
        .andExpect(status().isNoContent());

    verify(authService).resendVerificationEmail(any());
  }

  @Test
  @TmsLink("IDT-RESTIT-AUTH-010")
  @DisplayName("Resend verification returns 400 for malformed email")
  @Description("Equivalence partitioning: malformed email must fail validation before service call.")
  @Story("Resend verification - invalid input")
  void resendVerification_shouldReturnBadRequest_whenEmailIsInvalid() throws Exception {
    mockMvc.perform(
            post("/api/auth/resend-verification")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", "invalid-email")))
        )
        .andExpect(status().isBadRequest());

    verify(authService, never()).resendVerificationEmail(any());
  }

  @Test
  @TmsLink("IDT-RESTIT-AUTH-011")
  @DisplayName("Forgot password returns 204 for valid email")
  @Description("Non-BVA flow: valid forgot-password request returns no content.")
  @Story("Forgot password - successful path")
  void forgotPassword_shouldReturnNoContent_whenEmailIsValid() throws Exception {
    mockMvc.perform(
            post("/api/auth/forgot-password")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", "user@apsas.dev")))
        )
        .andExpect(status().isNoContent());

    verify(authService).requestPasswordReset(any());
  }

  @Test
  @TmsLink("IDT-RESTIT-AUTH-012")
  @DisplayName("Forgot password returns 400 for malformed email")
  @Description("Equivalence partitioning: invalid email format fails bean validation.")
  @Story("Forgot password - invalid input")
  void forgotPassword_shouldReturnBadRequest_whenEmailIsInvalid() throws Exception {
    mockMvc.perform(
            post("/api/auth/forgot-password")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", "not-an-email")))
        )
        .andExpect(status().isBadRequest());

    verify(authService, never()).requestPasswordReset(any());
  }

  private AuthResponse authResponse() {
    UserResponse userResponse = Instancio.of(UserResponse.class)
        .set(field(UserResponse::getId), UUID.randomUUID())
        .set(field(UserResponse::getEmail), "user@apsas.dev")
        .set(field(UserResponse::getFirstName), "Boundary")
        .set(field(UserResponse::getLastName), "User")
        .set(field(UserResponse::getRole), UserRole.STUDENT)
        .set(field(UserResponse::getIsActive), true)
        .set(field(UserResponse::getIsEmailVerified), true)
        .create();
    return new AuthResponse("jwt-token", userResponse);
  }

  private static Stream<Arguments> invalidRegisterBoundaryCases() {
    return Stream.of(
        Arguments.of(7, 10, HttpStatus.BAD_REQUEST),
        Arguments.of(8, 101, HttpStatus.BAD_REQUEST)
    );
  }

  private static Stream<Arguments> resetPasswordBoundaryCases() {
    return Stream.of(
        Arguments.of(7, HttpStatus.BAD_REQUEST),
        Arguments.of(8, HttpStatus.NO_CONTENT)
    );
  }

  private static String repeat(String value, int length) {
    return value.repeat(Math.max(length, 0));
  }
}






