package apsas.content.model.dto;

import apsas.content.model.entity.AssignmentStatus;
import apsas.content.model.entity.DifficultyLevel;
import apsas.content.model.entity.TestCase;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AssignmentResponse {
  private UUID id;
  private String title;
  private String description;
  private DifficultyLevel difficultyLevel;
  private UUID creatorId;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime startDate;
  private LocalDateTime dueDate;
  private BigDecimal maxScore;
  private AssignmentStatus status;
  private String[] languages;
  private List<TestCase> testCases;
  private Set<SkillResponse> skills;
  private Set<TutorialResponse> tutorials;
}
