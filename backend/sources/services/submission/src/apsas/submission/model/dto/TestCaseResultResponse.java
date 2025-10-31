package apsas.submission.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
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
