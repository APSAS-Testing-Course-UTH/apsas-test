package apsas.gateway.config;

import apsas.shared.security.HeaderAuthenticationToken;
import apsas.shared.security.JwtClaims;
import apsas.shared.security.UserPrincipal;
import java.util.UUID;
import javax.crypto.spec.SecretKeySpec;
import org.jspecify.annotations.NonNull;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {
  @Value("${jwt.secret}")
  private String jwtSecret;

  @Bean
  public ReactiveJwtDecoder jwtDecoder() {
    SecretKeySpec secretKey = new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA256");
    return NimbusReactiveJwtDecoder.withSecretKey(secretKey).build();
  }

  @Bean
  public SecurityWebFilterChain securityWebFilterChain(
      ServerHttpSecurity http, JwtToAuthenticationTokenConverter jwtConverter) {
    return http.authorizeExchange(
            exchanges ->
                exchanges
                    .pathMatchers("/api/auth/**")
                    .permitAll()
                    .pathMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                    .permitAll()
                    .anyExchange()
                    .authenticated())
        .oauth2ResourceServer(
            oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter)))
        .csrf(ServerHttpSecurity.CsrfSpec::disable)
        .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
        .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
        .build();
  }

  @Component
  public static class JwtToAuthenticationTokenConverter
      implements Converter<Jwt, Mono<? extends AbstractAuthenticationToken>> {
    @Override
    public @Nullable Mono<? extends AbstractAuthenticationToken> convert(@NonNull Jwt source) {
      return Mono.just(source)
          .map(
              jwt -> {
                var userId = jwt.getClaimAsString(JwtClaims.USER_ID);
                var email = jwt.getClaimAsString(JwtClaims.EMAIL);
                var firstName = jwt.getClaimAsString(JwtClaims.FIRST_NAME);
                var lastName = jwt.getClaimAsString(JwtClaims.LAST_NAME);
                var isActive = jwt.getClaimAsBoolean(JwtClaims.IS_ACTIVE);
                var role = jwt.getClaimAsString(JwtClaims.ROLE);
                return new UserPrincipal(
                    UUID.fromString(userId), email, firstName, lastName, role, isActive);
              })
          .map(HeaderAuthenticationToken::new);
    }
  }
}
