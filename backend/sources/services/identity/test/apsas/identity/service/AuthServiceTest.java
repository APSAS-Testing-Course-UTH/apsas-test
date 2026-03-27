package apsas.identity.service;

import static org.instancio.Select.field;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import apsas.identity.mapper.UserMapper;
import apsas.identity.model.dto.AuthResponse;
import apsas.identity.model.dto.EmailRequest;
import apsas.identity.model.dto.LoginRequest;
import apsas.identity.model.dto.RegisterRequest;
import apsas.identity.model.dto.ResetPasswordRequest;
import apsas.identity.model.dto.UserResponse;
import apsas.identity.model.entity.EmailVerificationToken;
import apsas.identity.model.entity.PasswordResetToken;
import apsas.identity.model.entity.User;
import apsas.identity.model.entity.UserRole;
import apsas.identity.repository.EmailVerificationTokenRepository;
import apsas.identity.repository.PasswordResetTokenRepository;
import apsas.identity.repository.UserRepository;
import apsas.identity.security.JwtTokenProvider;
import apsas.shared.exception.BadRequestException;
import apsas.shared.exception.NotFoundException;
import apsas.shared.exception.UnauthorizedException;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.BaseEvent;
import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.messaging.event.PasswordResetRequestedEvent;
import apsas.shared.messaging.event.UserRegisteredEvent;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import org.instancio.Instancio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@Tag("unit")
@Tag("identity")
@Epic("Identity Service")
@Feature("Auth Service")
@Issue("17")
class AuthServiceTest {

  @Mock
  private UserRepository userRepository;
  @Mock
  private EmailVerificationTokenRepository emailVerificationTokenRepository;
  @Mock
  private PasswordResetTokenRepository passwordResetTokenRepository;
  @Mock
  private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
  @Mock
  private JwtTokenProvider jwtTokenProvider;
  @Mock
  private EventPublisher eventPublisher;
  @Mock
  private UserMapper userMapper;

  @InjectMocks
  private AuthService authService;

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(authService, "emailTokenExpiration", 300L);
    ReflectionTestUtils.setField(authService, "passwordResetTokenExpiration", 600L);
  }

  @Test
  @TmsLink("IDT-AUTH-001")
  @DisplayName("Dang ky thanh cong khi email moi")
  @Description("register tra ve auth response, tao token verify va phat su kien user registered")
  @Story("Dang ky tai khoan")
  @Severity(SeverityLevel.CRITICAL)
  void register_shouldReturnAuthResponse_whenEmailIsNew() {
    RegisterRequest request =
        Instancio.of(RegisterRequest.class)
            .set(field(RegisterRequest::getEmail), "new.user@apsas.dev")
            .set(field(RegisterRequest::getPassword), "Password@123")
            .create();
    User user = buildUser("new.user@apsas.dev", true);
    UserResponse userResponse = Instancio.create(UserResponse.class);

    when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
    when(userMapper.toUserFromRegisterRequest(request)).thenReturn(user);
    when(userRepository.save(user)).thenReturn(user);
    when(jwtTokenProvider.generateToken(user)).thenReturn("jwt-token");
    when(userMapper.toUserResponse(user)).thenReturn(userResponse);
    when(emailVerificationTokenRepository.save(any(EmailVerificationToken.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    AuthResponse result = authService.register(request);

    assertEquals("jwt-token", result.getToken());
    assertEquals("Bearer", result.getType());
    assertEquals(userResponse, result.getUser());

    ArgumentCaptor<EmailVerificationToken> tokenCaptor =
        ArgumentCaptor.forClass(EmailVerificationToken.class);
    verify(emailVerificationTokenRepository).save(tokenCaptor.capture());
    assertEquals(user, tokenCaptor.getValue().getUser());
    assertNotNull(tokenCaptor.getValue().getToken());
    assertNotNull(tokenCaptor.getValue().getExpiresAt());

    ArgumentCaptor<BaseEvent> eventCaptor = ArgumentCaptor.forClass(BaseEvent.class);
    verify(eventPublisher).publish(
        eq(RabbitMqConfig.USER_REGISTERED_ROUTING_KEY),
        eventCaptor.capture()
    );
    UserRegisteredEvent event = (UserRegisteredEvent) eventCaptor.getValue();
    assertEquals(user.getEmail(), event.getEmail());
  }

  @Test
  @TmsLink("IDT-AUTH-002")
  @DisplayName("Dang ky that bai khi email da ton tai")
  @Story("Dang ky tai khoan")
  void register_shouldThrowBadRequest_whenEmailAlreadyExists() {
    RegisterRequest request =
        Instancio.of(RegisterRequest.class)
            .set(field(RegisterRequest::getEmail), "duplicate@apsas.dev")
            .create();

    when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

    assertThrows(BadRequestException.class, () -> authService.register(request));
    verify(userRepository, never()).save(any(User.class));
  }

  @Test
  @TmsLink("IDT-AUTH-003")
  @DisplayName("Dang nhap thanh cong voi thong tin hop le")
  @Story("Dang nhap")
  void login_shouldReturnAuthResponse_whenCredentialsAreValid() {
    LoginRequest request = new LoginRequest("user@apsas.dev", "Password@123");
    User user = buildUser("user@apsas.dev", true);
    UserResponse userResponse = Instancio.create(UserResponse.class);

    when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
    when(passwordEncoder.matches(request.getPassword(), user.getPasswordHash())).thenReturn(true);
    when(jwtTokenProvider.generateToken(user)).thenReturn("jwt-login");
    when(userMapper.toUserResponse(user)).thenReturn(userResponse);

    AuthResponse result = authService.login(request);

    assertEquals("jwt-login", result.getToken());
    assertEquals(userResponse, result.getUser());
  }

  @Test
  @TmsLink("IDT-AUTH-004")
  @DisplayName("Dang nhap that bai khi sai mat khau")
  @Story("Dang nhap")
  void login_shouldThrowUnauthorized_whenPasswordIsWrong() {
    LoginRequest request = new LoginRequest("user@apsas.dev", "wrong-pass");
    User user = buildUser("user@apsas.dev", true);

    when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
    when(passwordEncoder.matches(request.getPassword(), user.getPasswordHash())).thenReturn(false);

    assertThrows(UnauthorizedException.class, () -> authService.login(request));
  }

  @Test
  @TmsLink("IDT-AUTH-005")
  @DisplayName("Dang nhap that bai khi tai khoan bi vo hieu hoa")
  @Story("Dang nhap")
  void login_shouldThrowUnauthorized_whenAccountIsInactive() {
    LoginRequest request = new LoginRequest("user@apsas.dev", "Password@123");
    User user = buildUser("user@apsas.dev", false);

    when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
    when(passwordEncoder.matches(request.getPassword(), user.getPasswordHash())).thenReturn(true);

    assertThrows(UnauthorizedException.class, () -> authService.login(request));
  }

  @Test
  @TmsLink("IDT-AUTH-006")
  @DisplayName("Xac thuc email thanh cong khi token hop le")
  @Story("Xac thuc email")
  void verifyEmail_shouldMarkUserVerified_whenTokenIsValid() {
    User user = buildUser("verify@apsas.dev", true);
    user.setIsEmailVerified(false);

    EmailVerificationToken token = new EmailVerificationToken();
    token.setToken("verify-token");
    token.setUser(user);
    token.setExpiresAt(LocalDateTime.now().plusMinutes(5));

    when(emailVerificationTokenRepository.findByToken("verify-token")).thenReturn(Optional.of(token));

    authService.verifyEmail("verify-token");

    assertEquals(true, user.getIsEmailVerified());
    verify(userRepository).save(user);
    verify(emailVerificationTokenRepository).delete(token);
  }

  @Test
  @TmsLink("IDT-AUTH-007")
  @DisplayName("Xac thuc email that bai khi token khong ton tai")
  @Story("Xac thuc email")
  void verifyEmail_shouldThrowBadRequest_whenTokenNotFound() {
    when(emailVerificationTokenRepository.findByToken("missing-token")).thenReturn(Optional.empty());

    assertThrows(BadRequestException.class, () -> authService.verifyEmail("missing-token"));
  }

  @Test
  @TmsLink("IDT-AUTH-008")
  @DisplayName("Xac thuc email that bai khi token het han")
  @Story("Xac thuc email")
  void verifyEmail_shouldThrowBadRequest_whenTokenExpired() {
    EmailVerificationToken token = new EmailVerificationToken();
    token.setUser(buildUser("verify@apsas.dev", true));
    token.setExpiresAt(LocalDateTime.now().minusSeconds(1));

    when(emailVerificationTokenRepository.findByToken("expired-token")).thenReturn(Optional.of(token));

    assertThrows(BadRequestException.class, () -> authService.verifyEmail("expired-token"));
    verify(userRepository, never()).save(any(User.class));
  }

  @Test
  @TmsLink("IDT-AUTH-009")
  @DisplayName("Gui lai email verify thanh cong va xoa token cu")
  @Story("Xac thuc email")
  void resendVerificationEmail_shouldReplaceOldToken_whenUserNotVerified() {
    User user = buildUser("resend@apsas.dev", true);
    user.setIsEmailVerified(false);

    EmailVerificationToken oldToken = new EmailVerificationToken();
    oldToken.setToken("old-token");
    oldToken.setUser(user);

    when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
    when(emailVerificationTokenRepository.findByUser(user)).thenReturn(Optional.of(oldToken));
    when(emailVerificationTokenRepository.save(any(EmailVerificationToken.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    authService.resendVerificationEmail(new EmailRequest(user.getEmail()));

    verify(emailVerificationTokenRepository).delete(oldToken);
    verify(eventPublisher).publish(
        eq(RabbitMqConfig.USER_REGISTERED_ROUTING_KEY),
        any(UserRegisteredEvent.class)
    );
  }

  @Test
  @TmsLink("IDT-AUTH-010")
  @DisplayName("Gui lai email verify that bai khi email da duoc xac thuc")
  @Story("Xac thuc email")
  void resendVerificationEmail_shouldThrowBadRequest_whenAlreadyVerified() {
    User user = buildUser("verified@apsas.dev", true);
    EmailRequest request = new EmailRequest(user.getEmail());
    user.setIsEmailVerified(true);

    when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

    assertThrows(
        BadRequestException.class,
        () -> authService.resendVerificationEmail(request)
    );
  }

  @Test
  @TmsLink("IDT-AUTH-011")
  @DisplayName("Yeu cau reset password thanh cong")
  @Story("Khoi phuc mat khau")
  void requestPasswordReset_shouldPublishEvent_whenUserExists() {
    User user = buildUser("reset@apsas.dev", true);
    PasswordResetToken oldToken = new PasswordResetToken();
    oldToken.setUser(user);

    when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
    when(passwordResetTokenRepository.findByUser(user)).thenReturn(Optional.of(oldToken));
    when(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    authService.requestPasswordReset(new EmailRequest(user.getEmail()));

    verify(passwordResetTokenRepository).delete(oldToken);
    verify(eventPublisher)
        .publish(
            eq(RabbitMqConfig.PASSWORD_RESET_ROUTING_KEY),
            any(PasswordResetRequestedEvent.class)
        );
  }

  @Test
  @TmsLink("IDT-AUTH-012")
  @DisplayName("Reset password thanh cong voi token hop le")
  @Story("Khoi phuc mat khau")
  void resetPassword_shouldUpdatePasswordAndDeleteToken_whenTokenIsValid() {
    User user = buildUser("reset@apsas.dev", true);
    PasswordResetToken token = new PasswordResetToken();
    token.setToken("reset-token");
    token.setUser(user);
    token.setExpiresAt(LocalDateTime.now().plusMinutes(10));

    when(passwordResetTokenRepository.findByToken("reset-token")).thenReturn(Optional.of(token));
    when(passwordEncoder.encode("NewPassword@123")).thenReturn("hashed-new-password");

    authService.resetPassword(new ResetPasswordRequest("reset-token", "NewPassword@123"));

    assertEquals("hashed-new-password", user.getPasswordHash());
    verify(userRepository).save(user);
    verify(passwordResetTokenRepository).delete(token);
  }

  @Test
  @TmsLink("IDT-AUTH-013")
  @DisplayName("Reset password that bai khi token khong ton tai")
  @Story("Khoi phuc mat khau")
  void resetPassword_shouldThrowBadRequest_whenTokenNotFound() {
    ResetPasswordRequest request = new ResetPasswordRequest("missing-reset-token", "Password@123");
    when(passwordResetTokenRepository.findByToken("missing-reset-token")).thenReturn(Optional.empty());

    assertThrows(
        BadRequestException.class,
        () -> authService.resetPassword(request)
    );
  }

  @Test
  @TmsLink("IDT-AUTH-014")
  @DisplayName("Reset password that bai khi token het han")
  @Story("Khoi phuc mat khau")
  void resetPassword_shouldThrowBadRequest_whenTokenExpired() {
    ResetPasswordRequest request = new ResetPasswordRequest("expired-reset-token", "Password@123");
    PasswordResetToken token = new PasswordResetToken();
    token.setUser(buildUser("expired@apsas.dev", true));
    token.setExpiresAt(LocalDateTime.now().minusMinutes(1));

    when(passwordResetTokenRepository.findByToken("expired-reset-token")).thenReturn(Optional.of(
        token));

    assertThrows(
        BadRequestException.class,
        () -> authService.resetPassword(request)
    );
    verify(passwordEncoder, never()).encode(any());
  }

  @Test
  @TmsLink("IDT-AUTH-015")
  @DisplayName("Gui lai email verify that bai khi khong tim thay user")
  @Story("Xac thuc email")
  void resendVerificationEmail_shouldThrowNotFound_whenUserMissing() {
    EmailRequest request = org.mockito.Mockito.mock(EmailRequest.class);
    when(request.getEmail()).thenReturn("missing@apsas.dev");
    when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

    assertThrows(
        NotFoundException.class,
        () -> authService.resendVerificationEmail(request)
    );
  }

  private User buildUser(String email, boolean isActive) {
    return Instancio.of(User.class)
        .set(field(User::getId), UUID.randomUUID())
        .set(field(User::getEmail), email)
        .set(field(User::getPasswordHash), "hashed-password")
        .set(field(User::getFirstName), "Test")
        .set(field(User::getLastName), "User")
        .set(field(User::getRole), UserRole.STUDENT)
        .set(field(User::getIsActive), isActive)
        .set(field(User::getIsEmailVerified), false)
        .create();
  }
}


