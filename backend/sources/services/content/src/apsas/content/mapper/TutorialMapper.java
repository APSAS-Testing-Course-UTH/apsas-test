package apsas.content.mapper;

import apsas.content.model.dto.CreateTutorialRequest;
import apsas.content.model.dto.TutorialResponse;
import apsas.content.model.dto.UpdateTutorialRequest;
import apsas.content.model.entity.Tutorial;
import java.util.UUID;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TutorialMapper {

  @Mapping(target = "creatorId", source = "creatorId")
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  @Mapping(target = "assignments", ignore = true)
  Tutorial toEntity(CreateTutorialRequest request, UUID creatorId);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "creatorId", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  @Mapping(target = "assignments", ignore = true)
  void updateEntity(@MappingTarget Tutorial tutorial, UpdateTutorialRequest request);

  TutorialResponse toResponse(Tutorial tutorial);
}
