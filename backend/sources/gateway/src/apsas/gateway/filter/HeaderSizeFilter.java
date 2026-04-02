package apsas.gateway.filter;

import apsas.gateway.config.HeaderLimitProperties;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class HeaderSizeFilter implements GlobalFilter, Ordered {

  private final HeaderLimitProperties headerLimitProperties;

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String path = exchange.getRequest().getURI().getPath();
    if (!path.startsWith(headerLimitProperties.getPathPrefix())) {
      return chain.filter(exchange);
    }

    int headerSizeBytes = exchange.getRequest().getHeaders().entrySet().stream()
        .mapToInt(entry -> {
          int keySize = entry.getKey().getBytes(StandardCharsets.UTF_8).length;
          int valuesSize = entry.getValue().stream()
              .mapToInt(value -> value.getBytes(StandardCharsets.UTF_8).length)
              .sum();
          return keySize + valuesSize;
        })
        .sum();

    if (headerSizeBytes > headerLimitProperties.getMaxSizeBytes()) {
      exchange.getResponse().setStatusCode(HttpStatus.REQUEST_HEADER_FIELDS_TOO_LARGE);
      return exchange.getResponse().setComplete();
    }

    return chain.filter(exchange);
  }

  @Override
  public int getOrder() {
    return -210;
  }
}
