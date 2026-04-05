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
@Validated
@Component
@ConfigurationProperties(prefix = "apsas.gateway.header-limit")
public class HeaderLimitProperties {

  @Min(1)
  private int maxSizeBytes;

  @NotBlank
  private String pathPrefix;
}
