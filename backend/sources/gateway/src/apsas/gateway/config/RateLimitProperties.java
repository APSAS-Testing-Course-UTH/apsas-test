package apsas.gateway.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Component
@Validated
@ConfigurationProperties(prefix = "apsas.gateway.rate-limit")
public class RateLimitProperties {

  @Min(1)
  private int maxRequests;

  @Min(1)
  private int windowSeconds;

  @NotBlank
  private String pathPrefix;
}
