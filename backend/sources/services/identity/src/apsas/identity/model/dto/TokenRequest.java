package apsas.identity.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class TokenRequest {

  @NotBlank(message = "Token is required")
  private String token;

}