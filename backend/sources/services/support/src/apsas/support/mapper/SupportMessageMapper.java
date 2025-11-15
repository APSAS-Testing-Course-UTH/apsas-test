package apsas.support.mapper;

import apsas.support.model.dto.SupportMessageResponse;
import apsas.support.model.entity.SupportMessage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants.ComponentModel;

/**
 * Mapper class dùng để chuyển đổi giữa SupportMessage và các DTO liên quan.
 */
@Mapper(componentModel = ComponentModel.SPRING)
public interface SupportMessageMapper {
  @Mapping(target = "sessionId", source = "session.id")
  SupportMessageResponse toDto(SupportMessage message);
}
