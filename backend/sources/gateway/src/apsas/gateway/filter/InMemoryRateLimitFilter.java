package apsas.gateway.filter;

import apsas.gateway.config.RateLimitProperties;
import java.util.concurrent.ConcurrentHashMap;
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
public class InMemoryRateLimitFilter implements GlobalFilter, Ordered {

  private final RateLimitProperties rateLimitProperties;
  private final ConcurrentHashMap<String, FixedWindowCounter> counters = new ConcurrentHashMap<>();

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    var path = exchange.getRequest().getURI().getPath();
    if (!path.startsWith(rateLimitProperties.getPathPrefix())) {
      return chain.filter(exchange);
    }

    var clientIp = exchange.getRequest().getRemoteAddress() == null
        ? "unknown"
        : exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();

    var key = clientIp + ":" + path;
    var now = System.currentTimeMillis();

    var counter = counters.computeIfAbsent(key, ignored -> new FixedWindowCounter(now));

    boolean limited;
    synchronized (counter) {
      var windowMs = rateLimitProperties.getWindowSeconds() * 1000L;
      if (now - counter.windowStartMillis >= windowMs) {
        counter.windowStartMillis = now;
        counter.requestCount = 0;
      }

      if (counter.requestCount >= rateLimitProperties.getMaxRequests()) {
        limited = true;
      } else {
        counter.requestCount++;
        limited = false;
      }
    }

    if (limited) {
      exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
      return exchange.getResponse().setComplete();
    }

    return chain.filter(exchange);
  }

  @Override
  public int getOrder() {
    return -200;
  }

  private static final class FixedWindowCounter {
    private long windowStartMillis;
    private int requestCount;

    private FixedWindowCounter(long windowStartMillis) {
      this.windowStartMillis = windowStartMillis;
      this.requestCount = 0;
    }
  }
}
