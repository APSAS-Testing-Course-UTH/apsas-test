package apsas.evaluation.service;

import apsas.evaluation.client.PistonApiClient;
import apsas.evaluation.model.dto.RuntimeResponse;
import apsas.feign.client.AssignmentFeignClient;
import apsas.shared.cache.CacheConfig;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.messaging.event.SubmissionCreatedEvent;
import apsas.shared.messaging.event.SubmissionEvaluatedEvent;
import apsas.shared.messaging.event.SubmissionEvaluatedEvent.Result;
import apsas.shared.messaging.event.SubmissionEvaluatedEvent.Status;
import apsas.shared.models.submission.TestCaseResultResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service for evaluating code submissions
 */
@Service
@AllArgsConstructor
@Slf4j
public class EvaluationService {
  private final PistonApiClient pistonApiClient;
  private final AssignmentFeignClient assignmentFeignClient;
  private final EventPublisher eventPublisher;
  private final TestCaseService testCaseService;

  /**
   * Get list of supported programming languages and their versions
   *
   * @return List of supported runtimes
   */
  @Cacheable(value = CacheConfig.RUNTIMES_CACHE)
  public List<RuntimeResponse> getSupportedRuntimes() {
    return pistonApiClient.getRuntimes();
  }

  /**
   * Evaluate a code submission asynchronously
   *
   * @param event Submission created event
   */
  @Async
  public void evaluateSubmission(SubmissionCreatedEvent event) {
    log.info("Starting evaluation for submission: {}", event.getSubmissionId());

    try {
      // Fetch assignment details
      var assignment = assignmentFeignClient.getAssignmentById(event.getAssignmentId());

      // Validate language is supported
      if (!isLanguageSupported(event.getLanguage(), assignment.getLanguages())) {
        publishFailedEvaluation(
            event.getSubmissionId(),
            "Unsupported language: "
                + event.getLanguage()
                + ". Allowed languages: "
                + String.join(", ", assignment.getLanguages())
        );
        return;
      }

      // Execute test cases in parallel
      var futures = assignment.getTestCases().stream()
          .map(tc -> testCaseService.executeTestCase(
              event.getCodeBase64(),
              event.getLanguage(),
              tc
          ))
          .toList();

      // Wait for all test cases to complete
      CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

      // Collect results
      var testCaseResults = futures.
          stream()
          .map(CompletableFuture::join)
          .toList();

      // Calculate score and determine result
      var score = calculateScore(testCaseResults);
      var result = determineResult(testCaseResults);
      var status =
          result == Result.FAILED ? Status.FAILED : Status.EVALUATED;

      // Publish evaluation result
      var evaluatedEvent =
          new SubmissionEvaluatedEvent(
              event.getSubmissionId(), status, result, score, testCaseResults, LocalDateTime.now());

      eventPublisher.publish(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY, evaluatedEvent);

      log.info(
          "Evaluation completed for submission: {} with result: {} and score: {}",
          event.getSubmissionId(),
          result,
          score
      );

    } catch (Exception e) {
      log.error("Error evaluating submission: {}", event.getSubmissionId(), e);
      publishFailedEvaluation(event.getSubmissionId(), "Evaluation error: " + e.getMessage());
    }
  }

  /**
   * Calculate overall score based on test case results
   *
   * @param testCaseResults List of test case results
   * @return Overall score
   */
  private BigDecimal calculateScore(List<TestCaseResultResponse> testCaseResults) {
    if (testCaseResults.isEmpty()) {
      return BigDecimal.ZERO;
    }

    double totalWeight = 0;
    double earnedWeight = 0;

    for (var result : testCaseResults) {
      var weight = result.getWeight() != null ? result.getWeight() : 1.0;
      totalWeight += weight;
      if (result.getPassed() != null && result.getPassed()) {
        earnedWeight += weight;
      }
    }

    if (totalWeight == 0) {
      return BigDecimal.ZERO;
    }

    return BigDecimal.valueOf((earnedWeight / totalWeight) * 100).setScale(2, RoundingMode.HALF_UP);
  }

  /**
   * Determine submission result based on test case results
   *
   * @param testCaseResults List of test case results
   * @return Submission result
   */
  private Result determineResult(List<TestCaseResultResponse> testCaseResults) {
    if (testCaseResults.isEmpty()) {
      return Result.FAILED;
    }

    var passedCount =
        testCaseResults.stream()
            .filter(TestCaseResultResponse::getPassed)
            .count();

    if (passedCount == testCaseResults.size()) {
      return Result.PASSED;
    }

    if (passedCount > 0) {
      return Result.PARTIAL;
    }

    return Result.FAILED;
  }

  /**
   * Check if language is supported by the assignment
   *
   * @param language         Language to check
   * @param allowedLanguages Allowed languages for the assignment
   * @return True if language is supported
   */
  private boolean isLanguageSupported(String language, String[] allowedLanguages) {
    if (allowedLanguages == null || allowedLanguages.length == 0) {
      return true; // No restrictions
    }

    for (var allowed : allowedLanguages) {
      if (allowed.equalsIgnoreCase(language)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Publish a failed evaluation event
   *
   * @param submissionId Submission ID
   * @param errorMessage Error message
   */
  private void publishFailedEvaluation(UUID submissionId, String errorMessage) {
    var errorResult = new TestCaseResultResponse();
    errorResult.setPassed(false);
    errorResult.setErrorMessage(errorMessage);

    var event =
        new SubmissionEvaluatedEvent(
            submissionId,
            Status.FAILED,
            Result.FAILED,
            BigDecimal.ZERO,
            List.of(errorResult),
            LocalDateTime.now()
        );

    eventPublisher.publish(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY, event);
  }
}
