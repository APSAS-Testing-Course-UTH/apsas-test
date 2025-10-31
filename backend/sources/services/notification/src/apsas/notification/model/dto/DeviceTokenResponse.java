package apsas.notification.model.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class DeviceTokenResponse {

  private UUID id;
  private String token;
  private String deviceType;
  private String userAgent;
  private Boolean isActive;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
