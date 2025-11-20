package apsas.gateway.config;

import apsas.shared.security.HeaderAuthenticationToken;
import apsas.shared.security.JwtClaims;
import apsas.shared.security.UserPrincipal;
import java.util.List;
import java.util.UUID;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity.CsrfSpec;
import org.springframework.security.config.web.server.ServerHttpSecurity.FormLoginSpec;
import org.springframework.security.config.web.server.ServerHttpSecurity.HttpBasicSpec;
import org.springframework.security.core.userdetails.MapReactiveUserDetailsService;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.web.server.authentication.ServerBearerTokenAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class SecurityConfig {
  private final SecurityProperties securityProperties;

  @Value("${jwt.secret}")
  private String jwtSecret;

  @Bean
  public ReactiveJwtDecoder jwtDecoder() {
    SecretKeySpec secretKey = new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA256");
    return NimbusReactiveJwtDecoder.withSecretKey(secretKey).build();
  }

  @Bean
  @Order(1)
  public SecurityWebFilterChain actuatorSecurityWebFilterChain(ServerHttpSecurity http) {
    return http.securityMatcher(new PathPatternParserServerWebExchangeMatcher("/actuator/**"))
        .authorizeExchange(
            exchanges ->
                exchanges
                    .anyExchange()
                    .hasRole("ADMIN"))
        .httpBasic(Customizer.withDefaults())
        .csrf(CsrfSpec::disable)
        .formLogin(FormLoginSpec::disable)
        .cors(Customizer.withDefaults())
        .build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    var configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(List.of("*"));
    configuration.setAllowedMethods(List.of("*"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);
    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  @Bean
  public ReactiveUserDetailsService reactiveUserDetailsService() {
    var user = User.withUsername(securityProperties.getUser().getName())
        .password("{noop}" + securityProperties.getUser().getPassword())
        .roles("ADMIN")
        .build();
    return new MapReactiveUserDetailsService(user);
  }

  @Bean
  @Order(2)
  public SecurityWebFilterChain securityWebFilterChain(
      ServerHttpSecurity http,
      ServerBearerTokenAuthenticationConverter bearerTokenConverter,
      JwtToAuthenticationTokenConverter jwtConverter
  ) {
    return http.authorizeExchange(
            exchanges ->
                exchanges
                    .pathMatchers("/api/auth/**")
                    .permitAll()
                    .pathMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                    .permitAll()
                    .pathMatchers("/ws/support/**")
                    .permitAll()
                    .anyExchange()
                    .authenticated())
        .oauth2ResourceServer(
            oauth2 -> oauth2
                .bearerTokenConverter(bearerTokenConverter)
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter)))
        .csrf(CsrfSpec::disable)
        .httpBasic(HttpBasicSpec::disable)
        .formLogin(FormLoginSpec::disable)
        .build();
  }

  @Bean
  ServerBearerTokenAuthenticationConverter serverBearerTokenAuthenticationConverter() {
    var converter = new ServerBearerTokenAuthenticationConverter();
    converter.setAllowUriQueryParameter(true);
    return converter;
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
