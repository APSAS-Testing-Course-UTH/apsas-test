package apsas.evaluation.client;

import apsas.evaluation.exception.PistonApiException;
import apsas.evaluation.model.dto.PistonExecuteRequest;
import apsas.evaluation.model.dto.PistonExecuteResponse;
import apsas.evaluation.model.dto.RuntimeResponse;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Client for interacting with Piston API v2 */
@Component
public class PistonApiClient {
  private static final Logger logger = LoggerFactory.getLogger(PistonApiClient.class);

  private final RestClient restClient;

  public PistonApiClient(@Value("${piston.api.url}") String pistonApiUrl) {
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
      backoff = @Backoff(delay = 1000, multiplier = 2))
  public List<RuntimeResponse> getRuntimes() {
    logger.debug("Fetching supported runtimes from Piston API");

    try {
      List<RuntimeResponse> runtimes =
          restClient
              .get()
              .uri("/api/v2/runtimes")
              .retrieve()
              .onStatus(
                  HttpStatusCode::is4xxClientError,
                  (request, response) -> {
                    throw new PistonApiException(
                        "Client error when fetching runtimes: " + response.getStatusCode());
                  })
              .onStatus(
                  HttpStatusCode::is5xxServerError,
                  (request, response) -> {
                    throw new PistonApiException(
                        "Server error when fetching runtimes: " + response.getStatusCode());
                  })
              .body(new ParameterizedTypeReference<>() {});

      logger.info("Successfully fetched {} runtimes from Piston API", runtimes.size());
      return runtimes;
    } catch (Exception e) {
      logger.error("Failed to fetch runtimes from Piston API", e);
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
      backoff = @Backoff(delay = 1000, multiplier = 2))
  public PistonExecuteResponse execute(PistonExecuteRequest request) {
    logger.debug(
        "Executing code with Piston API - Language: {}, Version: {}",
        request.language(),
        request.version());

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
                    throw new PistonApiException("Piston API client error: " + res.getStatusCode());
                  })
              .onStatus(
                  HttpStatusCode::is5xxServerError,
                  (req, res) -> {
                    throw new PistonApiException("Piston API server error: " + res.getStatusCode());
                  })
              .body(PistonExecuteResponse.class);

      logger.debug("Code execution completed successfully");
      return response;
    } catch (Exception e) {
      logger.error("Failed to execute code with Piston API", e);
      throw new PistonApiException("Failed to execute code: " + e.getMessage(), e);
    }
  }
}
