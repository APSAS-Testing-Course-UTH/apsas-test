package apsas.shared.models.submission;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Shared DTO for Test Case execution results.
 * Used across submission and evaluation services for consistent result reporting.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseResultDto {
  private Integer order;
  private String description;
  private Boolean hidden;
  private Double weight;
  private String input;
  private String output;
  private Integer timeout;
  private Integer memoryLimit;
  private Boolean passed;
  private String actualOutput;
  private String errorMessage;
  private Double executionTime;
  private Double memoryUsed;
}
