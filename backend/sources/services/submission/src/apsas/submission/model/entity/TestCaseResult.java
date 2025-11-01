package apsas.submission.model.entity;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class TestCaseResult {
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
