package apsas.identity.service;

import apsas.identity.exception.BadRequestException;
import apsas.identity.exception.ResourceNotFoundException;
import apsas.identity.exception.UnauthorizedException;
import apsas.identity.mapper.UserMapper;
import apsas.identity.model.dto.*;
import apsas.identity.model.entity.User;
import apsas.identity.model.entity.UserRole;
import apsas.identity.repository.UserRepository;
import apsas.shared.common.dto.PageResponse;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final UserMapper userMapper;

  public UserService(
      UserRepository userRepository, PasswordEncoder passwordEncoder, UserMapper userMapper) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.userMapper = userMapper;
  }

  @Transactional(readOnly = true)
  public UserResponse getUserById(UUID userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    return userMapper.toUserResponse(user);
  }

  @Transactional(readOnly = true)
  public List<UserResponse> getAllUsers() {
    return userRepository.findAll().stream()
        .map(userMapper::toUserResponse)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
    Page<User> userPage = userRepository.findAll(pageable);
    Page<UserResponse> responsePage = userPage.map(userMapper::toUserResponse);
    return PageResponse.of(responsePage);
  }

  @Transactional(readOnly = true)
  public List<UserResponse> getUsersByRole(UserRole role) {
    return userRepository.findByRole(role).stream()
        .map(userMapper::toUserResponse)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public PageResponse<UserResponse> getUsersByRole(UserRole role, Pageable pageable) {
    Page<User> userPage = userRepository.findByRole(role, pageable);
    Page<UserResponse> responsePage = userPage.map(userMapper::toUserResponse);
    return PageResponse.of(responsePage);
  }

  @Transactional
  public UserResponse createUser(CreateUserRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new BadRequestException("Email already registered");
    }

    User user = userMapper.toUser(request);

    user = userRepository.save(user);
    return userMapper.toUserResponse(user);
  }

  @Transactional
  public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (request.getFirstName() != null && !request.getFirstName().isEmpty()) {
      user.setFirstName(request.getFirstName());
    }

    if (request.getLastName() != null && !request.getLastName().isEmpty()) {
      user.setLastName(request.getLastName());
    }

    user = userRepository.save(user);
    return userMapper.toUserResponse(user);
  }

  @Transactional
  public void changePassword(UUID userId, ChangePasswordRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);
  }

  @Transactional
  public void deactivateUser(UUID userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    user.setIsActive(false);
    userRepository.save(user);
  }

  @Transactional
  public void activateUser(UUID userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    user.setIsActive(true);
    userRepository.save(user);
  }

  @Transactional
  public void deleteUser(UUID userId) {
    if (!userRepository.existsById(userId)) {
      throw new ResourceNotFoundException("User not found");
    }
    userRepository.deleteById(userId);
  }
}
