package apsas.identity.service;

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
import apsas.identity.repository.EmailVerificationTokenRepository;
import apsas.identity.repository.PasswordResetTokenRepository;
import apsas.identity.repository.UserRepository;
import apsas.identity.security.JwtTokenProvider;
import apsas.shared.exception.BadRequestException;
import apsas.shared.exception.NotFoundException;
import apsas.shared.exception.UnauthorizedException;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.messaging.event.PasswordResetRequestedEvent;
import apsas.shared.messaging.event.UserRegisteredEvent;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final UserRepository userRepository;
  private final EmailVerificationTokenRepository emailVerificationTokenRepository;
  private final PasswordResetTokenRepository passwordResetTokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;
  private final EventPublisher eventPublisher;
  private final UserMapper userMapper;

  @Value("${verification.email-token-expiration}")
  private long emailTokenExpiration;

  @Value("${verification.password-reset-token-expiration}")
  private long passwordResetTokenExpiration;

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new BadRequestException("Email already registered");
    }

    User user = userMapper.toUserFromRegisterRequest(request);
    user = userRepository.save(user);

    // Create and send verification email
    String token = createAndSaveEmailVerificationToken(user);
    publishUserRegisteredEvent(user, token);

    String jwtToken = jwtTokenProvider.generateToken(user);
    UserResponse userResponse = userMapper.toUserResponse(user);

    return new AuthResponse(jwtToken, userResponse);
  }

  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest request) {
    User user =
        userRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.getIsActive()) {
      throw new UnauthorizedException("Account is deactivated");
    }

    return createAuthResponse(user);
  }

  @Transactional
  public void verifyEmail(String token) {
    EmailVerificationToken verificationToken = emailVerificationTokenRepository
        .findByToken(token)
        .orElseThrow(() -> new BadRequestException("Invalid verification token"));
    validateTokenNotExpired(verificationToken.getExpiresAt(), "Verification token has expired");

    User user = verificationToken.getUser();
    user.setIsEmailVerified(true);
    userRepository.save(user);

    emailVerificationTokenRepository.delete(verificationToken);
  }

  @Transactional
  public void resendVerificationEmail(EmailRequest request) {
    User user = findUserByEmailForVerification(request.getEmail());

    if (user.getIsEmailVerified()) {
      throw new BadRequestException("Email already verified");
    }

    // Delete old token if exists
    emailVerificationTokenRepository
        .findByUser(user)
        .ifPresent(emailVerificationTokenRepository::delete);

    // Create and send new verification email
    String token = createAndSaveEmailVerificationToken(user);
    publishUserRegisteredEvent(user, token);
  }

  @Transactional
  public void requestPasswordReset(EmailRequest request) {
    User user = findUserByEmailForVerification(request.getEmail());

    // Delete old token if exists
    passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

    // Create and send password reset email
    String token = createAndSavePasswordResetToken(user);
    publishPasswordResetEvent(user, token);
  }

  @Transactional
  public void resetPassword(ResetPasswordRequest request) {
    PasswordResetToken resetToken = findPasswordResetToken(request.getToken());
    validateTokenNotExpired(resetToken.getExpiresAt(), "Reset token has expired");

    User user = resetToken.getUser();
    user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);

    passwordResetTokenRepository.delete(resetToken);
  }

  private User findUserByEmailForVerification(String email) {
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new NotFoundException("User not found"));
  }

  private PasswordResetToken findPasswordResetToken(String token) {
    return passwordResetTokenRepository
        .findByToken(token)
        .orElseThrow(() -> new BadRequestException("Invalid reset token"));
  }

  private void validateTokenNotExpired(LocalDateTime expiresAt, String errorMessage) {
    if (expiresAt.isBefore(LocalDateTime.now())) {
      throw new BadRequestException(errorMessage);
    }
  }

  private String createAndSaveEmailVerificationToken(User user) {
    String token = generateToken();
    EmailVerificationToken verificationToken = new EmailVerificationToken();
    verificationToken.setUser(user);
    verificationToken.setToken(token);
    verificationToken.setExpiresAt(LocalDateTime.now().plusSeconds(emailTokenExpiration));
    emailVerificationTokenRepository.save(verificationToken);
    return token;
  }

  private String createAndSavePasswordResetToken(User user) {
    String token = generateToken();
    PasswordResetToken resetToken = new PasswordResetToken();
    resetToken.setUser(user);
    resetToken.setToken(token);
    resetToken.setExpiresAt(LocalDateTime.now().plusSeconds(passwordResetTokenExpiration));
    passwordResetTokenRepository.save(resetToken);
    return token;
  }

  private void publishUserRegisteredEvent(User user, String token) {
    UserRegisteredEvent event =
        new UserRegisteredEvent(
            user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), token);
    eventPublisher.publish(RabbitMqConfig.USER_REGISTERED_ROUTING_KEY, event);
  }

  private void publishPasswordResetEvent(User user, String token) {
    PasswordResetRequestedEvent event =
        new PasswordResetRequestedEvent(user.getEmail(), user.getFirstName(), token);
    eventPublisher.publish(RabbitMqConfig.PASSWORD_RESET_ROUTING_KEY, event);
  }

  private AuthResponse createAuthResponse(User user) {
    String token = jwtTokenProvider.generateToken(user);
    UserResponse userResponse = userMapper.toUserResponse(user);
    return new AuthResponse(token, userResponse);
  }

  private String generateToken() {
    return UUID.randomUUID().toString();
  }
}
