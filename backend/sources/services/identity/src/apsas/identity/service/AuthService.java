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
import apsas.messaging.event.EventPublisher;
import apsas.messaging.event.PasswordResetRequestedEvent;
import apsas.messaging.event.RabbitMQConfig;
import apsas.messaging.event.UserRegisteredEvent;
import apsas.shared.common.exception.BadRequestException;
import apsas.shared.common.exception.NotFoundException;
import apsas.shared.common.exception.UnauthorizedException;
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

    // Create email verification token
    String token = generateToken();
    EmailVerificationToken verificationToken = new EmailVerificationToken();
    verificationToken.setUser(user);
    verificationToken.setToken(token);
    verificationToken.setExpiresAt(LocalDateTime.now().plusSeconds(emailTokenExpiration));
    emailVerificationTokenRepository.save(verificationToken);

    // Publish event for notification service
    UserRegisteredEvent event =
        new UserRegisteredEvent(
            user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), token);
    eventPublisher.publish(RabbitMQConfig.USER_REGISTERED_ROUTING_KEY, event);

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

    String token = jwtTokenProvider.generateToken(user);
    UserResponse userResponse = userMapper.toUserResponse(user);

    return new AuthResponse(token, userResponse);
  }

  @Transactional
  public void verifyEmail(String token) {
    EmailVerificationToken verificationToken =
        emailVerificationTokenRepository
            .findByToken(token)
            .orElseThrow(() -> new BadRequestException("Invalid verification token"));

    if (verificationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
      throw new BadRequestException("Verification token has expired");
    }

    User user = verificationToken.getUser();
    user.setIsEmailVerified(true);
    userRepository.save(user);

    emailVerificationTokenRepository.delete(verificationToken);
  }

  @Transactional
  public void resendVerificationEmail(EmailRequest request) {
    User user =
        userRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> new NotFoundException("User not found"));

    if (user.getIsEmailVerified()) {
      throw new BadRequestException("Email already verified");
    }

    // Delete old token if exists
    emailVerificationTokenRepository
        .findByUser(user)
        .ifPresent(emailVerificationTokenRepository::delete);

    // Create new token
    String token = generateToken();
    EmailVerificationToken verificationToken = new EmailVerificationToken();
    verificationToken.setUser(user);
    verificationToken.setToken(token);
    verificationToken.setExpiresAt(LocalDateTime.now().plusSeconds(emailTokenExpiration));
    emailVerificationTokenRepository.save(verificationToken);

    // Publish event
    UserRegisteredEvent event =
        new UserRegisteredEvent(
            user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), token);
    eventPublisher.publish(RabbitMQConfig.USER_REGISTERED_ROUTING_KEY, event);
  }

  @Transactional
  public void requestPasswordReset(EmailRequest request) {
    User user =
        userRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> new NotFoundException("User not found"));

    // Delete old token if exists
    passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

    // Create new token
    String token = generateToken();
    PasswordResetToken resetToken = new PasswordResetToken();
    resetToken.setUser(user);
    resetToken.setToken(token);
    resetToken.setExpiresAt(LocalDateTime.now().plusSeconds(passwordResetTokenExpiration));
    passwordResetTokenRepository.save(resetToken);

    // Publish event
    PasswordResetRequestedEvent event =
        new PasswordResetRequestedEvent(user.getEmail(), user.getFirstName(), token);
    eventPublisher.publish(RabbitMQConfig.PASSWORD_RESET_ROUTING_KEY, event);
  }

  @Transactional
  public void resetPassword(ResetPasswordRequest request) {
    PasswordResetToken resetToken =
        passwordResetTokenRepository
            .findByToken(request.getToken())
            .orElseThrow(() -> new BadRequestException("Invalid reset token"));

    if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
      throw new BadRequestException("Reset token has expired");
    }

    User user = resetToken.getUser();
    user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);

    passwordResetTokenRepository.delete(resetToken);
  }

  private String generateToken() {
    return UUID.randomUUID().toString();
  }
}
