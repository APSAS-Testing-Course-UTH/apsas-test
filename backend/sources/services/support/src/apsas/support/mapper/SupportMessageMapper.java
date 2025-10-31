package apsas.support.mapper;

import apsas.support.model.dto.SupportMessageDto;
import apsas.support.model.entity.SupportMessage;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants.ComponentModel;

/**
 * Mapper class dùng để chuyển đổi giữa SupportMessage và SupportMessageDto
 */
@Mapper(componentModel = ComponentModel.SPRING)
public interface SupportMessageMapper {
  SupportMessageDto toDto(SupportMessage message);

  List<SupportMessageDto> toDtoList(List<SupportMessage> messages);
}
