package apsas.identity.mapper;

import apsas.identity.model.dto.UserResponse;
import apsas.identity.model.entity.UserRole;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface FeignUserMapper {

  @Mapping(target = "role", source = "role", qualifiedByName = "userRoleToString")
  apsas.feign.dto.UserResponse toFeignDto(UserResponse userResponse);

  @Named("userRoleToString")
  default String userRoleToString(UserRole role) {
    return role != null ? role.name() : null;
  }
}
