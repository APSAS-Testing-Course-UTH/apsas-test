package apsas.identity.mapper;

import apsas.identity.model.dto.CreateUserRequest;
import apsas.identity.model.dto.RegisterRequest;
import apsas.identity.model.dto.UserResponse;
import apsas.identity.model.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

@Mapper(componentModel = "spring")
public abstract class UserMapper {

  @Autowired protected PasswordEncoder passwordEncoder;

  @Mapping(target = "passwordHash", source = "password", qualifiedByName = "encodePassword")
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  public abstract User toUser(CreateUserRequest request);

  public abstract UserResponse toUserResponse(User user);

  @Mapping(target = "passwordHash", source = "password", qualifiedByName = "encodePassword")
  @Mapping(target = "role", constant = "STUDENT")
  @Mapping(target = "isActive", constant = "true")
  @Mapping(target = "isEmailVerified", constant = "false")
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  public abstract User toUserFromRegisterRequest(RegisterRequest request);

  @Named("encodePassword")
  public String encodePassword(String password) {
    return passwordEncoder.encode(password);
  }
}
