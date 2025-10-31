package apsas.notification.mapper;

import apsas.notification.model.dto.NotificationPreferencesRequest;
import apsas.notification.model.dto.NotificationPreferencesResponse;
import apsas.notification.model.entity.NotificationPreferences;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface NotificationPreferencesMapper {

  NotificationPreferencesResponse toResponse(NotificationPreferences preferences);

  void updateEntity(
      NotificationPreferencesRequest request, @MappingTarget NotificationPreferences preferences);
}
