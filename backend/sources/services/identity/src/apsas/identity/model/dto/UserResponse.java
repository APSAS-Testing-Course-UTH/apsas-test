package apsas.identity.model.dto;

import apsas.identity.model.entity.UserRole;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {

  private UUID id;
  private String email;
  private String firstName;
  private String lastName;
  private UserRole role;
  private Boolean isActive;
  private Boolean isEmailVerified;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
