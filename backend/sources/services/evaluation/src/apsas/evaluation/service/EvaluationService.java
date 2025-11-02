package apsas.evaluation.service;

import apsas.evaluation.client.PistonApiClient;
import apsas.evaluation.mapper.PistonRequestMapper;
import apsas.evaluation.mapper.TestCaseMapper;
import apsas.evaluation.model.dto.PistonExecuteRequest;
import apsas.evaluation.model.dto.PistonExecuteResponse;
import apsas.evaluation.model.dto.RuntimeResponse;
import apsas.feign.client.AssignmentFeignClient;
import apsas.feign.dto.AssignmentResponse;
import apsas.feign.dto.TestCaseDto;
import apsas.shared.messaging.config.RabbitMqConfig;
import apsas.shared.messaging.event.EventPublisher;
import apsas.shared.messaging.event.SubmissionCreatedEvent;
import apsas.shared.messaging.event.SubmissionEvaluatedEvent;
import apsas.shared.messaging.model.SubmissionResult;
import apsas.shared.messaging.model.SubmissionStatus;
import apsas.shared.models.submission.TestCaseResultDto;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service for evaluating code submissions
 */
@Service
@AllArgsConstructor
public class EvaluationService {
  private static final Logger logger = LoggerFactory.getLogger(EvaluationService.class);

  private final PistonApiClient pistonApiClient;
  private final AssignmentFeignClient assignmentFeignClient;
  private final EventPublisher eventPublisher;
  private final TestCaseMapper testCaseMapper;
  private final PistonRequestMapper pistonRequestMapper;

  /**
   * Get list of supported programming languages and their versions
   *
   * @return List of supported runtimes
   */
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
    logger.info("Starting evaluation for submission: {}", event.getSubmissionId());

    try {
      // Fetch assignment details
      AssignmentResponse assignment = assignmentFeignClient.getAssignmentById(event.getAssignmentId());

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
      List<CompletableFuture<apsas.shared.models.submission.TestCaseResultDto>> futures = new ArrayList<>();
      for (TestCaseDto testCase : assignment.getTestCases()) {
        futures.add(executeTestCase(event.getCode(), event.getLanguage(), testCase));
      }

      // Wait for all test cases to complete
      CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

      // Collect results
      List<apsas.shared.models.submission.TestCaseResultDto> testCaseResults = new ArrayList<>();
      for (CompletableFuture<apsas.shared.models.submission.TestCaseResultDto> future : futures) {
        testCaseResults.add(future.join());
      }

      // Calculate score and determine result
      BigDecimal score = calculateScore(testCaseResults);
      SubmissionResult result = determineResult(testCaseResults);
      SubmissionStatus status =
          result == SubmissionResult.FAILED ? SubmissionStatus.FAILED : SubmissionStatus.EVALUATED;

      // Publish evaluation result
      SubmissionEvaluatedEvent evaluatedEvent =
          new SubmissionEvaluatedEvent(
              event.getSubmissionId(), status, result, score, testCaseResults, LocalDateTime.now());

      eventPublisher.publish(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY, evaluatedEvent);

      logger.info(
          "Evaluation completed for submission: {} with result: {} and score: {}",
          event.getSubmissionId(),
          result,
          score
      );

    } catch (Exception e) {
      logger.error("Error evaluating submission: {}", event.getSubmissionId(), e);
      publishFailedEvaluation(event.getSubmissionId(), "Evaluation error: " + e.getMessage());
    }
  }

  /**
   * Execute a single test case asynchronously
   *
   * @param code     Student's code
   * @param language Programming language
   * @param testCase Test case to execute
   * @return Test case result
   */
  @Async
  protected CompletableFuture<apsas.shared.models.submission.TestCaseResultDto> executeTestCase(
      String code, String language, apsas.feign.dto.TestCaseDto testCase) {
    return CompletableFuture.supplyAsync(
        () -> {
          logger.debug("Executing test case: {}", testCase.getDescription());

          // Use mapper to create initial TestCaseResultDto  
          apsas.shared.models.submission.TestCaseResultDto result = testCaseMapper.toTestCaseResult(
              testCase);

          try {
            // Prepare execution request using mapper
            PistonExecuteRequest request = pistonRequestMapper.createExecuteRequest(
                code,
                language,
                testCase
            );

            // Execute code
            long startTime = System.currentTimeMillis();
            PistonExecuteResponse response = pistonApiClient.execute(request);
            long endTime = System.currentTimeMillis();

            // Check for compilation errors
            if (response.compile() != null && response.compile().code() != null) {
              if (response.compile().code() != 0) {
                result.setPassed(false);
                result.setErrorMessage("Compilation error: " + response.compile().stderr());
                result.setActualOutput(response.compile().output());
                return result;
              }
            }

            // Check runtime errors
            if (response.run().code() != null && response.run().code() != 0) {
              result.setPassed(false);
              result.setErrorMessage("Runtime error (exit code " + response.run().code() + ")");
              result.setActualOutput(response.run().output());
              return result;
            }

            // Get actual output
            String actualOutput = response.run().stdout();
            result.setActualOutput(actualOutput);
            result.setExecutionTime((double) (endTime - startTime));

            // Compare outputs
            boolean passed = compareOutputs(testCase.getOutput(), actualOutput);
            result.setPassed(passed);

            if (!passed) {
              result.setErrorMessage("Output mismatch");
            }

            logger.debug("Test case {} execution completed: {}", testCase.getOrder(), passed);
            return result;

          } catch (Exception e) {
            logger.error("Error executing test case: {}", testCase.getDescription(), e);
            result.setPassed(false);
            result.setErrorMessage("Execution error: " + e.getMessage());
            return result;
          }
        });
  }

  /**
   * Compare expected and actual outputs
   *
   * @param expected Expected output
   * @param actual   Actual output
   * @return True if outputs match
   */
  private boolean compareOutputs(String expected, String actual) {
    if (expected == null || actual == null) {
      return false;
    }

    // Normalize outputs (trim whitespace, normalize line endings)
    String normalizedExpected = expected.trim().replaceAll("\\r\\n", "\n");
    String normalizedActual = actual.trim().replaceAll("\\r\\n", "\n");

    return normalizedExpected.equals(normalizedActual);
  }

  /**
   * Calculate overall score based on test case results
   *
   * @param testCaseResults List of test case results
   * @return Overall score
   */
  private BigDecimal calculateScore(List<TestCaseResultDto> testCaseResults) {
    if (testCaseResults.isEmpty()) {
      return BigDecimal.ZERO;
    }

    double totalWeight = 0;
    double earnedWeight = 0;

    for (TestCaseResultDto result : testCaseResults) {
      double weight = result.getWeight() != null ? result.getWeight() : 1.0;
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
  private SubmissionResult determineResult(List<TestCaseResultDto> testCaseResults) {
    if (testCaseResults.isEmpty()) {
      return SubmissionResult.FAILED;
    }

    long passedCount =
        testCaseResults.stream()
            .filter(TestCaseResultDto::getPassed)
            .count();

    if (passedCount == testCaseResults.size()) {
      return SubmissionResult.PASSED;
    }

    if (passedCount > 0) {
      return SubmissionResult.PARTIAL;
    }

    return SubmissionResult.FAILED;
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

    for (String allowed : allowedLanguages) {
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
    logger.warn("Publishing failed evaluation for submission: {}", submissionId);

    TestCaseResultDto errorResult = new TestCaseResultDto();
    errorResult.setPassed(false);
    errorResult.setErrorMessage(errorMessage);

    SubmissionEvaluatedEvent event =
        new SubmissionEvaluatedEvent(
            submissionId,
            SubmissionStatus.FAILED,
            SubmissionResult.FAILED,
            BigDecimal.ZERO,
            List.of(errorResult),
            LocalDateTime.now()
        );

    eventPublisher.publish(RabbitMqConfig.SUBMISSION_EVALUATED_ROUTING_KEY, event);
  }
}
