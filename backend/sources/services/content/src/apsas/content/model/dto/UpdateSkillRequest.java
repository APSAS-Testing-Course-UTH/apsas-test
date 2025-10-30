package apsas.content.model.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UpdateSkillRequest {
  @Size(max = 255, message = "Skill name must not exceed 255 characters")
  private String name;

  private String description;
}
