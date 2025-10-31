package apsas.identity.model.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class AuthResponse {
  private final String token;
  private final String type = "Bearer";
  private final UserResponse user;
}
