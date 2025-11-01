package apsas.feign.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
  private UUID id;
  private String email;
  private String firstName;
  private String lastName;
  private String role;
  private Boolean isActive;
  private Boolean isEmailVerified;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
