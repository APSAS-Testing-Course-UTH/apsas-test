package apsas.gateway.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "apsas.gateway.header-limit")
public class HeaderLimitProperties {
  private int maxSizeBytes;
  private String pathPrefix;
}
