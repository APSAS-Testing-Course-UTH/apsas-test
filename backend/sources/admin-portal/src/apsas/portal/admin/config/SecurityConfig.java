package apsas.portal.admin.config;

import static org.springframework.http.HttpMethod.DELETE;
import static org.springframework.http.HttpMethod.POST;

import de.codecentric.boot.admin.server.config.AdminServerProperties;
import jakarta.servlet.DispatcherType;
import java.util.UUID;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
  private final AdminServerProperties adminServer;

  @Value("${jwt.secret}")
  private String jwtSecret;

  @Bean
  public JwtDecoder jwtDecoder() {
    SecretKeySpec secretKey = new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA256");
    return NimbusJwtDecoder.withSecretKey(secretKey).build();
  }

  @Bean
  public SecurityFilterChain securityFilterChain(
      HttpSecurity http
  ) throws Exception {
    var successHandler = new SavedRequestAwareAuthenticationSuccessHandler();
    successHandler.setTargetUrlParameter("redirectTo");
    successHandler.setDefaultTargetUrl(this.adminServer.path("/"));

    return http
        .authorizeHttpRequests(authorizeRequests -> authorizeRequests
            .requestMatchers(".well-known/appspecific/com.chrome.devtools.json")
            .permitAll()
            .requestMatchers(PathPatternRequestMatcher.withDefaults()
                .matcher(this.adminServer.path("/assets/**")))
            .permitAll()
            .requestMatchers(PathPatternRequestMatcher.withDefaults()
                .matcher("/css/**"))
            .permitAll()
            .requestMatchers(
                PathPatternRequestMatcher.withDefaults()
                    .matcher(this.adminServer.path("/actuator/info")))
            .permitAll()
            .requestMatchers(PathPatternRequestMatcher.withDefaults()
                .matcher(adminServer.path("/actuator/health")))
            .permitAll()
            .requestMatchers(PathPatternRequestMatcher.withDefaults()
                .matcher(this.adminServer.path("/login")))
            .permitAll()
            .dispatcherTypeMatchers(DispatcherType.ASYNC)
            .permitAll() // https://github.com/spring-projects/spring-security/issues/11027
            .anyRequest()
            .authenticated())
        .formLogin(
            formLogin -> formLogin.loginPage(this.adminServer.path("/login"))
                .successHandler(successHandler))
        .logout(logout -> logout.logoutUrl(this.adminServer.path("/logout")))
        .addFilterAfter(new CustomCsrfFilter(), BasicAuthenticationFilter.class)
        .csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
            .ignoringRequestMatchers(
                PathPatternRequestMatcher.withDefaults()
                    .matcher(POST, this.adminServer.path("/instances")),
                PathPatternRequestMatcher.withDefaults()
                    .matcher(DELETE, this.adminServer.path("/instances/*")),
                PathPatternRequestMatcher.withDefaults()
                    .matcher(this.adminServer.path("/actuator/**"))
            ))
        .rememberMe(rememberMe -> rememberMe.key(UUID.randomUUID().toString())
            .tokenValiditySeconds(1800))
        .build();
  }
}
