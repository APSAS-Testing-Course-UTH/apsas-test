package apsas.evaluation.service;

import apsas.evaluation.client.ContentServiceClient;
import apsas.evaluation.client.PistonApiClient;
import apsas.evaluation.model.AssignmentDto;
import apsas.evaluation.model.TestCaseDto;
import apsas.evaluation.model.dto.PistonExecuteRequest;
import apsas.evaluation.model.dto.PistonExecuteResponse;
import apsas.evaluation.model.dto.RuntimeResponse;
import apsas.messaging.event.EventPublisher;
import apsas.messaging.event.RabbitMQConfig;
import apsas.messaging.event.SubmissionCreatedEvent;
import apsas.messaging.event.SubmissionEvaluatedEvent;
import apsas.messaging.model.SubmissionResult;
import apsas.messaging.model.SubmissionStatus;
import apsas.messaging.model.TestCaseResult;
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

/** Service for evaluating code submissions */
@Service
@AllArgsConstructor
public class EvaluationService {
  private static final Logger logger = LoggerFactory.getLogger(EvaluationService.class);

  private final PistonApiClient pistonApiClient;
  private final ContentServiceClient contentServiceClient;
  private final EventPublisher eventPublisher;

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
      AssignmentDto assignment = contentServiceClient.getAssignment(event.getAssignmentId());

      // Validate language is supported
      if (!isLanguageSupported(event.getLanguage(), assignment.languages())) {
        publishFailedEvaluation(
            event.getSubmissionId(),
            "Unsupported language: "
                + event.getLanguage()
                + ". Allowed languages: "
                + String.join(", ", assignment.languages()));
        return;
      }

      // Execute test cases in parallel
      List<CompletableFuture<TestCaseResult>> futures = new ArrayList<>();
      for (TestCaseDto testCase : assignment.testCases()) {
        futures.add(executeTestCase(event.getCode(), event.getLanguage(), testCase));
      }

      // Wait for all test cases to complete
      CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

      // Collect results
      List<TestCaseResult> testCaseResults = new ArrayList<>();
      for (CompletableFuture<TestCaseResult> future : futures) {
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

      eventPublisher.publish(RabbitMQConfig.SUBMISSION_EVALUATED_ROUTING_KEY, evaluatedEvent);

      logger.info(
          "Evaluation completed for submission: {} with result: {} and score: {}",
          event.getSubmissionId(),
          result,
          score);

    } catch (Exception e) {
      logger.error("Error evaluating submission: {}", event.getSubmissionId(), e);
      publishFailedEvaluation(event.getSubmissionId(), "Evaluation error: " + e.getMessage());
    }
  }

  /**
   * Execute a single test case asynchronously
   *
   * @param code Student's code
   * @param language Programming language
   * @param testCase Test case to execute
   * @return Test case result
   */
  @Async
  protected CompletableFuture<TestCaseResult> executeTestCase(
      String code, String language, TestCaseDto testCase) {
    return CompletableFuture.supplyAsync(
        () -> {
          logger.debug("Executing test case: {}", testCase.description());

          TestCaseResult result = new TestCaseResult();
          result.setOrder(testCase.order());
          result.setDescription(testCase.description());
          result.setHidden(testCase.hidden());
          result.setWeight(testCase.weight());
          result.setInput(testCase.input());
          result.setOutput(testCase.output());
          result.setTimeout(testCase.timeout());
          result.setMemoryLimit(testCase.memoryLimit());

          try {
            // Prepare execution request
            PistonExecuteRequest request = createExecuteRequest(code, language, testCase);

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
            boolean passed = compareOutputs(testCase.output(), actualOutput);
            result.setPassed(passed);

            if (!passed) {
              result.setErrorMessage("Output mismatch");
            }

            logger.debug("Test case {} execution completed: {}", testCase.order(), passed);
            return result;

          } catch (Exception e) {
            logger.error("Error executing test case: {}", testCase.description(), e);
            result.setPassed(false);
            result.setErrorMessage("Execution error: " + e.getMessage());
            return result;
          }
        });
  }

  /**
   * Create Piston execute request from code and test case
   *
   * @param code Student's code
   * @param language Programming language
   * @param testCase Test case
   * @return Piston execute request
   */
  private PistonExecuteRequest createExecuteRequest(
      String code, String language, TestCaseDto testCase) {
    List<PistonExecuteRequest.FileContent> files = new ArrayList<>();

    // Determine file name based on language
    String fileName = getFileName(language);
    files.add(new PistonExecuteRequest.FileContent(fileName, code));

    // Set timeout and memory limits
    Integer timeout = testCase.timeout() != null ? testCase.timeout() : 5000;
    Long memoryLimit =
        testCase.memoryLimit() != null ? testCase.memoryLimit().longValue() * 1024 * 1024 : -1L;

    return new PistonExecuteRequest(
        language, "*", files, testCase.input(), timeout, timeout, memoryLimit);
  }

  /**
   * Get appropriate file name based on language
   *
   * @param language Programming language
   * @return File name
   */
  private String getFileName(String language) {
    return switch (language.toLowerCase()) {
      case "java" -> "Main.java";
      case "python", "python3" -> "main.py";
      case "javascript", "js", "node" -> "main.js";
      case "typescript", "ts" -> "main.ts";
      case "c" -> "main.c";
      case "cpp", "c++" -> "main.cpp";
      case "go" -> "main.go";
      case "rust" -> "main.rs";
      case "ruby" -> "main.rb";
      case "php" -> "main.php";
      case "csharp", "c#" -> "Main.cs";
      default -> "main.txt";
    };
  }

  /**
   * Compare expected and actual outputs
   *
   * @param expected Expected output
   * @param actual Actual output
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
  private BigDecimal calculateScore(List<TestCaseResult> testCaseResults) {
    if (testCaseResults.isEmpty()) {
      return BigDecimal.ZERO;
    }

    double totalWeight = 0;
    double earnedWeight = 0;

    for (TestCaseResult result : testCaseResults) {
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
  private SubmissionResult determineResult(List<TestCaseResult> testCaseResults) {
    if (testCaseResults.isEmpty()) {
      return SubmissionResult.FAILED;
    }

    long passedCount =
        testCaseResults.stream()
            .filter(result -> result.getPassed() != null && result.getPassed())
            .count();

    if (passedCount == testCaseResults.size()) {
      return SubmissionResult.PASSED;
    } else if (passedCount > 0) {
      return SubmissionResult.PARTIAL;
    } else {
      return SubmissionResult.FAILED;
    }
  }

  /**
   * Check if language is supported by the assignment
   *
   * @param language Language to check
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

    TestCaseResult errorResult = new TestCaseResult();
    errorResult.setPassed(false);
    errorResult.setErrorMessage(errorMessage);

    SubmissionEvaluatedEvent event =
        new SubmissionEvaluatedEvent(
            submissionId,
            SubmissionStatus.FAILED,
            SubmissionResult.FAILED,
            BigDecimal.ZERO,
            List.of(errorResult),
            LocalDateTime.now());

    eventPublisher.publish(RabbitMQConfig.SUBMISSION_EVALUATED_ROUTING_KEY, event);
  }
}
