package apsas.notification.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegisterDeviceRequest {

  @NotBlank(message = "Device token is required")
  private String token;

  @NotBlank(message = "Device type is required")
  private String deviceType;

  private String userAgent;
}
