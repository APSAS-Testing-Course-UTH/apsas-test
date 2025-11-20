package apsas.evaluation.client;

import apsas.evaluation.exception.PistonApiException;
import apsas.evaluation.model.dto.PistonExecuteRequest;
import apsas.evaluation.model.dto.PistonExecuteResponse;
import apsas.evaluation.model.dto.RuntimeResponse;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Client for interacting with Piston API v2
 */
@Component
@Slf4j
public class PistonApiClient {
  private final RestClient restClient;

  public PistonApiClient(
      @Value("${piston.api.url}")
      String pistonApiUrl
  ) {
    this.restClient =
        RestClient.builder()
            .baseUrl(pistonApiUrl)
            .defaultHeader("Content-Type", "application/json")
            .build();
  }

  /**
   * Get list of supported runtimes from Piston API
   *
   * @return List of supported runtimes
   * @throws PistonApiException if the API call fails
   */
  @Retryable(
      retryFor = {Exception.class},
      backoff = @Backoff(delay = 1000, multiplier = 2)
  )
  public List<RuntimeResponse> getRuntimes() {
    try {
      return restClient
          .get()
          .uri("/api/v2/runtimes")
          .retrieve()
          .onStatus(
              HttpStatusCode::is4xxClientError,
              (request, response) -> {
                throw new PistonApiException(
                    "Client error when fetching runtimes: " + response.getStatusCode());
              }
          )
          .onStatus(
              HttpStatusCode::is5xxServerError,
              (request, response) -> {
                throw new PistonApiException(
                    "Server error when fetching runtimes: " + response.getStatusCode());
              }
          )
          .body(new ParameterizedTypeReference<>() {});
    } catch (Exception e) {
      throw new PistonApiException("Failed to fetch runtimes: " + e.getMessage(), e);
    }
  }

  /**
   * Execute code using Piston API
   *
   * @param request Execution request containing code, language, and test inputs
   * @return Execution result
   * @throws PistonApiException if the API call fails
   */
  @Retryable(
      retryFor = {Exception.class},
      backoff = @Backoff(delay = 1000, multiplier = 2)
  )
  public PistonExecuteResponse execute(PistonExecuteRequest request) {
    log.debug(
        "Executing code with Piston API - Language: {}, Version: {}",
        request.language(),
        request.version()
    );

    try {
      PistonExecuteResponse response =
          restClient
              .post()
              .uri("/api/v2/execute")
              .body(request)
              .retrieve()
              .onStatus(
                  HttpStatusCode::is4xxClientError,
                  (req, res) -> {
                    var reader = new BufferedReader(new InputStreamReader(res.getBody()));
                    var errorMsg =
                        reader.lines().collect(Collectors.joining(System.lineSeparator()));
                    throw new PistonApiException("Piston API client error (%d): %s".formatted(
                        res.getStatusCode().value(),
                        errorMsg
                    ));
                  }
              )
              .onStatus(
                  HttpStatusCode::is5xxServerError,
                  (req, res) -> {
                    throw new PistonApiException("Piston API server error: " + res.getStatusCode());
                  }
              )
              .body(PistonExecuteResponse.class);

      log.debug("Code execution completed successfully");
      return response;
    } catch (Exception e) {
      log.error("Failed to execute code with Piston API", e);
      throw new PistonApiException("Failed to execute code: " + e.getMessage(), e);
    }
  }
}
