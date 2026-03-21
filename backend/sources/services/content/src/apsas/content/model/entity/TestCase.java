package apsas.content.model.entity;

import java.io.Serializable;
import lombok.Data;

@Data
public class TestCase implements Serializable {
  private static final long serialVersionUID = 1L;

  private Integer order;
  private String description;
  private Boolean hidden;
  private Double weight;
  private String input;
  private String output;
  private Integer timeout;
  private Integer memoryLimit;
}
