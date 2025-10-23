package apsas.identity.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class AuthResponse {
  private String token;
  private String type = "Bearer";
  private UserResponse user;

  public AuthResponse(String token, UserResponse user) {
    this.token = token;
    this.user = user;
  }
}
