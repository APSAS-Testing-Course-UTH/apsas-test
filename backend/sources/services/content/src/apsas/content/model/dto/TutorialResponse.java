package apsas.content.model.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class TutorialResponse {
  private UUID id;
  private String title;
  private String content;
  private UUID creatorId;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private String[] tags;
}
