package apsas.content.model.dto;

import apsas.content.model.entity.DifficultyLevel;
import apsas.content.model.entity.TestCase;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UpdateAssignmentRequest {
  @Size(max = 255, message = "Title must not exceed 255 characters")
  private String title;

  private String description;
  private DifficultyLevel difficultyLevel;
  private LocalDateTime startDate;
  private LocalDateTime dueDate;

  @DecimalMin(value = "0.0", message = "Max score must be positive")
  @DecimalMax(value = "999.99", message = "Max score must not exceed 999.99")
  private BigDecimal maxScore;

  @Size(min = 1, message = "At least one language is required")
  private String[] languages;

  @Size(min = 1, message = "At least one test case is required")
  @Valid
  private List<TestCase> testCases;

  private Set<UUID> skillIds;
  private Set<UUID> tutorialIds;
}
