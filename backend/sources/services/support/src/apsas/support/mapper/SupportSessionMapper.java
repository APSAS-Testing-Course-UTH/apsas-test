package apsas.support.mapper;

import apsas.support.model.dto.SupportSessionDto;
import apsas.support.model.entity.SupportSession;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants.ComponentModel;

/** Mapper class dùng để chuyển đổi giữa SupportSession và SupportSessionDto */
@Mapper(
    componentModel = ComponentModel.SPRING,
    uses = {SupportMessageMapper.class})
public interface SupportSessionMapper {
  SupportSessionDto toDto(SupportSession session);
}
