package apsas.feign.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TestCaseResultDto {
  private String description;
  private Boolean passed;
  private String expected;
  private String actual;
  private String errorMessage;
}
