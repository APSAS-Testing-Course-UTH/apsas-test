package apsas.content.model.entity;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
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
