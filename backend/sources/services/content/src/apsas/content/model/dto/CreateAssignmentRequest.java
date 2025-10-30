package apsas.content.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import apsas.content.model.entity.DifficultyLevel;
import apsas.content.model.entity.TestCase;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CreateAssignmentRequest {
  @NotBlank(message = "Title is required")
  @Size(max = 255, message = "Title must not exceed 255 characters")
  private String title;

  @NotBlank(message = "Description is required")
  private String description;

  @NotNull(message = "Difficulty level is required")
  private DifficultyLevel difficultyLevel;

  private LocalDateTime startDate;
  private LocalDateTime dueDate;

  @NotNull(message = "Max score is required")
  @DecimalMin(value = "0.0", message = "Max score must be positive")
  @DecimalMax(value = "999.99", message = "Max score must not exceed 999.99")
  private BigDecimal maxScore;

  @NotNull(message = "Languages are required")
  @Size(min = 1, message = "At least one language is required")
  private String[] languages;

  @NotNull(message = "Test cases are required")
  @Size(min = 1, message = "At least one test case is required")
  @Valid
  private List<TestCase> testCases;

  private Set<UUID> skillIds;
  private Set<UUID> tutorialIds;
}
