package apsas.identity.service;

import apsas.identity.mapper.UserMapper;
import apsas.identity.model.dto.ChangePasswordRequest;
import apsas.identity.model.dto.CreateUserRequest;
import apsas.identity.model.dto.UpdateProfileRequest;
import apsas.identity.model.dto.UserResponse;
import apsas.identity.model.entity.User;
import apsas.identity.model.entity.UserRole;
import apsas.identity.repository.UserRepository;
import apsas.shared.cache.CacheConfig;
import apsas.shared.exception.BadRequestException;
import apsas.shared.exception.NotFoundException;
import apsas.shared.exception.UnauthorizedException;
import apsas.shared.models.pagination.PageResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
  private static final String USER_NOT_FOUND_MESSAGE = "User not found";
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final UserMapper userMapper;

  @Cacheable(value = CacheConfig.USERS_CACHE, key = "#userId", unless = "#result == null")
  @Transactional(readOnly = true)
  public UserResponse getUserById(UUID userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new NotFoundException(USER_NOT_FOUND_MESSAGE));
    return userMapper.toUserResponse(user);
  }

  @Transactional(readOnly = true)
  public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
    Page<User> userPage = userRepository.findAll(pageable);
    Page<UserResponse> responsePage = userPage.map(userMapper::toUserResponse);
    return PageResponse.of(responsePage);
  }

  @Transactional(readOnly = true)
  public PageResponse<UserResponse> getUsersByRole(UserRole role, Pageable pageable) {
    Page<User> userPage = userRepository.findByRole(role, pageable);
    Page<UserResponse> responsePage = userPage.map(userMapper::toUserResponse);
    return PageResponse.of(responsePage);
  }

  @CacheEvict(value = CacheConfig.USERS_BY_ROLE_CACHE, allEntries = true)
  @Transactional
  public UserResponse createUser(CreateUserRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new BadRequestException("Email already registered");
    }

    User user = userMapper.toUser(request);

    user = userRepository.save(user);
    return userMapper.toUserResponse(user);
  }

  @CachePut(value = CacheConfig.USERS_CACHE, key = "#userId")
  @Transactional
  public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new NotFoundException(USER_NOT_FOUND_MESSAGE));

    if (request.getFirstName() != null && !request.getFirstName().isEmpty()) {
      user.setFirstName(request.getFirstName());
    }

    if (request.getLastName() != null && !request.getLastName().isEmpty()) {
      user.setLastName(request.getLastName());
    }

    user = userRepository.save(user);
    return userMapper.toUserResponse(user);
  }

  @CacheEvict(value = CacheConfig.USERS_CACHE, key = "#userId")
  @Transactional
  public void changePassword(UUID userId, ChangePasswordRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new NotFoundException(USER_NOT_FOUND_MESSAGE));

    if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);
  }

  @CacheEvict(value = CacheConfig.USERS_CACHE, key = "#userId")
  @Transactional
  public void deactivateUser(UUID userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new NotFoundException(USER_NOT_FOUND_MESSAGE));

    user.setIsActive(false);
    userRepository.save(user);
  }

  @CacheEvict(value = CacheConfig.USERS_CACHE, key = "#userId")
  @Transactional
  public void activateUser(UUID userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new NotFoundException(USER_NOT_FOUND_MESSAGE));

    user.setIsActive(true);
    userRepository.save(user);
  }

  @Caching(
      evict = {
        @CacheEvict(value = CacheConfig.USERS_CACHE, key = "#userId"),
        @CacheEvict(value = CacheConfig.USERS_BY_ROLE_CACHE, allEntries = true)
      })
  @Transactional
  public void deleteUser(UUID userId) {
    if (!userRepository.existsById(userId)) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }
    userRepository.deleteById(userId);
  }

  // Internal service methods for Feign clients
  @Transactional(readOnly = true)
  public List<UserResponse> findUsersByIds(List<UUID> ids) {
    List<User> users = userRepository.findAllById(ids);
    return users.stream().map(userMapper::toUserResponse).toList();
  }

  @Cacheable(value = CacheConfig.USERS_BY_ROLE_CACHE, key = "#role")
  @Transactional(readOnly = true)
  public List<UserResponse> getUsersByRole(String role) {
    List<User> users = userRepository.findByRole(UserRole.valueOf(role));
    return users.stream().map(userMapper::toUserResponse).toList();
  }
}
