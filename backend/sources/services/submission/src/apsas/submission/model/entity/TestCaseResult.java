package apsas.submission.model.entity;

import java.io.Serial;
import java.io.Serializable;
import lombok.Data;

@Data
public class TestCaseResult implements Serializable {

  @Serial
  private static final long serialVersionUID = 1L;

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
