package apsas.content.model.entity;

import lombok.Data;

@Data
public class TestCase {
  private Integer order;
  private String description;
  private Boolean hidden;
  private Double weight;
  private String input;
  private String output;
  private Integer timeout;
  private Integer memoryLimit;
}
