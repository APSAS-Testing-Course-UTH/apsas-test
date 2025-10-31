package apsas.identity.model.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {

  @Size(max = 100, message = "First name must not exceed 100 characters")
  private String firstName;

  @Size(max = 100, message = "Last name must not exceed 100 characters")
  private String lastName;
}
