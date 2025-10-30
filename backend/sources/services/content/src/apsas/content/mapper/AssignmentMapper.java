package apsas.content.mapper;

import apsas.content.model.dto.AssignmentResponse;
import apsas.content.model.dto.CreateAssignmentRequest;
import apsas.content.model.dto.SkillResponse;
import apsas.content.model.dto.TutorialResponse;
import apsas.content.model.dto.UpdateAssignmentRequest;
import apsas.content.model.entity.Assignment;
import apsas.content.model.entity.Skill;
import apsas.content.model.entity.Tutorial;
import java.util.Set;
import java.util.UUID;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
    uses = {SkillMapper.class, TutorialMapper.class})
public interface AssignmentMapper {

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  @Mapping(target = "skills", ignore = true)
  @Mapping(target = "tutorials", ignore = true)
  @Mapping(target = "status", constant = "DRAFT")
  Assignment toEntity(CreateAssignmentRequest request, UUID creatorId);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  @Mapping(target = "creatorId", ignore = true)
  @Mapping(target = "status", ignore = true)
  @Mapping(target = "skills", ignore = true)
  @Mapping(target = "tutorials", ignore = true)
  void updateEntity(@MappingTarget Assignment assignment, UpdateAssignmentRequest request);

  @Mapping(target = "skills", source = "skills")
  @Mapping(target = "tutorials", source = "tutorials")
  AssignmentResponse toResponse(Assignment assignment);

  Set<SkillResponse> mapSkills(Set<Skill> skills);

  Set<TutorialResponse> mapTutorials(Set<Tutorial> tutorials);
}
