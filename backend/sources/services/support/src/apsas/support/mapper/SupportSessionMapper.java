package apsas.support.mapper;

import apsas.support.model.dto.SupportSessionResponse;
import apsas.support.model.entity.SupportSession;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants.ComponentModel;

/**
 * Mapper class dùng để chuyển đổi giữa SupportSession và SupportSessionResponse.
 */
@Mapper(componentModel = ComponentModel.SPRING, uses = SupportMessageMapper.class)
public interface SupportSessionMapper {
  SupportSessionResponse toDto(SupportSession session);
}
