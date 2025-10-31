package apsas.identity.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class EmailRequest {
  @NotBlank(message = "Email is required")
  @Email(message = "Email must be valid")
  private String email;
}
