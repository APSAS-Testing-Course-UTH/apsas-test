package apsas.gateway.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import io.qameta.allure.Allure;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Issue;
import io.qameta.allure.Owner;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import io.qameta.allure.TmsLink;
import java.io.IOException;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@AutoConfigureWebTestClient
@ActiveProfiles("integration")
@Tag("integration")
@Epic("API Gateway")
@Feature("BVA Route and Security Boundaries")
@Issue("21")
class ApiGatewayIntegrationTest {

  private static final AtomicInteger FORWARDED_REQUESTS = new AtomicInteger();

  private static HttpServer mockBackend;
  private static String mockBackendBaseUrl;

  @Autowired
  private WebTestClient webTestClient;

  @DynamicPropertySource
  static void registerDynamicProperties(DynamicPropertyRegistry registry) {
    ensureMockBackendStarted();
    registry.add("test.downstream.base-url", () -> mockBackendBaseUrl);
  }

  @AfterAll
  static void shutdownMockBackend() {
    if (mockBackend != null) {
      mockBackend.stop(0);
    }
  }

  private static Stream<Arguments> routeBoundaryCases() {
    return Stream.of(
        Arguments.of("/api/auth/login", 200, true, "/api/auth/login"),
        Arguments.of("/api/auth/login/extra", 200, true, "/api/auth/login/extra"),
        Arguments.of("/api/authx/login", 401, false, null),
        Arguments.of("/api-docs/evaluation-service", 200, true, "/api-docs"),
        Arguments.of("/api-docs/evaluation-servic", 404, false, null),
        Arguments.of("/api-docs/evaluation-service/", 200, true, "/api-docs"),
        Arguments.of("/api/v1/runtimes", 401, false, null),
        Arguments.of("/api/v1/runtimes/health", 401, false, null),
        Arguments.of("/api/v1/runtime", 401, false, null)
    );
  }

  private static synchronized void ensureMockBackendStarted() {
    if (mockBackend != null) {
      return;
    }

    try {
      mockBackend = HttpServer.create(new InetSocketAddress(0), 0);
      mockBackend.createContext("/api/auth/", ApiGatewayIntegrationTest::respondOkWithPath);
      mockBackend.createContext("/api/auth/slow", ApiGatewayIntegrationTest::respondSlowResponse);
      mockBackend.createContext("/api/auth/upload", ApiGatewayIntegrationTest::respondUpload);
      mockBackend.createContext("/api-docs", ApiGatewayIntegrationTest::respondOkWithPath);
      mockBackend.start();
      mockBackendBaseUrl = "http://localhost:" + mockBackend.getAddress().getPort();
    } catch (IOException exception) {
      throw new UncheckedIOException(exception);
    }
  }

  private static void respondOkWithPath(HttpExchange exchange) throws IOException {
    FORWARDED_REQUESTS.incrementAndGet();
    byte[] body = ("path=" + exchange.getRequestURI().getPath()).getBytes(StandardCharsets.UTF_8);

    exchange.getResponseHeaders().add("Content-Type", "text/plain;charset=UTF-8");
    exchange.sendResponseHeaders(200, body.length);

    try (OutputStream output = exchange.getResponseBody()) {
      output.write(body);
    }
  }

  private static void respondSlowResponse(HttpExchange exchange) throws IOException {
    try {
      Thread.sleep(3000);
    } catch (InterruptedException exception) {
      Thread.currentThread().interrupt();
      throw new IOException("Interrupted while simulating slow backend", exception);
    }
    respondOkWithPath(exchange);
  }

  private static void respondUpload(HttpExchange exchange) throws IOException {
    FORWARDED_REQUESTS.incrementAndGet();
    exchange.getRequestBody().readAllBytes();

    byte[] body = "uploaded".getBytes(StandardCharsets.UTF_8);
    exchange.getResponseHeaders().add("Content-Type", "text/plain;charset=UTF-8");
    exchange.sendResponseHeaders(200, body.length);

    try (OutputStream output = exchange.getResponseBody()) {
      output.write(body);
    }
  }

  @BeforeEach
  void resetCounter() {
    FORWARDED_REQUESTS.set(0);
  }

  @DisplayName("Applies BVA for route and security boundaries in API Gateway")
  @Description(
      "Verifies Min-/Min/Min+ boundary cases for permitAll paths, exact docs path, and protected routes."
  )
  @Story("Boundary path matching between permitAll and authenticated routes")
  @Severity(SeverityLevel.CRITICAL)
  @Owner("backend-team")
  @TmsLink("GW-BVA-001")
  @ParameterizedTest(name = "[{index}] GET {0} -> {1}")
  @MethodSource("routeBoundaryCases")
  void gateway_shouldApplyExpectedBoundaryBehavior_whenRequestPathVaries(
      String path,
      int expectedStatus,
      boolean shouldForward,
      String expectedForwardedPath
  ) {
    Allure.parameter("Path", path);
    Allure.parameter("Expected Status", expectedStatus);
    Allure.parameter("Should Forward", shouldForward);
    Allure.parameter("Expected Forwarded Path", expectedForwardedPath);

    int forwardedBefore = FORWARDED_REQUESTS.get();

    var response = webTestClient.get()
        .uri(path)
        .exchange()
        .expectStatus()
        .isEqualTo(expectedStatus);

    if (shouldForward) {
      assertNotNull(expectedForwardedPath);
      response.expectBody(String.class)
          .value(body -> assertTrue(body.contains("path=" + expectedForwardedPath)));
      assertEquals(forwardedBefore + 1, FORWARDED_REQUESTS.get());
      return;
    }

    assertEquals(forwardedBefore, FORWARDED_REQUESTS.get());
  }

  @Test
  @DisplayName("Rejects invalid bearer token on protected route")
  @Description(
      "Checks token-state boundary when Authorization header is present but token is invalid."
  )
  @Story("JWT boundary on protected endpoint")
  @Severity(SeverityLevel.CRITICAL)
  @Owner("backend-team")
  @TmsLink("GW-BVA-010")
  void gateway_shouldRejectInvalidBearerToken_whenAccessingProtectedRoute() {
    int forwardedBefore = FORWARDED_REQUESTS.get();

    webTestClient.get()
        .uri("/api/v1/runtimes")
        .header("Authorization", "Bearer invalid-token")
        .exchange()
        .expectStatus()
        .isUnauthorized();

    assertEquals(forwardedBefore, FORWARDED_REQUESTS.get());
  }

  @Test
  @DisplayName("Returns 429 when rate-limit exceeds Max+ boundary")
  @Description(
      "Applies BVA for rate limit: the 21st request in the same rate-limit window is blocked."
  )
  @Story("Rate limiting boundary")
  @Severity(SeverityLevel.CRITICAL)
  @Owner("backend-team")
  @TmsLink("GW-BVA-011")
  void gateway_shouldReturnTooManyRequests_whenRateLimitExceeded() {
    Allure.parameter("Max", 20);
    Allure.parameter("Max+", 21);

    IntStream.range(0, 20).parallel().forEach(
        ignored -> webTestClient.get()
            .uri("/api/auth/rate-limit")
            .exchange()
            .expectStatus()
            .isOk());

    webTestClient.get()
        .uri("/api/auth/rate-limit")
        .exchange()
        .expectStatus()
        .isEqualTo(429);
  }

  @Test
  @DisplayName("Returns gateway timeout when downstream exceeds response timeout")
  @Description(
      "Applies timeout boundary check: downstream delay beyond configured threshold results in 504."
  )
  @Story("Gateway timeout boundary")
  @Severity(SeverityLevel.CRITICAL)
  @Owner("backend-team")
  @TmsLink("GW-BVA-012")
  void gateway_shouldReturnGatewayTimeout_whenDownstreamExceedsResponseTimeout() {
    Allure.parameter("Max", "2s");
    Allure.parameter("Max+", "3s");

    webTestClient.get()
        .uri("/api/auth/slow")
        .exchange()
        .expectStatus()
        .isEqualTo(504);
  }

  @Test
  @DisplayName("Rejects request body larger than payload size boundary")
  @Description(
      "Applies payload-size boundary with RequestSize filter where 1KB is the configured threshold."
  )
  @Story("Payload size boundary")
  @Severity(SeverityLevel.CRITICAL)
  @Owner("backend-team")
  @TmsLink("GW-BVA-013")
  void gateway_shouldRejectPayloadTooLarge_whenRequestBodyExceedsLimit() {
    Allure.parameter("Max", "1KB");
    Allure.parameter("Max+", "1.5KB");


    String underLimitPayload = "a".repeat(900);
    String overLimitPayload = "a".repeat(1400);

    webTestClient.post()
        .uri("/api/auth/upload")
        .bodyValue(underLimitPayload)
        .exchange()
        .expectStatus()
        .isOk();

    webTestClient.post()
        .uri("/api/auth/upload")
        .bodyValue(overLimitPayload)
        .exchange()
        .expectStatus()
        .isEqualTo(413);
  }

  @Test
  @DisplayName("Rejects oversized request header at Max+ boundary")
  @Description("Applies request-header boundary check where header size above limit is rejected.")
  @Story("Header size boundary")
  @Severity(SeverityLevel.CRITICAL)
  @Owner("backend-team")
  @TmsLink("GW-BVA-014")
  void gateway_shouldRejectRequest_whenHeaderExceedsMaxSize() {
    String oversizedHeader = "x".repeat(9000);

    webTestClient.get()
        .uri("/api/auth/login")
        .header("X-Large", oversizedHeader)
        .exchange()
        .expectStatus()
        .isEqualTo(431);
  }
}
