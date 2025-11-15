package apsas.shared.models.submission;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO dùng chung cho kết quả thực thi test case.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseResultResponse {
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
