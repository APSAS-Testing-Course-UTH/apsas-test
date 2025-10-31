package apsas.identity.mapper;

import apsas.identity.model.dto.CreateUserRequest;
import apsas.identity.model.dto.RegisterRequest;
import apsas.identity.model.dto.UserResponse;
import apsas.identity.model.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

@SuppressWarnings("SpringJavaAutowiredFieldsWarningInspection")
@Mapper(
    componentModel = "spring"
)
public abstract class UserMapper {
  @Autowired
  protected PasswordEncoder passwordEncoder;

  @Mapping(
      target = "passwordHash",
      expression = "java(passwordEncoder.encode(request.getPassword()))"
  )
  @Mapping(target = "updatedAt", ignore = true)
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  public abstract User toUser(CreateUserRequest request);

  public abstract UserResponse toUserResponse(User user);

  @Mapping(
      target = "passwordHash",
      expression = "java(passwordEncoder.encode(request.getPassword()))"
  )
  @Mapping(target = "role", constant = "STUDENT")
  @Mapping(target = "isActive", constant = "true")
  @Mapping(target = "isEmailVerified", constant = "false")
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  public abstract User toUserFromRegisterRequest(RegisterRequest request);
}
