package apsas.identity.mapper;

import apsas.identity.model.dto.CreateUserRequest;
import apsas.identity.model.dto.RegisterRequest;
import apsas.identity.model.dto.UserResponse;
import apsas.identity.model.entity.User;
import apsas.identity.model.entity.UserRole;
import org.springframework.security.crypto.password.PasswordEncoder;

public class UserMapper {

  private UserMapper() {
    // Utility class
  }

  public static User toUser(CreateUserRequest request, PasswordEncoder passwordEncoder) {
    if (request == null) {
      return null;
    }

    User user = new User();
    user.setEmail(request.getEmail());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setFirstName(request.getFirstName());
    user.setLastName(request.getLastName());
    user.setRole(request.getRole());
    user.setIsActive(request.getIsActive());
    user.setIsEmailVerified(request.getIsEmailVerified());

    return user;
  }

  public static UserResponse toUserResponse(User user) {
    if (user == null) {
      return null;
    }

    UserResponse response = new UserResponse();
    response.setId(user.getId());
    response.setEmail(user.getEmail());
    response.setFirstName(user.getFirstName());
    response.setLastName(user.getLastName());
    response.setRole(user.getRole());
    response.setIsActive(user.getIsActive());
    response.setIsEmailVerified(user.getIsEmailVerified());
    response.setCreatedAt(user.getCreatedAt());
    response.setUpdatedAt(user.getUpdatedAt());

    return response;
  }

  public static User toUserFromRegisterRequest(
      RegisterRequest request, PasswordEncoder passwordEncoder) {
    if (request == null) {
      return null;
    }

    User user = new User();
    user.setEmail(request.getEmail());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setFirstName(request.getFirstName());
    user.setLastName(request.getLastName());
    user.setRole(UserRole.STUDENT);
    user.setIsActive(true);
    user.setIsEmailVerified(false);

    return user;
  }
}