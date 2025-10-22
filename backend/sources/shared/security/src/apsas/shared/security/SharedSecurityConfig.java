package apsas.shared.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

/** Cấu hình bảo mật chung cho ứng dụng web sử dụng Spring Security. */
@Configuration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@EnableWebSecurity
@EnableMethodSecurity
public class SharedSecurityConfig {
  @Bean
  public HeaderAuthenticationFilter headerAuthenticationFilter() {
    return new HeaderAuthenticationFilter();
  }
}
