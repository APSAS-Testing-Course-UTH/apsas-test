package apsas.content.model.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UpdateTutorialRequest {
  @Size(max = 255, message = "Title must not exceed 255 characters")
  private String title;

  private String content;
  private String[] tags;
}
