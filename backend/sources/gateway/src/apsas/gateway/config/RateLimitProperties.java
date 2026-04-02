package apsas.gateway.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "apsas.gateway.rate-limit")
public class RateLimitProperties {
  private int maxRequests = 20;
  private int windowSeconds = 1;
  private String pathPrefix = "/api/";
}
