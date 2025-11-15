package apsas.evaluation.service;

import apsas.evaluation.client.PistonApiClient;
import apsas.evaluation.mapper.PistonRequestMapper;
import apsas.evaluation.mapper.TestCaseMapper;
import apsas.shared.models.submission.TestCaseResultResponse;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestCaseService {
  private final PistonApiClient pistonApiClient;
  private final TestCaseMapper testCaseMapper;
  private final PistonRequestMapper pistonRequestMapper;

  @Async
  public CompletableFuture<TestCaseResultResponse> executeTestCase(
      String codeBase64,
      String language,
      apsas.feign.dto.TestCaseDto testCase
  ) {
    return CompletableFuture.supplyAsync(
        () -> {
          log.debug("Executing test case: {}", testCase.getDescription());

          // Use mapper to create initial TestCaseResultDto  
          var result = testCaseMapper.toTestCaseResult(
              testCase);

          try {
            // Prepare execution request using mapper
            var request = pistonRequestMapper.createExecuteRequest(
                codeBase64,
                language,
                testCase
            );

            // Execute code
            var startTime = System.currentTimeMillis();
            var response = pistonApiClient.execute(request);
            var endTime = System.currentTimeMillis();

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
            var actualOutput = response.run().stdout();
            result.setActualOutput(actualOutput);
            result.setExecutionTime((double) (endTime - startTime));

            // Compare outputs
            var passed = compareOutputs(testCase.getOutput(), actualOutput);
            result.setPassed(passed);

            if (!passed) {
              result.setErrorMessage("Output mismatch");
            }

            log.debug("Test case {} execution completed: {}", testCase.getOrder(), passed);
            return result;

          } catch (Exception e) {
            log.error("Error executing test case: {}", testCase.getDescription(), e);
            result.setPassed(false);
            result.setErrorMessage("Execution error: " + e.getMessage());
            return result;
          }
        });
  }

  private boolean compareOutputs(String expected, String actual) {
    if (expected == null || actual == null) {
      return false;
    }

    // Normalize outputs (trim whitespace, normalize line endings)
    var normalizedExpected = expected.trim().replaceAll("\\r\\n", "\n");
    var normalizedActual = actual.trim().replaceAll("\\r\\n", "\n");

    return normalizedExpected.equals(normalizedActual);
  }
}
