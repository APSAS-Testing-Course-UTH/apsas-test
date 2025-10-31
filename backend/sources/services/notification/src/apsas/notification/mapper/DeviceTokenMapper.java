package apsas.notification.mapper;

import apsas.notification.model.dto.DeviceTokenResponse;
import apsas.notification.model.dto.RegisterDeviceRequest;
import apsas.notification.model.entity.DeviceToken;
import java.util.UUID;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DeviceTokenMapper {

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "userId", source = "userId")
  @Mapping(target = "isActive", constant = "true")
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  DeviceToken toEntity(RegisterDeviceRequest request, UUID userId);

  DeviceTokenResponse toResponse(DeviceToken deviceToken);
}
