package apsas.content.mapper;

import apsas.content.model.dto.CreateSkillRequest;
import apsas.content.model.dto.SkillResponse;
import apsas.content.model.dto.UpdateSkillRequest;
import apsas.content.model.entity.Skill;
import org.springframework.stereotype.Component;

@Component
public class SkillMapper {

  public Skill toEntity(CreateSkillRequest request) {
    Skill skill = new Skill();
    skill.setName(request.getName());
    skill.setDescription(request.getDescription());
    return skill;
  }

  public void updateEntity(Skill skill, UpdateSkillRequest request) {
    if (request.getName() != null) {
      skill.setName(request.getName());
    }
    if (request.getDescription() != null) {
      skill.setDescription(request.getDescription());
    }
  }

  public SkillResponse toResponse(Skill skill) {
    SkillResponse response = new SkillResponse();
    response.setId(skill.getId());
    response.setName(skill.getName());
    response.setDescription(skill.getDescription());
    response.setCreatedAt(skill.getCreatedAt());
    response.setUpdatedAt(skill.getUpdatedAt());
    return response;
  }
}
