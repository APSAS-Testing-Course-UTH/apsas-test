package apsas.feign.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AssignmentResponse {
  private UUID id;
  private String title;
  private String description;
  private String difficultyLevel;
  private UUID creatorId;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime startDate;
  private LocalDateTime dueDate;
  private BigDecimal maxScore;
  private String status;
  private String[] languages;
  private List<TestCaseDto> testCases;
}
